import {
    Button,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import EventFlowConfig from './event-flow-config.js'
import { ViewContext } from '../view-context.js'
import SankeyConfig from './sankey-config.js'
import Modal from '../../components/modal.js'

export default function () {
    const [settings, setSettings] = useState(null)
    const [showDeleteAllDataModal, setShowDeleteAllDataModal] = useState(false)
    const [showDeleteApplicationDataModal, setShowDeleteApplicationDataModal] =
        useState(false)

    const [deleteConfirmationTextField, setDeleteConfirmationTextField] =
        useState('')

    const { pushView } = useContext(ViewContext)

    const onGetSettings = (event, args) => {
        setSettings(args)
    }

    useEffect(() => {
        window.settingsApi.onGetSettings(onGetSettings)

        window.settingsApi.getSettings()

        return () => {
            window.settingsApi.removeListener(onGetSettings)
        }
    }, [])

    const ghostPeriodIsValid = (period) => period > 0

    const handleGhostPeriodChange = (event) => {
        let value = event.target.value
        if (ghostPeriodIsValid(value)) {
            setSettings((prevState) => ({
                ...prevState,
                ghostPeriod: value,
            }))
            window.settingsApi.setGhostPeriod(value)
        }
    }

    const handleAutoUpdateSwitchChange = (event) => {
        let value = event.target.checked
        setSettings((prevState) => ({
            ...prevState,
            autoCheckForUpdates: value,
        }))
        window.settingsApi.setAutoCheckForUpdates(value)
    }

    const handleManualCheckForUpdates = (event) => {
        window.settingsApi.checkForUpdates()
    }

    const handleConfigureApplicationEventsButton = (event) => {
        event.stopPropagation()
        pushView(<EventFlowConfig />, 'Configure Application Events')
    }

    const handleConfigureSankeyDiagramButton = (event) => {
        event.stopPropagation()
        pushView(<SankeyConfig />, 'Configure Sankey Diagram')
    }

    const handleDisplayThemeSelectChange = (event) => {
        let value = event.target.value
        setSettings((prevState) => ({
            ...prevState,
            displayTheme: value,
        }))
        window.settingsApi.setDisplayTheme(value)
    }

    const handleDeleteApplicationDateTextFieldChange = (event) => {
        setDeleteConfirmationTextField(event.target.value)
    }

    const handleModalClose = () => {
        setShowDeleteApplicationDataModal(false)
        setShowDeleteAllDataModal(false)
        setDeleteConfirmationTextField('')
    }

    const handleDeleteApplicationData = () => {
        window.settingsApi.deleteApplicationData()
        handleModalClose()
    }

    const handleDeleteAllData = () => {
        window.settingsApi.deleteAllData()
        handleModalClose()
    }

    if (!settings) return <div>Loading...</div>

    return (
        <Stack spacing={2}>
            <Typography variant="h6" style={{ textDecoration: 'underline' }}>
                General
            </Typography>
            <Stack spacing={2} alignItems="flex-start" sx={{ paddingLeft: 2 }}>
                <FormControl>
                    <Stack direction="row">
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    onChange={handleAutoUpdateSwitchChange}
                                    checked={settings.autoCheckForUpdates}
                                />
                            }
                            label="Automatically check for updates"
                        />
                        {!settings.autoCheckForUpdates && (
                            <Button
                                size="small"
                                variant="contained"
                                onClick={handleManualCheckForUpdates}
                            >
                                Check for updates
                            </Button>
                        )}
                    </Stack>
                </FormControl>
                <FormControl>
                    <InputLabel id="displayThemeSelectBox">
                        Appearance
                    </InputLabel>
                    <Select
                        size="small"
                        labelId="displayThemeSelectBox"
                        label="Appearance"
                        value={settings.displayTheme}
                        onChange={handleDisplayThemeSelectChange}
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="system">System Default</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
            <Typography variant="h6" style={{ textDecoration: 'underline' }}>
                Application Tracking
            </Typography>
            <Stack spacing={2} alignItems="flex-start" sx={{ paddingLeft: 2 }}>
                <FormControl>
                    <Tooltip title="The number of days past the latest event where an application is considered ghosted.">
                        <TextField
                            size="small"
                            id="ghostPeriod"
                            label="Ghost Period"
                            variant="outlined"
                            type="number"
                            value={settings.ghostPeriod || ''}
                            error={!ghostPeriodIsValid(settings.ghostPeriod)}
                            helperText={
                                ghostPeriodIsValid(settings.ghostPeriod)
                                    ? ''
                                    : 'Ghost period must be greater than 0'
                            }
                            onChange={handleGhostPeriodChange}
                            sx={{ width: 200 }}
                        />
                    </Tooltip>
                </FormControl>
                <Button
                    size="small"
                    variant="contained"
                    onClick={handleConfigureApplicationEventsButton}
                >
                    Configure Application Events
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    onClick={handleConfigureSankeyDiagramButton}
                >
                    Configure Sankey Diagram
                </Button>
            </Stack>
            <Typography variant="h6" style={{ textDecoration: 'underline' }}>
                Danger Zone
            </Typography>
            <Stack spacing={2} alignItems="flex-start" sx={{ paddingLeft: 2 }}>
                <Stack direction="row" spacing={2}>
                    <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => setShowDeleteApplicationDataModal(true)}
                    >
                        Delete Application Data
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => setShowDeleteAllDataModal(true)}
                    >
                        Delete All Data
                    </Button>
                </Stack>
            </Stack>
            <Modal
                isOpen={showDeleteApplicationDataModal}
                onClose={handleModalClose}
                header="Delete Application Data"
            >
                <Stack spacing={2} sx={{ width: '80vw' }}>
                    <Typography>
                        Are you sure you want to delete all application data?
                    </Typography>
                    <Typography>
                        This will permanently delete all Applications and any
                        events associated with them. Only company data, and the
                        configurations for events and the sankey diagram will be
                        preserved.
                    </Typography>
                    <Typography>
                        This action cannot be undone. Please type "DELETE"
                        to confirm.
                    </Typography>
                    <TextField
                        size="small"
                        variant="outlined"
                        label="Confirmation"
                        value={deleteConfirmationTextField}
                        onChange={handleDeleteApplicationDateTextFieldChange}
                    ></TextField>
                    <Stack direction="row" spacing={2}>
                        <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={handleDeleteApplicationData}
                            disabled={
                                deleteConfirmationTextField.toUpperCase() !==
                                'DELETE'
                            }
                        >
                            Delete
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleModalClose}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Modal>
            <Modal
                isOpen={showDeleteAllDataModal}
                onClose={handleModalClose}
                header="Delete All Data"
            >
                <Stack spacing={2} sx={{ width: '80vw' }}>
                    <Typography>
                        Are you sure you want to delete all data?
                    </Typography>
                    <Typography>
                        This will permanently delete all data. Effectively
                        setting this application back to a fresh install state.
                    </Typography>
                    <Typography>
                        This action cannot be undone. Please type "DELETE" to
                        confirm.
                    </Typography>
                    <TextField
                        size="small"
                        variant="outlined"
                        label="Confirmation"
                        value={deleteConfirmationTextField}
                        onChange={handleDeleteApplicationDateTextFieldChange}
                    ></TextField>
                    <Stack direction="row" spacing={2}>
                        <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={handleDeleteAllData}
                            disabled={
                                deleteConfirmationTextField.toUpperCase() !==
                                'DELETE'
                            }
                        >
                            Delete
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleModalClose}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Modal>
        </Stack>
    )
}
