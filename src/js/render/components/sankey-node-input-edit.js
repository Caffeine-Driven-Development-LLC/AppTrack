import React, { useContext, useState } from 'react'
import { EventFlowContext } from '../main-window/event-flow-context.js'
import {
    Button,
    Chip,
    ColorInput,
    Dialog,
    DialogContent,
    DialogClose,
    Input,
    Select,
    SelectItem,
} from '../ui/index.js'

export default function SankeyNodeInputEdit({
    onClose,
    initialSankeyNode,
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

    const handleColorChange = (color) => {
        setSankeyNode((prevState) => ({
            ...prevState,
            color: color,
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

    const handleNewAssignedStep = (value) => {
        const newStep = parseInt(value)
        setAssignStepText('')
        setSankeyNode((prevState) => ({
            ...prevState,
            applicationStateIds: [...prevState.applicationStateIds, newStep],
        }))
    }

    const handleRemoveAssignedStep = (id) => {
        setSankeyNode((prevState) => ({
            ...prevState,
            applicationStateIds: prevState.applicationStateIds.filter(
                (e) => e !== id
            ),
        }))
    }

    const availableSteps = eventFlowMap
        .filter((e) => !sankeyNode.applicationStateIds.includes(e.id))
        .filter((e) => e.isDeleted === 0)

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 min-w-[400px]">
                <Input
                    id="name"
                    label="Name"
                    value={sankeyNode.name || ''}
                    onChange={handleChange}
                    required
                />

                <ColorInput
                    label="Color"
                    value={sankeyNode.color || '#5bbbbb'}
                    onChange={handleColorChange}
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                        Assigned application steps
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {sankeyNode.applicationStateIds.map((applicationStateId) => {
                            const e = eventFlowMap.find((e) => e.id === applicationStateId)
                            if (!e) return null
                            return (
                                <Chip
                                    key={e.id}
                                    onDelete={() => handleRemoveAssignedStep(e.id)}
                                >
                                    {e.name}
                                </Chip>
                            )
                        })}
                        {sankeyNode.applicationStateIds.length === 0 && (
                            <span className="text-sm text-[var(--text-muted)]">None assigned</span>
                        )}
                    </div>
                </div>

                {sankeyNode.id && !sankeyNode.isPermanent && availableSteps.length > 0 && (
                    <Select
                        label="Assign to application step"
                        value={assignStepText}
                        onValueChange={handleNewAssignedStep}
                        placeholder="Select a step..."
                    >
                        {availableSteps.map((event) => (
                            <SelectItem key={event.id} value={String(event.id)}>
                                {event.name}
                            </SelectItem>
                        ))}
                    </Select>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    {sankeyNode.id && !sankeyNode.isPermanent && (
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
                <DialogContent title="Delete Sankey Node">
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-[var(--text-secondary)]">
                            Are you sure you want to delete this sankey node?
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
