import {
    requestCompanies,
    requestCompanyNames,
    requestCreateCompany,
    requestDeleteCompany,
    requestGetCompany,
    requestUpdateCompany,
    responseCompanies,
    responseCompany,
    responseCompanyDeleted,
    responseCompanyNames,
} from '../../shared/company-ipc-channels.js'
import { selectCompanyNames } from '../persistence/company-persistence.js'
import {
    createNewCompany,
    getAllCompanies,
    getCompanyById,
    removeCompany,
    updateCompany,
} from '../service/company-service.js'
import logger from '../logger.js'

export default function (ipcMain) {
    ipcMain.on(requestCreateCompany, async (event, companyInput, logo) => {
        logger.debug('Creating new company')
        createNewCompany(companyInput, logo)
            .then((company) => {
                logger.debug(`Created company: ${JSON.stringify(company)}`)
                event.reply(responseCompany, company)
                return company
            })
            .catch((error) => {
                logger.error(`Error creating company: ${error.message}`)
            })
    })
    ipcMain.on(requestGetCompany, async (event, args) => {
        logger.debug(`Requesting company with id: ${args}`)
        getCompanyById(args)
            .then((company) => {
                logger.debug(`Found company: ${JSON.stringify(company)}`)
                event.reply(responseCompany, company)
            })
            .catch((error) => {
                logger.error(`Error getting company: ${error.message}`)
            })
    })
    ipcMain.on(
        requestUpdateCompany,
        async (event, id, companyInput, hasLogoChanged, logo) => {
            logger.debug(`Updating company with id: ${id}`)
            updateCompany(id, companyInput, hasLogoChanged, logo)
                .then((company) => {
                    logger.debug(`Updated company: ${JSON.stringify(company)}`)
                    event.reply(responseCompany, company)
                    return company
                })
                .catch((error) => {
                    logger.error(`Error updating company: ${error.message}`)
                })
        }
    )
    ipcMain.on(requestDeleteCompany, async (event, args) => {
        logger.debug(`Deleting company with id: ${args}`)
        removeCompany(args)
            .then(() => {
                logger.debug(`Deleted company with id: ${args}`)
                event.reply(responseCompanyDeleted, args)
            })
            .catch((error) => {
                logger.error(`Error deleting company: ${error.message}`)
            })
    })

    ipcMain.on(requestCompanies, async (event, args) => {
        logger.debug('Requesting all companies')
        getAllCompanies(args)
            .then((companies) => {
                logger.debug(`Found companies: ${JSON.stringify(companies)}`)
                event.reply(responseCompanies, companies)
            })
            .catch((error) => {
                logger.error(`Error getting companies: ${error.message}`)
            })
    })
    ipcMain.on(requestCompanyNames, async (event) => {
        logger.debug('Requesting company names')
        selectCompanyNames()
            .then((companies) => {
                event.reply(responseCompanyNames, companies)
            })
            .catch((error) => {
                logger.error(`Error getting company names: ${error.message}`)
            })
    })
}
