import {
    requestApplications,
    requestApplicationsForCompany,
    requestCreateApplication,
    requestCreateEvent,
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
    responseEventsForApplication,
} from '../../shared/application-ipc-channels.js'
import {
    addEvent,
    createNewApplication,
    getApplicationById,
    getApplications,
    getApplicationsByCompanyId,
    getEventsForApplication,
    updateApplication,
    updateEvent,
} from '../service/application-service.js'
import {
    deleteApplication,
    deleteEvent,
    insertEvent,
} from '../persistence/application-persistence.js'
import logger from '../logger.js'

export default function (ipcMain) {
    ipcMain.on(requestCreateApplication, async (event, applicationInput) => {
        logger.debug('Creating new application')
        createNewApplication(applicationInput)
            .then((application) => {
                logger.debug(
                    `Created application: ${JSON.stringify(application)}`
                )
                event.reply(responseApplication, application)
            })
            .catch((error) => {
                logger.error(`Error creating application: ${error.message}`)
            })
    })
    ipcMain.on(requestGetApplication, async (event, id) => {
        logger.debug(`Requesting application with id: ${id}`)
        getApplicationById(id)
            .then((application) => {
                logger.debug(
                    `Found application: ${JSON.stringify(application)}`
                )
                event.reply(responseApplication, application)
            })
            .catch((error) => {
                logger.error(`Error getting application: ${error.message}`)
            })
    })
    ipcMain.on(
        requestUpdateApplication,
        async (event, id, applicationInput) => {
            logger.debug(`Updating application with id: ${id}`)
            updateApplication(id, applicationInput)
                .then((application) => {
                    logger.debug(
                        `Updated application: ${JSON.stringify(application)}`
                    )
                    event.reply(responseApplication, application)
                })
                .catch((error) => {
                    logger.error(`Error updating application: ${error.message}`)
                })
        }
    )
    ipcMain.on(requestDeleteApplication, async (event, id) => {
        logger.debug(`Deleting application with id: ${id}`)
        deleteApplication(id)
            .then(() => {
                logger.debug(`Deleted application with id: ${id}`)
                event.reply(responseApplicationDeleted, id)
            })
            .catch((error) => {
                logger.error(`Error deleting application: ${error.message}`)
            })
    })

    ipcMain.on(requestApplications, async (event, args) => {
        logger.debug('Requesting applications')
        getApplications(args)
            .then((applications) => {
                logger.debug(`Found ${applications.length} applications`)
                event.reply(responseApplications, applications)
            })
            .catch((error) => {
                logger.error(`Error getting applications: ${error.message}`)
            })
    })

    ipcMain.on(requestCreateEvent, async (event, eventInput) => {
        logger.debug('Creating new event')
        addEvent(eventInput)
            .then((application) => {
                event.reply(responseApplication, application)
            })
            .catch((error) => {
                logger.error(`Error creating event: ${error.message}`)
            })
    })
    ipcMain.on(requestEventsForApplication, async (event, applicationId) => {
        logger.debug(
            `Requesting events for application with id: ${applicationId}`
        )
        getEventsForApplication(applicationId)
            .then((events) => {
                logger.debug(`Found ${events.length} events`)
                event.reply(responseEventsForApplication, events)
            })
            .catch((error) => {
                logger.error(`Error getting events: ${error.message}`)
            })
    })

    ipcMain.on(
        requestUpdateEvent,
        async (event, eventId, eventInput, applicationId) => {
            logger.debug(`Updating event with id: ${eventId}`)
            updateEvent(eventId, eventInput, applicationId)
                .then((events) => {
                    event.reply(responseEventsForApplication, events)
                })
                .catch((error) => {
                    logger.error(`Error updating event: ${error.message}`)
                })
        }
    )

    ipcMain.on(requestDeleteEvent, async (event, id, applicationId) => {
        logger.debug(`Deleting event with id: ${id}`)
        deleteEvent(id)
            .then(() => {
                logger.debug(`Deleted event with id: ${id}`)
                return getEventsForApplication(applicationId)
            })
            .then((events) => {
                event.reply(responseEventsForApplication, events)
            })
            .catch((error) => {
                logger.error(`Error deleting event: ${error.message}`)
            })
    })

    ipcMain.on(requestApplicationsForCompany, async (event, companyId) => {
        logger.debug(
            `Requesting applications for company with id: ${companyId}`
        )
        getApplicationsByCompanyId(companyId)
            .then((applications) => {
                logger.debug(
                    `Found ${applications.length} applications for company with id: ${companyId}`
                )
                event.reply(responseApplicationsForCompany, applications)
            })
            .catch((error) => {
                logger.error(
                    `Error getting applications for company: ${error.message}`
                )
            })
    })
}
