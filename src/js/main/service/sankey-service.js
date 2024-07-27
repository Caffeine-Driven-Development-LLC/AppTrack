import {
    getAllSankeyNodes,
    ghostedNodeId,
    inProgressNodeId,
} from './sankey-node-service.js'

/**
 * Generate sankey data from applications and there events
 * @param applications The applications to generate sankey data from
 * @returns {Promise<{nodes: *[], links: *[]}>} The sankey data
 */
export async function getSankeyData(applications) {
    const nodes = []
    const links = []

    const sankeyNodes = await getAllSankeyNodes()

    const mapToNode = (id) => {
        const fullNode = sankeyNodes.find((n) => n.id === id)
        return {
            name: fullNode.name,
            color: fullNode.color,
            isTerminal: fullNode.isTerminal,
        }
    }

    const ghostedNode = mapToNode(ghostedNodeId)
    const inProgressNode = mapToNode(inProgressNodeId)

    const trackedEvents = sankeyNodes.reduce((map, sankeyNodes) => {
        sankeyNodes.applicationStateIds.forEach((applicationStateId) => {
            map[applicationStateId] = {
                name: sankeyNodes.name,
                color: sankeyNodes.color,
                isTerminal: sankeyNodes.isTerminal,
            }
        })
        return map
    }, {})

    const addNode = (node) => {
        let existingNode = nodes.find((n) => n.name === node.name)
        if (existingNode) {
            existingNode.value += 1
            return
        }
        node.value = 1
        nodes.push(node)
    }

    const addLink = (from, to) => {
        const link = links.find((link) => link.from === from && link.to === to)
        if (link) {
            link.flow += 1
            return
        }
        links.push({ from: from, to: to, flow: 1 })
    }

    applications.forEach((application) => {
        let previousEventId = null
        application.events
            .map((event) => event.statusId)
            .filter((statusId) => trackedEvents[statusId])
            .filter((statusId, index, self) => {
                const trackedEvent = trackedEvents[statusId]
                return (
                    self.findIndex(
                        (id) => trackedEvents[id].name === trackedEvent.name
                    ) === index
                )
            })
            .forEach((statusId) => {
                addNode(trackedEvents[statusId])
                if (!previousEventId) {
                    previousEventId = statusId
                    return
                }
                if (
                    trackedEvents[previousEventId].name ===
                    trackedEvents[statusId].name
                )
                    return
                addLink(
                    trackedEvents[previousEventId].name,
                    trackedEvents[statusId].name
                )
                previousEventId = statusId
            })

        if (previousEventId && !trackedEvents[previousEventId].isTerminal) {
            if (application.ghosted) {
                addNode(ghostedNode)
                addLink(trackedEvents[previousEventId].name, ghostedNode.name)
            } else {
                addNode(inProgressNode)
                addLink(
                    trackedEvents[previousEventId].name,
                    inProgressNode.name
                )
            }
        }
    })

    return { nodes, links }
}
