import ApplicationOverview from '../../components/application-overview.js'
import { useContext, useEffect, useState } from 'react'
import ApplicationInputEdit from '../../components/application-input-edit.js'
import EventInputEdit from '../../components/event-input-edit.js'
import ApplicaionNoteInputEdit from '../../components/applicaion-note-input-edit.js'
import TimelineEvent from '../../components/timeline-event.js'
import { EventFlowContext } from '../event-flow-context.js'
import { Button, Dialog, DialogContent } from '../../ui/index.js'

export default function ApplicationDetails({ initialApplication }) {
    const [application, setApplication] = useState(initialApplication || {})
    const [events, setEvents] = useState([])

    const [eventToEdit, setEventToEdit] = useState(null)

    const [isApplicationInputModalOpen, setIsApplicationInputModalOpen] = useState(false)
    const [isApplicationEventInputModalOpen, setIsApplicationEventInputModalOpen] = useState(false)
    const [isApplicationNoteInputModalOpen, setIsApplicationNoteInputModalOpen] = useState(false)

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

        window.applicationApi.onGetApplication((event, app) => {
            if (app.id === initialApplication.id) {
                setApplication(app)
            }
        })

        window.applicationApi.getEventsForApplication(application.id)

        return () => {
            window.applicationApi.removeListeners()
        }
    }, [])

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4">
                <ApplicationOverview
                    application={application}
                    eventFlowMap={eventFlowMap}
                    onApplicationStatusChange={handleApplicationStatusChange}
                />

                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleAddNoteClick}>
                        Add Note
                    </Button>
                    {application.postUrl && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.api.openLink(application.postUrl)}
                        >
                            Job Description
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsApplicationInputModalOpen(true)}
                    >
                        Edit
                    </Button>
                </div>

                {application.salaryRangeHigh && application.salaryRangeLow && (
                    <p className="text-[var(--text-primary)]">
                        Salary Range: ${Intl.NumberFormat().format(application.salaryRangeLow)} - ${Intl.NumberFormat().format(application.salaryRangeHigh)}
                    </p>
                )}

                {/* Timeline */}
                <div className="flex flex-col">
                    {events.map((event, index) => (
                        <div key={event.id} className="flex">
                            {/* Timeline marker */}
                            <div className="flex flex-col items-center mr-4">
                                <div className="w-3 h-3 rounded-full bg-accent-500 flex-shrink-0" />
                                {index !== events.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-[var(--border-color)] my-1" />
                                )}
                            </div>
                            {/* Content */}
                            <div className="pb-4 flex-1">
                                <TimelineEvent
                                    date={event.date}
                                    header={event.status}
                                    comment={event.notes}
                                    handleEditClick={(e) => handleEditEventClick(e, event)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={isApplicationInputModalOpen} onOpenChange={(open) => !open && setIsApplicationInputModalOpen(false)}>
                <DialogContent title="Edit Application">
                    <ApplicationInputEdit
                        application={application}
                        onClose={() => setIsApplicationInputModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isApplicationEventInputModalOpen} onOpenChange={(open) => !open && handleModalClose(false)}>
                <DialogContent title={eventToEdit ? eventToEdit.status : 'Edit Event'}>
                    <EventInputEdit
                        onclose={() => handleModalClose(false)}
                        eventId={eventToEdit ? eventToEdit.id : null}
                        event={eventToEdit}
                        applicationId={application.id}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isApplicationNoteInputModalOpen} onOpenChange={(open) => !open && handleModalClose(false)}>
                <DialogContent title="Note">
                    <ApplicaionNoteInputEdit
                        applicationId={application.id}
                        onclose={() => handleModalClose(true)}
                        note={eventToEdit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
