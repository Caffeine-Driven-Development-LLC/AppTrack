import React, { useContext, useEffect, useRef } from 'react'
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
} from '@mui/material'
import { Delete, Edit, Star, StarBorder } from '@mui/icons-material'
import { ViewContext } from '../main-window/view-context.js'

export default function CompanyInputEdit({
    onClose: onClose,
    company: company,
}) {
    const [companyInput, setCompanyInput] = React.useState(
        company || {
            name: '',
            homePage: '',
            careerPage: '',
            logoPath: '',
            notes: '',
            isFavorite: false,
        }
    )
    const [logoSrc, setLogoSrc] = React.useState(
        companyInput.logoPath ? `media://${companyInput.logoPath}` : null
    )
    const [hasLogoChanged, setHasLogoChanged] = React.useState(false)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

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
        onClose()
    }

    const handleCancel = () => {
        onClose()
    }

    const handleDelete = () => {
        window.companyApi.deleteCompany(companyInput.id)
        setIsDeleteDialogOpen(false)
        setViewHistory((prevState) => prevState.slice(0, -1))
        onClose()
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

    useEffect(() => {}, [])

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ width: '300px' }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                >
                    <Box position="relative" display="inline-flex">
                        <Avatar
                            variant="square"
                            alt={companyInput?.name.toUpperCase()}
                            src={logoSrc}
                            sx={{ width: 64, height: 64 }}
                        />
                        <IconButton
                            aria-label="edit"
                            sx={{
                                position: 'absolute',
                                bottom: -7,
                                right: -7,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                },
                            }}
                            onClick={() => logoEditRef.current.click()}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                            aria-label="delete"
                            sx={{
                                position: 'absolute',
                                bottom: -7,
                                left: -7,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                },
                            }}
                            onClick={handleDeleteLogo}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Box>
                    {companyInput.isFavorite ? (
                        <Star
                            fontSize="large"
                            sx={{ color: 'gold' }}
                            onClick={toggleIsFavorite}
                        />
                    ) : (
                        <StarBorder
                            fontSize="large"
                            onClick={toggleIsFavorite}
                        />
                    )}
                </Stack>
                <TextField
                    required
                    size="small"
                    id="name"
                    label="Name"
                    variant="outlined"
                    value={companyInput.name}
                    onChange={handleChange}
                />
                <TextField
                    size="small"
                    id="homePage"
                    label="Home page"
                    variant="outlined"
                    value={companyInput.homePage || ''}
                    onChange={handleChange}
                />
                <TextField
                    size="small"
                    id="careerPage"
                    label="Careers page"
                    variant="outlined"
                    value={companyInput.careerPage || ''}
                    onChange={handleChange}
                />
                <TextField
                    size="small"
                    id="notes"
                    label="Notes"
                    variant="outlined"
                    value={companyInput.notes || ''}
                    onChange={handleChange}
                    multiline
                    rows={2}
                />
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
                    {companyInput.id && (
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
                    Delete Company
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this Company?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDelete}>Delete</Button>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                </DialogActions>
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
