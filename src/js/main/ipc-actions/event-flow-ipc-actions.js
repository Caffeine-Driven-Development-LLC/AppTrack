import {
    createApplicationState,
    deleteApplicationState,
    getEventFlowMap,
    swapOrderOfApplicationStates,
    updateApplicationState,
} from '../service/event-flow-setting-service.js'
import {
    requestCreateApplicationState,
    requestDeleteApplicationState,
    requestEventFlowMap,
    requestSwapOrderOfApplicationStates,
    requestUpdateApplicationState,
    responseEventFlowMap,
} from '../../shared/event-flow-ipc-channels.js'
import logger from '../logger.js'

export default function (ipcMain) {
    ipcMain.on(requestEventFlowMap, async (event, args) => {
        logger.debug('Requesting event flow map')
        getEventFlowMap()
            .then((eventFlowMap) => {
                logger.debug(
                    `Found event flow map: ${JSON.stringify(eventFlowMap)}`
                )
                event.reply(responseEventFlowMap, eventFlowMap)
            })
            .catch((error) => {
                logger.error(`Error getting event flow map: ${error.message}`)
            })
    })

    ipcMain.on(requestSwapOrderOfApplicationStates, async (event, args) => {
        logger.debug('Swapping order of application states')
        swapOrderOfApplicationStates(args)
            .then((eventFlowMap) => {
                event.reply(responseEventFlowMap, eventFlowMap)
            })
            .catch((error) => {
                logger.error(
                    `Error swapping order of application states: ${error.message}`
                )
            })
    })

    ipcMain.on(requestCreateApplicationState, async (event, args) => {
        logger.debug('Creating new application state')
        createApplicationState(args)
            .then((eventFlowMap) => {
                event.reply(responseEventFlowMap, eventFlowMap)
            })
            .catch((error) => {
                logger.error(
                    `Error creating new application state: ${error.message}`
                )
            })
    })

    ipcMain.on(
        requestUpdateApplicationState,
        async (event, id, applicationStateInput) => {
            logger.debug(`Updating application state with id: ${id}`)
            updateApplicationState(id, applicationStateInput)
                .then((eventFlowMap) => {
                    event.reply(responseEventFlowMap, eventFlowMap)
                })
                .catch((error) => {
                    logger.error(
                        `Error updating application state: ${error.message}`
                    )
                })
        }
    )

    ipcMain.on(requestDeleteApplicationState, async (event, args) => {
        logger.debug(`Deleting application state with id: ${args}`)
        deleteApplicationState(args)
            .then((eventFlowMap) => {
                event.reply(responseEventFlowMap, eventFlowMap)
            })
            .catch((error) => {
                logger.error(
                    `Error deleting application state: ${error.message}`
                )
            })
    })
}
