import { contextBridge, ipcRenderer } from 'electron'
import {
    requestDeleteAllData,
    requestDeleteApplicationData,
    requestGetSettings,
    requestSetDisplayTheme,
    requestSetGhostPeriod,
    responseSettings,
} from '../../shared/settings-ipc-channels.js'

export default function () {
    contextBridge.exposeInMainWorld('settingsApi', {
        getSettings: () => ipcRenderer.send(requestGetSettings),
        setGhostPeriod: (args) => ipcRenderer.send(requestSetGhostPeriod, args),
        setDisplayTheme: (args) =>
            ipcRenderer.send(requestSetDisplayTheme, args),

        onGetSettings: (callback) => ipcRenderer.on(responseSettings, callback),

        deleteApplicationData: () =>
            ipcRenderer.send(requestDeleteApplicationData),
        deleteAllData: () => ipcRenderer.send(requestDeleteAllData),

        removeListeners: () => {
            ipcRenderer.removeAllListeners(responseSettings)
        },

        removeListener: (callback) => {
            ipcRenderer.removeListener(responseSettings, callback)
        },
    })
}
