import { getNewId } from './persistance-utils.js'
import { getDatabaseConnection } from '../database-client.js'

export async function insertApplication(applicationInput) {
    let newId = getNewId()
    await getDatabaseConnection().run(insertApplicationSql, [
        newId,
        applicationInput.companyId,
        applicationInput.role,
        applicationInput.postUrl,
        applicationInput.salaryRangeHigh,
        applicationInput.salaryRangeLow,
    ])
    return newId
}

export async function selectApplication(id) {
    return getDatabaseConnection().get(selectApplicationByIdSql, id)
}

export async function selectApplications(
    includeDeleted = false,
    cutoffDate = null,
    showTerminated = false
) {
    console.log(selectAllApplicationsSql(includeDeleted, cutoffDate, showTerminated))

    return getDatabaseConnection().all(
        selectAllApplicationsSql(includeDeleted, cutoffDate, showTerminated)
    )
}

export async function updateApplication(id, applicationInput) {
    return getDatabaseConnection().run(updateApplicationSql, [
        applicationInput.companyId,
        applicationInput.role,
        applicationInput.postUrl,
        applicationInput.salaryRangeHigh,
        applicationInput.salaryRangeLow,
        id,
    ])
}

export async function deleteApplication(id) {
    return getDatabaseConnection().run(deleteApplicationByIdSql, [id])
}

export async function insertEvent(applicationEventInput) {
    return getDatabaseConnection().run(insertEventSql, [
        applicationEventInput.applicationId,
        applicationEventInput.date,
        applicationEventInput.applicationStateId,
        applicationEventInput.notes,
    ])
}

export async function updateEvent(id, applicationEventInput) {
    return getDatabaseConnection().run(updateEventSql, [
        applicationEventInput.date,
        applicationEventInput.notes,
        id,
    ])
}

export async function selectEvent(id) {
    return getDatabaseConnection().get(selectEventByIdSql, [id])
}

export async function deleteEvent(id) {
    return getDatabaseConnection().run(deleteEventByIdSql, [id])
}

export async function deleteEventsByApplicationId(applicationId) {
    return getDatabaseConnection().run(deleteEventsByApplicationIdSql, [
        applicationId,
    ])
}

export async function selectEventsByApplicationId(applicationId) {
    return getDatabaseConnection().all(selectEventsByApplicationIdSql, [
        applicationId,
    ])
}

export async function selectApplicationsByCompanyId(companyId) {
    return getDatabaseConnection().all(selectApplicationsByCompanyIdSql, [
        companyId,
    ])
}

export async function searchApplications(searchText) {
    return getDatabaseConnection().all(searchApplicationByRoleAndCompanySql, [
        searchText,
        searchText,
    ])
}

export async function deleteAllApplications() {
    return getDatabaseConnection()
        .run(deleteAllEventsSql)
        .then(() => {
            getDatabaseConnection().run(deleteAllApplicationsSql)
        })
}

const insertApplicationSql = `INSERT INTO applications 
(id, companyId, role, postUrl, salaryRangeHigh, salaryRangeLow) 
VALUES (?,?,?,?,?,?)`

const selectApplicationByIdSql = `SELECT
application.id              as id,
application.role            as role,
application.postUrl         as postUrl,
application.salaryRangeHigh as salaryRangeHigh,
application.salaryRangeLow  as salaryRangeLow,
company.id                  as companyId,
company.logoPath            as companyLogoPath,
company.name                as companyName,
recent_event.date           as lastUpdated,
applicationState.id         as statusId,
applicationState.name       as status,
application.isDeleted       as isDeleted
FROM applications application
JOIN companies company on application.companyId = company.id
LEFT JOIN (
SELECT
event.id,
event.applicationId,
event.applicationStateId,
event.date,
ROW_NUMBER() OVER(PARTITION BY applicationId ORDER BY id DESC) rn
FROM events event
WHERE event.applicationStateId IS NOT NULL
) recent_event ON application.id = recent_event.applicationId
LEFT JOIN applicationStates applicationState ON recent_event.applicationStateId = applicationState.id
WHERE application.id = ?
AND recent_event.rn = 1;`

