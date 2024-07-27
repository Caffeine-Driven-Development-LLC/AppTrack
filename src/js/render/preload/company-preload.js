import { contextBridge, ipcRenderer } from 'electron'
import {
    requestCompanies,
    requestCompanyNames,
    requestCreateCompany,
    requestDeleteCompany,
    requestGetCompany,
    requestUpdateCompany,
    responseCompanies,
    responseCompany,
    responseCompanyDeleted,
    responseCompanyNames,
} from '../../shared/company-ipc-channels.js'

export default function () {
    contextBridge.exposeInMainWorld('companyApi', {
        createCompany: (companyInput, logo) => ipcRenderer.send(requestCreateCompany, companyInput, logo),
        getCompany: (args) => ipcRenderer.send(requestGetCompany, args),
        updateCompany: (id, companyInput, hasLogoChanged, logo) =>
            ipcRenderer.send(requestUpdateCompany, id, companyInput, hasLogoChanged, logo),
        deleteCompany: (args) => ipcRenderer.send(requestDeleteCompany, args),

        getCompanies: (args) => ipcRenderer.send(requestCompanies, args),
        getCompanyNames: (args) => ipcRenderer.send(requestCompanyNames, args),

        onGetCompany: (callback) => ipcRenderer.on(responseCompany, callback),
        onCompanyDeleted: (callback) =>
            ipcRenderer.on(responseCompanyDeleted, callback),
        onGetCompanyNames: (callback) =>
            ipcRenderer.on(responseCompanyNames, callback),
        onGetCompanies: (callback) =>
            ipcRenderer.on(responseCompanies, callback),

        removeListeners: () => {
            ipcRenderer.removeAllListeners(responseCompany)
            ipcRenderer.removeAllListeners(responseCompanyDeleted)
            ipcRenderer.removeAllListeners(responseCompanyNames)
            ipcRenderer.removeAllListeners(responseCompanies)
        },
    })
}
