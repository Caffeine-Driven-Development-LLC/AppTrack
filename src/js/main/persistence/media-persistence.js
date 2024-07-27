import fs from 'node:fs'
import path from 'node:path'
import { app, net } from 'electron'
import url from 'node:url'
import { getNewId } from './persistance-utils.js'

const mediaFolderPath = `media`
const logoPath = `logos`

export const getMediaFolderPath = () =>
    path.join(app.getPath('userData'), mediaFolderPath)

const getLogoFolderPath = () => path.join(getMediaFolderPath(), logoPath)

function getMediaByPath(pathToMedia) {
    const filePath = path.join(getMediaFolderPath(), pathToMedia)
    if (fs.existsSync(filePath)) {
        return net.fetch(url.pathToFileURL(filePath))
    } else {
        return new Promise((resolve, reject) => reject(Response.error()))
    }
}

function saveMedia(filePath, media) {
    const folderPath = path.dirname(filePath)
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    }
    fs.writeFileSync(filePath, media)
}

function deleteMedia(pathToMedia) {
    const filePath = path.join(getMediaFolderPath(), pathToMedia)
    if (!fs.existsSync(filePath)) {
        return
    }
    fs.unlinkSync(filePath)
}

function saveLogo(logoBinary, fileType) {
    const guid = getNewId()
    const filePath = path.join(getLogoFolderPath(), `${guid}.${fileType}`)
    saveMedia(filePath, logoBinary)

    const relativePath = path.relative(getMediaFolderPath(), filePath)
    const posixPath = relativePath.split(path.sep).join(path.posix.sep)

    return posixPath
}

export { getMediaByPath, saveLogo, deleteMedia }
