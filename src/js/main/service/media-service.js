import { saveLogo } from '../persistence/media-persistence.js'
import logger from '../logger.js'

const validImageFileTypes = ['png', 'jpeg', 'gif', 'webp']

/**
 * Saves an image to the file system and returns the path to the image.
 * @param logoBase64String base64 encoded image
 * @returns {Promise<String>} a promise that resolves to the path of the saved image
 */
export function addLogo(logoBase64String) {
    const matches = logoBase64String.match(/^data:(image\/\w+);base64,/)
    if (!matches || matches.length !== 2) {
        logger.error('Invalid base64 string')
        return new Promise((resolve, reject) => reject('Invalid base64 string'))
    }
    const fileType = matches[1].split('/')[1].toLowerCase()

    if (!validImageFileTypes.includes(fileType)) {
        logger.error('Invalid file type')
        return new Promise((resolve, reject) => reject('Invalid file type'))
    }

    const base64Data = logoBase64String.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    const filePath = saveLogo(imageBuffer, fileType)

    return new Promise((resolve) => resolve(filePath))
}
