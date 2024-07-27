import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material'
import React, { useState } from 'react'
import { getCurrentDateString } from '../utils/date-utils.js'

export default function ({ onclose, applicationId, note }) {
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
        console.log('noteInput in handle submit', noteInput)
        if (noteInput.id) {
            console.log('updating note')
            window.applicationApi.updateEvent(
                noteInput.id,
                noteInput,
                applicationId
            )
        } else {
            console.log('creating note')
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
            <Stack spacing={2}>
                <TextField
                    id="notes"
                    label="Notes"
                    multiline
                    rows={4}
                    value={noteInput.notes}
                    onChange={handleChange}
                    sx={{ width: '500px' }}
                    required={true}
                />
                <Stack direction="row-reverse" spacing={2}>
                    <Button type="submit" variant="contained">
                        Save
                    </Button>
                    <Button variant="outlined" onClick={onclose}>
                        Cancel
                    </Button>
                    {noteInput.id && (
                        <Button onClick={() => setIsDeleteDialogOpen(true)}>
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
                <DialogTitle id="alert-dialog-title">Delete Note</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this note?
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
