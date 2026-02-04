import React, { useContext, useRef, useState } from 'react'
import { ViewContext } from '../main-window/view-context.js'
import { Button, Dialog, DialogContent, DialogClose, Input, TextArea } from '../ui/index.js'

function EditIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 1.5L12.5 4M1.5 12.5L2 10L9.5 2.5L11.5 4.5L4 12L1.5 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function DeleteIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H12M5 4V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V4M10.5 4V11.5C10.5 11.7761 10.2761 12 10 12H4C3.72386 12 3.5 11.7761 3.5 11.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function StarIcon({ filled, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`${filled ? 'text-warning' : 'text-[var(--text-muted)]'} hover:scale-110 transition-transform`}
        >
            {filled ? (
                <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 1L12.39 6.36L18.18 7.27L14.09 11.48L15 17.27L10 14.77L5 17.27L5.91 11.48L1.82 7.27L7.61 6.36L10 1Z"/>
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 1L12.39 6.36L18.18 7.27L14.09 11.48L15 17.27L10 14.77L5 17.27L5.91 11.48L1.82 7.27L7.61 6.36L10 1Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
        </button>
    )
}

export default function CompanyInputEdit({ onClose, company }) {
    const [companyInput, setCompanyInput] = useState(
        company || {
            name: '',
            homePage: '',
            careerPage: '',
            logoPath: '',
            notes: '',
            isFavorite: false,
        }
    )
    const [logoSrc, setLogoSrc] = useState(
        companyInput.logoPath ? `media://${companyInput.logoPath}` : null
    )
    const [hasLogoChanged, setHasLogoChanged] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const logoEditRef = useRef(null)
    const { setViewHistory } = useContext(ViewContext)

    const handleChange = (event) => {
        let { id, value } = event.target
        setCompanyInput((prevState) => ({
            ...prevState,
            [id]: value,
        }))
    }

    const toggleIsFavorite = () => {
        setCompanyInput((prevState) => ({
            ...prevState,
            isFavorite: !companyInput.isFavorite,
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (companyInput.id) {
            window.companyApi.updateCompany(
                companyInput.id,
                companyInput,
                hasLogoChanged,
                logoSrc
            )
        } else {
            window.companyApi.createCompany(companyInput, logoSrc)
        }
        onClose?.()
    }

    const handleCancel = () => {
        onClose?.()
    }

    const handleDelete = () => {
        window.companyApi.deleteCompany(companyInput.id)
        setIsDeleteDialogOpen(false)
        setViewHistory((prevState) => prevState.slice(0, -1))
        onClose?.()
    }

    const handleEditLogo = (event) => {
        const file = event.target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
            setLogoSrc(e.target.result)
            setHasLogoChanged(true)
        }
        reader.readAsDataURL(file)
    }

    const handleDeleteLogo = () => {
        setLogoSrc(null)
        setHasLogoChanged(true)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 min-w-[300px]">
                {/* Logo and Favorite */}
                <div className="flex justify-between items-start">
                    <div className="relative inline-block">
                        {logoSrc ? (
                            <img
                                src={logoSrc}
                                alt={companyInput.name}
                                className="w-16 h-16 rounded object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded bg-[var(--bg-tertiary)] flex items-center justify-center text-xl font-semibold text-[var(--text-muted)]">
                                {companyInput.name?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => logoEditRef.current.click()}
                            className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                        >
                            <EditIcon />
                        </button>
                        {logoSrc && (
                            <button
                                type="button"
                                onClick={handleDeleteLogo}
                                className="absolute -bottom-1 -left-1 p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-negative hover:bg-[var(--bg-tertiary)]"
                            >
                                <DeleteIcon />
                            </button>
                        )}
                    </div>
                    <StarIcon filled={companyInput.isFavorite} onClick={toggleIsFavorite} />
                </div>

                <Input
                    id="name"
                    label="Name"
                    value={companyInput.name}
                    onChange={handleChange}
                    required
                />

                <Input
                    id="homePage"
                    label="Home page"
                    value={companyInput.homePage || ''}
                    onChange={handleChange}
                />

                <Input
                    id="careerPage"
                    label="Careers page"
                    value={companyInput.careerPage || ''}
                    onChange={handleChange}
                />

                <TextArea
                    id="notes"
                    label="Notes"
                    value={companyInput.notes || ''}
                    onChange={handleChange}
                    rows={2}
                />

                <div className="flex justify-end gap-2">
                    {companyInput.id && (
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
                <DialogContent title="Delete Company">
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Are you sure you want to delete this company?
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

            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleEditLogo}
                ref={logoEditRef}
            />
        </form>
    )
}
