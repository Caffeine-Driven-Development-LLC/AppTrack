import {
    addSankeyNode,
    deleteSankeyNode,
    getAllSankeyNodes,
    updateSankeyNode,
} from '../sankey-node-service.js'

jest.mock('../../persistence/sankey-node-persistence.js', () => ({
    deleteSankeyLinksByApplicationStateId: jest.fn(),
    deleteSankeyLinksBySankeyNodeId: jest.fn(),
    insertSankeyLink: jest.fn(),
    insertSankeyNode: jest.fn(),
    selectSankeyNodes: jest.fn(),
    updateSankeyNode: jest.fn(),
    deleteSankeyNode: jest.fn(),
}))

jest.mock('../event-flow-setting-service.js', () => ({
    getEventFlowMap: jest.fn(),
    createApplicationState: jest.fn(),
    updateApplicationState: jest.fn(),
    deleteApplicationState: jest.fn(),
    swapOrderOfApplicationStates: jest.fn(),
}))

describe('SankeyNodeServiceTests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getAllSankeyNodes', () => {
        it('should map the nodes correctly', () => {
            const mockSelectSankeyNodes =
                require('../../persistence/sankey-node-persistence.js').selectSankeyNodes

            mockSelectSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    name: 'name',
                    color: 'color',
                    applicationStateIds: '1,2,3',
                    isTerminal: 1,
                },
            ])

            const response = getAllSankeyNodes()

            expect(response).resolves.toEqual([
                {
                    id: 1,
                    name: 'name',
                    color: 'color',
                    applicationStateIds: [1, 2, 3],
                    isTerminal: true,
                    isPermanent: true,
                },
            ])

            expect(mockSelectSankeyNodes).toHaveBeenCalledTimes(1)
        })

        it('should map permanent nodes correctly', () => {
            const mockSelectSankeyNodes =
                require('../../persistence/sankey-node-persistence.js').selectSankeyNodes

            mockSelectSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    name: 'name',
                    color: 'color',
                    applicationStateIds: '1,2,3',
                    isTerminal: 1,
                },
                {
                    id: 2,
                    name: 'name',
                    color: 'color',
                    applicationStateIds: '1,2,3',
                    isTerminal: 1,
                },
                {
                    id: 3,
                    name: 'name',
                    color: 'color',
                    applicationStateIds: '1,2,3',
                    isTerminal: 1,
                },
            ])

            const response = getAllSankeyNodes()

            expect(response).resolves.toEqual([
                {
                    id: 1,
                    name: 'name',
                    color: 'color',
                    applicationStateIds: [1, 2, 3],
                    isTerminal: true,
                    isPermanent: true,
                },
                {
                    id: 2,
                    name: 'name',
                    color: 'color',
                    applicationStateIds: [1, 2, 3],
                    isTerminal: true,
                    isPermanent: true,
                },
                {
                    id: 3,
                    name: 'name',
                    color: 'color',
                    applicationStateIds: [1, 2, 3],
                    isTerminal: true,
                    isPermanent: false,
                },
            ])

            expect(mockSelectSankeyNodes).toHaveBeenCalledTimes(1)
        })
    })

    describe('addSankeyNode', () => {
        it('should fail if no name is provided', () => {
            const sankeyNodeInput = {
                name: '',
                color: 'color',
                applicationStateIds: [],
            }

            expect.assertions(1)
            return addSankeyNode(sankeyNodeInput).catch((e) => {
                expect(e.message).toEqual('Name is required')
            })
        })

        it('should fail if no color is provided', () => {
            const sankeyNodeInput = {
                name: 'name',
                color: '',
                applicationStateIds: [],
            }

            expect.assertions(1)
            return addSankeyNode(sankeyNodeInput).catch((e) => {
                expect(e.message).toEqual('Color is required')
            })
        })

        it('should fail if color is not in a #RRGGBB format', () => {
            const sankeyNodeInput = {
                name: 'name',
                color: 'color',
                applicationStateIds: [],
            }

            expect.assertions(1)
            return addSankeyNode(sankeyNodeInput).catch((e) => {
                expect(e.message).toEqual('Color must be a valid hex color')
            })
        })

        it('should fail if an application state id does not exist', () => {
            const sankeyNodeInput = {
                name: 'name',
                color: '#000000',
                applicationStateIds: [1],
            }

            const mockGetEventFlowMap =
                require('../event-flow-setting-service.js').getEventFlowMap
            mockGetEventFlowMap.mockResolvedValue([
                {
                    id: 2,
                },
            ])

            expect.assertions(1)
            return addSankeyNode(sankeyNodeInput).catch((e) => {
                expect(e.message).toEqual(
                    'Application state id 1 does not exist'
                )
            })
        })

        it('should sanitize inputs', async () => {
            const sankeyNodeInput = {
                name: ' name ',
                color: '#000000',
                applicationStateIds: [1, 2],
            }

            const mockGetEventFlowMap =
                require('../event-flow-setting-service.js').getEventFlowMap
            const mockInsertSankeyNode =
                require('../../persistence/sankey-node-persistence.js').insertSankeyNode
            const mockInsertSankeyLink =
                require('../../persistence/sankey-node-persistence.js').insertSankeyLink
            const mockSelectSankeyNodes =
                require('../../persistence/sankey-node-persistence.js').selectSankeyNodes

            mockInsertSankeyNode.mockResolvedValue(3)
            mockInsertSankeyLink.mockResolvedValue(
                new Promise((resolve) => resolve())
            )

            mockGetEventFlowMap.mockResolvedValue([
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ])

            mockSelectSankeyNodes.mockResolvedValue([
                {
                    id: 3,
                    name: 'name',
                    color: '#000000',
                    applicationStateIds: '1,2',
                    isTerminal: false,
                    isPermanent: false,
                },
            ])

            const response = await addSankeyNode(sankeyNodeInput)

            expect(response).toEqual([
                {
                    id: 3,
                    name: 'name',
                    color: '#000000',
                    applicationStateIds: [1, 2],
                    isTerminal: false,
                    isPermanent: false,
                },
            ])

            expect(mockInsertSankeyNode).toHaveBeenCalledTimes(1)
            expect(mockInsertSankeyLink).toHaveBeenCalledTimes(2)
            expect(mockGetEventFlowMap).toHaveBeenCalledTimes(1)
            expect(mockSelectSankeyNodes).toHaveBeenCalledTimes(1)

            expect(mockInsertSankeyNode).toHaveBeenCalledWith({
                name: 'name',
                color: '#000000',
                applicationStateIds: [1, 2],
            })

            expect(mockInsertSankeyLink).toHaveBeenCalledWith(3, 1)
            expect(mockInsertSankeyLink).toHaveBeenCalledWith(3, 2)
        })
    })

    describe('updateSankeyNode', () => {
        it('should fail is no id is provided', () => {
            const sankeyNodeInput = {
                name: 'name',
                color: 'color',
                applicationStateIds: [],
            }

            expect.assertions(1)
            return updateSankeyNode(null, sankeyNodeInput).catch((e) => {
                expect(e.message).toEqual('Id is required')
            })
        })

        it('should fail if no name is provided', () => {
            const sankeyNodeInput = {
                name: '',
                color: 'color',
                applicationStateIds: [],
            }

            expect.assertions(1)
            return updateSankeyNode(1, sankeyNodeInput).catch((e) => {
                expect(e.message).toEqual('Name is required')
            })
        })

        it('should fail if no color is provided', () => {
            const sankeyNodeInput = {
                name: 'name',
                color: '',
                applicationStateIds: [],
            }

            expect.assertions(1)
            return updateSankeyNode(1, sankeyNodeInput).catch((e) => {
                expect(e.message).toEqual('Color is required')
            })
        })

        it('should fail if color is not in a #RRGGBB format', () => {
            const sankeyNodeInput = {
                name: 'name',
                color: 'color',
                applicationStateIds: [],
            }

            expect.assertions(1)
            return updateSankeyNode(1, sankeyNodeInput).catch((e) => {
                expect(e.message).toEqual('Color must be a valid hex color')
            })
        })

        it('should fail if an application state id does not exist', () => {
            const sankeyNodeInput = {
                name: 'name',
                color: '#000000',
                applicationStateIds: [1],
            }

            const mockGetEventFlowMap =
                require('../event-flow-setting-service.js').getEventFlowMap
            mockGetEventFlowMap.mockResolvedValue([
                {
                    id: 2,
                },
            ])

            expect.assertions(1)
            return updateSankeyNode(1, sankeyNodeInput).catch((e) => {
                expect(e.message).toEqual(
                    'Application state id 1 does not exist'
                )
            })
        })

        it('should sanitize inputs', async () => {
            const sankeyNodeInput = {
                name: ' name ',
                color: '#000000',
                applicationStateIds: [1, 2],
            }

            const mockGetEventFlowMap =
                require('../event-flow-setting-service.js').getEventFlowMap
            const mockUpdateSankeyNode =
                require('../../persistence/sankey-node-persistence.js').updateSankeyNode
            const mockInsertSankeyLink =
                require('../../persistence/sankey-node-persistence.js').insertSankeyLink
            const mockDeleteSankeyLinksBySankeyNodeId =
                require('../../persistence/sankey-node-persistence.js').deleteSankeyLinksBySankeyNodeId
            const mockSelectSankeyNodes =
                require('../../persistence/sankey-node-persistence.js').selectSankeyNodes

            mockUpdateSankeyNode.mockResolvedValue()
            mockInsertSankeyLink.mockResolvedValue()
            mockDeleteSankeyLinksBySankeyNodeId.mockResolvedValue()
            mockSelectSankeyNodes.mockResolvedValue([
                {
                    id: 3,
                    name: 'name',
                    color: '#000000',
                    applicationStateIds: '1,2',
                    isTerminal: false,
                    isPermanent: false,
                },
            ])

            mockGetEventFlowMap.mockResolvedValue([
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ])

            const response = await updateSankeyNode(3, sankeyNodeInput)

            expect(response).toEqual([
                {
                    id: 3,
                    name: 'name',
                    color: '#000000',
                    applicationStateIds: [1, 2],
                    isTerminal: false,
                    isPermanent: false,
                },
            ])

            expect(mockUpdateSankeyNode).toHaveBeenCalledTimes(1)
            expect(mockInsertSankeyLink).toHaveBeenCalledTimes(2)
            expect(mockDeleteSankeyLinksBySankeyNodeId).toHaveBeenCalledTimes(1)
            expect(mockSelectSankeyNodes).toHaveBeenCalledTimes(1)

            expect(mockUpdateSankeyNode).toHaveBeenCalledWith(3, {
                name: 'name',
                color: '#000000',
                applicationStateIds: [1, 2],
            })

            expect(mockInsertSankeyLink).toHaveBeenCalledWith(3, 1)
            expect(mockInsertSankeyLink).toHaveBeenCalledWith(3, 2)
            expect(mockDeleteSankeyLinksBySankeyNodeId).toHaveBeenCalledWith(3)
        })
    })

    describe('deleteSankeyNode', () => {
        it('should fail if provided a permanent node id', () => {
            expect.assertions(1)
            return deleteSankeyNode(1).catch((e) => {
                expect(e.message).toEqual('Cannot delete a permanent node')
            })
        })

        it('should delete the node and its links', async () => {
            const mockDeleteSankeyNode =
                require('../../persistence/sankey-node-persistence.js').deleteSankeyNode
            const mockDeleteSankeyLinksBySankeyNodeId =
                require('../../persistence/sankey-node-persistence.js').deleteSankeyLinksBySankeyNodeId

            mockDeleteSankeyNode.mockResolvedValue()
            mockDeleteSankeyLinksBySankeyNodeId.mockResolvedValue()

            await deleteSankeyNode(3)

            expect(mockDeleteSankeyNode).toHaveBeenCalledTimes(1)
            expect(mockDeleteSankeyLinksBySankeyNodeId).toHaveBeenCalledTimes(1)
            expect(mockDeleteSankeyNode).toHaveBeenCalledWith(3)
            expect(mockDeleteSankeyLinksBySankeyNodeId).toHaveBeenCalledWith(3)
        })
    })
})
