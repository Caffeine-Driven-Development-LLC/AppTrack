import {
    Box,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import Modal from '../../components/modal.js'
import { Edit, Help } from '@mui/icons-material'
import SankeyNodeInputEdit from '../../components/sankey-node-input-edit.js'

export default function () {
    const [sankeyNodes, setSankeyNodes] = useState([])
    const [selectedNode, setSelectedNode] = useState(null)
    const [modalHeader, setModalHeader] = useState('')
    const [isSankeyNodeModalOpen, setIsSankeyNodeModalOpen] = useState(false)
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

    const iconWidth = '15px'
    const iconPadding = '3px'

    const openSankeyNodeModal = (event, nodeId) => {
        event.preventDefault()
        setSelectedNode(sankeyNodes.find((n) => n.id === parseInt(nodeId)))
        setModalHeader(nodeId !== undefined ? 'Edit Node' : 'Add Node')
        setIsSankeyNodeModalOpen(true)
    }

    useEffect(() => {
        window.sankeyNodeApi.getSankeyNodes()
        window.sankeyNodeApi.onGetSankeyNodes((event, nodes) => {
            setSankeyNodes(nodes)
        })

        return () => {
            window.sankeyNodeApi.removeListeners()
        }
    }, [])
    return (
        <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" spacing={2}>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={openSankeyNodeModal}
                    >
                        Add node
                    </Button>
                </Stack>
                <Help onClick={() => setIsHelpModalOpen(true)} />
            </Stack>
            <TableContainer>
                <Table size="small">
                    <TableBody>
                        {sankeyNodes.map((n, index) => (
                            <TableRow
                                key={n.id}
                                sx={{
                                    '&:last-child td, &:last-child th': {
                                        border: 0,
                                    },
                                    backgroundColor:
                                        index % 2
                                            ? 'rgba(0, 0, 0, 0.05)'
                                            : 'rgba(0, 0, 0, 0)',
                                }}
                            >
                                <TableCell
                                    style={{
                                        flexGrow: 0,
                                        width: iconWidth,
                                        padding: iconPadding,
                                    }}
                                    align="center"
                                >
                                    <Box
                                        sx={{
                                            width: 16,
                                            height: 16,
                                            border: '1px solid black',
                                            bgcolor: n.color,
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{n.name}</TableCell>
                                <TableCell
                                    style={{
                                        flexGrow: 0,
                                        width: iconWidth,
                                        padding: iconPadding,
                                    }}
                                    align="center"
                                >
                                    <Edit
                                        fontSize="small"
                                        onClick={(e) =>
                                            openSankeyNodeModal(e, n.id)
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Modal
                isOpen={isSankeyNodeModalOpen}
                onClose={() => setIsSankeyNodeModalOpen(false)}
                header={modalHeader}
            >
                <SankeyNodeInputEdit initialSankeyNode={selectedNode} />
            </Modal>
            <Modal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
            >
                <Stack sx={{ width: '80vw' }}>
                    <Typography paragraph>
                        This page allows you to customize what is displayed in
                        sankey graphs throughout the application.
                    </Typography>
                    <Typography paragraph>
                        You can add, edit, or remove any node you would like
                        shown in the sankey graphs, as well as associate any
                        application steps with the nodes, or change the color
                        of the node.
                    </Typography>
                    <Typography paragraph>
                        Multiple application steps can be mapped to the same
                        node, if desired. This can simplify a graph and
                        obfuscate steps your applications have taken. For
                        example: If you have 2 different types of interviews
                        defined as application steps (A technical, and
                        behavioral interview), you can condense them down to a
                        single 'interview' node in the sankey graph.
                    </Typography>
                </Stack>
            </Modal>
        </Stack>
    )
}
