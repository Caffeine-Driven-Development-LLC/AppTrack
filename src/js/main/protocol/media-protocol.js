import { protocol } from 'electron'
import logger from '../logger.js'
import { getMediaByPath } from '../persistence/media-persistence.js'

export const registerMediaProtocol = () => {
    protocol.registerSchemesAsPrivileged([
        {
            scheme: 'media',
            privileges: {
                bypassCSP: true,
            },
        },
    ])
}

export const registerMediaActions = () => {
    protocol.handle('media', (request) => {
        logger.info(`Requesting media: ${request.url}`)
        const filePath = request.url.slice('media://'.length).split('?')[0]
        return getMediaByPath(filePath)
    })
}
