import { app, autoUpdater } from 'electron'
import { autoCheckForUpdates } from './setting-service.js'
import logger from '../logger.js'

let intervalId = null
let lastCheckDateTime = null

const url = `http://localhost:4000/${process.platform}/${app.getVersion()}`

export const initializeAutoUpdate = () => {
    logger.debug('Initializing auto update...')
    autoUpdater.setFeedURL({ url })

    if (autoCheckForUpdates()) {
        startAutoUpdateCheck()
    }
}

export const checkForUpdate = () => {
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

autoUpdater.on('update-available', () => {
    logger.debug('Update available')

    // TODO notify the renderer process that an update is available to be downloaded
})

autoUpdater.on('update-downloaded', () => {
    logger.debug('Update downloaded')

    // TODO notify the renderer process that an update is available to be installed
    // autoUpdater.quitAndInstall()
})

autoUpdater.on('error', (error) => {
    logger.error('Error checking for update', error)
})

autoUpdater.on('checking-for-update', () => {
    logger.debug('Checking for update...')
})

autoUpdater.on('update-not-available', () => {
    logger.debug('Update not available')
})
