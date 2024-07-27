import { getDatabaseConnection } from '../database-client.js'
import { getLastInsertedIdSql } from './persistance-utils.js'

export async function insertSankeyNode(sankeyNodeInput) {
    await getDatabaseConnection().run(insertSankeyNodeSql, {
        $name: sankeyNodeInput.name,
        $color: sankeyNodeInput.color,
    })
    const { lastID } = await getDatabaseConnection().run(getLastInsertedIdSql)
    return lastID
}

export async function insertSankeyLink(sankeyNodeId, applicationStateId) {
    return getDatabaseConnection().run(insertSankeyLinkSql, {
        $sankeyNodeId: sankeyNodeId,
        $applicationStateId: applicationStateId,
    })
}

export async function updateSankeyNode(id, sankeyNodeInput) {
    return getDatabaseConnection().run(updateSankeyNodeSql, {
        $name: sankeyNodeInput.name,
        $color: sankeyNodeInput.color,
        $id: id,
    })
}

export async function deleteSankeyNode(id) {
    await deleteSankeyLinksBySankeyNodeId(id)
    return getDatabaseConnection().run(deleteSankeyNodeSql, {
        $id: id,
    })
}

export async function deleteSankeyLinksBySankeyNodeId(sankeyNodeId) {
    return getDatabaseConnection().run(deleteSankeyLinksBySankeyNodeIdSql, {
        $sankeyNodeId: sankeyNodeId,
    })
}

export async function deleteSankeyLinksByApplicationStateId(
    applicationStateId
) {
    return getDatabaseConnection().run(
        deleteSankeyLinksByApplicationStateIdSql,
        {
            $applicationStateId: applicationStateId,
        }
    )
}

export async function selectSankeyNodes() {
    return getDatabaseConnection().all(selectAllSankeyNodesSql)
}

const insertSankeyNodeSql = `INSERT INTO sankeyNodes (name, color) VALUES ($name, $color)`

const insertSankeyLinkSql = `INSERT INTO sankeyLinks (sankeyNodeId, applicationStateId) VALUES ($sankeyNodeId, $applicationStateId)`

const selectAllSankeyNodesSql = `SELECT
    n.id,
    n.name,
    n.color,
    GROUP_CONCAT(l.applicationStateId, ',') AS applicationStateIds,
    NOT EXISTS (
        SELECT 1 FROM applicationFlow af 
        WHERE af.applicationStateId = l.applicationStateId
    ) AS isTerminal
FROM sankeyNodes n
LEFT JOIN sankeyLinks l on n.id = l.sankeyNodeId
GROUP BY n.id`

const updateSankeyNodeSql = `UPDATE sankeyNodes SET name = $name, color = $color WHERE id = $id`

const deleteSankeyLinksBySankeyNodeIdSql = `DELETE FROM sankeyLinks WHERE sankeyNodeId = $sankeyNodeId`

const deleteSankeyNodeSql = `DELETE FROM sankeyNodes WHERE id = $id`

const deleteSankeyLinksByApplicationStateIdSql = `DELETE FROM sankeyLinks WHERE applicationStateId = $applicationStateId`
