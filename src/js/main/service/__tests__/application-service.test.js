import {
    addEvent,
    createNewApplication,
    getAllActiveApplications,
    getAllApplicationSankeyData,
    getApplicationById,
    getApplications,
    getApplicationsByCompanyId,
    getEventsForApplication,
    updateApplication,
    updateEvent,
} from '../application-service'
import { ghostPeriod as mockGhostPeriod } from '../setting-service.js'
import {
    selectApplications as mockSelectApplications,
    selectEventsByApplicationId as mockSelectEventsByApplicationId,
} from '../../persistence/application-persistence.js'
import { getSankeyData as mockGetSankeyData } from '../sankey-service.js'

jest.mock('../setting-service.js', () => ({
    ghostPeriod: jest.fn(),
}))

jest.mock('../sankey-service.js', () => ({
    getSankeyData: jest.fn(),
}))

jest.mock('../../logger.js', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logFilePath: 'test/path',
}))

jest.mock('../../persistence/application-persistence.js', () => ({
    insertApplication: jest.fn(),
    insertEvent: jest.fn(),
    searchApplications: jest.fn(),
    selectApplication: jest.fn(),
    selectApplications: jest.fn(),
    selectApplicationsByCompanyId: jest.fn(),
    selectEventsByApplicationId: jest.fn(),
    updateEvent: jest.fn(),
    updateApplication: jest.fn(),
}))

function generateDateStringForDaysAgo (daysAgo) {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)

    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are 0-based in JavaScript
    const day = date.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
}

const dateString10DaysAgo = generateDateStringForDaysAgo(10)

