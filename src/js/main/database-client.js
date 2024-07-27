import { databasePath } from './service/setting-service.js'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import logger from './logger.js'
import { app } from 'electron'
import path from 'node:path'

let dbConnection = null

export async function setDatabaseConnection() {
    logger.info('Setting database connection')
    const dbPath = databasePath()
    dbConnection = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    })
        .then(async (db) => {
            const migrationsPath = path.join(
                app.getAppPath(),
                '.webpack/main/dbMigrations'
            )
            logger.debug(`Migrations path: ${migrationsPath}`)
            await db.migrate({
                migrationsPath: migrationsPath,
            })
            await db.run('PRAGMA foreign_keys = ON')
            return db
        })
        .catch((error) => {
            logger.error(`Error setting database connection: ${error.message}`)
        })
}

export async function closeDatabaseConnection() {
    return dbConnection.close()
}

export const getDatabaseConnection = () => dbConnection
