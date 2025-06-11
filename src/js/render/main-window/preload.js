import { contextBridge, ipcRenderer } from 'electron'
import CompanyPreload from '../preload/company-preload.js'
import ApplicationPreload from '../preload/application-preload.js'
import SettingsPreload from '../preload/settings-preload.js'
import EventFlowPreload from '../preload/event-flow-preload.js'
import SankeyNodePreload from '../preload/sankey-node-preload.js'
import { requestOpenUrl } from '../../shared/misclanious-ipc-channels.js'
import UpdatePreload from '../preload/update-preload.js'

CompanyPreload()
ApplicationPreload()
SettingsPreload()
EventFlowPreload()
SankeyNodePreload()
UpdatePreload()

contextBridge.exposeInMainWorld('api', {
    openLink: (url) => ipcRenderer.send(requestOpenUrl, url),
})
