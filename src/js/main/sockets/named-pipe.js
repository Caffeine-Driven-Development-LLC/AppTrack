import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import net from 'net'
import logger from '../logger.js'
import { getAllCompanies } from '../service/company-service.js'

export const initializeNamedPipe = () => {
    const socketPath = path.join(app.getPath('userData'), 'app-track.sock')

    const server = net.createServer((connection) => {
        let buffer = ''

        connection.on('data', async (data) => {
            console.log('Received data:', data)
            logger.debug(`Received data: ${data}`)
            buffer += data.toString()
        })

        connection.on('end', async () => {
            console.log('Client disconnected')
        })

        connection.on('error', (err) => {
            console.error('Connection error:', err)
        })
    })

    server.listen(socketPath, () => {
        logger.info(`Server listening on ${socketPath}`)
    })

    server.on('error', (error) => {
        logger.error(`Server error: ${error}`)
    })

    app.on('will-quit', () => {
        server.close(() => {
            logger.info('Server has been shut down.')
            fs.unlink(socketPath, (err) => {
                if (err) logger.error(`Error removing socket file: ${err}`)
            })
        })
    })
}

function isValidJson(str) {
    try {
        JSON.parse(str)
        return true
    } catch (e) {
        return false
    }
}

async function doRequest(request, connection) {
    const action = request.action ?? '[no action provided]'
    logger.info(`Received request: ${action}`)
    switch (action) {
        case 'ping':
            connection.write(
                JSON.stringify({
                    id: request.id,
                    result: 'pong',
                })
            )
            break
        case 'getCompanies':
            try {
                logger.debug('Getting companies')
                const companies = await getAllCompanies()
                logger.debug(`Sending ${companies.length} companies`)
                const response = {
                    id: request.id,
                    result: companies,
                }
                logger.debug(`Sending response: ${JSON.stringify(response)}`)
                connection.write(JSON.stringify(response))
                logger.debug('Response sent')
            } catch (error) {
                logger.error(`Error getting companies: ${error}`)
                connection.write(
                    JSON.stringify({
                        id: request.id,
                        result: { error: 'Error getting companies' },
                    })
                )
            }
            break
        default:
            logger.error(`Unknown action: ${action}`)
            connection.write(
                JSON.stringify({
                    id: request.id,
                    result: { error: 'Not implemented' },
                })
            )
    }
}
