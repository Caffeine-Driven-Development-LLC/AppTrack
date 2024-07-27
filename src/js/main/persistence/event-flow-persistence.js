import { getDatabaseConnection } from '../database-client.js'
import { getLastInsertedIdSql } from './persistance-utils.js'

export async function selectApplicationStates() {
    return getDatabaseConnection().all(selectAllApplicationStatesSql)
}

export async function swapDisplayOrderOfApplicationStates(
    id1,
    id2,
    displayOrder1,
    displayOrder2
) {
    return getDatabaseConnection().run(swapDisplayOrderOfApplicationStatesSql, [
        id1,
        displayOrder2,
        id2,
        displayOrder1,
        id1,
        id2,
    ])
}

export async function insertApplicationState(applicationStateInput) {
    await getDatabaseConnection().run(insertApplicationStateSql, [
        applicationStateInput.name,
        applicationStateInput.alwaysAvailable,
        applicationStateInput.initialStep,
    ])

    const { lastID } = await getDatabaseConnection().run(getLastInsertedIdSql)
    return lastID
}

export async function updateApplicationState(id, applicationStateInput) {
    return getDatabaseConnection().run(updateApplicationStateSql, [
        applicationStateInput.name,
        applicationStateInput.alwaysAvailable,
        applicationStateInput.initialStep,
        id,
    ])
}

export async function deleteApplicationState(id) {
    return getDatabaseConnection().run(deleteApplicationStateSql, [id])
}

export async function removeApplicationStateFromFlowById(id) {
    return getDatabaseConnection().run(removeApplicationStateFromFlowByIdSql, [
        id,
    ])
}

export async function removeApplicationStateFromFlowByNextStepId(id) {
    return getDatabaseConnection().run(
        removeApplicationStateFromFlowByNextStepIdSql,
        [id]
    )
}

export async function insertApplicationFlow(applicationStepId, nextStepId) {
    return getDatabaseConnection().run(insertApplicationFlowSql, [
        applicationStepId,
        nextStepId,
    ])
}

const selectAllApplicationStatesSql = `SELECT
    s.id,
    s.name,
    s.displayOrder,
    s.alwaysAvailable,
    s.initialStep,
    s.isDeleted,
    GROUP_CONCAT(f.nextApplicationStateId, ',') AS availableNextStepIds
FROM applicationStates s
LEFT JOIN applicationFlow f on s.id = f.applicationStateId
GROUP BY s.id
ORDER BY s.displayOrder ASC`

const insertApplicationStateSql = `INSERT INTO applicationStates (
    name,
    displayOrder,
    alwaysAvailable,
    initialStep,
    isDeleted
) VALUES (?, (SELECT IFNULL(MAX(displayOrder), 0) + 1 FROM applicationStates), ?, ?, 0)`

const insertApplicationFlowSql = `INSERT INTO applicationFlow (
    applicationStateId,
    nextApplicationStateId
) VALUES (?, ?)`

const updateApplicationStateSql = `UPDATE applicationStates
    SET name = ?,
    alwaysAvailable = ?,
    initialStep = ?
WHERE id = ?`

const deleteApplicationStateSql = `UPDATE applicationStates
SET isDeleted = 1
WHERE id = ?`

const removeApplicationStateFromFlowByIdSql = `DELETE FROM applicationFlow
WHERE applicationStateId = ?`

const removeApplicationStateFromFlowByNextStepIdSql = `DELETE FROM applicationFlow
WHERE nextApplicationStateId = ?`

const swapDisplayOrderOfApplicationStatesSql = `UPDATE applicationStates
SET displayOrder = CASE
    WHEN id = ? THEN ?
    WHEN id = ? THEN ?
    ELSE displayOrder
END
WHERE id IN (?, ?)`
