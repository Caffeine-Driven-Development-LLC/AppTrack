import {
    addSankeyNode,
    deleteSankeyNode,
    getAllSankeyNodes,
    updateSankeyNode,
} from '../service/sankey-node-service.js'
import {
    requestAddSankeyNode,
    requestDeleteSankeyNode,
    requestGetSankeyNodes,
    requestUpdateSankeyNode,
    responseSankeyNodes,
} from '../../shared/sankey-node-ipc-channels.js'
import logger from '../logger.js'

export default function (ipcMain) {
    ipcMain.on(requestGetSankeyNodes, async (event) => {
        logger.debug('Requesting sankey nodes')
        getAllSankeyNodes()
            .then((sankeyNodes) => {
                logger.debug(
                    `Found sankey nodes: ${JSON.stringify(sankeyNodes)}`
                )
                event.reply(responseSankeyNodes, sankeyNodes)
            })
            .catch((error) => {
                logger.error(`Error getting sankey nodes: ${error.message}`)
            })
    })

    ipcMain.on(requestAddSankeyNode, async (event, sankeyNodeInput) => {
        logger.debug('Adding new sankey node')
        addSankeyNode(sankeyNodeInput)
            .then((sankeyNodes) => {
                event.reply(responseSankeyNodes, sankeyNodes)
            })
            .catch((error) => {
                logger.error(`Error adding sankey node: ${error.message}`)
            })
    })

    ipcMain.on(requestUpdateSankeyNode, async (event, id, sankeyNodeInput) => {
        logger.debug(`Updating sankey node with id: ${id}`)
        updateSankeyNode(id, sankeyNodeInput)
            .then((sankeyNodes) => {
                event.reply(responseSankeyNodes, sankeyNodes)
            })
            .catch((error) => {
                logger.error(`Error updating sankey node: ${error.message}`)
            })
    })

    ipcMain.on(requestDeleteSankeyNode, async (event, id) => {
        logger.debug(`Deleting sankey node with id: ${id}`)
        deleteSankeyNode(id)
            .then(() => {
                logger.debug(`Deleted sankey node with id: ${id}`)
                return getAllSankeyNodes()
            })
            .then((sankeyNodes) => {
                event.reply(responseSankeyNodes, sankeyNodes)
            })
            .catch((error) => {
                logger.error(`Error deleting sankey node: ${error.message}`)
            })
    })
}