describe('ApplicationServiceTests', function () {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createNewApplication', function () {
        it('should fail when passed an invalid application input with no role', function () {
            const applicationInput = {}
            const expectedErrorMessage = 'Role is required'

            expect.assertions(1)
            return createNewApplication(applicationInput, -1).catch((e) => {
                expect(e.message).toEqual(expectedErrorMessage)
            })
        })

        it('should fail when passed an invalid application input with no companyId', function () {
            const applicationInput = { role: 'role' }
            const expectedErrorMessage = 'Company is required'

            expect.assertions(1)
            return createNewApplication(applicationInput, -1).catch((e) => {
                expect(e.message).toEqual(expectedErrorMessage)
            })
        })

        it('should fail when passed an invalid application input with no dateApplied', function () {
            const applicationInput = { role: 'role', companyId: 'companyId' }
            const expectedErrorMessage = 'Date is required'

            expect.assertions(1)
            return createNewApplication(applicationInput, -1).catch((e) => {
                expect(e.message).toEqual(expectedErrorMessage)
            })
        })

        it('should fail when passed an invalid application input with no initial event id', function () {
            const applicationInput = {
                role: 'role',
                companyId: 'companyId',
                dateApplied: dateString10DaysAgo,
            }
            const expectedErrorMessage = 'Initial event id is required'

            expect.assertions(1)
            return createNewApplication(applicationInput).catch((e) => {
                expect(e.message).toEqual(expectedErrorMessage)
            })
        })

        it('Happy path should work', async function () {
            const applicationInput = {
                role: 'role',
                companyId: 'companyId',
                dateApplied: dateString10DaysAgo,
                initialEventId: -1,
                postUrl: 'postUrl',
                salaryRangeHigh: '100000',
                salaryRangeLow: '50000',
                notes: 'notes',
            }

            const mockInsertApplication =
                require('../../persistence/application-persistence.js').insertApplication
            const mockInsertEvent =
                require('../../persistence/application-persistence.js').insertEvent
            const mockSelectApplication =
                require('../../persistence/application-persistence.js').selectApplication
            const mockSelectEventsByApplicationId =
                require('../../persistence/application-persistence.js').selectEventsByApplicationId

            const mockGhostPeriod = require('../setting-service.js').ghostPeriod

            mockInsertApplication.mockResolvedValue(1)
            mockInsertEvent.mockResolvedValue(100)
            mockSelectApplication.mockResolvedValue({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
            })
            mockSelectEventsByApplicationId.mockResolvedValue([])
            mockGhostPeriod.mockReturnValue(20)

            const result = await createNewApplication(applicationInput)

            expect(mockInsertApplication).toHaveBeenCalledWith({
                role: 'role',
                companyId: 'companyId',
                postUrl: 'postUrl',
                salaryRangeHigh: '100000',
                salaryRangeLow: '50000',
            })
            expect(mockInsertEvent).toHaveBeenCalledWith({
                applicationId: 1,
                date: dateString10DaysAgo,
                notes: 'notes',
                applicationStateId: -1,
            })
            expect(mockSelectApplication).toHaveBeenCalledWith(1)
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledWith(1)

            expect(result).toEqual({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
                events: [],
            })
        })

        it('should sanitize the input', async function () {
            const applicationInput = {
                role: '    role   ',
                companyId: '   companyId   ',
                dateApplied: `   ${dateString10DaysAgo}   `,
                initialEventId: -1,
                postUrl: '   postUrl   ',
                salaryRangeHigh: '50',
                salaryRangeLow: '100',
                notes: '  notes   ',
            }

            const mockInsertApplication =
                require('../../persistence/application-persistence.js').insertApplication
            const mockInsertEvent =
                require('../../persistence/application-persistence.js').insertEvent
            const mockSelectApplication =
                require('../../persistence/application-persistence.js').selectApplication
            const mockSelectEventsByApplicationId =
                require('../../persistence/application-persistence.js').selectEventsByApplicationId

            const mockGhostPeriod = require('../setting-service.js').ghostPeriod

            mockInsertApplication.mockResolvedValue(1)
            mockInsertEvent.mockResolvedValue(100)
            mockSelectApplication.mockResolvedValue({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
            })
            mockSelectEventsByApplicationId.mockResolvedValue([])
            mockGhostPeriod.mockReturnValue(20)

            const result = await createNewApplication(applicationInput)

            expect(mockInsertApplication).toHaveBeenCalledWith({
                role: 'role',
                companyId: 'companyId',
                postUrl: 'postUrl',
                salaryRangeHigh: '100',
                salaryRangeLow: '50',
            })
            expect(mockInsertEvent).toHaveBeenCalledWith({
                applicationId: 1,
                date: dateString10DaysAgo,
                notes: 'notes',
                applicationStateId: -1,
            })
            expect(mockSelectApplication).toHaveBeenCalledWith(1)
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledWith(1)

            expect(result).toEqual({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
                events: [],
            })
        })
    })

    describe('getApplicationById', function () {
        it('should return the application with the given id', async function () {
            const applicationId = 100

            const mockSelectApplication =
                require('../../persistence/application-persistence.js').selectApplication
            const mockGhostPeriod = require('../setting-service.js').ghostPeriod
            const mockSelectEventsByApplicationId =
                require('../../persistence/application-persistence.js').selectEventsByApplicationId

            mockSelectApplication.mockResolvedValue({
                id: applicationId,
                role: 'role',
                postUrl: null,
                salaryRangeHigh: null,
                salaryRangeLow: null,
                companyLogoPath: null,
                companyName: 'companyName',
                lastUpdated: dateString10DaysAgo,
                statusId: 1,
                status: 'status',
                isDeleted: 0,
            })
            mockGhostPeriod.mockReturnValue(20)
            mockSelectEventsByApplicationId.mockResolvedValue([
                {
                    id: 9,
                    date: dateString10DaysAgo,
                    notes: null,
                    applicationStateId: 1,
                },
            ])

            const result = await getApplicationById(applicationId)

            expect(mockSelectApplication).toHaveBeenCalledWith(applicationId)
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledWith(
                applicationId
            )
            expect(result).toEqual({
                id: applicationId,
                role: 'role',
                postUrl: null,
                salaryRangeHigh: null,
                salaryRangeLow: null,
                companyLogoPath: null,
                companyName: 'companyName',
                lastUpdated: dateString10DaysAgo,
                statusId: 1,
                status: 'status',
                isDeleted: 0,
                ghosted: false,
                percentGhosted: 50,
                events: [
                    {
                        id: 9,
                        date: dateString10DaysAgo,
                        notes: null,
                        applicationStateId: 1,
                    },
                ],
            })
        })

        it('should return an application that has been ghosted', async function () {
            const applicationId = 100

            const mockSelectApplication =
                require('../../persistence/application-persistence.js').selectApplication
            const mockGhostPeriod = require('../setting-service.js').ghostPeriod
            const mockSelectEventsByApplicationId =
                require('../../persistence/application-persistence.js').selectEventsByApplicationId

            mockSelectApplication.mockResolvedValue({
                id: applicationId,
                role: 'role',
                postUrl: null,
                salaryRangeHigh: null,
                salaryRangeLow: null,
                companyLogoPath: null,
                companyName: 'companyName',
                lastUpdated: dateString10DaysAgo,
                statusId: 1,
                status: 'status',
                isDeleted: 0,
            })
            mockGhostPeriod.mockReturnValue(10)
            mockSelectEventsByApplicationId.mockResolvedValue([
                {
                    id: 9,
                    date: dateString10DaysAgo,
                    notes: null,
                    applicationStateId: 1,
                },
            ])

            const result = await getApplicationById(applicationId)

            expect(mockSelectApplication).toHaveBeenCalledWith(applicationId)
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledWith(
                applicationId
            )
            expect(result).toEqual({
                id: applicationId,
                role: 'role',
                postUrl: null,
                salaryRangeHigh: null,
                salaryRangeLow: null,
                companyLogoPath: null,
                companyName: 'companyName',
                lastUpdated: dateString10DaysAgo,
                statusId: 1,
                status: 'status',
                isDeleted: 0,
                ghosted: true,
                percentGhosted: 100,
                events: [
                    {
                        id: 9,
                        date: dateString10DaysAgo,
                        notes: null,
                        applicationStateId: 1,
                    },
                ],
            })
        })

        it('should error out if requesting an application that does not exist', async function () {
            const applicationId = 100

            const mockSelectApplication =
                require('../../persistence/application-persistence.js').selectApplication

            mockSelectApplication.mockResolvedValue(null)

            expect.assertions(1)
            return getApplicationById(applicationId).catch((e) => {
                expect(e.message).toEqual('Application not found')
            })
        })
    })

    describe('updateApplication', function () {
        it('should fail when passed no application id', async function () {
            const applicationInput = {
                role: 'role',
                companyId: 'companyId',
            }

            expect.assertions(1)
            return updateApplication(null, applicationInput).catch((e) => {
                expect(e.message).toEqual('Application Id is required')
            })
        })

        it('should fail when passed an invalid application input with no role', function () {
            const applicationInput = {}
            const expectedErrorMessage = 'Role is required'

            expect.assertions(1)
            return updateApplication(1, applicationInput).catch((e) => {
                expect(e.message).toEqual(expectedErrorMessage)
            })
        })

        it('should fail when passed an invalid application input with no companyId', function () {
            const applicationInput = { role: 'role' }
            const expectedErrorMessage = 'Company is required'

            expect.assertions(1)
            return updateApplication(1, applicationInput).catch((e) => {
                expect(e.message).toEqual(expectedErrorMessage)
            })
        })

        it('Happy path should work', async function () {
            const applicationInput = {
                role: 'role',
                companyId: 'companyId',
                postUrl: 'postUrl',
                salaryRangeHigh: '100000',
                salaryRangeLow: '50000',
            }

            const mockUpdateApplication =
                require('../../persistence/application-persistence.js').updateApplication
            const mockSelectApplication =
                require('../../persistence/application-persistence.js').selectApplication
            const mockSelectEventsByApplicationId =
                require('../../persistence/application-persistence.js').selectEventsByApplicationId
            const mockGhostPeriod = require('../setting-service.js').ghostPeriod

            mockUpdateApplication.mockResolvedValue()
            mockSelectApplication.mockResolvedValue({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
            })
            mockSelectEventsByApplicationId.mockResolvedValue([])
            mockGhostPeriod.mockReturnValue(20)

            const result = await updateApplication(1, applicationInput)

            expect(mockUpdateApplication).toHaveBeenCalledWith(1, {
                companyId: 'companyId',
                role: 'role',
                postUrl: 'postUrl',
                salaryRangeHigh: '100000',
                salaryRangeLow: '50000',
            })
            expect(mockSelectApplication).toHaveBeenCalledWith(1)
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledWith(1)

            expect(result).toEqual({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
                events: [],
            })
        })
    })

    describe('GetAllActiveApplications', function () {
        it('Should not return any applications if there are none', async function () {
            const ghostPeriod = 30
            const expectedDateString = new Date()
            expectedDateString.setDate(
                expectedDateString.getDate() - ghostPeriod
            )
            const year = expectedDateString.getFullYear()
            const month = (expectedDateString.getMonth() + 1)
                .toString()
                .padStart(2, '0')
            const day = expectedDateString.getDate().toString().padStart(2, '0')
            const cutoffDateString = `${year}-${month}-${day}`

            const mockGhostPeriod = require('../setting-service.js').ghostPeriod
            const mockSelectApplications =
                require('../../persistence/application-persistence.js').selectApplications

            mockGhostPeriod.mockReturnValue(30)
            mockSelectApplications.mockResolvedValue([])

            const result = await getAllActiveApplications()

            expect(result).toEqual([])

            expect(mockSelectApplications).toHaveBeenCalledWith(
                false,
                cutoffDateString,
                false
            )
        })

        it('should populate events for each application', async function () {
            const ghostPeriod = 20
            const expectedDateString = new Date()
            expectedDateString.setDate(
                expectedDateString.getDate() - ghostPeriod
            )
            const year = expectedDateString.getFullYear()
            const month = (expectedDateString.getMonth() + 1)
                .toString()
                .padStart(2, '0')
            const day = expectedDateString.getDate().toString().padStart(2, '0')
            const cutoffDateString = `${year}-${month}-${day}`

            const mockGhostPeriod = require('../setting-service.js').ghostPeriod
            const mockSelectApplications =
                require('../../persistence/application-persistence.js').selectApplications

            mockGhostPeriod.mockReturnValue(ghostPeriod)
            mockSelectApplications.mockResolvedValue([
                {
                    id: 1,
                    companyId: 'companyId',
                    lastUpdated: dateString10DaysAgo,
                },
                {
                    id: 2,
                    companyId: 'companyId',
                    lastUpdated: dateString10DaysAgo,
                },
            ])

            const result = await getAllActiveApplications()

            const result1 = result.find((app) => app.id === 1)
            const result2 = result.find((app) => app.id === 2)

            expect(result1).toEqual({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
            })

            expect(result2).toEqual({
                id: 2,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
            })

            expect(mockSelectApplications).toHaveBeenCalledWith(
                false,
                cutoffDateString,
                false
            )
            expect(mockSelectApplications).toHaveBeenCalledTimes(1)
        })
    })

    describe('getApplications', () => {
        it('should return all active applications when searchText is empty', async () => {
            const ghostPeriod = 20
            const expectedDateString = new Date()
            expectedDateString.setDate(
                expectedDateString.getDate() - ghostPeriod
            )
            const year = expectedDateString.getFullYear()
            const month = (expectedDateString.getMonth() + 1)
                .toString()
                .padStart(2, '0')
            const day = expectedDateString.getDate().toString().padStart(2, '0')
            const cutoffDateString = `${year}-${month}-${day}`

            const mockGhostPeriod = require('../setting-service.js').ghostPeriod
            const mockSelectApplications =
                require('../../persistence/application-persistence.js').selectApplications

            mockGhostPeriod.mockReturnValue(ghostPeriod)
            mockSelectApplications.mockResolvedValue([
                {
                    id: 1,
                    companyId: 'companyId',
                    lastUpdated: dateString10DaysAgo,
                },
                {
                    id: 2,
                    companyId: 'companyId',
                    lastUpdated: dateString10DaysAgo,
                },
            ])

            const result = await getApplications({})

            const result1 = result.find((app) => app.id === 1)
            const result2 = result.find((app) => app.id === 2)

            expect(result1).toEqual({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
            })

            expect(result2).toEqual({
                id: 2,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
            })

            expect(mockSelectApplications).toHaveBeenCalledWith(
                false,
                cutoffDateString,
                false
            )
            expect(mockSelectApplications).toHaveBeenCalledTimes(1)
        })

        it('should search applications when searchText is provided', async () => {
            const mockSearchApplicationsInDb =
                require('../../persistence/application-persistence.js').searchApplications
            const searchText = 'someSearchText'

            mockSearchApplicationsInDb.mockResolvedValue([
                {
                    id: 1,
                    companyId: 'companyId',
                    lastUpdated: dateString10DaysAgo,
                },
                {
                    id: 2,
                    companyId: 'companyId',
                    lastUpdated: dateString10DaysAgo,
                },
            ])

            const result = await getApplications({ searchText })

            const result1 = result.find((app) => app.id === 1)
            const result2 = result.find((app) => app.id === 2)

            expect(result1).toEqual({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
            })

            expect(result2).toEqual({
                id: 2,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
            })

            expect(mockSearchApplicationsInDb).toHaveBeenCalledWith(searchText)
            expect(mockSearchApplicationsInDb).toHaveBeenCalledTimes(1)
        })
    })

    describe('getApplicationsByCompanyId', () => {
        it('Should return all applications and events for a given company', async () => {
            const companyId = 'companyId'
            const mockSelectApplicationsByCompanyId =
                require('../../persistence/application-persistence.js').selectApplicationsByCompanyId
            const mockSelectEventsByApplicationId =
                require('../../persistence/application-persistence.js').selectEventsByApplicationId
            const mockGetSankeyData =
                require('../sankey-service.js').getSankeyData
            const mockGhostPeriod = require('../setting-service.js').ghostPeriod

            const mockApplications = [
                {
                    id: 1,
                    companyId: companyId,
                    lastUpdated: dateString10DaysAgo,
                },
                {
                    id: 2,
                    companyId: companyId,
                    lastUpdated: dateString10DaysAgo,
                },
            ]

            const mockEvents = [
                {
                    statusId: 1,
                },
                {
                    statusId: 2,
                },
            ]

            const mockSankeyData = {
                nodes: [],
                links: [],
            }

            mockSelectApplicationsByCompanyId.mockResolvedValue(
                mockApplications
            )
            mockSelectEventsByApplicationId.mockResolvedValue(mockEvents)
            mockGetSankeyData.mockResolvedValue(mockSankeyData)
            mockGhostPeriod.mockReturnValue(20)

            const result = await getApplicationsByCompanyId(companyId)

            expect(mockSelectApplicationsByCompanyId).toHaveBeenCalledWith(
                companyId
            )
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledWith(1)
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledWith(2)

            expect(result.applications.length).toEqual(2)
            const result1 = result.applications.find((app) => app.id === 1)
            const result2 = result.applications.find((app) => app.id === 2)

            expect(result1).toEqual({
                id: 1,
                companyId: companyId,
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
                events: mockEvents,
            })

            expect(result2).toEqual({
                id: 2,
                companyId: companyId,
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
                events: mockEvents,
            })

            expect(result.companyId).toEqual(companyId)
            expect(result.sankeyData).toEqual({
                nodes: [],
                links: [],
            })

            expect(mockSelectApplicationsByCompanyId).toHaveBeenCalledTimes(1)
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledTimes(2)
            expect(mockGetSankeyData).toHaveBeenCalledTimes(1)
        })
    })

    describe('getEventsForApplication', () => {
        it('should return all events for a given application', async () => {
            const applicationId = 1
            const mockSelectEventsByApplicationId =
                require('../../persistence/application-persistence.js').selectEventsByApplicationId

            const mockEvents = [
                {
                    id: 1,
                    statusId: 1,
                    status: 'applied',
                    date: dateString10DaysAgo,
                    notes: 'notes',
                },
                {
                    id: 2,
                    statusId: 2,
                    status: 'interview',
                    date: dateString10DaysAgo,
                    notes: 'notes',
                },
            ]

            mockSelectEventsByApplicationId.mockResolvedValue(mockEvents)

            const result = await getEventsForApplication(applicationId)

            expect(result).toEqual({
                applicationId: applicationId,
                events: mockEvents,
            })

            expect(mockSelectEventsByApplicationId).toHaveBeenCalledWith(
                applicationId
            )
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledTimes(1)
        })
    })

    describe('addEvent', () => {
        it('should fail when passed no applicaion id', async () => {
            const eventInput = {
                date: dateString10DaysAgo,
                notes: 'notes',
                applicationStateId: 1,
            }

            expect.assertions(1)
            return addEvent(eventInput).catch((e) => {
                expect(e.message).toEqual('Application Id is required')
            })
        })

        it('should fail when passed no date', async () => {
            const eventInput = {
                applicationId: 1,
                notes: 'notes',
                applicationStateId: 1,
            }

            expect.assertions(1)
            return addEvent(eventInput).catch((e) => {
                expect(e.message).toEqual('Date is required')
            })
        })

        it('should fail when passed an invalid date format', async () => {
            const eventInput = {
                applicationId: 1,
                date: '20255-02-20',
                notes: 'notes',
                applicationStateId: 1,
            }

            expect.assertions(1)
            return addEvent(eventInput).catch((e) => {
                expect(e.message).toEqual('Invalid date format')
            })
        })

        it('should sanitize inputs', async () => {
            const eventInput = {
                applicationId: 1,
                date: `  ${dateString10DaysAgo}  `,
                notes: '  notes  ',
                applicationStateId: 1,
            }

            const mockInsertEvent =
                require('../../persistence/application-persistence.js').insertEvent
            const mockGhostPeriod = require('../setting-service.js').ghostPeriod
            const mockSelectApplication =
                require('../../persistence/application-persistence.js').selectApplication
            const mockSelectEventsByApplicationId =
                require('../../persistence/application-persistence.js').selectEventsByApplicationId

            mockSelectEventsByApplicationId.mockResolvedValue([
                {
                    applicationId: 1,
                    date: dateString10DaysAgo,
                    notes: 'notes',
                    applicationStateId: 1,
                },
            ])
            mockGhostPeriod.mockReturnValue(20)
            mockSelectApplication.mockResolvedValue({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
            })

            const result = await addEvent(eventInput)

            expect(mockInsertEvent).toHaveBeenCalledWith({
                applicationId: 1,
                date: dateString10DaysAgo,
                notes: 'notes',
                applicationStateId: 1,
            })

            expect(mockSelectApplication).toHaveBeenCalledWith(1)
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledWith(1)

            expect(result).toEqual({
                id: 1,
                companyId: 'companyId',
                lastUpdated: dateString10DaysAgo,
                ghosted: false,
                percentGhosted: 50,
                events: [
                    {
                        applicationId: 1,
                        date: dateString10DaysAgo,
                        notes: 'notes',
                        applicationStateId: 1,
                    },
                ],
            })
        })
    })

    describe('updateEvent', () => {
        it('should fail when no id is passed', async () => {
            const eventInput = {
                date: dateString10DaysAgo,
                notes: 'notes',
            }

            expect.assertions(1)
            return updateEvent(null, eventInput).catch((e) => {
                expect(e.message).toEqual('eventId is required')
            })
        })

        it('should fail when passed an invalid date format', async () => {
            const eventInput = {
                date: '20255-02-20',
                notes: 'notes',
            }

            expect.assertions(1)
            return updateEvent(1, eventInput).catch((e) => {
                expect(e.message).toEqual('Invalid date format')
            })
        })

        it('should fail when no date is passed', async () => {
            const eventInput = {
                notes: 'notes',
            }

            expect.assertions(1)
            return updateEvent(1, eventInput).catch((e) => {
                expect(e.message).toEqual('Date is required')
            })
        })

        it('should sanitize inputs', async () => {
            const eventInput = {
                date: `  ${dateString10DaysAgo}  `,
                notes: '  notes  ',
            }

            const mockUpdateEvent =
                require('../../persistence/application-persistence.js').updateEvent
            const mockSelectEventsByApplicationId =
                require('../../persistence/application-persistence.js').selectEventsByApplicationId

            mockSelectEventsByApplicationId.mockResolvedValue([
                {
                    date: dateString10DaysAgo,
                    notes: 'notes',
                    applicationStateId: 1,
                },
            ])
            const response = await updateEvent(1, eventInput, 1)

            expect(response).toEqual({
                applicationId: 1,
                events: [
                    {
                        date: dateString10DaysAgo,
                        notes: 'notes',
                        applicationStateId: 1,
                    },
                ],
            })

            expect(mockUpdateEvent).toHaveBeenCalledTimes(1)
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledTimes(1)

            expect(mockUpdateEvent).toHaveBeenCalledWith(1, {
                date: dateString10DaysAgo,
                notes: 'notes',
            })
            expect(mockSelectEventsByApplicationId).toHaveBeenCalledWith(1)
        })
    })
})
