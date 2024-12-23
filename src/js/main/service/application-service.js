import { ghostPeriod } from './setting-service.js'
import { getSankeyData } from './sankey-service.js'
import {
    insertApplication,
    insertEvent,
    searchApplications as searchApplicationsInDb,
    selectApplication,
    selectApplications,
    selectApplicationsByCompanyId,
    selectEventsByApplicationId,
    updateApplication as updateApplicationInDb,
    updateEvent as updateEventInDb,
} from '../persistence/application-persistence.js'

const validDateFormat = /^\d{4}-\d{2}-\d{2}$/

/**
 * Creates a new application.
 * @param applicationInput object with the application data
 * @returns {Promise<Object>} a promise that resolves to the new application
 */
export async function createNewApplication(applicationInput) {
    let newId
    return validateAndSanitizeCreateApplicationInput(applicationInput)
        .then((sanitizedInput) => (applicationInput = sanitizedInput))
        .then(() =>
            insertApplication({
                companyId: applicationInput.companyId,
                role: applicationInput.role,
                postUrl: applicationInput.postUrl,
                salaryRangeHigh: applicationInput.salaryRangeHigh,
                salaryRangeLow: applicationInput.salaryRangeLow,
            })
        )
        .then((newApplicationId) => {
            newId = newApplicationId
        })
        .then(() =>
            insertEvent({
                applicationId: newId,
                date: applicationInput.dateApplied,
                notes: applicationInput.notes,
                applicationStateId: applicationInput.initialEventId,
            })
        )
        .then(() => getApplicationById(newId))
}

/**
 * Returns an application by its id or throws an error if it does not exist.
 * @param id id of the application
 * @returns {Promise<Object>} a promise that resolves to the application object
 */
export async function getApplicationById(id) {
    return selectApplication(id)
        .then((application) => {
            if (!application) {
                throw new Error('Application not found')
            }
            return application
        })
        .then((application) => populateGhostData(application))
        .then((application) => populateEvents(application))
}

/**
 * Updates an application.
 * @param id id of the application to update
 * @param applicationInput object with the application data
 * @returns {Promise<Object>} a promise that resolves to the updated application object
 */
export async function updateApplication(id, applicationInput) {
    if (!id) throw new Error('Application Id is required')
    return validateAndSanitizeUpdateApplicationInput(applicationInput)
        .then((sanitizedInput) => (applicationInput = sanitizedInput))
        .then((applicationInput) =>
            updateApplicationInDb(id, {
                companyId: applicationInput.companyId,
                role: applicationInput.role,
                postUrl: applicationInput.postUrl,
                salaryRangeHigh: applicationInput.salaryRangeHigh,
                salaryRangeLow: applicationInput.salaryRangeLow,
            })
        )
        .then(() => getApplicationById(id))
}

/**
 * Returns all active applications. An application is considered active if it
 * has an event that has next steps, and it within the ghost period.
 * @returns {Promise<[Object]>} a promise that resolves to an array of application objects
 */
export async function getAllActiveApplications() {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - ghostPeriod())
    const year = cutoffDate.getFullYear()
    const month = (cutoffDate.getMonth() + 1).toString().padStart(2, '0')
    const day = cutoffDate.getDate().toString().padStart(2, '0')
    const cutoffDateString = `${year}-${month}-${day}`

    return selectApplications(false, cutoffDateString, null, false).then(
        (applications) => applications.map(populateGhostData)
    )
}

/**
 * Has an optional search text parameter.
 *
 * If search text is provided, it returns all applications that match the search text.
 * The search text is matched against the application role and company name.
 *
 * If search text is not provided, it returns all active applications.
 *
 * @param searchText optional string to search for
 * @returns {Promise<[Object]>} a promise that resolves to an array of application objects
 */
export async function getApplications({ searchText }) {
    return searchText
        ? searchApplications(searchText)
        : getAllActiveApplications()
}

/**
 * Searches for applications that match the search text.
 * The search text is matched against the application role and company name.
 * @param searchText string to search for
 * @returns {Promise<[Object]>} a promise that resolves to an array of application objects
 */
export async function searchApplications(searchText) {
    return searchApplicationsInDb(searchText).then((applications) =>
        applications.map(populateGhostData)
    )
}

/**
 * Returns a summary of applications for a company. including sankey data for the applications.
 * @param companyId id of the company
 * @returns {Promise<{companyId, sankeyData: {nodes: [], links: []}, applications: Awaited<unknown>[]}>} a promise that resolves to an object with the company id, sankey data, and applications
 */
export async function getApplicationsByCompanyId(companyId) {
    const applicationsByCompanyId = await selectApplicationsByCompanyId(
        companyId
    )
        .then((applications) => applications.map(populateGhostData))
        .then((applications) => Promise.all(applications.map(populateEvents)))

    return {
        companyId: companyId,
        applications: applicationsByCompanyId,
        sankeyData: await getSankeyData(applicationsByCompanyId),
    }
}

/**
 * Returns all the events for an application.
 * @param applicationId id of the application
 * @returns {Promise<{applicationId: *, events: *}>} a promise that resolves to an object with the application id and events
 */
