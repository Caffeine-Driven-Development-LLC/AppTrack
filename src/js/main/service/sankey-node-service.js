import {
    deleteSankeyLinksBySankeyNodeId,
    deleteSankeyNode as deleteSankeyNodeInDb,
    insertSankeyLink,
    insertSankeyNode,
    selectSankeyNodes,
    updateSankeyNode as updateSankeyNodeInDb,
} from '../persistence/sankey-node-persistence.js'
import { getEventFlowMap } from './event-flow-setting-service.js'

export const ghostedNodeId = 1
export const inProgressNodeId = 2

const permanentNodeIds = [ghostedNodeId, inProgressNodeId]

/**
 * Get all sankey nodes
 * @returns {Promise<[Object]>} A list of sankey nodes
 */
export async function getAllSankeyNodes() {
    return selectSankeyNodes().then((nodes) => {
        return nodes.map((node) => {
            return {
                id: node.id,
                name: node.name,
                color: node.color,
                applicationStateIds: node.applicationStateIds
                    ? node.applicationStateIds
                          .split(',')
                          .map((id) => parseInt(id))
                    : [],
                isTerminal: node.isTerminal === 1,
                isPermanent: permanentNodeIds.includes(node.id),
            }
        })
    })
}

/**
 * Add a sankey node
 * @param sankeyNodeInput The sankey node input object
 * @returns {Promise<[Object]>} A list of sankey nodes
 */
export async function addSankeyNode(sankeyNodeInput) {
    return validateAndSanitizeSankeyNodeInput(sankeyNodeInput)
        .then((sanitizedInput) => insertSankeyNode(sanitizedInput))
        .then((id) => {
            const insertPromises = sankeyNodeInput.applicationStateIds.map(
                (applicationStateId) => {
                    return insertSankeyLink(id, applicationStateId)
                }
            )
            return Promise.all(insertPromises)
        })
        .then(() => getAllSankeyNodes())
}

/**
 * Update a sankey node
 * @param id The id of the sankey node to update
 * @param sankeyNodeInput The sankey node input object
 * @returns {Promise<[Object]>} A list of sankey nodes
 */
export async function updateSankeyNode(id, sankeyNodeInput) {
    if (!id) throw new Error('Id is required')
    return validateAndSanitizeSankeyNodeInput(sankeyNodeInput)
        .then((sanitizedInput) => updateSankeyNodeInDb(id, sanitizedInput))
        .then(() => {
            if (permanentNodeIds.includes(id)) {
                return
            }

            return deleteSankeyLinksBySankeyNodeId(id).then(() => {
                const insertPromises = sankeyNodeInput.applicationStateIds.map(
                    (applicationStateId) => {
                        return insertSankeyLink(id, applicationStateId)
                    }
                )
                return Promise.all(insertPromises)
            })
        })
        .then(() => getAllSankeyNodes())
}

/**
 * Delete a sankey node
 * @param id The id of the sankey node to delete
 * @returns {Promise<*>} A promise that resolves when the deletion is complete
 */
export async function deleteSankeyNode(id) {
    if (permanentNodeIds.includes(id)) {
        throw new Error('Cannot delete a permanent node')
    }
    return deleteSankeyLinksBySankeyNodeId(id).then(() =>
        deleteSankeyNodeInDb(id)
    )
}

async function validateAndSanitizeSankeyNodeInput(input) {
    const colorRegex = /^#[0-9A-Fa-f]{6}$/
    const eventFlowMap = await getEventFlowMap()
    function validate() {
        if (!input.name) {
            throw new Error('Name is required')
        }
        if (!input.color) {
            throw new Error('Color is required')
        }
        if (!colorRegex.test(input.color)) {
            throw new Error('Color must be a valid hex color')
        }
        if (input.applicationStateIds) {
            input.applicationStateIds.forEach((id) => {
                if (!eventFlowMap.find((state) => state.id === id)) {
                    throw new Error(`Application state id ${id} does not exist`)
                }
            })
        }
    }

    function sanitize() {
        input.name = input.name.trim()
        input.applicationStateIds = input.applicationStateIds || []
    }

    return new Promise((resolve) => {
        validate()
        sanitize()
        resolve(input)
    })
}
