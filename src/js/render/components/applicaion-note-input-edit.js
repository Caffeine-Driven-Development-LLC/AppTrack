import React, { useState } from 'react'
import { getCurrentDateString } from '../utils/date-utils.js'
import { Button, Dialog, DialogContent, DialogClose, TextArea } from '../ui/index.js'

export default function ApplicationNoteInputEdit({ onclose, applicationId, note }) {
    const [noteInput, setNoteInput] = useState(
        note || {
            applicationId: applicationId,
            date: getCurrentDateString(),
            notes: '',
        }
    )

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const handleChange = (event) => {
        let { id, value } = event.target
        setNoteInput((prevState) => ({
            ...prevState,
            [id]: value,
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (noteInput.id) {
            window.applicationApi.updateEvent(
                noteInput.id,
                noteInput,
                applicationId
            )
        } else {
            window.applicationApi.createEvent(noteInput)
        }
        onclose()
    }

    const handleDelete = (event) => {
        event.preventDefault()
        window.applicationApi.deleteEvent(noteInput.id, applicationId)
        onclose()
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 min-w-[400px]">
                <TextArea
                    id="notes"
                    label="Notes"
                    value={noteInput.notes}
                    onChange={handleChange}
                    rows={4}
                    required
                />

                <div className="flex justify-end gap-2">
                    {noteInput.id && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            Delete
                        </Button>
                    )}
                    <Button type="button" variant="secondary" onClick={onclose}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Save
                    </Button>
                </div>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}>
                <DialogContent title="Delete Note">
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Are you sure you want to delete this note?
                    </p>
                    <div className="flex justify-end gap-2">
                        <DialogClose>
                            <Button variant="secondary" size="sm">Cancel</Button>
                        </DialogClose>
                        <Button variant="danger" size="sm" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </form>
    )
}
