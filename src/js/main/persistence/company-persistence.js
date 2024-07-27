import { getNewId } from './persistance-utils.js'
import { getDatabaseConnection } from '../database-client.js'

export async function insertCompany(companyInput) {
    let newId = getNewId()
    await getDatabaseConnection().run(insertCompanySql, [
        newId,
        companyInput.name,
        companyInput.homePage,
        companyInput.careerPage,
        companyInput.logoPath,
        companyInput.notes,
        companyInput.isFavorite,
    ])
    return newId
}

export async function selectCompany(id) {
    return getDatabaseConnection().get(selectCompanySql, [id])
}

export async function updateCompany(id, companyInput) {
    return getDatabaseConnection().run(updateCompanySql, [
        companyInput.name,
        companyInput.homePage,
        companyInput.careerPage,
        companyInput.logoPath,
        companyInput.notes,
        companyInput.isFavorite,
        id,
    ])
}

export async function deleteCompany(id) {
    return getDatabaseConnection().run(deleteCompanySql, id)
}

export async function selectCompanies() {
    return getDatabaseConnection().all(selectCompaniesSql)
}

export async function selectCompanyNames() {
    return getDatabaseConnection().all(getCompanyNamesSql)
}

const insertCompanySql = `INSERT INTO companies
(id, name, homePage, careerPage, logoPath, notes, isFavorite)
VALUES (?,?,?,?,?,?,?)`

const selectCompanySql = `SELECT
    c.id,
    c.name,
    c.homePage,
    c.careerPage,
    c.notes,
    c.logoPath,
    c.isFavorite,
    c.isDeleted,
    COUNT(a.id) AS applicationCount,
    MAX(e.date) AS mostRecentApplication
FROM companies c
LEFT JOIN applications a ON c.id = a.companyId
LEFT JOIN events e ON a.id = e.applicationId AND e.applicationStateId IN (
    SELECT id FROM applicationStates WHERE initialStep = 1
)
WHERE c.id = ?`

const updateCompanySql = `UPDATE companies SET
  name = ?,
  homePage = ?,
  careerPage = ?,
  logoPath = ?,
  notes = ?,
  isFavorite = ?
WHERE id = ?`

const deleteCompanySql = `UPDATE companies SET isDeleted = 1, logoPath = null WHERE id = ?`

const selectCompaniesSql = `SELECT
    c.id,
    c.name,
    c.homePage,
    c.careerPage,
    c.notes,
    c.logoPath,
    c.isFavorite,
    c.isDeleted,
    COUNT(a.id) AS applicationCount,
    MAX(e.date) AS mostRecentApplication
FROM companies c
LEFT JOIN applications a ON c.id = a.companyId
LEFT JOIN events e ON a.id = e.applicationId AND e.applicationStateId IN (
    SELECT id FROM applicationStates WHERE initialStep = 1
)
WHERE c.isDeleted = 0
GROUP BY c.id
ORDER BY c.isFavorite DESC, LOWER(c.name) ASC`

const getCompanyNamesSql = `SELECT id, name FROM companies WHERE isDeleted = 0;`
