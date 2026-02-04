import React, { useContext, useState } from 'react'
import { EventFlowContext } from '../main-window/event-flow-context.js'
import {
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogClose,
    Input,
    Select,
    SelectItem,
    Switch,
} from '../ui/index.js'

export default function EventConfigInputEdit({
    onClose,
    initialApplicationEvent,
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

    const handleSwitchChange = (id, checked) => {
        setApplicationEvent((prevState) => ({
            ...prevState,
            [id]: checked ? 1 : 0,
        }))
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

    const handleRemoveNextStep = (nextStepId) => {
        setApplicationEvent((prevState) => ({
            ...prevState,
            availableNextStepIds: prevState.availableNextStepIds.filter(
                (id) => id !== nextStepId
            ),
        }))
    }

    const handleNewPossibleNextStep = (value) => {
        const nextStepId = parseInt(value)
        setSelectedNextStep('')
        setApplicationEvent((prevState) => ({
            ...prevState,
            availableNextStepIds: [
                ...prevState.availableNextStepIds,
                nextStepId,
            ],
        }))
    }

    const availableNextSteps = eventFlowMap
        .filter((e) => !applicationEvent.availableNextStepIds.includes(e.id))
        .filter((e) => e.alwaysAvailable === 0)
        .filter((e) => e.initialStep === 0)
        .filter((e) => e.isDeleted === 0)

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 min-w-[400px]">
                <Input
                    id="name"
                    label="Name"
                    value={applicationEvent.name || ''}
                    onChange={handleChange}
                    required
                />

                <Switch
                    id="alwaysAvailable"
                    checked={applicationEvent.alwaysAvailable === 1}
                    onCheckedChange={(checked) => handleSwitchChange('alwaysAvailable', checked)}
                    label="Always available"
                />

                <Switch
                    id="initialStep"
                    checked={applicationEvent.initialStep === 1}
                    onCheckedChange={(checked) => handleSwitchChange('initialStep', checked)}
                    label="Initial step"
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                        Possible next steps
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {applicationEvent.availableNextStepIds.map((nextStepId) => {
                            const e = eventFlowMap.find((e) => e.id === nextStepId)
                            if (!e) return null
                            return (
                                <Chip
                                    key={e.id}
                                    onDelete={() => handleRemoveNextStep(e.id)}
                                >
                                    {e.name}
                                </Chip>
                            )
                        })}
                        {applicationEvent.availableNextStepIds.length === 0 && (
                            <span className="text-sm text-[var(--text-muted)]">None selected</span>
                        )}
                    </div>
                </div>

                {availableNextSteps.length > 0 && (
                    <Select
                        label="Add new possible next step"
                        value={selectedNextStep}
                        onValueChange={handleNewPossibleNextStep}
                        placeholder="Select a step..."
                    >
                        {availableNextSteps.map((eventFlow) => (
                            <SelectItem key={eventFlow.id} value={String(eventFlow.id)}>
                                {eventFlow.name}
                            </SelectItem>
                        ))}
                    </Select>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    {applicationEvent.id && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            Delete
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" size="sm">
                        Submit
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}>
                <DialogContent title="Delete Step">
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-[var(--text-secondary)]">
                            Are you sure you want to delete this step?
                        </p>
                        <div className="flex justify-end gap-2">
                            <DialogClose>
                                <Button variant="secondary" size="sm">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button variant="danger" size="sm" onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </form>
    )
}
