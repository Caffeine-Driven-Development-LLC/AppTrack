import { checkForUpdate, getUpdateState } from '../service/application-update-service.js'
import { requestCheckForUpdates, updateStateChanged } from '../../shared/update-ipc-channels.js'
import logger from '../logger.js'

export function registerUpdateIpcActionsForWindow (window) {

    window.webContents.once('did-finish-load', () => {
        window.webContents.send(updateStateChanged, getUpdateState())
    })
}

export function registerUpdateIpcActions(ipcMain) {
    ipcMain.on(requestCheckForUpdates, async () => {
        logger.debug('Request to check for update')
        checkForUpdate()
    })
}