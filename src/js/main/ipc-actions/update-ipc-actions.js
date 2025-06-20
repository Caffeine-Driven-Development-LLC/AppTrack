import { checkForUpdate, getUpdateState, updateApplication } from '../service/application-update-service.js'
import {
    requestCheckForUpdates, requestCurrentAppVersion, requestUpdateApplication,
    requestUpdateState, responseCurrentAppVersion,
    responseUpdateState,
    updateStateChanged,
} from '../../shared/update-ipc-channels.js'
import logger from '../logger.js'
import { app } from 'electron'

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

    ipcMain.on(requestUpdateState, async (event) => {
        logger.debug('Requesting update state')
        event.reply(responseUpdateState, getUpdateState())
    })

    ipcMain.on(requestUpdateApplication, async () => {
        logger.debug('Requesting update application')
        updateApplication()
    })

    ipcMain.on(requestCurrentAppVersion, async (event) => {
        event.reply(responseCurrentAppVersion, app.getVersion())
    })
}