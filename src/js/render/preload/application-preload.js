import { contextBridge, ipcRenderer } from 'electron'
import {
    requestApplications,
    requestApplicationsForCompany,
    requestAllApplicationsSankeyData,
    requestCreateApplication,
    requestCreateEvent,
    requestDashboardData,
    requestDeleteApplication,
    requestDeleteEvent,
    requestEventsForApplication,
    requestGetApplication,
    requestUpdateApplication,
    requestUpdateEvent,
    responseApplication,
    responseApplicationDeleted,
    responseApplications,
    responseApplicationsForCompany,
    responseAllApplicationsSankeyData,
    responseDashboardData,
    responseEventsForApplication,
} from '../../shared/application-ipc-channels.js'

export default function () {
    contextBridge.exposeInMainWorld('applicationApi', {
        createApplication: (applicationInput) =>
            ipcRenderer.send(requestCreateApplication, applicationInput),
        getApplication: (args) => ipcRenderer.send(requestGetApplication, args),
        updateApplication: (id, applicationInput) =>
            ipcRenderer.send(requestUpdateApplication, id, applicationInput),
        deleteApplication: (args) =>
            ipcRenderer.send(requestDeleteApplication, args),

        onGetApplication: (callback) =>
            ipcRenderer.on(responseApplication, callback),
        onApplicationDeleted: (callback) =>
            ipcRenderer.on(responseApplicationDeleted, callback),

        getApplicationListItems: (args) =>
            ipcRenderer.send(requestApplications, args),
        onGetApplicationListItems: (callback) =>
            ipcRenderer.on(responseApplications, callback),

        getApplicationsForCompany: (companyId) =>
            ipcRenderer.send(requestApplicationsForCompany, companyId),
        onGetApplicationsForCompany: (callback) =>
            ipcRenderer.on(responseApplicationsForCompany, callback),

        getAllApplicationsSankeyData: (startDate, endDate) =>
            ipcRenderer.send(requestAllApplicationsSankeyData, startDate, endDate),
        onGetAllApplicationsSankeyData: (callback) =>
            ipcRenderer.on(responseAllApplicationsSankeyData, callback),

        getDashboardData: () =>
            ipcRenderer.send(requestDashboardData),
        onGetDashboardData: (callback) =>
            ipcRenderer.on(responseDashboardData, callback),

        getEventsForApplication: (applicationId) =>
            ipcRenderer.send(requestEventsForApplication, applicationId),
        onGetEventsForApplication: (callback) =>
            ipcRenderer.on(responseEventsForApplication, callback),

        createEvent: (args, updateEventsForApplication) =>
            ipcRenderer.send(
                requestCreateEvent,
                args,
                updateEventsForApplication
            ),
        updateEvent: (eventId, eventInput, applicationId) =>
            ipcRenderer.send(
                requestUpdateEvent,
                eventId,
                eventInput,
                applicationId
            ),

        deleteEvent: (id, applicationId) =>
            ipcRenderer.send(requestDeleteEvent, id, applicationId),

        removeListeners: () => {
            ipcRenderer.removeAllListeners(responseApplication)
            ipcRenderer.removeAllListeners(responseApplicationDeleted)
            ipcRenderer.removeAllListeners(responseApplications)
            ipcRenderer.removeAllListeners(responseApplicationsForCompany)
            ipcRenderer.removeAllListeners(responseAllApplicationsSankeyData)
            ipcRenderer.removeAllListeners(responseDashboardData)
            ipcRenderer.removeAllListeners(responseEventsForApplication)
        },
    })
}
