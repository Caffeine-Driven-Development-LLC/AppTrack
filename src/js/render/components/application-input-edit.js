import React, { useContext, useEffect, useState } from 'react'
import { getCurrentDateString } from '../utils/date-utils.js'
import { EventFlowContext } from '../main-window/event-flow-context.js'
import { ViewContext } from '../main-window/view-context.js'
import {
    Autocomplete,
    Button,
    DatePicker,
    Dialog,
    DialogContent,
    DialogClose,
    Input,
    TextArea,
    Select,
    SelectItem,
} from '../ui/index.js'

export default function ApplicationInputEdit({ onClose, application }) {
    const { eventFlowMap } = useContext(EventFlowContext)

    const [initialEvents] = useState(
        eventFlowMap
            .filter((e) => e.initialStep === 1 && e.isDeleted === 0)
            .map((e) => ({
                id: e.id,
                label: e.name,
            }))
    )

    const [applicationInput, setApplicationInput] = useState(
        application || {
            companyId: '',
            role: '',
            postUrl: '',
            notes: '',
            salaryRangeHigh: undefined,
            salaryRangeLow: undefined,
            initialEventId: initialEvents[0]?.id || undefined,
            dateApplied: getCurrentDateString(),
        }
    )

    const [companyOptions, setCompanyOptions] = useState([])
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [dateError, setDateError] = useState(false)

    const { setViewHistory } = useContext(ViewContext)

    useEffect(() => {
        window.companyApi.onGetCompanyNames((event, companies) => {
            const companyMap = companies.map((c) => ({
                id: c.id,
                label: c.name,
            }))
            setCompanyOptions(companyMap)
        })

        window.companyApi.onGetCompany((event, company) => {
            const newOption = { id: company.id, label: company.name }
            setCompanyOptions((prev) => {
                if (prev.some((c) => c.id === company.id)) return prev
                return [...prev, newOption]
            })
            setApplicationInput((prev) => ({
                ...prev,
                companyId: company.id,
            }))
        })

        window.companyApi.getCompanyNames()

        return () => {
            window.companyApi.removeListeners()
        }
    }, [])

    const handleCreateCompany = (companyName) => {
        window.companyApi.createCompany({
            name: companyName,
            homePage: '',
            careerPage: '',
            notes: '',
            isFavorite: false,
        }, null)
    }

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
        onClose?.()
    }

    const handleCancel = () => {
        onClose?.()
    }

    const handleDelete = () => {
        window.applicationApi.deleteApplication(applicationInput.id)
        setIsDeleteDialogOpen(false)
        setViewHistory((prevState) => prevState.slice(0, -1))
        onClose?.()
    }

    const selectedCompany = companyOptions.find((c) => c.id === applicationInput.companyId)

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 min-w-[400px]">
                <Autocomplete
                    label="Company"
                    value={selectedCompany}
                    onChange={(option) => {
                        handleChange({
                            target: { id: 'companyId', value: option?.id || '' },
                        })
                    }}
                    options={companyOptions}
                    getOptionLabel={(opt) => opt?.label || ''}
                    placeholder="Search or create a company..."
                    onCreateNew={handleCreateCompany}
                    createNewLabel={(name) => `+ Create "${name}" as new company`}
                />

                {!applicationInput.id && initialEvents.length > 1 && (
                    <Select
                        label="Initial Event"
                        value={String(applicationInput.initialEventId)}
                        onValueChange={(value) => {
                            handleChange({
                                target: { id: 'initialEventId', value: parseInt(value) },
                            })
                        }}
                    >
                        {initialEvents.map((event) => (
                            <SelectItem key={event.id} value={String(event.id)}>
                                {event.label}
                            </SelectItem>
                        ))}
                    </Select>
                )}

                {!applicationInput.id && (
                    <DatePicker
                        label="Date Applied"
                        value={applicationInput.dateApplied}
                        onChange={(value) =>
                            handleChange({
                                target: { id: 'dateApplied', value },
                            })
                        }
                        required
                        error={dateError}
                    />
                )}

                <Input
                    id="role"
                    label="Role"
                    value={applicationInput.role}
                    onChange={handleChange}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        id="salaryRangeLow"
                        label="Salary Range (Low)"
                        type="number"
                        value={applicationInput.salaryRangeLow || ''}
                        onChange={handleChange}
                    />
                    <Input
                        id="salaryRangeHigh"
                        label="Salary Range (High)"
                        type="number"
                        value={applicationInput.salaryRangeHigh || ''}
                        onChange={handleChange}
                    />
                </div>

                <Input
                    id="postUrl"
                    label="URL"
                    value={applicationInput.postUrl || ''}
                    onChange={handleChange}
                />

                {!applicationInput.id && (
                    <TextArea
                        id="notes"
                        label="Notes"
                        value={applicationInput.notes || ''}
                        onChange={handleChange}
                        rows={2}
                    />
                )}

                <div className="flex justify-end gap-2">
                    {applicationInput.id && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            Delete
                        </Button>
                    )}
                    <Button type="button" variant="secondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Submit
                    </Button>
                </div>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}>
                <DialogContent title="Delete Application">
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Are you sure you want to delete this application?
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
