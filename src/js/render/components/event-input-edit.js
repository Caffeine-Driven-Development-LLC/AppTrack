import { Button, Stack, TextField } from '@mui/material'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers'
import React, { useState } from 'react'
import { getCurrentDateString } from '../utils/date-utils.js'

export default function ({ onclose, eventId, applicationId, event }) {
    const [eventInput, setEventInput] = useState(
        event || {
            applicationId: applicationId,
            notes: '',
            date: getCurrentDateString(),
            applicationStateId: eventId,
        }
    )

    const [dateError, setDateError] = useState(false)

    const handleChange = (event) => {
        let { id, value } = event.target
        setEventInput((prevState) => ({
            ...prevState,
            [id]: value,
        }))
        if (id === 'date') {
            setDateError(false)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (!eventInput.date || eventInput.date === 'Invalid Date') {
            setDateError(true)
            return
        }

        if (eventInput.id) {
            window.applicationApi.updateEvent(
                eventInput.id,
                eventInput,
                applicationId
            )
        } else {
            window.applicationApi.createEvent(eventInput)
        }
        onclose()
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <DatePicker
                    label="Date"
                    defaultValue={dayjs()}
                    value={dayjs(eventInput.date)}
                    onChange={(date) =>
                        handleChange({
                            target: {
                                id: 'date',
                                value: date?.format('YYYY-MM-DD'),
                            },
                        })
                    }
                    slotProps={{
                        textField: {
                            size: 'small',
                            required: true,
                        },
                    }}
                    renderInput={(params) => (
                        <TextField {...params} required error={dateError} />
                    )}
                />
                <TextField
                    size="small"
                    id="notes"
                    label="Notes"
                    variant="outlined"
                    value={eventInput.notes || ''}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    sx={{ width: '500px' }}
                />
                <Stack direction="row-reverse" spacing={2}>
                    <Button variant="contained" color="primary" type="submit">
                        Save
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => onclose()}
                    >
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </form>
    )
}
