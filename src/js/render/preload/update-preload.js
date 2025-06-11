import { contextBridge, ipcRenderer } from 'electron'
import {
    requestCheckForUpdates, requestUpdateApplication,
    requestUpdateState,
    responseUpdateState,
    updateStateChanged,
} from '../../shared/update-ipc-channels.js'

export default function () {
    contextBridge.exposeInMainWorld('updateApi', {
        onUpdateStateChange: (callback) => ipcRenderer.on(updateStateChanged, (_event, value) => callback(value)),
        checkForUpdates: () => ipcRenderer.send(requestCheckForUpdates),

        getUpdateState: () => ipcRenderer.send(requestUpdateState),
        onGetUpdateState: (callback) => ipcRenderer.on(responseUpdateState, callback),

        requestUpdateApplication: () => ipcRenderer.send(requestUpdateApplication),

        removeListeners: () => {
            ipcRenderer.removeAllListeners(updateStateChanged)
            ipcRenderer.removeAllListeners(responseUpdateState)
        },

        removeListener: (callback) => {
            ipcRenderer.removeListener(updateStateChanged, callback)
            ipcRenderer.removeListener(responseUpdateState, callback)
        }
    })
}