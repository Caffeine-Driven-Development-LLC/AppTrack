import { Button, Menu, MenuItem, Stack, Typography } from '@mui/material'
import Logo from './logo.js'
import EstimatedTimeAgo from './estimated-time-ago.js'
import { ArrowDropDown } from '@mui/icons-material'
import VerticalPercentBar from './vertical-percent-bar.js'
import { useContext, useEffect, useState } from 'react'
import EventInputEdit from './event-input-edit.js'
import Modal from './modal.js'
import { EventFlowContext } from '../main-window/event-flow-context.js'

export default function ({ application, onApplicationStatusChange }) {
    const [nextStepsMenuItems, setNextStepsMenuItems] = useState([])
    const [anchorEl, setAnchorEl] = useState(null)

    const [isEventInputModalOpen, setIsEventInputModalOpen] = useState(false)
    const [selectedEventId, setSelectedEventId] = useState(null)

    const { eventFlowMap } = useContext(EventFlowContext)

    const isProgressMenuOpen = Boolean(anchorEl)

    const alwaysAvailableApplicationEventMenuItems = eventFlowMap
        ?.filter((e) => e.alwaysAvailable)
        .filter((e) => e.isDeleted === 0)
        .map((e) => (
            <MenuItem
                key={e.id}
                onClick={(event) => updateApplicationStatus(event, e.id)}
            >
                {e.name}
            </MenuItem>
        ))

    const currentApplicationStep = eventFlowMap.find(
        (e) => e.id === application.statusId
    )

    const canApplicationProgress =
        currentApplicationStep?.availableNextStepIds.length > 0

    useEffect(() => {
        const nextSteps = eventFlowMap.filter((eventFlow) =>
            currentApplicationStep.availableNextStepIds.includes(eventFlow.id)
        )

        const progressEventMenuItems = nextSteps?.map((nextStep) => (
            <MenuItem
                key={nextStep.id}
                onClick={(event) => updateApplicationStatus(event, nextStep.id)}
            >
                {nextStep.name}
            </MenuItem>
        ))
        setNextStepsMenuItems([
            ...progressEventMenuItems,
            ...alwaysAvailableApplicationEventMenuItems,
        ])
    }, [eventFlowMap, application])

    const updateApplicationStatus = (event, applicationStateId) => {
        event.stopPropagation()
        setSelectedEventId(applicationStateId)
        setIsEventInputModalOpen(true)
        handleNextStepClose()
    }

    const handleNextStepClick = (event) => {
        event.stopPropagation()
        setAnchorEl(event.currentTarget)
    }

    const handleNextStepClose = (event) => {
        event?.stopPropagation()
        setAnchorEl(null)
    }

    const handleEventInputModalClose = () => {
        setIsEventInputModalOpen(false)
        onApplicationStatusChange()
    }

    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ width: '100%' }}
        >
            <Stack direction="row" alignItems="center" spacing={1}>
                <Logo
                    companyName={application.companyName}
                    logoPath={application.companyLogoPath}
                />
                <Stack>
                    <Typography variant="body1">{application.role}</Typography>
                    <Typography variant="body2">
                        {application.companyName}
                    </Typography>
                </Stack>
            </Stack>
            <Stack direction="row" spacing={1}>
                <Stack alignItems="flex-end">
                    <Button
                        size="small"
                        variant="contained"
                        endIcon={<ArrowDropDown />}
                        onClick={handleNextStepClick}
                        disabled={!canApplicationProgress}
                    >
                        {currentApplicationStep?.name}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={isProgressMenuOpen}
                        onClose={handleNextStepClose}
                    >
                        {nextStepsMenuItems}
                    </Menu>
                    <EstimatedTimeAgo date={application.lastUpdated} />
                </Stack>
                {canApplicationProgress && (
                    <VerticalPercentBar
                        fillPercentage={application.percentGhosted}
                    />
                )}
            </Stack>
            <Modal
                isOpen={isEventInputModalOpen}
                onClose={handleEventInputModalClose}
                header={
                    eventFlowMap.find(
                        (eventFlow) => eventFlow.id === selectedEventId
                    )?.name || ''
                }
            >
                <EventInputEdit
                    onclose={handleEventInputModalClose}
                    eventId={selectedEventId}
                    applicationId={application.id}
                />
            </Modal>
        </Stack>
    )
}
