import ApplicationOverview from '../../components/application-overview.js'
import { Box, Button, Link, Stack, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineSeparator,
    TimelineItem,
    timelineItemClasses,
} from '@mui/lab'
import Modal from '../../components/modal.js'
import ApplicationInputEdit from '../../components/application-input-edit.js'
import EventInputEdit from '../../components/event-input-edit.js'
import ApplicaionNoteInputEdit from '../../components/applicaion-note-input-edit.js'
import TimelineEvent from '../../components/timeline-event.js'
import { EventFlowContext } from '../event-flow-context.js'

export default function ({ initialApplication }) {
    const [application, setApplication] = useState(initialApplication || {})
    const [events, setEvents] = useState([])

    const [eventToEdit, setEventToEdit] = useState(null)

    const [isApplicationInputModalOpen, setIsApplicationInputModalOpen] =
        useState(false)
    const [
        isApplicationEventInputModalOpen,
        setIsApplicationEventInputModalOpen,
    ] = useState(false)

    const [
        isApplicationNoteInputModalOpen,
        setIsApplicationNoteInputModalOpen,
    ] = useState(false)

    const { eventFlowMap } = useContext(EventFlowContext)

    const handleEditEventClick = (event, eventToEdit) => {
        event.stopPropagation()
        setEventToEdit(eventToEdit)
        if (eventToEdit.status) {
            setIsApplicationEventInputModalOpen(true)
        } else {
            setIsApplicationNoteInputModalOpen(true)
        }
    }

    const handleAddNoteClick = (event) => {
        event.stopPropagation()
        setIsApplicationNoteInputModalOpen(true)
    }

    const handleModalClose = (requestNewEvents) => {
        setIsApplicationNoteInputModalOpen(false)
        setIsApplicationEventInputModalOpen(false)
        if (requestNewEvents)
            window.applicationApi.getEventsForApplication(application.id)
        setEventToEdit(null)
    }

    const handleApplicationStatusChange = () => {
        window.applicationApi.getEventsForApplication(application.id)
        window.applicationApi.getApplication(application.id)
    }

    useEffect(() => {
        window.applicationApi.onGetEventsForApplication((event, data) => {
            if (data.applicationId === application.id) {
                setEvents(data.events)
            }
        })

        window.applicationApi.onGetApplication((event, application) => {
            if (application.id === application.id) {
                setApplication(application)
            }
        })

        window.applicationApi.getEventsForApplication(application.id)

        return () => {
            window.applicationApi.removeListeners()
        }
    }, [])

    const jobDescriptionButton = application.postUrl && (
        <Button
            onClick={() => window.api.openLink(application.postUrl)}
            variant="outlined"
            size="small"
        >
            Job Description
        </Button>
    )

    const salaryRange = application.salaryRangeHigh &&
        application.salaryRangeLow && (
            <Typography>
                Salary Range: $
                {Intl.NumberFormat().format(application.salaryRangeLow)} - $
                {Intl.NumberFormat().format(application.salaryRangeHigh)}
            </Typography>
        )

    return (
        <Box sx={{ width: '100%' }}>
            <Stack spacing={1}>
                <ApplicationOverview
                    application={application}
                    eventFlowMap={eventFlowMap}
                    onApplicationStatusChange={handleApplicationStatusChange}
                />
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAddNoteClick}
                    >
                        Add Note
                    </Button>
                    {jobDescriptionButton}
                    <Button
                        size="small"
                        onClick={() => setIsApplicationInputModalOpen(true)}
                    >
                        Edit
                    </Button>
                </Stack>
                {salaryRange}
                <Timeline
                    sx={{
                        [`& .${timelineItemClasses.root}:before`]: {
                            flex: 0,
                            padding: 0,
                        },
                    }}
                >
                    {events.map((event, index) => (
                        <TimelineItem key={event.id}>
                            <TimelineSeparator>
                                <TimelineDot />
                                {index !== events.length - 1 && (
                                    <TimelineConnector />
                                )}
                            </TimelineSeparator>
                            <TimelineContent>
                                <TimelineEvent
                                    date={event.date}
                                    header={event.status}
                                    comment={event.notes}
                                    handleEditClick={(e) =>
                                        handleEditEventClick(e, event)
                                    }
                                />
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            </Stack>
            <Modal
                isOpen={isApplicationInputModalOpen}
                onClose={() => setIsApplicationInputModalOpen(false)}
                header="Edit Application"
            >
                <ApplicationInputEdit application={application} />
            </Modal>
            <Modal
                isOpen={isApplicationEventInputModalOpen}
                onClose={() => handleModalClose(false)}
                header={eventToEdit ? eventToEdit.status : 'Edit Event'}
            >
                <EventInputEdit
                    onclose={() => handleModalClose(false)}
                    eventId={eventToEdit ? eventToEdit.id : null}
                    event={eventToEdit}
                    applicationId={application.id}
                />
            </Modal>
            <Modal
                isOpen={isApplicationNoteInputModalOpen}
                onClose={() => handleModalClose(false)}
                header="Note"
            >
                <ApplicaionNoteInputEdit
                    applicationId={application.id}
                    onclose={() => handleModalClose(true)}
                    note={eventToEdit}
                />
            </Modal>
        </Box>
    )
}
