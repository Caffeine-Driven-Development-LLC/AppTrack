import { contextBridge, ipcRenderer } from 'electron'
import {
    requestCheckForUpdates, requestCurrentAppVersion, requestUpdateApplication,
    requestUpdateState, responseCurrentAppVersion,
    responseUpdateState,
    updateStateChanged,
} from '../../shared/update-ipc-channels.js'

export default function () {
    contextBridge.exposeInMainWorld('updateApi', {
        onUpdateStateChange: (callback) => ipcRenderer.on(updateStateChanged, (_event, value) => callback(value)),
        checkForUpdates: () => ipcRenderer.send(requestCheckForUpdates),

        getUpdateState: () => ipcRenderer.send(requestUpdateState),
        onGetUpdateState: (callback) => ipcRenderer.on(responseUpdateState, callback),

        getCurrentAppVersion: () => ipcRenderer.send(requestCurrentAppVersion),
        onGetCurrentAppVersion: (callback) => ipcRenderer.on(responseCurrentAppVersion, callback),

        requestUpdateApplication: () => ipcRenderer.send(requestUpdateApplication),

        removeListeners: () => {
            ipcRenderer.removeAllListeners(updateStateChanged)
            ipcRenderer.removeAllListeners(responseCurrentAppVersion)
            ipcRenderer.removeAllListeners(responseUpdateState)
        },

        removeListener: (callback) => {
            ipcRenderer.removeListener(updateStateChanged, callback)
            ipcRenderer.removeListener(responseCurrentAppVersion, callback)
            ipcRenderer.removeListener(responseUpdateState, callback)
        }
    })
}