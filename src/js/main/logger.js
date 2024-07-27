import winston from 'winston'
import { app } from 'electron'
import path from 'node:path'

const myFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${JSON.stringify(message)}`
})

export const logFilePath = path.join(app.getPath('userData'), 'logfile.log')

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp(), myFormat),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: logFilePath }),
    ],
})

export default logger
