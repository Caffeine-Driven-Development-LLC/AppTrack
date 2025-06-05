import { app, BrowserWindow, ipcMain, nativeTheme, shell } from 'electron'
import isFirstRun from 'electron-squirrel-startup'
import registerSettingsIpcActions from './ipc-actions/setting-ipc-actions.js'
import registerCompanyIpcActions from './ipc-actions/company-ipc-actions.js'
import registerApplicationIpcActions from './ipc-actions/application-ipc-actions.js'
import registerEventFlowIpcActions from './ipc-actions/event-flow-ipc-actions.js'
import registerSankeyNodeIpcActions from './ipc-actions/sankey-node-ipc-actions.js'
import { getSettings, initializeSettings } from './service/setting-service.js'
import { setDatabaseConnection } from './database-client.js'
import { requestOpenUrl } from '../shared/misclanious-ipc-channels.js'
import { responseSettings } from '../shared/settings-ipc-channels.js'
import logger from './logger.js'
import {
    registerMediaActions,
    registerMediaProtocol,
} from './protocol/media-protocol.js'
import { initializeAutoUpdate } from './service/application-update-service.js'

if (isFirstRun) {
    app.quit()
}

registerMediaProtocol()

const createWindow = () => {
    logger.info('Creating main window')

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 550,
        title: 'App Track',
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
            enableRemoteModule: false,
            spellcheck: true,
        },
    })

    mainWindow.setMenuBarVisibility(false)
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

    nativeTheme.on('updated', () => {
        mainWindow.webContents.send(responseSettings, getSettings())
    })

    logger.info('Main window created')

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools()
    }
}

app.whenReady()
    .then(initializeSettings)
    .then(setDatabaseConnection)
    .then(() => {
        registerSettingsIpcActions(ipcMain)
        registerApplicationIpcActions(ipcMain)
        registerCompanyIpcActions(ipcMain)
        registerEventFlowIpcActions(ipcMain)
        registerSankeyNodeIpcActions(ipcMain)

        registerMediaActions()

        ipcMain.on(requestOpenUrl, (event, url) => {
            shell.openExternal(url)
        })

        createWindow()
    })
    .then(initializeAutoUpdate)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.setName('App Track')
