import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material'
import React, { useContext, useState } from 'react'
import { EventFlowContext } from '../main-window/event-flow-context.js'

export default function ({
    onClose: onClose,
    initialApplicationEvent: initialApplicationEvent,
}) {
    const [selectedNextStep, setSelectedNextStep] = useState('')
    const [applicationEvent, setApplicationEvent] = useState(
        initialApplicationEvent || {
            name: '',
            alwaysAvailable: 0,
            initialStep: 0,
            availableNextStepIds: [],
        }
    )
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const { eventFlowMap } = useContext(EventFlowContext)

    const handleChange = (event) => {
        let { id, value } = event.target
        setApplicationEvent((prevState) => ({
            ...prevState,
            [id]: value,
        }))
    }

    const handleSwitchChange = (event) => {
        let { id, checked } = event.target
        setApplicationEvent((prevState) => ({
            ...prevState,
            [id]: checked ? 1 : 0,
        }))
        console.log('applicationEvent', applicationEvent)
    }

    const handleCancel = () => {
        onClose()
    }

    const handleDelete = (event) => {
        event.preventDefault()
        window.eventFlowApi.deleteApplicationState(applicationEvent.id)
        onClose()
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (applicationEvent.id) {
            window.eventFlowApi.updateApplicationState(
                applicationEvent.id,
                applicationEvent
            )
        } else {
            window.eventFlowApi.createApplicationState(applicationEvent)
        }
        onClose()
    }

    const handleRemoveNextStep = (event, nextStepId) => {
        setApplicationEvent((prevState) => ({
            ...prevState,
            availableNextStepIds: prevState.availableNextStepIds.filter(
                (id) => id !== nextStepId
            ),
        }))
    }

    const handleNewPossibleNextStep = (event) => {
        const nextStepId = event.target.value
        setSelectedNextStep('')
        setApplicationEvent((prevState) => ({
            ...prevState,
            availableNextStepIds: [
                ...prevState.availableNextStepIds,
                nextStepId,
            ],
        }))
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ minWidth: '400px' }}>
                <TextField
                    size="small"
                    id="name"
                    label="Name"
                    variant="outlined"
                    value={applicationEvent.name || ''}
                    onChange={handleChange}
                    required
                />
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            id="alwaysAvailable"
                            checked={applicationEvent.alwaysAvailable === 1}
                            onChange={handleSwitchChange}
                        />
                    }
                    label="Always available"
                />
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            id="initialStep"
                            checked={applicationEvent.initialStep === 1}
                            onChange={handleSwitchChange}
                        />
                    }
                    label="Initial step"
                />
                <Typography>Possible next steps</Typography>
                <Box>
                    {applicationEvent.availableNextStepIds.map((nextStepId) => {
                        const e = eventFlowMap.find((e) => e.id == nextStepId)
                        return (
                            <Chip
                                label={e.name}
                                key={e.id}
                                onDelete={(event) =>
                                    handleRemoveNextStep(event, e.id)
                                }
                                sx={{ margin: 0.5 }}
                            />
                        )
                    })}
                </Box>

                <FormControl fullWidth>
                    <InputLabel id="addNewNextStepSelectBox">
                        Add new possible next step
                    </InputLabel>
                    <Select
                        labelId="addNewNextStepSelectBox"
                        size="small"
                        id="addNewNextStepSelectBox"
                        label="Add new possible next step"
                        onChange={handleNewPossibleNextStep}
                        value={selectedNextStep}
                    >
                        {eventFlowMap
                            .filter(
                                (e) =>
                                    !applicationEvent.availableNextStepIds.includes(
                                        e.id
                                    )
                            )
                            .filter((e) => e.alwaysAvailable === 0)
                            .filter((e) => e.initialStep === 0)
                            .filter((e) => e.isDeleted === 0)
                            .map((eventFlow) => (
                                <MenuItem
                                    key={eventFlow.id}
                                    value={eventFlow.id}
                                >
                                    {eventFlow.name}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
                <Stack direction="row-reverse" spacing={1}>
                    <Button
                        size="small"
                        variant="contained"
                        type="submit"
                        vaiant="contained"
                    >
                        Submit
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    {applicationEvent.id && (
                        <Button
                            size="small"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            Delete
                        </Button>
                    )}
                </Stack>
            </Stack>
            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Delete Step</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this step?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDelete}>Delete</Button>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </form>
    )
}