export async function getEventsForApplication(applicationId) {
    return selectEventsByApplicationId(applicationId).then((events) => ({
        applicationId: applicationId,
        events: events,
    }))
}

/**
 * Adds a new event to an application.
 * @param newEventInput object with the new event data
 * @returns {Promise<Object>} a promise that resolves to the updated application object
 */
export async function addEvent(newEventInput) {
    return validateAndSanitizeNewEventInput(newEventInput)
        .then((sanitizedEventInput) =>
            insertEvent({
                applicationId: sanitizedEventInput.applicationId,
                date: sanitizedEventInput.date,
                notes: sanitizedEventInput.notes,
                applicationStateId: sanitizedEventInput.applicationStateId,
            })
        )
        .then(() => getApplicationById(newEventInput.applicationId))
}

/**
 * Updates an event.
 * @param eventId id of the event to update
 * @param eventUpdateInput object with the updated event data
 * @param applicationId id of the application
 * @returns {Promise<{applicationId: *, events: *}>} a promise that resolves to an object with the application id and events
 */
export async function updateEvent(eventId, eventUpdateInput, applicationId) {
    if (!eventId) throw new Error('eventId is required')
    return validateAndSanitizeUpdateEventInput(eventUpdateInput)
        .then((sanitizedEventUpdateInput) =>
            updateEventInDb(eventId, sanitizedEventUpdateInput)
        )
        .then(() => getEventsForApplication(applicationId))
}

function populateGhostData(application) {
    const appLastUpdated = application.lastUpdated.split('-')
    const lastEventDate = new Date(
        appLastUpdated[0],
        appLastUpdated[1] - 1,
        appLastUpdated[2]
    )
    const daysAgo = Math.floor(
        (new Date() - lastEventDate) / (1000 * 60 * 60 * 24)
    )
    const percentGhosted = Math.min((daysAgo / ghostPeriod()) * 100, 100)
    const isGhosted = daysAgo >= ghostPeriod()
    return {
        ...application,
        percentGhosted: percentGhosted,
        ghosted: isGhosted,
    }
}

function populateEvents(application) {
    return selectEventsByApplicationId(application.id).then((events) => ({
        ...application,
        events: events,
    }))
}

async function validateAndSanitizeCreateApplicationInput(input) {
    function validate() {
        if (!input.role) {
            throw new Error('Role is required')
        }
        if (!input.companyId) {
            throw new Error('Company is required')
        }
        if (!input.dateApplied) {
            throw new Error('Date is required')
        }
        if (!input.initialEventId) {
            throw new Error('Initial event id is required')
        }
        if (!validDateFormat.test(input.dateApplied.trim())) {
            throw new Error('Invalid date format')
        }
    }

    function sanitize() {
        input.role = input.role.trim()
        input.companyId = input.companyId.trim()

        input.postUrl = input.postUrl?.trim() || null
        input.salaryRangeHigh = input.salaryRangeHigh?.toString().trim() || null
        input.salaryRangeLow = input.salaryRangeLow?.toString().trim() || null

        input.dateApplied = input.dateApplied.trim()
        input.notes = input.notes?.trim() || null

        if (input.salaryRangeLow && input.salaryRangeHigh) {
            if (input.salaryRangeLow < input.salaryRangeHigh) {
                const temp = input.salaryRangeLow
                input.salaryRangeLow = input.salaryRangeHigh
                input.salaryRangeHigh = temp
            }
        }
    }
    return new Promise((resolve) => {
        validate()
        sanitize()
        resolve(input)
    })
}

async function validateAndSanitizeUpdateApplicationInput(input) {
    function validate() {
        if (!input.role) {
            throw new Error('Role is required')
        }
        if (!input.companyId) {
            throw new Error('Company is required')
        }
    }

    function sanitize() {
        input.role = input.role.trim()
        input.companyId = input.companyId.trim()
        input.postUrl = input.postUrl?.trim() || null
        input.salaryRangeHigh = input.salaryRangeHigh?.toString().trim() || null
        input.salaryRangeLow = input.salaryRangeLow?.toString().trim() || null
    }

    return new Promise((resolve) => {
        validate()
        sanitize()
        resolve(input)
    })
}

async function validateAndSanitizeNewEventInput(input) {
    function validate() {
        if (!input.applicationId) {
            throw new Error('Application Id is required')
        }
        if (!input.date) {
            throw new Error('Date is required')
        }
        if (!validDateFormat.test(input.date.trim())) {
            throw new Error('Invalid date format')
        }
    }

    function sanitize() {
        input.date = input.date.trim()
        input.notes = input.notes?.trim() || null
    }

    return new Promise((resolve) => {
        validate()
        sanitize()
        resolve(input)
    })
}

async function validateAndSanitizeUpdateEventInput(input) {
    function validate() {
        if (!input.date) {
            throw new Error('Date is required')
        }
        if (!validDateFormat.test(input.date.trim())) {
            throw new Error('Invalid date format')
        }
    }

    function sanitize() {
        input.date = input.date.trim()
        input.notes = input.notes?.trim() || null
    }

    return new Promise((resolve) => {
        validate()
        sanitize()
        resolve(input)
    })
}
