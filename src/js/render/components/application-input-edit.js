import React, { useContext, useEffect, useState } from 'react'
import { getCurrentDateString } from '../utils/date-utils.js'
import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { EventFlowContext } from '../main-window/event-flow-context.js'
import { ViewContext } from '../main-window/view-context.js'

export default function ({ onClose: onClose, application: application }) {
    const { eventFlowMap } = useContext(EventFlowContext)

    const [initialEvents] = useState(
        eventFlowMap
            .filter((e) => e.initialStep === 1 && e.isDeleted === 0)
            .map((e) => {
                return {
                    id: e.id,
                    label: e.name,
                }
            })
    )

    const [applicationInput, setApplicationInput] = useState(
        application || {
            companyId: '',
            role: '',
            postUrl: '',
            notes: '',
            salaryRangeHigh: undefined,
            salaryRangeLow: undefined,
            initialEventId: initialEvents[0].id || undefined,
            dateApplied: getCurrentDateString(),
        }
    )
    const [companyAutoCompleteInputValue, setCompanyAutoCompleteInputValue] =
        useState((applicationInput && applicationInput.companyId) || '')
    const [companyOptions, setCompanyOptions] = useState([])

    const [
        initialEventAutoCompleteInputValue,
        setInitialEventAutoCompleteInputValue,
    ] = useState(initialEvents[0].label || '')

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [dateError, setDateError] = useState(false)

    const { setViewHistory } = useContext(ViewContext)

    useEffect(() => {
        window.companyApi.onGetCompanyNames((event, companies) => {
            const companyMap = companies.map((c) => {
                return {
                    id: c.id,
                    label: c.name,
                }
            })
            setCompanyOptions(companyMap)
        })
        window.companyApi.getCompanyNames()

        return () => {
            window.companyApi.removeListeners()
        }
    }, [])

    const handleChange = (event) => {
        let { id, value } = event.target
        setApplicationInput((prevState) => ({
            ...prevState,
            [id]: value,
        }))
        if (id === 'dateApplied') {
            setDateError(false)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (applicationInput.id) {
            window.applicationApi.updateApplication(
                applicationInput.id,
                applicationInput
            )
        } else {
            if (
                !applicationInput.dateApplied ||
                applicationInput.dateApplied === 'Invalid Date'
            ) {
                setDateError(true)
                return
            }

            window.applicationApi.createApplication(applicationInput)
        }
        onClose()
    }

    const handleCancel = () => {
        onClose()
    }

    const handleDelete = () => {
        window.applicationApi.deleteApplication(applicationInput.id)
        setIsDeleteDialogOpen(false)
        setViewHistory((prevState) => prevState.slice(0, -1))
        onClose()
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <Autocomplete
                    size="small"
                    required
                    disableClearable
                    id="companyId"
                    renderInput={(params) => (
                        <TextField {...params} required label="Company" />
                    )}
                    options={companyOptions}
                    value={
                        companyOptions.find(
                            (c) => c.id === applicationInput.companyId
                        ) || null
                    }
                    onChange={(event, newValue) => {
                        handleChange({
                            target: { id: 'companyId', value: newValue.id },
                        })
                    }}
                    inputValue={companyAutoCompleteInputValue}
                    onInputChange={(event, newInputValue) => {
                        setCompanyAutoCompleteInputValue(newInputValue)
                    }}
                />
                {!applicationInput.id && initialEvents.length !== 1 && (
                    <Autocomplete
                        size="small"
                        required
                        disableClearable
                        id="initialEventId"
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                required
                                label="Initial Event"
                            />
                        )}
                        options={initialEvents}
                        value={initialEvents.find(
                            (e) => e.id === applicationInput.initialEventId
                        )}
                        onChange={(event, newValue) => {
                            handleChange({
                                target: {
                                    id: 'initialEventId',
                                    value: newValue.id,
                                },
                            })
                        }}
                        inputValue={initialEventAutoCompleteInputValue}
                        onInputChange={(event, newInputValue) =>
                            setInitialEventAutoCompleteInputValue(newInputValue)
                        }
                    />
                )}
                {!applicationInput.id && (
                    <DatePicker
                        label="Date Applied"
                        defaultValue={dayjs()}
                        onChange={(date) =>
                            handleChange({
                                target: {
                                    id: 'dateApplied',
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
                )}
                <TextField
                    required
                    size="small"
                    id="role"
                    label="Role"
                    variant="outlined"
                    value={applicationInput.role}
                    onChange={handleChange}
                />
                <Stack direction="row" spacing={2}>
                    <TextField
                        size="small"
                        id="salaryRangeLow"
                        label="Salary Range (Low)"
                        type="number"
                        variant="outlined"
                        value={applicationInput.salaryRangeLow || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        size="small"
                        id="salaryRangeHigh"
                        label="Salary Range (High)"
                        type="number"
                        variant="outlined"
                        value={applicationInput.salaryRangeHigh || ''}
                        onChange={handleChange}
                    />
                </Stack>
                <TextField
                    size="small"
                    id="postUrl"
                    label="URL"
                    variant="outlined"
                    value={applicationInput.postUrl || ''}
                    onChange={handleChange}
                />
                {!applicationInput.id && (
                    <TextField
                        size="small"
                        id="notes"
                        label="Notes"
                        variant="outlined"
                        value={applicationInput.notes || ''}
                        onChange={handleChange}
                        multiline
                        rows={2}
                    />
                )}
                <Stack direction="row-reverse" spacing={2}>
                    <Button
                        variant="contained"
                        type="submit"
                        vaiant="contained"
                    >
                        Submit
                    </Button>
                    <Button variant="outlined" onClick={handleCancel}>
                        Cancel
                    </Button>
                    {applicationInput.id && (
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
                <DialogTitle id="alert-dialog-title">
                    Delete Application
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this application?
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
