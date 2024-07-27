import {
    deleteCompany,
    insertCompany,
    selectCompanies,
    selectCompany,
    updateCompany as updateCompanyInDb,
} from '../persistence/company-persistence.js'
import { addLogo } from './media-service.js'
import { deleteMedia } from '../persistence/media-persistence.js'
import logger from '../logger.js'

/**
 * Crates a new company.
 * @param companyInput object with the company data
 * @param logo optional logo image as a base64 string
 * @returns {Promise<string>} a promise that resolves to the id of the new company
 */
export async function createNewCompany(companyInput, logo) {
    return validateAndSanitizeNewCompanyInput(companyInput)
        .then((sanitizedCompanyInput) => {
            if (logo) {
                return addLogo(logo).then((logoPath) => {
                    sanitizedCompanyInput.logoPath = logoPath
                    return sanitizedCompanyInput
                })
            }
            return sanitizedCompanyInput
        })
        .then((companyInput) => insertCompany(companyInput))
        .then((newCompanyId) => getCompanyById(newCompanyId))
}

/**
 * Returns a company by its id or null if it does not exist.
 * @param id
 * @returns {Promise<Object>} a promise that resolves to the company object
 */
export async function getCompanyById(id) {
    return selectCompany(id)
}

/**
 * Updates a company.
 * @param id id of the company to update
 * @param companyInput object with the company data
 * @param hasLogoChanged boolean indicating if the logo has changed
 * @param logo optional new logo image as a base64 string
 * @returns {Promise<Object>} a promise that resolves to the updated company object
 */
export async function updateCompany(id, companyInput, hasLogoChanged, logo) {
    if (!id) throw new Error('Company id is required')
    return validateAndSanitizeNewCompanyInput(companyInput)
        .then(async (sanitizedCompanyInput) => {
            if (hasLogoChanged) {
                const oldCompany = await getCompanyById(id)
                if (oldCompany.logoPath) {
                    deleteMedia(oldCompany.logoPath)
                }
                sanitizedCompanyInput.logoPath = null
                if (logo) {
                    sanitizedCompanyInput.logoPath = await addLogo(logo)
                }
            }
            return sanitizedCompanyInput
        })
        .then((companyInput) => updateCompanyInDb(id, companyInput))
        .then(() => getCompanyById(id))
}

/**
 * Soft deletes a company by setting the isDeleted flag to true.
 * As a side effect if a logo is associated with the company it will be deleted.
 * @param id id of the company to remove
 * @returns {Promise<*>} a promise that resolves to the id of the removed company
 */
export async function removeCompany(id) {
    return getCompanyById(id)
        .then((company) => {
            if (!company) {
                throw new Error('Company not found')
            }
            return company
        })
        .then((company) => {
            if (company.logoPath) {
                return deleteMedia(company.logoPath)
            }
            return null
        })
        .then(() => deleteCompany(id))
        .then(() => id)
        .catch((error) => {
            logger.warn(`Failed to remove company with id ${id}`, error)
            return id
        })
}

/**
 * Returns all companies.
 * @returns {Promise<[Object]>} a promise that resolves to an array of company objects
 */
export async function getAllCompanies() {
    return selectCompanies()
}

async function validateAndSanitizeNewCompanyInput(input) {
    function validate() {
        if (!input.name) {
            throw new Error('Company name is required')
        }
    }

    function sanitize() {
        input.name = input.name.trim()
        input.homePage = input.homePage?.trim() || null
        input.careerPage = input.careerPage?.trim() || null
        input.notes = input.notes?.trim() || null
    }

    return new Promise((resolve) => {
        validate()
        sanitize()
        resolve(input)
    })
}
