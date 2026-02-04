import { useContext, useEffect, useState } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
    Tooltip,
    TooltipProvider,
} from '../ui/index.js'

// Icons
function DragHandleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 4H5.01M5 8H5.01M5 12H5.01M11 4H11.01M11 8H11.01M11 12H11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    )
}

function CheckIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function HelpIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7.5 7.5C7.5 6.12 8.62 5 10 5C11.38 5 12.5 6.12 12.5 7.5C12.5 8.88 11.38 10 10 10V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="10" cy="14" r="0.75" fill="currentColor"/>
        </svg>
    )
}

function PlusIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    )
}

function SortableRow({ event, index, editingId, startEditing, renderEditRow }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: event.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        position: 'relative',
    }

    return (
        <div ref={setNodeRef} style={style}>
            <div
                className={`
                    grid grid-cols-[40px_1fr_50px_50px] items-center
                    border-t border-[var(--border-color)]
                    ${isDragging ? 'bg-[var(--bg-tertiary)] shadow-lg' : ''}
                    ${editingId === event.id ? 'bg-[var(--bg-secondary)]' : index % 2 === 1 ? 'bg-[var(--bg-secondary)]/30' : ''}
                    ${editingId !== event.id && !isDragging ? 'cursor-pointer hover:bg-[var(--bg-secondary)]/50' : ''}
                `}
                onClick={() => editingId !== event.id && !isDragging && startEditing(event)}
            >
                <div
                    className="p-2 flex justify-center cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    {...attributes}
                    {...listeners}
                >
                    <DragHandleIcon />
                </div>
                <div className="p-2 text-sm text-[var(--text-primary)]">{event.name}</div>
                <div className="p-2 flex justify-center text-accent-500">
                    {event.initialStep === 1 && <CheckIcon />}
                </div>
                <div className="p-2 flex justify-center text-accent-500">
                    {event.alwaysAvailable === 1 && <CheckIcon />}
                </div>
            </div>
            {editingId === event.id && renderEditRow(event)}
        </div>
    )
}

