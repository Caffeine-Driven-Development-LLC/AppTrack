import React, { useState } from 'react'
import { getCurrentDateString } from '../utils/date-utils.js'
import { Button, DatePicker, TextArea } from '../ui/index.js'

export default function EventInputEdit({ onclose, eventId, applicationId, event }) {
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
            <div className="flex flex-col gap-4 min-w-[400px]">
                <DatePicker
                    label="Date"
                    value={eventInput.date}
                    onChange={(value) =>
                        handleChange({
                            target: { id: 'date', value },
                        })
                    }
                    required
                    error={dateError}
                />

                <TextArea
                    id="notes"
                    label="Notes"
                    value={eventInput.notes || ''}
                    onChange={handleChange}
                    rows={3}
                />

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onclose()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">
                        Save
                    </Button>
                </div>
            </div>
        </form>
    )
}
