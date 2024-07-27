import {
    createNewCompany,
    getAllCompanies,
    getCompanyById,
    removeCompany,
    updateCompany,
} from '../company-service.js'

jest.mock('../../logger.js', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logFilePath: 'test/path',
}))

jest.mock('../media-service.js', () => ({
    addLogo: jest.fn(),
}))

jest.mock('../../persistence/media-persistence.js', () => ({
    deleteMedia: jest.fn(),
}))

jest.mock('../../persistence/company-persistence.js', () => ({
    deleteCompany: jest.fn(),
    insertCompany: jest.fn(),
    selectCompanies: jest.fn(),
    selectCompany: jest.fn(),
    updateCompany: jest.fn(),
}))

describe('CompanyService Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createNewCompany', () => {
        it('should fail when no name is provided ', async () => {
            const companyInput = {
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            }

            expect.assertions(1)
            return createNewCompany(companyInput).catch((e) => {
                expect(e.message).toBe('Company name is required')
            })
        })

        it('should sanitize the inputs', async () => {
            const companyInput = {
                name: '     Example Company    ',
                homePage: '     https://www.example.com     ',
                careerPage: '     https://www.example.com/careers     ',
                notes: '      Some notes        ',
            }

            const mockInsertCompany =
                require('../../persistence/company-persistence.js').insertCompany
            const mockSelectCompany =
                require('../../persistence/company-persistence.js').selectCompany

            mockInsertCompany.mockResolvedValue(1)
            mockSelectCompany.mockResolvedValue({
                id: 1,
                name: 'Example Company',
                homePage: 'https://www.example.com',
                careerPage: 'https://www.example.com/careers',
                notes: 'Some notes',
            })

            const result = await createNewCompany(companyInput)

            expect(result).toEqual({
                id: 1,
                name: 'Example Company',
                homePage: 'https://www.example.com',
                careerPage: 'https://www.example.com/careers',
                notes: 'Some notes',
            })

            expect(mockInsertCompany).toHaveBeenCalledTimes(1)
            expect(mockSelectCompany).toHaveBeenCalledTimes(1)

            expect(mockInsertCompany).toHaveBeenCalledWith({
                name: 'Example Company',
                homePage: 'https://www.example.com',
                careerPage: 'https://www.example.com/careers',
                notes: 'Some notes',
            })

            expect(mockSelectCompany).toHaveBeenCalledWith(1)
        })

        it('should save a logo if one is provided', async () => {
            const companyInput = {
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            }

            const logo = 'logo'

            const mockInsertCompany =
                require('../../persistence/company-persistence.js').insertCompany
            const mockSelectCompany =
                require('../../persistence/company-persistence.js').selectCompany

            mockInsertCompany.mockResolvedValue(1)
            mockSelectCompany.mockResolvedValue({
                id: 1,
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            })

            const mockAddLogo = require('../media-service.js').addLogo
            mockAddLogo.mockResolvedValue('logoPath')

            const result = await createNewCompany(companyInput, logo)

            expect(result).toEqual({
                id: 1,
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            })

            expect(mockInsertCompany).toHaveBeenCalledTimes(1)
            expect(mockSelectCompany).toHaveBeenCalledTimes(1)
            expect(mockAddLogo).toHaveBeenCalledTimes(1)

            expect(mockInsertCompany).toHaveBeenCalledWith({
                name: 'Example Company',
                homePage: null,
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
                logoPath: 'logoPath',
            })

            expect(mockSelectCompany).toHaveBeenCalledWith(1)
            expect(mockAddLogo).toHaveBeenCalledWith(logo)
        })
    })

    describe('getCompanyById', () => {
        it('should query the persistence layer for a company', async () => {
            const companyId = 1

            const mockSelectCompany =
                require('../../persistence/company-persistence.js').selectCompany

            mockSelectCompany.mockResolvedValue({
                id: companyId,
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            })

            const result = await getCompanyById(companyId)

            expect(result).toEqual({
                id: companyId,
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            })

            expect(mockSelectCompany).toHaveBeenCalledTimes(1)
        })
    })

    describe('updateCompany', () => {
        it('should fail when no id is provided', async () => {
            const companyInput = {
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            }

            expect.assertions(1)
            return expect(updateCompany(null, companyInput)).rejects.toThrow(
                'Company id is required'
            )
        })

        it('should fail if name is not provided', () => {
            const companyInput = {
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            }

            expect.assertions(1)
            return expect(updateCompany(1, companyInput)).rejects.toThrow(
                'Company name is required'
            )
        })

        it('should sanitize the inputs', async () => {
            const companyId = 1
            const companyInput = {
                name: '     Example Company    ',
                homePage: '     https://www.example.com     ',
                careerPage: '     https://www.example.com/careers     ',
                notes: '      Some notes        ',
            }

            const mockUpdateCompany =
                require('../../persistence/company-persistence.js').updateCompany
            const mockSelectCompany =
                require('../../persistence/company-persistence.js').selectCompany

            mockUpdateCompany.mockResolvedValue(
                new Promise((resolve) => resolve())
            )
            mockSelectCompany.mockResolvedValue({
                id: companyId,
                name: 'Example Company',
                homePage: 'https://www.example.com',
                careerPage: 'https://www.example.com/careers',
                notes: 'Some notes',
            })

            const result = await updateCompany(companyId, companyInput)

            expect(result).toEqual({
                id: companyId,
                name: 'Example Company',
                homePage: 'https://www.example.com',
                careerPage: 'https://www.example.com/careers',
                notes: 'Some notes',
            })

            expect(mockUpdateCompany).toHaveBeenCalledTimes(1)
            expect(mockSelectCompany).toHaveBeenCalledTimes(1)

            expect(mockUpdateCompany).toHaveBeenCalledWith(companyId, {
                name: 'Example Company',
                homePage: 'https://www.example.com',
                careerPage: 'https://www.example.com/careers',
                notes: 'Some notes',
            })

            expect(mockSelectCompany).toHaveBeenCalledWith(companyId)
        })

        it('should remove logoPath if hasLogoChanged is true but no logo is provided', async () => {
            const companyId = 1
            const companyInput = {
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            }

            const mockSelectCompany =
                require('../../persistence/company-persistence.js').selectCompany
            mockSelectCompany
                .mockResolvedValueOnce({
                    id: companyId,
                    name: 'Example Company',
                    careerPage: 'https://www.example.com',
                    logoPath: 'logoPath',
                    notes: 'Some notes',
                })
                .mockResolvedValueOnce({
                    id: companyId,
                    name: 'Example Company',
                    careerPage: 'https://www.example.com',
                    notes: 'Some notes',
                })

            const mockDeleteMedia =
                require('../../persistence/media-persistence.js').deleteMedia
            mockDeleteMedia.mockResolvedValue(null)

            const mockAddLogo = require('../media-service.js').addLogo

            const mockUpdateCompany =
                require('../../persistence/company-persistence.js').updateCompany

            const result = await updateCompany(companyId, companyInput, true)

            expect(result).toEqual({
                id: companyId,
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            })

            expect(mockSelectCompany).toHaveBeenCalledTimes(2)
            expect(mockDeleteMedia).toHaveBeenCalledTimes(1)
            expect(mockAddLogo).toHaveBeenCalledTimes(0)

            expect(mockSelectCompany).toHaveBeenCalledWith(companyId)
            expect(mockDeleteMedia).toHaveBeenCalledWith('logoPath')

            expect(mockUpdateCompany).toHaveBeenCalledWith(companyId, {
                name: 'Example Company',
                homePage: null,
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
                logoPath: null,
            })

            expect(mockSelectCompany).toHaveBeenCalledWith(companyId)
        })

        it('should modify the logo path if hasLogoChanged is true and a logo is provided', async () => {
            const companyId = 1
            const companyInput = {
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            }

            const logo = 'logo'

            const mockSelectCompany =
                require('../../persistence/company-persistence.js').selectCompany
            mockSelectCompany
                .mockResolvedValueOnce({
                    id: companyId,
                    name: 'Example Company',
                    careerPage: 'https://www.example.com',
                    notes: 'Some notes',
                })
                .mockResolvedValueOnce({
                    id: companyId,
                    name: 'Example Company',
                    careerPage: 'https://www.example.com',
                    notes: 'Some notes',
                    logoPath: 'newLogoPath',
                })

            const mockAddLogo = require('../media-service.js').addLogo
            mockAddLogo.mockResolvedValue('newLogoPath')

            const mockUpdateCompany =
                require('../../persistence/company-persistence.js').updateCompany

            const result = await updateCompany(
                companyId,
                companyInput,
                true,
                logo
            )

            expect(result).toEqual({
                id: companyId,
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
                logoPath: 'newLogoPath',
            })

            expect(mockSelectCompany).toHaveBeenCalledTimes(2)
            expect(mockAddLogo).toHaveBeenCalledTimes(1)

            expect(mockSelectCompany).toHaveBeenCalledWith(companyId)
            expect(mockAddLogo).toHaveBeenCalledWith(logo)

            expect(mockUpdateCompany).toHaveBeenCalledWith(companyId, {
                name: 'Example Company',
                homePage: null,
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
                logoPath: 'newLogoPath',
            })

            expect(mockSelectCompany).toHaveBeenCalledWith(companyId)
        })
    })

    describe('removeCompany', () => {
        it('should fail gracefully if the company does not exist', async () => {
            const companyId = 1

            const mockSelectCompany =
                require('../../persistence/company-persistence.js').selectCompany
            mockSelectCompany.mockResolvedValue(undefined)

            const mockDeleteCompany =
                require('../../persistence/company-persistence.js').deleteCompany

            const mockLogger = require('../../logger.js').logger

            const result = await removeCompany(companyId)

            expect(result).toBe(1)

            expect(mockSelectCompany).toHaveBeenCalledTimes(1)
            expect(mockDeleteCompany).toHaveBeenCalledTimes(0)

            expect(mockSelectCompany).toHaveBeenCalledWith(companyId)
        })

        it('should remove the company and its logo if it exists', async () => {
            const companyId = 1

            const mockSelectCompany =
                require('../../persistence/company-persistence.js').selectCompany
            const mockDeleteMedia =
                require('../../persistence/media-persistence.js').deleteMedia
            const mockDeleteCompany =
                require('../../persistence/company-persistence.js').deleteCompany

            mockSelectCompany.mockResolvedValue({
                id: companyId,
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                logoPath: 'logoPath',
                notes: 'Some notes',
            })

            mockDeleteMedia.mockResolvedValue(null)
            mockDeleteCompany.mockResolvedValue(null)

            const result = await removeCompany(companyId)

            expect(result).toBe(1)

            expect(mockSelectCompany).toHaveBeenCalledTimes(1)
            expect(mockDeleteMedia).toHaveBeenCalledTimes(1)
            expect(mockDeleteCompany).toHaveBeenCalledTimes(1)

            expect(mockSelectCompany).toHaveBeenCalledWith(companyId)
            expect(mockDeleteMedia).toHaveBeenCalledWith('logoPath')
            expect(mockDeleteCompany).toHaveBeenCalledWith(companyId)
        })

        it('should not remove the logo if it does not exist', async () => {
            const companyId = 1

            const mockSelectCompany =
                require('../../persistence/company-persistence.js').selectCompany
            const mockDeleteMedia =
                require('../../persistence/media-persistence.js').deleteMedia
            const mockDeleteCompany =
                require('../../persistence/company-persistence.js').deleteCompany

            mockSelectCompany.mockResolvedValue({
                id: companyId,
                name: 'Example Company',
                careerPage: 'https://www.example.com',
                notes: 'Some notes',
            })

            mockDeleteMedia.mockResolvedValue(null)
            mockDeleteCompany.mockResolvedValue(null)

            const result = await removeCompany(companyId)

            expect(result).toBe(1)

            expect(mockSelectCompany).toHaveBeenCalledTimes(1)
            expect(mockDeleteMedia).toHaveBeenCalledTimes(0)
            expect(mockDeleteCompany).toHaveBeenCalledTimes(1)

            expect(mockSelectCompany).toHaveBeenCalledWith(companyId)
            expect(mockDeleteCompany).toHaveBeenCalledWith(companyId)
        })
    })

    describe('getAllCompanies', () => {
        it('should return all companies', async () => {
            const mockSelectCompanies =
                require('../../persistence/company-persistence.js').selectCompanies

            const companies = [
                {
                    id: 1,
                    name: 'Example Company 1',
                    careerPage: 'https://www.example.com',
                    notes: 'Some notes',
                },
                {
                    id: 2,
                    name: 'Example Company 2',
                    careerPage: 'https://www.example.com',
                    notes: 'Some notes',
                },
            ]

            mockSelectCompanies.mockResolvedValue(companies)

            const result = await getAllCompanies()

            expect(result).toEqual(companies)

            expect(mockSelectCompanies).toHaveBeenCalledTimes(1)
        })
    })
})