export default function EventFlowList({ label }) {
    const { eventFlowMap } = useContext(EventFlowContext)
    const [eventMap, setEventMap] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [editingEvent, setEditingEvent] = useState(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [newEvent, setNewEvent] = useState({ name: '', alwaysAvailable: 0, initialStep: 0, availableNextStepIds: [] })
    const [showErrorSnackbar, setShowErrorSnackbar] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        window.eventFlowApi.onDisplayError((event, args) => {
            setSnackbarMessage(args)
            setShowErrorSnackbar(true)
        })
        return () => window.eventFlowApi.removeListeners()
    }, [])

    useEffect(() => {
        setEventMap(eventFlowMap.filter((event) => event.isDeleted === 0))
    }, [eventFlowMap])

    const handleDragEnd = (event) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            const oldIndex = eventMap.findIndex(e => e.id === active.id)
            const newIndex = eventMap.findIndex(e => e.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                // Update local state immediately for smooth UX
                const newOrder = arrayMove(eventMap, oldIndex, newIndex)
                setEventMap(newOrder)

                // Persist the new order to the database
                const reorderData = newOrder.map((item, index) => ({
                    id: item.id,
                    displayOrder: index
                }))
                window.eventFlowApi.reorderApplicationStates(reorderData)
            }
        }
    }

    const startEditing = (event) => {
        setEditingId(event.id)
        setEditingEvent({ ...event })
        setIsAddingNew(false)
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditingEvent(null)
    }

    const saveEditing = () => {
        if (editingEvent.id) {
            window.eventFlowApi.updateApplicationState(editingEvent.id, editingEvent)
        }
        setEditingId(null)
        setEditingEvent(null)
    }

    const startAddingNew = () => {
        setIsAddingNew(true)
        setNewEvent({ name: '', alwaysAvailable: 0, initialStep: 0, availableNextStepIds: [] })
        setEditingId(null)
    }

    const cancelAddingNew = () => {
        setIsAddingNew(false)
        setNewEvent({ name: '', alwaysAvailable: 0, initialStep: 0, availableNextStepIds: [] })
    }

    const saveNewEvent = () => {
        if (newEvent.name.trim()) {
            window.eventFlowApi.createApplicationState(newEvent)
            setIsAddingNew(false)
            setNewEvent({ name: '', alwaysAvailable: 0, initialStep: 0, availableNextStepIds: [] })
        }
    }

    const deleteEvent = (id) => {
        window.eventFlowApi.deleteApplicationState(id)
        setDeleteConfirmId(null)
    }

    const addNextStep = (stepId, isNew = false) => {
        if (isNew) {
            setNewEvent(prev => ({ ...prev, availableNextStepIds: [...prev.availableNextStepIds, parseInt(stepId)] }))
        } else {
            setEditingEvent(prev => ({ ...prev, availableNextStepIds: [...prev.availableNextStepIds, parseInt(stepId)] }))
        }
    }

    const removeNextStep = (stepId, isNew = false) => {
        if (isNew) {
            setNewEvent(prev => ({ ...prev, availableNextStepIds: prev.availableNextStepIds.filter(id => id !== stepId) }))
        } else {
            setEditingEvent(prev => ({ ...prev, availableNextStepIds: prev.availableNextStepIds.filter(id => id !== stepId) }))
        }
    }

    const getAvailableNextSteps = (currentIds) => {
        return eventFlowMap
            .filter(e => !currentIds.includes(e.id))
            .filter(e => e.alwaysAvailable === 0 && e.initialStep === 0 && e.isDeleted === 0)
    }

    const renderEditRow = (event, isNew = false) => {
        const data = isNew ? newEvent : editingEvent
        const setData = isNew ? setNewEvent : setEditingEvent
        const availableSteps = getAvailableNextSteps(data.availableNextStepIds)

        return (
            <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <Input
                                label="Name"
                                value={data.name}
                                onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                                autoFocus
                            />
                        </div>
                        <div className="flex flex-col gap-2 pt-6">
                            <Switch
                                checked={data.initialStep === 1}
                                onCheckedChange={(checked) => setData(prev => ({ ...prev, initialStep: checked ? 1 : 0 }))}
                                label="Initial step"
                            />
                            <Switch
                                checked={data.alwaysAvailable === 1}
                                onCheckedChange={(checked) => setData(prev => ({ ...prev, alwaysAvailable: checked ? 1 : 0 }))}
                                label="Always available"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-[var(--text-secondary)]">Next Steps</label>
                        <div className="flex flex-wrap gap-1.5 items-center">
                            {data.availableNextStepIds.map(id => {
                                const step = eventFlowMap.find(e => e.id === id)
                                if (!step) return null
                                return (
                                    <Chip key={id} onDelete={() => removeNextStep(id, isNew)}>
                                        {step.name}
                                    </Chip>
                                )
                            })}
                            {availableSteps.length > 0 && (
                                <Select
                                    value=""
                                    onValueChange={(val) => addNextStep(val, isNew)}
                                    placeholder={<span className="flex items-center gap-1"><PlusIcon /> Add</span>}
                                >
                                    {availableSteps.map(step => (
                                        <SelectItem key={step.id} value={String(step.id)}>{step.name}</SelectItem>
                                    ))}
                                </Select>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        {!isNew && (
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(event.id)}>
                                Delete
                            </Button>
                        )}
                        <Button variant="secondary" size="sm" onClick={isNew ? cancelAddingNew : cancelEditing}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={isNew ? saveNewEvent : saveEditing}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{label}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={startAddingNew} disabled={isAddingNew}>
                            Add new
                        </Button>
                        <button
                            onClick={() => setIsHelpModalOpen(true)}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <HelpIcon />
                        </button>
                    </div>
                </div>

                {/* Add New Row */}
                {isAddingNew && (
                    <div className="border border-accent-500 rounded overflow-hidden">
                        {renderEditRow(null, true)}
                    </div>
                )}

                {/* Table */}
                <div className="border border-[var(--border-color)] rounded overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-[40px_1fr_50px_50px] bg-[var(--bg-tertiary)] text-xs font-medium text-[var(--text-secondary)]">
                        <div className="p-2"></div>
                        <div className="p-2">Step Name</div>
                        <Tooltip content="Initial Step"><div className="p-2 text-center cursor-help">IS</div></Tooltip>
                        <Tooltip content="Always Available"><div className="p-2 text-center cursor-help">AA</div></Tooltip>
                    </div>

                    {/* Rows */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={eventMap.map(e => e.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {eventMap.map((event, index) => (
                                <SortableRow
                                    key={event.id}
                                    event={event}
                                    index={index}
                                    editingId={editingId}
                                    startEditing={startEditing}
                                    renderEditRow={renderEditRow}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {eventMap.length === 0 && (
                        <div className="p-8 text-center text-sm text-[var(--text-muted)]">
                            No steps configured. Click "Add new" to create one.
                        </div>
                    )}
                </div>

                {/* Error Snackbar */}
                {showErrorSnackbar && (
                    <div className="fixed bottom-4 right-4 p-4 bg-negative text-white rounded shadow-overlay max-w-sm">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm">{snackbarMessage}</span>
                            <button onClick={() => setShowErrorSnackbar(false)}>×</button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                    <DialogContent title="Delete Step">
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            Are you sure you want to delete this step?
                        </p>
                        <div className="flex justify-end gap-2">
                            <DialogClose><Button variant="secondary" size="sm">Cancel</Button></DialogClose>
                            <Button variant="danger" size="sm" onClick={() => deleteEvent(deleteConfirmId)}>Delete</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Help Modal */}
                <Dialog open={isHelpModalOpen} onOpenChange={(open) => !open && setIsHelpModalOpen(false)}>
                    <DialogContent title="Help">
                        <div className="flex flex-col gap-3 text-sm text-[var(--text-secondary)]">
                            <p><strong>Click a row</strong> to edit it inline.</p>
                            <p><strong>Reorder</strong> using the arrow buttons on the left.</p>
                            <p><strong>Initial Step (IS)</strong> marks steps that can start an application (e.g., "Applied").</p>
                            <p><strong>Always Available (AA)</strong> marks steps available at any time (e.g., "Withdrawn", "Rejected").</p>
                            <p><strong>Next Steps</strong> define which steps can follow this one in your workflow.</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    )
}