const selectAllApplicationsSql = (
    includeDeleted,
    cutoffDate,
    showTerminated
) => `SELECT
application.id              as id,
application.role            as role,
application.postUrl         as postUrl,
application.salaryRangeHigh as salaryRangeHigh,
application.salaryRangeLow  as salaryRangeLow,
company.id                 as companyId,
company.logoPath           as companyLogoPath,
company.name               as companyName,
recent_event.date          as lastUpdated,
applicationState.id         as statusId,
applicationState.name       as status,
application.isDeleted       as isDeleted
FROM applications application
JOIN companies company ON application.companyId = company.id
LEFT JOIN (
SELECT
    event.id,
    event.applicationId,
    event.applicationStateId,
    event.date,
    ROW_NUMBER() OVER(PARTITION BY applicationId ORDER BY id DESC) rn
FROM events event
WHERE event.applicationStateId IS NOT NULL
) recent_event ON application.id = recent_event.applicationId
LEFT JOIN applicationStates applicationState ON recent_event.applicationStateId = applicationState.id
WHERE ((${includeDeleted ? 1 : 0} = 1) OR (application.isDeleted = 0))
AND recent_event.rn = 1
AND (${cutoffDate} is null OR recent_event.date > '${cutoffDate}')
AND ((${showTerminated ? 1 : 0} = 1) OR EXISTS(
SELECT 1
FROM applicationFlow flow
WHERE flow.applicationStateId = applicationState.id
))
ORDER BY applicationState.displayOrder DESC, recent_event.date DESC`

const updateApplicationSql = `UPDATE applications SET
companyId = ?,
role = ?,
postUrl = ?,
salaryRangeHigh = ?,
salaryRangeLow = ?
WHERE id = ?`

const deleteApplicationByIdSql = `UPDATE applications SET isDeleted = 1 WHERE id = ?`

const insertEventSql = `INSERT INTO events 
(applicationId, date, applicationStateId, notes) 
VALUES (?, ?, ?, ?)`

const updateEventSql = `UPDATE events SET
date = ?,
notes = ?
WHERE id = ?`

const selectEventByIdSql = `SELECT
id,
applicationId,
date,
s.name as status,
notes
FROM events
WHERE id = ?
LEFT JOIN applicationStates s ON e.applicationStateId = s.id`

const deleteEventByIdSql = `DELETE FROM events WHERE id = ?`

const deleteEventsByApplicationIdSql = `DELETE FROM events WHERE applicationId = ?`

const selectEventsByApplicationIdSql = `SELECT
e.id,
s.id as statusId,
s.name as status,
e.date,
e.notes
FROM events e
LEFT JOIN applicationStates s ON e.applicationStateId = s.id
WHERE e.applicationId = ?`

const selectApplicationsByCompanyIdSql = `SELECT
application.id              as id,
application.role            as role,
application.postUrl         as postUrl,
application.salaryRangeHigh as salaryRangeHigh,
application.salaryRangeLow  as salaryRangeLow,
company.id                 as companyId,
company.logoPath           as companyLogoPath,
company.name               as companyName,
recent_event.date          as lastUpdated,
applicationState.id         as statusId,
applicationState.name       as status,
application.isDeleted       as isDeleted
FROM applications application
JOIN companies company ON application.companyId = company.id
LEFT JOIN (
SELECT
    event.id,
    event.applicationId,
    event.applicationStateId,
    event.date,
    ROW_NUMBER() OVER(PARTITION BY applicationId ORDER BY id DESC) rn
FROM events event
WHERE event.applicationStateId IS NOT NULL
) recent_event ON application.id = recent_event.applicationId
LEFT JOIN applicationStates applicationState ON recent_event.applicationStateId = applicationState.id
WHERE application.isDeleted = 0
AND recent_event.rn = 1
AND application.companyId = ?`

const searchApplicationByRoleAndCompanySql = `SELECT
application.id              as id,
application.role            as role,
application.postUrl         as postUrl,
application.salaryRangeHigh as salaryRangeHigh,
application.salaryRangeLow  as salaryRangeLow,
company.id                 as companyId,
company.logoPath           as companyLogoPath,
company.name               as companyName,
recent_event.date          as lastUpdated,
applicationState.id         as statusId,
applicationState.name       as status,
application.isDeleted       as isDeleted
FROM applications application
JOIN companies company ON application.companyId = company.id
LEFT JOIN (
SELECT
    event.id,
    event.applicationId,
    event.applicationStateId,
    event.date,
    ROW_NUMBER() OVER(PARTITION BY applicationId ORDER BY id DESC) rn
FROM events event
WHERE event.applicationStateId IS NOT NULL
) recent_event ON application.id = recent_event.applicationId
LEFT JOIN applicationStates applicationState ON recent_event.applicationStateId = applicationState.id
WHERE application.isDeleted = 0
AND recent_event.rn = 1
AND (
    application.role like '%' || ? || '%'
        OR
    company.name like '%' || ? || '%'
    )
ORDER BY applicationState.displayOrder DESC, recent_event.date DESC`

const deleteAllEventsSql = `DELETE FROM events;`

const deleteAllApplicationsSql = `DELETE FROM applications;`
