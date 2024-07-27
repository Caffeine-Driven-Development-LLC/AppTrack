import { contextBridge, ipcRenderer } from 'electron'
import {
    requestCreateApplicationState,
    requestDeleteApplicationState,
    requestEventFlowMap,
    requestSwapOrderOfApplicationStates,
    requestUpdateApplicationState,
    responseEventFlowMap,
} from '../../shared/event-flow-ipc-channels.js'

export default function () {
    contextBridge.exposeInMainWorld('eventFlowApi', {
        getEventFlowMap: (args) => ipcRenderer.send(requestEventFlowMap, args),
        onEventFlowMap: (callback) =>
            ipcRenderer.on(responseEventFlowMap, callback),

        swapOrderOfApplicationStates: (args) =>
            ipcRenderer.send(requestSwapOrderOfApplicationStates, args),

        createApplicationState: (args) =>
            ipcRenderer.send(requestCreateApplicationState, args),

        updateApplicationState: (id, applicationStateInput) =>
            ipcRenderer.send(
                requestUpdateApplicationState,
                id,
                applicationStateInput
            ),

        deleteApplicationState: (args) =>
            ipcRenderer.send(requestDeleteApplicationState, args),

        onDisplayError: (callback) => ipcRenderer.on('error', callback),

        removeListeners: () => {
            ipcRenderer.removeAllListeners(responseEventFlowMap)
            ipcRenderer.removeAllListeners('error')
        },
    })
}
