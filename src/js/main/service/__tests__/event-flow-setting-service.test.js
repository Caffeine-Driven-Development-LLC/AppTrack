import {
    createApplicationState,
    deleteApplicationState,
    getEventFlowMap,
    swapOrderOfApplicationStates,
    updateApplicationState,
} from '../event-flow-setting-service.js'

jest.mock('../../persistence/sankey-node-persistence.js', () => ({
    deleteSankeyLinksByApplicationStateId: jest.fn(),
}))

jest.mock('../../logger.js', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    logFilePath: 'test/path',
}))

jest.mock('../../persistence/event-flow-persistence.js', () => ({
    deleteApplicationState: jest.fn(),
    insertApplicationFlow: jest.fn(),
    insertApplicationState: jest.fn(),
    removeApplicationStateFromFlowById: jest.fn(),
    removeApplicationStateFromFlowByNextStepId: jest.fn(),
    selectApplicationStates: jest.fn(),
    swapDisplayOrderOfApplicationStates: jest.fn(),
    updateApplicationState: jest.fn(),
}))

describe('EventFlowSettingService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getEventFlowMap', () => {
        it('should return a list of application states with available next steps', async () => {
            const applicationStates = [
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: '2, 3',
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '3',
                },
                {
                    id: 3,
                    name: 'Application State 3',
                    displayOrder: 3,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
            ]
            const expected = [
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: [2, 3],
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: [3],
                },
                {
                    id: 3,
                    name: 'Application State 3',
                    displayOrder: 3,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: [],
                },
            ]

            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates

            mockSelectApplicationStates.mockResolvedValue(applicationStates)

            const result = await getEventFlowMap()

            expect(result).toEqual(expected)
        })

        it('should handle deleted application states', async () => {
            const applicationStates = [
                {
                    id: 1,
                    isDeleted: 0,
                    availableNextStepIds: '2, 3',
                },
                {
                    id: 2,
                    isDeleted: 0,
                    availableNextStepIds: '3',
                },
                {
                    id: 3,
                    isDeleted: 1,
                    availableNextStepIds: '4',
                },
                {
                    id: 4,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
            ]

            const expected = [
                {
                    id: 1,
                    isDeleted: 0,
                    availableNextStepIds: [2],
                },
                {
                    id: 2,
                    isDeleted: 0,
                    availableNextStepIds: [],
                },
                {
                    id: 3,
                    isDeleted: 1,
                    availableNextStepIds: [4],
                },
                {
                    id: 4,
                    isDeleted: 0,
                    availableNextStepIds: [],
                },
            ]

            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates

            mockSelectApplicationStates.mockResolvedValue(applicationStates)

            const result = await getEventFlowMap()

            expect(result).toEqual(expected)
        })
    })

    describe('createApplicationState', () => {
        it('should fail if name is not provided', async () => {
            const applicationStateInput = {
                displayOrder: 1,
                alwaysAvailable: 0,
                initialStep: 1,
                availableNextStepIds: [2, 3],
            }

            expect.assertions(1)
            createApplicationState(applicationStateInput).catch((error) => {
                expect(error.message).toEqual(
                    'Application state name is required'
                )
            })
        })

        it('should fail if availableNextStepIds contains a step that is deleted', async () => {
            const applicationStateInput = {
                name: 'Application State 1',
                displayOrder: 1,
                alwaysAvailable: 0,
                initialStep: 1,
                availableNextStepIds: [2],
            }

            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates

            mockSelectApplicationStates.mockResolvedValue([
                {
                    id: 2,
                    isDeleted: 1,
                },
            ])

            expect.assertions(1)
            return createApplicationState(applicationStateInput).catch((e) => {
                expect(e.message).toEqual(
                    'Application state with id 2 is deleted'
                )
            })
        })

        it('should fail if availableNextStepIds contains a step that is not found', async () => {
            const applicationStateInput = {
                name: 'Application State 1',
                displayOrder: 1,
                alwaysAvailable: 0,
                initialStep: 1,
                availableNextStepIds: [2],
            }

            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates

            mockSelectApplicationStates.mockResolvedValue([])

            expect.assertions(1)
            return createApplicationState(applicationStateInput).catch((e) => {
                expect(e.message).toEqual(
                    'Application state with id 2 not found'
                )
            })
        })

        it('should sanitize input', async () => {
            const applicationStateInput = {
                name: '   Application State 1   ',
                availableNextStepIds: [],
            }

            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates

            const mockInsertApplicationState =
                require('../../persistence/event-flow-persistence.js').insertApplicationState

            mockSelectApplicationStates.mockResolvedValueOnce([])
            mockSelectApplicationStates.mockResolvedValueOnce([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
            ])

            const result = await createApplicationState(applicationStateInput)

            expect(result).toEqual([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: [],
                },
            ])

            expect(mockInsertApplicationState).toHaveBeenCalledTimes(1)
            expect(mockSelectApplicationStates).toHaveBeenCalledTimes(2)

            expect(mockInsertApplicationState).toHaveBeenCalledWith({
                name: 'Application State 1',
                alwaysAvailable: 0,
                initialStep: 0,
                availableNextStepIds: [],
            })
        })

        it('should set the next steps of the new application state', async () => {
            const applicationStateInput = {
                name: '   Application State 1   ',
                availableNextStepIds: [1, 2],
            }

            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates
            const mockInsertApplicationState =
                require('../../persistence/event-flow-persistence.js').insertApplicationState
            const mockInsertApplicationFlow =
                require('../../persistence/event-flow-persistence.js').insertApplicationFlow

            mockInsertApplicationState.mockResolvedValue(3)

            mockSelectApplicationStates.mockResolvedValueOnce([
                {
                    id: 1,
                    name: 'existing 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '2',
                },
                {
                    id: 2,
                    name: 'existing 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
            ])
            mockSelectApplicationStates.mockResolvedValueOnce([
                {
                    id: 1,
                    name: 'existing 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '2',
                },
                {
                    id: 2,
                    name: 'existing 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
                {
                    id: 3,
                    name: 'Application State 1',
                    displayOrder: 3,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '1,2',
                },
            ])

            const result = await createApplicationState(applicationStateInput)

            expect(result).toEqual([
                {
                    id: 1,
                    name: 'existing 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: [2],
                },
                {
                    id: 2,
                    name: 'existing 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: [],
                },
                {
                    id: 3,
                    name: 'Application State 1',
                    displayOrder: 3,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: [1, 2],
                },
            ])

            expect(mockInsertApplicationState).toHaveBeenCalledTimes(1)
            expect(mockInsertApplicationFlow).toHaveBeenCalledTimes(2)
            expect(mockSelectApplicationStates).toHaveBeenCalledTimes(2)

            expect(mockInsertApplicationState).toHaveBeenCalledWith({
                name: 'Application State 1',
                alwaysAvailable: 0,
                initialStep: 0,
                availableNextStepIds: [1, 2],
            })

            expect(mockInsertApplicationFlow).toHaveBeenCalledWith(3, 1)
            expect(mockInsertApplicationFlow).toHaveBeenCalledWith(3, 2)
        })
    })

    describe('updateApplicationState', () => {
        it('should fail if no id is provided', async () => {
            const applicationStateInput = {
                name: 'Application State 1',
                displayOrder: 1,
                alwaysAvailable: 0,
                initialStep: 1,
                availableNextStepIds: [2, 3],
            }

            expect.assertions(1)
            return updateApplicationState(null, applicationStateInput).catch(
                (error) => {
                    expect(error.message).toEqual(
                        'Application state id is required'
                    )
                }
            )
        })

        it('should throw an error if name is not provided', async () => {
            const applicationStateInput = {
                displayOrder: 1,
                alwaysAvailable: 0,
                initialStep: 1,
                availableNextStepIds: [2, 3],
            }

            expect.assertions(1)
            return updateApplicationState(1, applicationStateInput).catch(
                (error) => {
                    expect(error.message).toEqual(
                        'Application state name is required'
                    )
                }
            )
        })

        it('should sanitize inputs', async () => {
            const applicationStateId = 1
            const applicationStateInput = {
                name: '   Application State 1   ',
                availableNextStepIds: [],
            }

            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates
            const mockUpdateApplicationState =
                require('../../persistence/event-flow-persistence.js').updateApplicationState
            const mockRemoveApplicationStateFromFlowById =
                require('../../persistence/event-flow-persistence.js').removeApplicationStateFromFlowById
            const mockInsertApplicationFlow =
                require('../../persistence/event-flow-persistence.js').insertApplicationFlow

            mockSelectApplicationStates.mockResolvedValueOnce([])
            mockSelectApplicationStates.mockResolvedValueOnce([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
            ])

            const result = await updateApplicationState(
                applicationStateId,
                applicationStateInput
            )

            expect(result).toEqual([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: [],
                },
            ])

            expect(mockUpdateApplicationState).toHaveBeenCalledTimes(1)
            expect(
                mockRemoveApplicationStateFromFlowById
            ).toHaveBeenCalledTimes(1)
            expect(mockInsertApplicationFlow).toHaveBeenCalledTimes(0)
            expect(mockSelectApplicationStates).toHaveBeenCalledTimes(2)

            expect(mockUpdateApplicationState).toHaveBeenCalledWith(1, {
                name: 'Application State 1',
                alwaysAvailable: 0,
                initialStep: 0,
                availableNextStepIds: [],
            })
        })

        it('should insert rows for all application state next steps', async () => {
            const applicationStateId = 1
            const applicationStateInput = {
                name: 'Application State 1 - new name',
                alwaysAvailable: 1,
                initialStep: 1,
                availableNextStepIds: [2, 3],
            }

            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates
            const mockUpdateApplicationState =
                require('../../persistence/event-flow-persistence.js').updateApplicationState
            const mockRemoveApplicationStateFromFlowById =
                require('../../persistence/event-flow-persistence.js').removeApplicationStateFromFlowById
            const mockInsertApplicationFlow =
                require('../../persistence/event-flow-persistence.js').insertApplicationFlow

            mockSelectApplicationStates.mockResolvedValueOnce([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '3',
                },
                {
                    id: 3,
                    name: 'Application State 3',
                    displayOrder: 3,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
            ])
            mockSelectApplicationStates.mockResolvedValueOnce([
                {
                    id: 1,
                    name: 'Application State 1 - new name',
                    displayOrder: 1,
                    alwaysAvailable: 1,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: '2,3',
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '3',
                },
                {
                    id: 3,
                    name: 'Application State 3',
                    displayOrder: 3,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
            ])

            const result = await updateApplicationState(
                applicationStateId,
                applicationStateInput
            )

            expect(result).toEqual([
                {
                    id: 1,
                    name: 'Application State 1 - new name',
                    displayOrder: 1,
                    alwaysAvailable: 1,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: [2, 3],
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: [3],
                },
                {
                    id: 3,
                    name: 'Application State 3',
                    displayOrder: 3,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: [],
                },
            ])

            expect(mockUpdateApplicationState).toHaveBeenCalledTimes(1)
            expect(
                mockRemoveApplicationStateFromFlowById
            ).toHaveBeenCalledTimes(1)

            expect(mockInsertApplicationFlow).toHaveBeenCalledTimes(2)
            expect(mockSelectApplicationStates).toHaveBeenCalledTimes(2)

            expect(mockUpdateApplicationState).toHaveBeenCalledWith(1, {
                name: 'Application State 1 - new name',
                alwaysAvailable: 1,
                initialStep: 1,
                availableNextStepIds: [2, 3],
            })

            expect(mockInsertApplicationFlow).toHaveBeenCalledWith(1, 2)
            expect(mockInsertApplicationFlow).toHaveBeenCalledWith(1, 3)
        })
    })

    describe('deleteApplicationState', () => {
        it('should fail if no id is provided', async () => {
            expect.assertions(1)
            return deleteApplicationState(null).catch((error) => {
                expect(error.message).toEqual(
                    'Application state id is required'
                )
            })
        })

        it('should fail if the the application state was the last initial state', async () => {
            const applicationStateId = 1

            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates

            mockSelectApplicationStates.mockResolvedValue([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: '2',
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 0,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
            ])

            expect.assertions(1)
            return deleteApplicationState(applicationStateId).catch((error) => {
                expect(error.message).toEqual(
                    'Cannot delete the only initial application state'
                )
            })
        })

        it('should delete the application state and its links', async () => {
            const applicationStateId = 1

            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates
            const mockDeleteApplicationState =
                require('../../persistence/event-flow-persistence.js').deleteApplicationState
            const mockRemoveApplicationStateFromFlowByNextStepId =
                require('../../persistence/event-flow-persistence.js').removeApplicationStateFromFlowByNextStepId
            const mockDeleteSankeyLinksByApplicationStateId =
                require('../../persistence/sankey-node-persistence.js').deleteSankeyLinksByApplicationStateId

            mockSelectApplicationStates.mockResolvedValueOnce([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: '2',
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: '1',
                },
            ])

            mockSelectApplicationStates.mockResolvedValueOnce([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 1,
                    availableNextStepIds: '2',
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
            ])

            mockDeleteApplicationState.mockResolvedValue(
                new Promise((resolve) => resolve())
            )
            mockRemoveApplicationStateFromFlowByNextStepId.mockResolvedValue(
                new Promise((resolve) => resolve())
            )
            mockDeleteSankeyLinksByApplicationStateId.mockResolvedValue(
                new Promise((resolve) => resolve())
            )

            const result = await deleteApplicationState(applicationStateId)

            expect(result).toEqual([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 1,
                    availableNextStepIds: [2],
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: [],
                },
            ])

            expect(mockSelectApplicationStates).toHaveBeenCalledTimes(2)
            expect(mockDeleteApplicationState).toHaveBeenCalledTimes(1)
            expect(
                mockRemoveApplicationStateFromFlowByNextStepId
            ).toHaveBeenCalledTimes(1)
            expect(
                mockDeleteSankeyLinksByApplicationStateId
            ).toHaveBeenCalledTimes(1)

            expect(mockDeleteApplicationState).toHaveBeenCalledWith(1)
            expect(
                mockRemoveApplicationStateFromFlowByNextStepId
            ).toHaveBeenCalledWith(1)
            expect(
                mockDeleteSankeyLinksByApplicationStateId
            ).toHaveBeenCalledWith(1)
        })
    })

    describe('swapOrderOfApplicationStates', () => {
        it('should swap the display order of two application states', async () => {
            const mockSwapDisplayOrderOfApplicationStates =
                require('../../persistence/event-flow-persistence.js').swapDisplayOrderOfApplicationStates
            const mockSelectApplicationStates =
                require('../../persistence/event-flow-persistence.js').selectApplicationStates

            mockSelectApplicationStates.mockResolvedValue([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: '2',
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: '',
                },
            ])

            mockSwapDisplayOrderOfApplicationStates.mockResolvedValue(
                new Promise((resolve) => resolve())
            )

            const result = await swapOrderOfApplicationStates({
                id1: 1,
                id2: 2,
                displayOrder1: 1,
                displayOrder2: 2,
            })

            expect(result).toEqual([
                {
                    id: 1,
                    name: 'Application State 1',
                    displayOrder: 1,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: [2],
                },
                {
                    id: 2,
                    name: 'Application State 2',
                    displayOrder: 2,
                    alwaysAvailable: 0,
                    initialStep: 1,
                    isDeleted: 0,
                    availableNextStepIds: [],
                },
            ])

            expect(mockSelectApplicationStates).toHaveBeenCalledTimes(1)
            expect(
                mockSwapDisplayOrderOfApplicationStates
            ).toHaveBeenCalledTimes(1)

            expect(
                mockSwapDisplayOrderOfApplicationStates
            ).toHaveBeenCalledWith(1, 2, 1, 2)
        })
    })
})
