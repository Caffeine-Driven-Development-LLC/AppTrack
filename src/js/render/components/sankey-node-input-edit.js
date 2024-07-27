import React, { useContext, useState } from 'react'
import { EventFlowContext } from '../main-window/event-flow-context.js'
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
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material'
import { MuiColorInput } from 'mui-color-input'

export default function ({
    onClose: onClose,
    initialSankeyNode: initialSankeyNode,
}) {
    const [sankeyNode, setSankeyNode] = useState(
        initialSankeyNode || {
            name: '',
            color: '#5bbbbb',
            applicationStateIds: [],
        }
    )
    const [assignStepText, setAssignStepText] = useState('')
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const { eventFlowMap } = useContext(EventFlowContext)

    const handleChange = (event) => {
        let { id, value } = event.target
        setSankeyNode((prevState) => ({
            ...prevState,
            [id]: value,
        }))
    }

    const handleCancel = () => {
        onClose()
    }

    const handleDelete = (event) => {
        event.preventDefault()
        window.sankeyNodeApi.deleteSankeyNode(sankeyNode.id)
        onClose()
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (sankeyNode.id) {
            window.sankeyNodeApi.updateSankeyNode(sankeyNode.id, sankeyNode)
        } else {
            window.sankeyNodeApi.addSankeyNode(sankeyNode)
        }
        onClose()
    }

    const handleNewAssignedStep = (event) => {
        const newStep = event.target.value
        setAssignStepText('')
        setSankeyNode((prevState) => ({
            ...prevState,
            applicationStateIds: [...prevState.applicationStateIds, newStep],
        }))
    }

    const handleRemoveAssignedStep = (event, id) => {
        setSankeyNode((prevState) => ({
            ...prevState,
            applicationStateIds: prevState.applicationStateIds.filter(
                (e) => e !== id
            ),
        }))
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ minWidth: '400px' }}>
                <TextField
                    size="small"
                    id="name"
                    label="Name"
                    value={sankeyNode.name || ''}
                    variant="outlined"
                    onChange={handleChange}
                    required
                />
                <MuiColorInput
                    id="color"
                    label="Color"
                    format="hex"
                    value={sankeyNode.color || ''}
                    onChange={(event) =>
                        handleChange({
                            target: { id: 'color', value: event },
                        })
                    }
                    isAlphaHidden
                />
                <Box>
                    {sankeyNode.applicationStateIds.map(
                        (applicationStateId) => {
                            const e = eventFlowMap.find(
                                (e) => e.id === applicationStateId
                            )
                            return (
                                <Chip
                                    label={e.name}
                                    key={e.id}
                                    onDelete={(event) =>
                                        handleRemoveAssignedStep(event, e.id)
                                    }
                                    sx={{ margin: 0.5 }}
                                />
                            )
                        }
                    )}
                </Box>
                {sankeyNode.id && !sankeyNode.isPermanent && (
                    <FormControl fullWidth>
                        <InputLabel id="assignToApplicaionStepLabel">
                            Assign to application step
                        </InputLabel>
                        <Select
                            labelId="assignToApplicaionStepLabel"
                            size="small"
                            id="assignToApplicaionStepBox"
                            label="Assign to application step"
                            onChange={handleNewAssignedStep}
                            value={assignStepText}
                        >
                            {eventFlowMap
                                .filter(
                                    (e) =>
                                        !sankeyNode.applicationStateIds.includes(
                                            e.id
                                        )
                                )
                                .filter((e) => e.isDeleted === 0)
                                .map((event) => {
                                    return (
                                        <MenuItem
                                            key={event.id}
                                            value={event.id}
                                        >
                                            {event.name}
                                        </MenuItem>
                                    )
                                })}
                        </Select>
                    </FormControl>
                )}
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
                    {sankeyNode.id && !sankeyNode.isPermanent && (
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
                <DialogTitle id="alert-dialog-title">
                    Delete Sankey Node
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this sankey node?
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
