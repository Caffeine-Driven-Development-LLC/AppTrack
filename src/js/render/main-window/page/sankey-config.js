import { useContext, useEffect, useState } from 'react'
import { EventFlowContext } from '../event-flow-context.js'
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
} from '../../ui/index.js'

// Icons
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

export default function SankeyConfig() {
    const [sankeyNodes, setSankeyNodes] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [editingNode, setEditingNode] = useState(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [newNode, setNewNode] = useState({ name: '', color: '#5bbbbb', applicationStateIds: [] })
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)

    const { eventFlowMap } = useContext(EventFlowContext)

    useEffect(() => {
        window.sankeyNodeApi.getSankeyNodes()
        window.sankeyNodeApi.onGetSankeyNodes((event, nodes) => {
            setSankeyNodes(nodes)
        })

        return () => {
            window.sankeyNodeApi.removeListeners()
        }
    }, [])

    const startEditing = (node) => {
        setEditingId(node.id)
        setEditingNode({ ...node })
        setIsAddingNew(false)
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditingNode(null)
    }

    const saveEditing = () => {
        if (editingNode.id) {
            window.sankeyNodeApi.updateSankeyNode(editingNode.id, editingNode)
        }
        setEditingId(null)
        setEditingNode(null)
    }

    const startAddingNew = () => {
        setIsAddingNew(true)
        setNewNode({ name: '', color: '#5bbbbb', applicationStateIds: [] })
        setEditingId(null)
    }

    const cancelAddingNew = () => {
        setIsAddingNew(false)
        setNewNode({ name: '', color: '#5bbbbb', applicationStateIds: [] })
    }

    const saveNewNode = () => {
        if (newNode.name.trim()) {
            window.sankeyNodeApi.addSankeyNode(newNode)
            setIsAddingNew(false)
            setNewNode({ name: '', color: '#5bbbbb', applicationStateIds: [] })
        }
    }

    const deleteNode = (id) => {
        window.sankeyNodeApi.deleteSankeyNode(id)
        setDeleteConfirmId(null)
        setEditingId(null)
        setEditingNode(null)
    }

    const addStep = (stepId, isNew = false) => {
        if (isNew) {
            setNewNode(prev => ({ ...prev, applicationStateIds: [...prev.applicationStateIds, parseInt(stepId)] }))
        } else {
            setEditingNode(prev => ({ ...prev, applicationStateIds: [...prev.applicationStateIds, parseInt(stepId)] }))
        }
    }

    const removeStep = (stepId, isNew = false) => {
        if (isNew) {
            setNewNode(prev => ({ ...prev, applicationStateIds: prev.applicationStateIds.filter(id => id !== stepId) }))
        } else {
            setEditingNode(prev => ({ ...prev, applicationStateIds: prev.applicationStateIds.filter(id => id !== stepId) }))
        }
    }

    const getAvailableSteps = (currentIds) => {
        return eventFlowMap
            .filter(e => !currentIds.includes(e.id))
            .filter(e => e.isDeleted === 0)
    }

    const renderEditRow = (node, isNew = false) => {
        const data = isNew ? newNode : editingNode
        const setData = isNew ? setNewNode : setEditingNode
        const availableSteps = getAvailableSteps(data.applicationStateIds)
        const canDelete = !isNew && node && !node.isPermanent

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
                        <div className="w-32">
                            <ColorInput
                                label="Color"
                                value={data.color || '#5bbbbb'}
                                onChange={(color) => setData(prev => ({ ...prev, color }))}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-[var(--text-secondary)]">Assigned Steps</label>
                        <div className="flex flex-wrap gap-1.5 items-center">
                            {data.applicationStateIds.map(id => {
                                const step = eventFlowMap.find(e => e.id === id)
                                if (!step) return null
                                return (
                                    <Chip key={id} onDelete={() => removeStep(id, isNew)}>
                                        {step.name}
                                    </Chip>
                                )
                            })}
                            {data.applicationStateIds.length === 0 && (
                                <span className="text-sm text-[var(--text-muted)]">None assigned</span>
                            )}
                            {availableSteps.length > 0 && (
                                <Select
                                    value=""
                                    onValueChange={(val) => addStep(val, isNew)}
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
                        {canDelete && (
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(node.id)}>
                                Delete
                            </Button>
                        )}
                        <Button variant="secondary" size="sm" onClick={isNew ? cancelAddingNew : cancelEditing}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={isNew ? saveNewNode : saveEditing}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button size="sm" onClick={startAddingNew} disabled={isAddingNew}>
                    Add node
                </Button>
                <button
                    onClick={() => setIsHelpModalOpen(true)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <HelpIcon />
                </button>
            </div>

            {/* Add New Row */}
            {isAddingNew && (
                <div className="border border-accent-500 rounded overflow-hidden">
                    {renderEditRow(null, true)}
                </div>
            )}

            {/* Table */}
            <div className="border border-[var(--border-color)] rounded overflow-hidden">
                {sankeyNodes.map((n, index) => (
                    <div key={n.id}>
                        <div
                            className={`
                                flex items-center gap-3 px-3 py-2
                                ${index !== 0 ? 'border-t border-[var(--border-color)]' : ''}
                                ${editingId === n.id ? 'bg-[var(--bg-secondary)]' : index % 2 === 1 ? 'bg-[var(--bg-secondary)]/30' : ''}
                                ${editingId !== n.id ? 'cursor-pointer hover:bg-[var(--bg-secondary)]/50' : ''}
                            `}
                            onClick={() => editingId !== n.id && startEditing(n)}
                        >
                            <div
                                className="w-4 h-4 rounded-sm border border-[var(--border-color)] flex-shrink-0"
                                style={{ backgroundColor: n.color }}
                            />
                            <span className="flex-1 text-sm text-[var(--text-primary)]">
                                {n.name}
                            </span>
                            {n.isPermanent && (
                                <span className="text-xs text-[var(--text-muted)]">System</span>
                            )}
                        </div>
                        {editingId === n.id && renderEditRow(n)}
                    </div>
                ))}
                {sankeyNodes.length === 0 && (
                    <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                        No nodes configured. Click "Add node" to create one.
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <DialogContent title="Delete Node">
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Are you sure you want to delete this sankey node?
                    </p>
                    <div className="flex justify-end gap-2">
                        <DialogClose><Button variant="secondary" size="sm">Cancel</Button></DialogClose>
                        <Button variant="danger" size="sm" onClick={() => deleteNode(deleteConfirmId)}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Help Modal */}
            <Dialog open={isHelpModalOpen} onOpenChange={(open) => !open && setIsHelpModalOpen(false)}>
                <DialogContent title="Help">
                    <div className="flex flex-col gap-4 text-sm text-[var(--text-secondary)] max-w-lg">
                        <p><strong>Click a row</strong> to edit it inline.</p>
                        <p>
                            This page allows you to customize what is displayed in sankey graphs
                            throughout the application.
                        </p>
                        <p>
                            You can add, edit, or remove any node you would like shown in the sankey
                            graphs, as well as associate any application steps with the nodes, or
                            change the color of the node.
                        </p>
                        <p>
                            Multiple application steps can be mapped to the same node, if desired.
                            This can simplify a graph and obfuscate steps your applications have taken.
                            For example: If you have 2 different types of interviews defined as
                            application steps (A technical, and behavioral interview), you can condense
                            them down to a single 'interview' node in the sankey graph.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
