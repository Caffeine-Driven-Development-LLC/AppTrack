import {
    deleteApplicationState as deleteApplicationStateFromDb,
    insertApplicationFlow,
    insertApplicationState,
    removeApplicationStateFromFlowById,
    removeApplicationStateFromFlowByNextStepId,
    selectApplicationStates,
    swapDisplayOrderOfApplicationStates as swapDisplayOrder,
    updateApplicationState as updateApplicationStateInDb,
} from '../persistence/event-flow-persistence.js'
import { deleteSankeyLinksByApplicationStateId } from '../persistence/sankey-node-persistence.js'
import logger from '../logger.js'

/**
 * Get all application states and their available next steps
 * Including deleted application states, If an application is in a state that has
 * been deleted, that application has not been deleted, and it should have the chance
 * to move into the next state.
 *
 * that being said a cleanup effort should be automated in at some point.
 * @returns {Promise<[Object]>} A list of application states with available next steps
 */
export async function getEventFlowMap() {
    return selectApplicationStates().then((applicationStates) =>
        processApplicationStates(applicationStates)
    )
}

/**
 * Create a new application state
 * @param applicationStateInput object with application state data
 * @returns {Promise<[Object]>} A list of application states with available next steps
 */
export async function createApplicationState(applicationStateInput) {
    return validateAndSanitizeApplicationState(applicationStateInput)
        .then(async (sanitizedInputs) => {
            const newId = await insertApplicationState(sanitizedInputs)
            const insertPromises = sanitizedInputs.availableNextStepIds.map(
                (nextStepId) => {
                    insertApplicationFlow(newId, nextStepId)
                }
            )
            return Promise.all(insertPromises)
        })
        .then(() => getEventFlowMap())
}

/**
 * Update an application state
 * @param id id of the application state to update
 * @param applicationStateInput object with application state data
 * @returns {Promise<[Object]>} A list of application states with available next steps
 */
export async function updateApplicationState(id, applicationStateInput) {
    if (!id) {
        throw new Error('Application state id is required')
    }
    return validateAndSanitizeApplicationState(applicationStateInput)
        .then(async (sanitizedInputs) => {
            await updateApplicationStateInDb(id, sanitizedInputs)
            await removeApplicationStateFromFlowById(id)
            const insertPromises =
                applicationStateInput.availableNextStepIds.map((nextStepId) => {
                    insertApplicationFlow(id, nextStepId)
                })
            return Promise.all(insertPromises)
        })
        .then(() => getEventFlowMap())
}

/**
 * Delete an application state
 * Can not hard delete the application state as there may be applications in that state
 * But we can mark it as deleted
 *
 * Also removes links to any sankey nodes that are associated with the application state
 *
 * @param applicationStateId id of the application state to delete
 * @returns {Promise<[Object]>} A list of application states with available next steps
 */
export async function deleteApplicationState(applicationStateId) {
    if (!applicationStateId) {
        throw new Error('Application state id is required')
    }
    const eventFlowMap = await getEventFlowMap()
    const initialApplicationStates = eventFlowMap.filter(
        (applicationState) =>
            applicationState.initialStep === 1 &&
            applicationState.isDeleted === 0
    )

    if (
        initialApplicationStates.length === 1 &&
        initialApplicationStates[0].id === applicationStateId
    ) {
        logger.warn('Cannot delete the only initial application state')
        throw new Error('Cannot delete the only initial application state')
    }

    return deleteApplicationStateFromDb(applicationStateId)
        .then(() =>
            removeApplicationStateFromFlowByNextStepId(applicationStateId)
        )
        .then(() => deleteSankeyLinksByApplicationStateId(applicationStateId))
        .then(() => getEventFlowMap())
}

/**
 * Swap the display order of two application states
 * @param args object with ids and display orders of the application states to swap
 * @returns {Promise<[Object]>} A list of application states with available next steps
 */
export async function swapOrderOfApplicationStates(args) {
    return swapDisplayOrder(
        args.id1,
        args.id2,
        args.displayOrder1,
        args.displayOrder2
    ).then(() => getEventFlowMap())
}

function processApplicationStates(applicationStates) {
    const applicationStateMap = new Map()
    applicationStates.forEach((applicationState) => {
        applicationStateMap.set(applicationState.id, applicationState)
    })

    return applicationStates.map((applicationState) => {
        return {
            ...applicationState,
            availableNextStepIds: applicationState.availableNextStepIds
                ? applicationState.availableNextStepIds
                      .split(',')
                      .map((nextStepId) => parseInt(nextStepId))
                      .filter((nextStepId) => {
                          return (
                              applicationStateMap.has(nextStepId) &&
                              !applicationStateMap.get(nextStepId).isDeleted
                          )
                      })
                : [],
        }
    })
}

async function validateAndSanitizeApplicationState(input) {
    const eventFlowMap = await getEventFlowMap()

    function validate() {
        if (!input.name) {
            throw new Error('Application state name is required')
        }

        input.availableNextStepIds.forEach((nextStepId) => {
            const nextStep = eventFlowMap.find((e) => e.id === nextStepId)
            if (!nextStep) {
                throw new Error(
                    `Application state with id ${nextStepId} not found`
                )
            }

            if (nextStep.isDeleted) {
                throw new Error(
                    `Application state with id ${nextStepId} is deleted`
                )
            }
        })
    }

    function sanitize() {
        input.name = input.name.trim()
        input.alwaysAvailable = input.alwaysAvailable || 0
        input.initialStep = input.initialStep || 0
    }

    return new Promise((resolve) => {
        validate()
        sanitize()
        resolve(input)
    })
}
