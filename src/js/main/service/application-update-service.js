import { autoUpdater, app, BrowserWindow } from 'electron'
import { autoCheckForUpdates } from './setting-service.js'
import logger from '../logger.js'

let intervalId = null
let lastCheckDateTime = null

const server = 'https://update.electronjs.org'
const feed = `${server}/Caffeine-Driven-Development-LLC/AppTrack/${process.platform}-${process.arch}/${app.getVersion()}`
autoUpdater.setFeedURL({ url: feed })

let updateState = {
    checkingForUpdate: false,
    updateAvailable: false,
    updateDownloaded: false,
};

export const initializeAutoUpdate = () => {
    logger.debug('Initializing auto update...')

    if (autoCheckForUpdates()) {
        startAutoUpdateCheck()
    }
}

export const checkForUpdate = () => {
    if (process.env.NODE_ENV === 'development') {
        logger.info('Auto update is disabled in development mode')
        return
    }

    logger.debug('Checking for update...')

    // if last check was less then 10 minutes ago, skip this check
    if (lastCheckDateTime && new Date() - lastCheckDateTime < 10 * 60 * 1000) {
        logger.debug(
            'Last check was less than 10 minutes ago, skipping this check'
        )
        return
    }
    lastCheckDateTime = new Date()

    autoUpdater.checkForUpdates()
    logger.debug('Check for update done')
}

export const startAutoUpdateCheck = () => {
    logger.debug('Starting auto update check...')
    if (autoCheckForUpdates() === false) {
        logger.debug('Auto update check is disabled')
        return
    }

    if (intervalId) {
        logger.debug('The auto update interval is already running')
        return
    }

    checkForUpdate()
    intervalId = setInterval(checkForUpdate, 24 * 60 * 60 * 1000)
}

export const stopAutoUpdateCheck = () => {
    logger.debug('Stopping auto update check...')
    clearInterval(intervalId)
    intervalId = null
}

export const getUpdateState = () => updateState

autoUpdater.on('update-available', () => {
    logger.debug('Update available')
    updateState.updateAvailable = true
    updateState.checkingForUpdate = false
    broadcastUpdateState()
})

autoUpdater.on('update-downloaded', () => {
    logger.debug('Update downloaded')
    updateState.updateDownloaded = true
    updateState.checkingForUpdate = false
    broadcastUpdateState()
})

autoUpdater.on('error', (error) => {
    logger.error('Error checking for update', error)
    updateState.updateAvailable = false
    updateState.updateDownloaded = false
    updateState.checkingForUpdate = false
    broadcastUpdateState()
})

autoUpdater.on('checking-for-update', () => {
    logger.debug('Checking for update...')
    updateState.checkingForUpdate = true
    broadcastUpdateState()
})

autoUpdater.on('update-not-available', () => {
    logger.debug('Update not available')
    updateState.updateAvailable = false
    updateState.updateDownloaded = false
    updateState.checkingForUpdate = false
    broadcastUpdateState()
})

function broadcastUpdateState() {
    logger.debug(`Broadcasting update state: ${JSON.stringify(updateState)}`)
    BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('update-state-changed', updateState);
    });
}
