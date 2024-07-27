import crypto from 'crypto'

export function getNewId() {
    return crypto.randomUUID()
}

export const getLastInsertedIdSql = 'SELECT last_insert_rowid() as lastID'
