import {
    requestDeleteAllData,
    requestDeleteApplicationData,
    requestGetSettings, requestSetAutoCheckForUpdates,
    requestSetDisplayTheme,
    requestSetGhostPeriod,
    responseSettings,
} from '../../shared/settings-ipc-channels.js'
import {
    deleteAllData,
    deleteApplicationData,
    getSettings, setAutoCheckForUpdates,
    setDisplayTheme,
    setGhostPeriod,
} from '../service/setting-service.js'
import logger from '../logger.js'

export default function (ipcMain) {
    ipcMain.on(requestGetSettings, async (event) => {
        logger.debug('Requesting settings')
        event.reply(responseSettings, getSettings())
    })

    ipcMain.on(requestSetGhostPeriod, async (event, args) => {
        logger.debug('Setting ghost period')
        setGhostPeriod(args)
    })

    ipcMain.on(requestSetDisplayTheme, async (event, args) => {
        logger.debug('Setting display theme')
        setDisplayTheme(args)
        event.reply(responseSettings, getSettings())
    })

    ipcMain.on(requestSetAutoCheckForUpdates, async (event, args) => {
        logger.debug('Setting auto check for updates')
        setAutoCheckForUpdates(args)
    })

    ipcMain.on(requestDeleteApplicationData, async () => {
        deleteApplicationData()
    })

    ipcMain.on(requestDeleteAllData, async () => {
        await deleteAllData()
    })
}
