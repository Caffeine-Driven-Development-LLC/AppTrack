import electron from 'electron'
import * as fs from 'node:fs'
import path from 'node:path'
import { deleteAllApplications } from '../persistence/application-persistence.js'
import logger, { logFilePath } from '../logger.js'
import { closeDatabaseConnection } from '../database-client.js'
import { getMediaFolderPath } from '../persistence/media-persistence.js'
import { startAutoUpdateCheck, stopAutoUpdateCheck } from './application-update-service.js'

const { app, nativeTheme } = electron

const settingsFileName = 'settings.json'
const databaseFileName = 'database.sqlite'

let settings = {}

const getDefaultSettings = () => {
    return {
        ghostPeriod: 30,
        databasePath: path.join(app.getPath('userData'), databaseFileName),
        displayTheme: 'system',
        autoCheckForUpdates: true,
    }
}
const getSettingsFilePath = () => path.join(app.getPath('userData'), settingsFileName)

function saveSettingsFile() {
    const settingsString = JSON.stringify(settings)
    fs.writeFileSync(getSettingsFilePath(), settingsString)
}

function saveSetting(settingName, settingValue) {
    settings[settingName] = settingValue
    saveSettingsFile()
}

export function initializeSettings() {
    const settingsFile = getSettingsFilePath
    if (!fs.existsSync(settingsFile())) {
        settings = getDefaultSettings()
        saveSettingsFile()
        return
    }
    const settingsContent = fs.readFileSync(settingsFile())
    Object.assign(settings, JSON.parse(settingsContent))
    settings = { ...getDefaultSettings(), ...settings }
    saveSettingsFile()
}

export const getSettings = () => {
    return {
        ...settings,
        systemTheme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
    }
}

export const ghostPeriod = () => settings.ghostPeriod
export const databasePath = () => settings.databasePath
export const displayTheme = () => settings.displayTheme
export const autoCheckForUpdates = () => settings.autoCheckForUpdates

export function setGhostPeriod(ghostPeriod) {
    saveSetting('ghostPeriod', ghostPeriod)
}

export function setDatabasePath(databasePath) {
    saveSetting('databasePath', databasePath)
}

export function setDisplayTheme(displayTheme) {
    saveSetting('displayTheme', displayTheme)
}

export function setAutoCheckForUpdates(autoCheckForUpdates) {
    saveSetting('autoCheckForUpdates', autoCheckForUpdates)

    if (autoCheckForUpdates) {
        startAutoUpdateCheck()
    } else {
        stopAutoUpdateCheck()
    }
}

export function deleteApplicationData() {
    logger.info('Deleting all application data')
    deleteAllApplications().catch((error) => {
        logger.error('Error deleting application data', error)
    })
}

export function deleteAllData() {
    closeDatabaseConnection()
        .then(() => fs.unlinkSync(settings.databasePath))
        .then(() => fs.unlinkSync(getSettingsFilePath()))
        .then(() => fs.unlinkSync(logFilePath))
        .then(() => fs.rm(getMediaFolderPath(), {recursive: true, force: true}))
        .then(() => {
            app.relaunch()
            app.exit(0)
        })
}
