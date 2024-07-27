import { getSankeyData } from '../sankey-service.js'

jest.mock('../sankey-node-service.js', () => ({
    getAllSankeyNodes: jest.fn(),
    ghostedNodeId: 1,
    inProgressNodeId: 2,
}))

describe('SankeyService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getSankeyData', () => {
        it('should return empty lists for nodes and links when passed an empty array of applications', () => {
            const mockGetAllSankeyNodes =
                require('../sankey-node-service.js').getAllSankeyNodes

            mockGetAllSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    applicationStateIds: [],
                    name: 'Ghosted SankeyNode',
                },
                {
                    id: 2,
                    applicationStateIds: [],
                    name: 'In Progress SankeyNode',
                },
            ])

            return getSankeyData([]).then((data) => {
                expect(data.nodes).toEqual([])
                expect(data.links).toEqual([])
            })
        })

        it('should return a single node when passed an array of applications with a single terminal event', async () => {
            const inputApplications = [
                {
                    events: [
                        {
                            statusId: 1,
                        },
                    ],
                    ghosted: false,
                },
            ]

            const mockGetAllSankeyNodes =
                require('../sankey-node-service.js').getAllSankeyNodes

            mockGetAllSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    applicationStateIds: [],
                    name: 'Ghosted SankeyNode',
                },
                {
                    id: 2,
                    applicationStateIds: [],
                    name: 'In Progress SankeyNode',
                },
                {
                    id: 3,
                    applicationStateIds: [1],
                    color: 'yellow',
                    isTerminal: true,
                    name: 'Applied SankeyNode',
                },
            ])

            const { nodes, links } = await getSankeyData(inputApplications)
            expect(nodes).toEqual([
                {
                    name: 'Applied SankeyNode',
                    color: 'yellow',
                    isTerminal: true,
                    value: 1,
                },
            ])

            expect(links).toEqual([])
        })

        it('should return 2 nodes, one linking to inProgress for a single application with a single event', async () => {
            const inputApplications = [
                {
                    events: [
                        {
                            statusId: 1,
                        },
                    ],
                    ghosted: false,
                },
            ]

            const mockGetAllSankeyNodes =
                require('../sankey-node-service.js').getAllSankeyNodes

            mockGetAllSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    applicationStateIds: [],
                    name: 'Ghosted SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 2,
                    color: 'blue',
                    applicationStateIds: [],
                    name: 'In Progress SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 3,
                    applicationStateIds: [1],
                    color: 'yellow',
                    isTerminal: false,
                    name: 'Applied SankeyNode',
                },
            ])

            const { nodes, links } = await getSankeyData(inputApplications)
            expect(nodes).toEqual([
                {
                    name: 'Applied SankeyNode',
                    color: 'yellow',
                    value: 1,
                    isTerminal: false,
                },
                {
                    name: 'In Progress SankeyNode',
                    color: 'blue',
                    value: 1,
                    isTerminal: false,
                },
            ])

            expect(links).toEqual([
                {
                    from: 'Applied SankeyNode',
                    to: 'In Progress SankeyNode',
                    flow: 1,
                },
            ])
        })

        it('should return 2 nodes, one linking to ghosted for a single application with a single event', async () => {
            const inputApplications = [
                {
                    events: [
                        {
                            statusId: 1,
                        },
                    ],
                    ghosted: true,
                },
            ]

            const mockGetAllSankeyNodes =
                require('../sankey-node-service.js').getAllSankeyNodes

            mockGetAllSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    applicationStateIds: [],
                    color: 'greay',
                    name: 'Ghosted SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 2,
                    color: 'blue',
                    applicationStateIds: [],
                    name: 'In Progress SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 3,
                    applicationStateIds: [1],
                    color: 'yellow',
                    isTerminal: false,
                    name: 'Applied SankeyNode',
                },
            ])

            const { nodes, links } = await getSankeyData(inputApplications)
            expect(nodes).toEqual([
                {
                    name: 'Applied SankeyNode',
                    color: 'yellow',
                    value: 1,
                    isTerminal: false,
                },
                {
                    name: 'Ghosted SankeyNode',
                    color: 'greay',
                    value: 1,
                    isTerminal: false,
                },
            ])

            expect(links).toEqual([
                {
                    from: 'Applied SankeyNode',
                    to: 'Ghosted SankeyNode',
                    flow: 1,
                },
            ])
        })

        it('a single application with no sankey node events should not show up in the sankey data', async () => {
            const applications = [
                {
                    events: [{ statusId: 1 }, { statusId: 2 }, { statusId: 3 }],
                    ghosted: false,
                },
            ]

            const mockGetAllSankeyNodes =
                require('../sankey-node-service.js').getAllSankeyNodes

            mockGetAllSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    applicationStateIds: [],
                    name: 'Ghosted SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 2,
                    color: 'blue',
                    applicationStateIds: [],
                    name: 'In Progress SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 3,
                    applicationStateIds: [4],
                    color: 'yellow',
                    isTerminal: false,
                    name: 'Applied SankeyNode',
                },
            ])

            const { nodes, links } = await getSankeyData(applications)

            expect(nodes).toEqual([])
            expect(links).toEqual([])
        })

        it('should return 1 node when multiple events are in the same sankey node', async () => {
            const applications = [
                {
                    events: [{ statusId: 1 }, { statusId: 1 }],
                    ghosted: false,
                },
            ]

            const mockGetAllSankeyNodes =
                require('../sankey-node-service.js').getAllSankeyNodes

            mockGetAllSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    applicationStateIds: [],
                    name: 'Ghosted SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 2,
                    color: 'blue',
                    applicationStateIds: [],
                    name: 'In Progress SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 3,
                    applicationStateIds: [1],
                    color: 'yellow',
                    isTerminal: false,
                    name: 'Applied SankeyNode',
                },
            ])

            const { nodes, links } = await getSankeyData(applications)

            expect(nodes).toEqual([
                {
                    name: 'Applied SankeyNode',
                    color: 'yellow',
                    value: 1,
                    isTerminal: false,
                },
                {
                    name: 'In Progress SankeyNode',
                    color: 'blue',
                    value: 1,
                    isTerminal: false,
                },
            ])
            expect(links).toEqual([
                {
                    from: 'Applied SankeyNode',
                    to: 'In Progress SankeyNode',
                    flow: 1,
                },
            ])
        })

        it('sankey node with 2 events, and application with 2 events should show up as 1 node', async () => {
            const applications = [
                {
                    events: [{ statusId: 1 }, { statusId: 2 }],
                    ghosted: false,
                },
            ]

            const mockGetAllSankeyNodes =
                require('../sankey-node-service.js').getAllSankeyNodes

            mockGetAllSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    applicationStateIds: [],
                    name: 'Ghosted SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 2,
                    color: 'blue',
                    applicationStateIds: [],
                    name: 'In Progress SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 3,
                    applicationStateIds: [1, 2],
                    color: 'yellow',
                    isTerminal: false,
                    name: 'Applied SankeyNode',
                },
            ])

            const { nodes, links } = await getSankeyData(applications)

            expect(nodes).toEqual([
                {
                    name: 'Applied SankeyNode',
                    color: 'yellow',
                    value: 1,
                    isTerminal: false,
                },
                {
                    name: 'In Progress SankeyNode',
                    color: 'blue',
                    value: 1,
                    isTerminal: false,
                },
            ])
            expect(links).toEqual([
                {
                    from: 'Applied SankeyNode',
                    to: 'In Progress SankeyNode',
                    flow: 1,
                },
            ])
        })

        it('should return a single node that is not a permanent node when passed an array of applications with a single terminal event', async () => {
            const inputApplications = [
                {
                    events: [
                        {
                            statusId: 1,
                        },
                    ],
                    ghosted: false,
                },
            ]

            const mockGetAllSankeyNodes =
                require('../sankey-node-service.js').getAllSankeyNodes

            mockGetAllSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    applicationStateIds: [],
                    name: 'Ghosted SankeyNode',
                },
                {
                    id: 2,
                    applicationStateIds: [],
                    name: 'In Progress SankeyNode',
                },
                {
                    id: 3,
                    applicationStateIds: [1],
                    color: 'yellow',
                    isTerminal: true,
                    name: 'Applied SankeyNode',
                },
            ])

            const { nodes, links } = await getSankeyData(inputApplications)

            expect(nodes).toEqual([
                {
                    name: 'Applied SankeyNode',
                    color: 'yellow',
                    isTerminal: true,
                    value: 1,
                },
            ])

            expect(links).toEqual([])
        })

        it('should return a complex list of nodes and links when passed a number of different applications', async () => {
            const applications = []

            const addApplication = (events, ghosted) => {
                const evts = events.map((statusId) => ({ statusId }))
                applications.push({ events: evts, ghosted })
            }

            for (let i = 0; i < 30; i++) {
                addApplication([1], true)
            }

            for (let i = 0; i < 50; i++) {
                addApplication([1, 10], false)
            }

            for (let i = 0; i < 20; i++) {
                addApplication([1, 2, 3], false)
            }

            for (let i = 0; i < 10; i++) {
                addApplication([1, 2, 3, 4], false)
            }

            const mockGetAllSankeyNodes =
                require('../sankey-node-service.js').getAllSankeyNodes

            mockGetAllSankeyNodes.mockResolvedValue([
                {
                    id: 1,
                    applicationStateIds: [],
                    color: 'grey',
                    name: 'Ghosted SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 2,
                    color: 'blue',
                    applicationStateIds: [],
                    name: 'In Progress SankeyNode',
                    isTerminal: false,
                },
                {
                    id: 3,
                    applicationStateIds: [1],
                    color: 'yellow',
                    isTerminal: false,
                    name: 'Applied SankeyNode',
                },
                {
                    id: 4,
                    applicationStateIds: [3],
                    color: 'green',
                    isTerminal: false,
                    name: 'Phone screen SankeyNode',
                },
                {
                    id: 5,
                    applicationStateIds: [10],
                    color: 'red',
                    isTerminal: true,
                    name: 'Rejected SankeyNode',
                },
            ])

            const { nodes, links } = await getSankeyData(applications)

            expect(nodes).toEqual([
                {
                    name: 'Applied SankeyNode',
                    color: 'yellow',
                    value: 110,
                    isTerminal: false,
                },
                {
                    name: 'Ghosted SankeyNode',
                    color: 'grey',
                    value: 30,
                    isTerminal: false,
                },
                {
                    name: 'Rejected SankeyNode',
                    color: 'red',
                    value: 50,
                    isTerminal: true,
                },
                {
                    name: 'Phone screen SankeyNode',
                    color: 'green',
                    value: 30,
                    isTerminal: false,
                },
                {
                    name: 'In Progress SankeyNode',
                    color: 'blue',
                    value: 30,
                    isTerminal: false,
                },
            ])

            expect(links).toEqual([
                {
                    from: 'Applied SankeyNode',
                    to: 'Ghosted SankeyNode',
                    flow: 30,
                },
                {
                    from: 'Applied SankeyNode',
                    to: 'Rejected SankeyNode',
                    flow: 50,
                },
                {
                    from: 'Applied SankeyNode',
                    to: 'Phone screen SankeyNode',
                    flow: 30,
                },
                {
                    from: 'Phone screen SankeyNode',
                    to: 'In Progress SankeyNode',
                    flow: 30,
                },
            ])
        })
    })
})
