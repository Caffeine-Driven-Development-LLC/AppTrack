import Logo from './logo.js'
import EstimatedTimeAgo from './estimated-time-ago.js'
import { useContext, useEffect, useState } from 'react'
import EventInputEdit from './event-input-edit.js'
import { EventFlowContext } from '../main-window/event-flow-context.js'
import { Button, Dialog, DialogContent, Menu, MenuItem, Tooltip } from '../ui/index.js'

function GhostProgressBar({ percentage }) {
    const clamped = Math.min(percentage, 100)
    const color = clamped < 33
        ? 'var(--color-positive)'
        : clamped < 66
          ? 'var(--color-warning)'
          : 'var(--color-negative)'
    const label = clamped >= 100
        ? 'Likely ghosted'
        : `${parseInt(clamped)}% to ghost threshold`

    return (
        <Tooltip content={label}>
            <div className="w-full h-1 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${clamped}%`, backgroundColor: color }}
                />
            </div>
        </Tooltip>
    )
}

function ChevronDownIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

export default function ApplicationOverview({ application, onApplicationStatusChange }) {
    const [nextStepsMenuItems, setNextStepsMenuItems] = useState([])
    const [isEventInputModalOpen, setIsEventInputModalOpen] = useState(false)
    const [selectedEventId, setSelectedEventId] = useState(null)

    const { eventFlowMap } = useContext(EventFlowContext)

    const currentApplicationStep = eventFlowMap.find(
        (e) => e.id === application.statusId
    )

    const canApplicationProgress =
        currentApplicationStep?.availableNextStepIds.length > 0

    useEffect(() => {
        const alwaysAvailable = eventFlowMap
            ?.filter((e) => e.alwaysAvailable)
            .filter((e) => e.isDeleted === 0)

        const nextSteps = eventFlowMap.filter((eventFlow) =>
            currentApplicationStep?.availableNextStepIds.includes(eventFlow.id)
        )

        setNextStepsMenuItems([...nextSteps, ...alwaysAvailable])
    }, [eventFlowMap, application, currentApplicationStep])

    const updateApplicationStatus = (event, applicationStateId) => {
        event.stopPropagation()
        setSelectedEventId(applicationStateId)
        setIsEventInputModalOpen(true)
    }

    const handleEventInputModalClose = () => {
        setIsEventInputModalOpen(false)
        onApplicationStatusChange()
    }

    const menuTrigger = (
        <button
            onClick={(e) => e.stopPropagation()}
            disabled={!canApplicationProgress}
            className={`
                flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded
                transition-colors duration-150
                ${canApplicationProgress
                    ? 'bg-accent-500 text-white hover:bg-accent-600'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
                }
            `}
        >
            {currentApplicationStep?.name}
            {canApplicationProgress && <ChevronDownIcon />}
        </button>
    )

    const isGhosted = application.percentGhosted >= 100

    return (
        <div className="flex flex-col w-full gap-2">
            <div className="flex justify-between w-full">
                <div className="flex items-center gap-3">
                    <Logo
                        companyName={application.companyName}
                        logoPath={application.companyLogoPath}
                    />
                    <div className="flex flex-col">
                        <span className="font-medium text-[var(--text-primary)]">{application.role}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--text-secondary)]">
                                {application.companyName}
                            </span>
                            <span className="text-[var(--text-muted)]">&middot;</span>
                            <EstimatedTimeAgo date={application.lastUpdated} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canApplicationProgress ? (
                        <Menu trigger={menuTrigger} align="end">
                            {nextStepsMenuItems.map((step) => (
                                <MenuItem
                                    key={step.id}
                                    onClick={(event) => updateApplicationStatus(event, step.id)}
                                >
                                    {step.name}
                                </MenuItem>
                            ))}
                        </Menu>
                    ) : (
                        menuTrigger
                    )}
                </div>
            </div>

            {/* Ghost progress bar */}
            {canApplicationProgress && application.percentGhosted > 0 && (
                <GhostProgressBar percentage={application.percentGhosted} />
            )}

            <Dialog open={isEventInputModalOpen} onOpenChange={(open) => !open && handleEventInputModalClose()}>
                <DialogContent title={
                    eventFlowMap.find(
                        (eventFlow) => eventFlow.id === selectedEventId
                    )?.name || ''
                }>
                    <EventInputEdit
                        onclose={handleEventInputModalClose}
                        eventId={selectedEventId}
                        applicationId={application.id}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
