import { contextBridge, ipcRenderer } from 'electron'
import {
    requestAddSankeyNode,
    requestDeleteSankeyNode,
    requestGetSankeyNodes,
    requestUpdateSankeyNode,
    responseSankeyNodes,
} from '../../shared/sankey-node-ipc-channels.js'

export default function () {
    contextBridge.exposeInMainWorld('sankeyNodeApi', {
        getSankeyNodes: () => ipcRenderer.send(requestGetSankeyNodes),
        onGetSankeyNodes: (callback) =>
            ipcRenderer.on(responseSankeyNodes, callback),

        addSankeyNode: (sankeyNode) =>
            ipcRenderer.send(requestAddSankeyNode, sankeyNode),

        updateSankeyNode: (id, sankeyNode) =>
            ipcRenderer.send(requestUpdateSankeyNode, id, sankeyNode),

        deleteSankeyNode: (id) => ipcRenderer.send(requestDeleteSankeyNode, id),

        removeListeners: () => {
            ipcRenderer.removeAllListeners(responseSankeyNodes)
        },
    })
}
