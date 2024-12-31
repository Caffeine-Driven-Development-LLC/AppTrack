import {
    Button,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material'
import {
    ArrowDownward,
    ArrowUpward,
    Check,
    Edit,
    Help,
} from '@mui/icons-material'
import { useContext, useEffect, useState } from 'react'
import Modal from './modal.js'
import EventConfigInputEdit from './event-config-input-edit.js'
import { EventFlowContext } from '../main-window/event-flow-context.js'

export default function ({ label }) {
    const { eventFlowMap } = useContext(EventFlowContext)
    const [selectedEventIndex, setSelectedEventIndex] = useState(null)

    const [isEventInputModalOpen, setIsEventInputModalOpen] = useState(false)
    const [modalHeader, setModalHeader] = useState('')

    const theme = useTheme()

    const iconWidth = '15px'
    const iconPadding = '3px'

    const [eventMap, setEventMap] = useState(eventFlowMap)

    const [showErrorSnackbar, setShowErrorSnackbar] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')

    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

    useEffect(() => {
        window.eventFlowApi.onDisplayError((event, args) => {
            console.log('Error: ', args)
            setSnackbarMessage(args)
            setShowErrorSnackbar(true)
        })

        return () => {
            window.eventFlowApi.removeListeners()
        }
    }, [])

    useEffect(() => {
        setEventMap(eventFlowMap.filter((event) => event.isDeleted === 0))
    }, [eventFlowMap])

    const swapEvents = (index1, index2) => {
        const applicationState1 = eventMap[index1]
        const applicationState2 = eventMap[index2]
        window.eventFlowApi.swapOrderOfApplicationStates({
            id1: applicationState1.id,
            displayOrder1: applicationState1.displayOrder,
            id2: applicationState2.id,
            displayOrder2: applicationState2.displayOrder,
        })
    }

    const shiftItemUp = (event, index) => {
        event.preventDefault()
        swapEvents(index, index - 1)
    }

    const shiftItemDown = (event, index) => {
        event.preventDefault()
        swapEvents(index, index + 1)
    }

    const openEventInputModal = (event, index) => {
        event.preventDefault()
        setSelectedEventIndex(index)
        setModalHeader(index !== undefined ? 'Edit Event' : 'Add Event')
        setIsEventInputModalOpen(true)
    }

    const closeEventInputModal = () => {
        setIsEventInputModalOpen(false)
        setSelectedEventIndex(null)
    }

    return (
        <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" spacing={1}>
                    <Typography variant="h5">{label}</Typography>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={openEventInputModal}
                    >
                        Add new event
                    </Button>
                </Stack>
                <Help onClick={() => setIsHelpModalOpen(true)} />
            </Stack>
            <TableContainer>
                <Table size="small">
                    <TableHead
                        sx={{
                            backgroundColor: theme.palette.tableHeader.default,
                        }}
                    >
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>Step Name</TableCell>
                            <Tooltip title="Initial step">
                                <TableCell>IS</TableCell>
                            </Tooltip>
                            <Tooltip title="Always available">
                                <TableCell>AA</TableCell>
                            </Tooltip>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {eventMap.map((event, index) => {
                            return (
                                <TableRow
                                    key={event.id}
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
                                        {index != 0 && (
                                            <ArrowUpward
                                                fontSize="small"
                                                onClick={(event) =>
                                                    shiftItemUp(event, index)
                                                }
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell
                                        style={{
                                            flexGrow: 0,
                                            width: iconWidth,
                                            padding: iconPadding,
                                        }}
                                        align="center"
                                    >
                                        {index != eventMap.length - 1 && (
                                            <ArrowDownward
                                                fontSize="small"
                                                onClick={(event) =>
                                                    shiftItemDown(event, index)
                                                }
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell style={{ flexGrow: 1 }}>
                                        {event.name}
                                    </TableCell>
                                    <TableCell
                                        style={{
                                            flexGrow: 0,
                                            width: iconWidth,
                                            padding: iconPadding,
                                        }}
                                        align="center"
                                    >
                                        {event.initialStep === 1 && <Check />}
                                    </TableCell>
                                    <TableCell
                                        style={{
                                            flexGrow: 0,
                                            width: iconWidth,
                                            padding: iconPadding,
                                        }}
                                        align="center"
                                    >
                                        {event.alwaysAvailable === 1 && (
                                            <Check />
                                        )}
                                    </TableCell>
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
                                            onClick={(event) =>
                                                openEventInputModal(
                                                    event,
                                                    index
                                                )
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Modal
                isOpen={isEventInputModalOpen}
                onClose={closeEventInputModal}
                header={modalHeader}
            >
                <EventConfigInputEdit
                    initialApplicationEvent={eventMap[selectedEventIndex]}
                />
            </Modal>
            <Snackbar
                open={showErrorSnackbar}
                autoHideDuration={6000}
                onClose={() => setShowErrorSnackbar(false)}
                message={snackbarMessage}
            />
            <Modal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
            >
                <Stack sx={{ width: '80vw' }}>
                    <Typography paragraph>
                        This page allows you to customize the order of steps
                        within the application process. You can add new steps,
                        edit existing, or remove all together.
                    </Typography>
                    <Typography paragraph>
                        When customizing, you also have the ability to define
                        what, if any, next steps are available within your
                        application process.
                    </Typography>
                    <Typography paragraph>
                        For example, if you receive a verbal offer, you can
                        customize the next steps to be "waiting on written
                        offer", "accepting/declining", or "offer negotiation".
                    </Typography>
                    <Typography paragraph>
                        When customizing, there are certain steps that are
                        available to you to use at any time. Examples could
                        include withdrawing yourself from the application
                        process, receiving an offer, or declining an offer.
                    </Typography>
                    <Typography paragraph>
                        The order of steps within the process can be changed
                        using the arrow keys. Applications will be sorted in
                        reverse order of the current step they are currently on.
                        It is recommended to order the steps that the closer the
                        process is to completion, the lower it appears on the
                        list.
                    </Typography>
                    <Typography paragraph>
                        Steps can also be marked as an initial step, This should
                        mark any step that is the first step in the application
                        process. If there is only 1 initial step, when logging a
                        new application, it will automatically be of that step,
                        otherwise the user will be prompted to select the
                        initial step from the set of initial steps.
                    </Typography>
                </Stack>
            </Modal>
        </Stack>
    )
}
