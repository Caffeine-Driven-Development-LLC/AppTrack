import React, { useContext, useEffect, useState } from 'react'
import EventFlowConfig from './event-flow-config.js'
import { ViewContext } from '../view-context.js'
import SankeyConfig from './sankey-config.js'
import {
    Button,
    Dialog,
    DialogContent,
    DialogClose,
    Input,
    Select,
    SelectItem,
    Switch,
    Tooltip,
    TooltipProvider,
} from '../../ui/index.js'

export default function Settings() {
    const [settings, setSettings] = useState(null)
    const [showDeleteAllDataModal, setShowDeleteAllDataModal] = useState(false)
    const [showDeleteApplicationDataModal, setShowDeleteApplicationDataModal] = useState(false)
    const [deleteConfirmationTextField, setDeleteConfirmationTextField] = useState('')
    const [updateState, setUpdateState] = useState(null)
    const [currentAppVersion, setCurrentAppVersion] = useState('')

    const { pushView } = useContext(ViewContext)

    useEffect(() => {
        window.settingsApi.onGetSettings((event, args) => {
            setSettings(args)
        })
        window.settingsApi.getSettings()

        window.updateApi.onGetUpdateState((event, args) => {
            setUpdateState(args)
        })
        window.updateApi.onUpdateStateChange((event, args) => {
            setUpdateState(args)
        })
        window.updateApi.getUpdateState()

        window.updateApi.onGetCurrentAppVersion((event, args) => {
            setCurrentAppVersion(args)
        })
        window.updateApi.getCurrentAppVersion()

        return () => {
            window.settingsApi.removeListener(() => {})
            window.updateApi.removeListener(() => {})
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

    const handleAutoUpdateSwitchChange = (checked) => {
        setSettings((prevState) => ({
            ...prevState,
            autoCheckForUpdates: checked,
        }))
        window.settingsApi.setAutoCheckForUpdates(checked)
    }

    const handleManualCheckForUpdates = () => {
        window.updateApi.checkForUpdates()
    }

    const handleUpdateNow = () => {
        window.updateApi.requestUpdateApplication()
    }

    const handleConfigureApplicationEventsButton = (event) => {
        event.stopPropagation()
        pushView(<EventFlowConfig />, 'Configure Application Events')
    }

    const handleConfigureSankeyDiagramButton = (event) => {
        event.stopPropagation()
        pushView(<SankeyConfig />, 'Configure Sankey Diagram')
    }

    const handleDisplayThemeSelectChange = (value) => {
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

    const renderUpdateButton = () => {
        if (!updateState) return null

        if (updateState.updateDownloaded) {
            return (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--text-secondary)]">Update is ready to install</span>
                    <Button size="sm" onClick={handleUpdateNow}>
                        Restart & Update
                    </Button>
                </div>
            )
        } else if (updateState.updateAvailable) {
            return <span className="text-sm text-[var(--text-muted)]">Downloading update...</span>
        } else if (updateState.checkingForUpdate) {
            return <span className="text-sm text-[var(--text-muted)]">Checking for updates...</span>
        } else if (!settings?.autoCheckForUpdates) {
            return (
                <Button variant="secondary" size="sm" onClick={handleManualCheckForUpdates}>
                    Check for updates
                </Button>
            )
        }
        return null
    }

    if (!settings) {
        return <div className="text-[var(--text-muted)]">Loading...</div>
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-6 p-4 max-w-2xl">
                {/* General Section */}
                <section>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-4">
                        General
                    </h2>
                    <div className="flex flex-col gap-4 pl-4">
                        <div className="flex flex-col gap-2">
                            <Switch
                                checked={settings.autoCheckForUpdates}
                                onCheckedChange={handleAutoUpdateSwitchChange}
                                label="Automatically check for updates"
                            />
                            {renderUpdateButton()}
                        </div>
                    </div>
                </section>

                {/* Theme Section */}
                <section>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-4">
                        Theme
                    </h2>
                    <div className="pl-4">
                        <Select
                            label="Appearance"
                            value={settings.displayTheme}
                            onValueChange={handleDisplayThemeSelectChange}
                        >
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System Default</SelectItem>
                        </Select>
                    </div>
                </section>

                {/* Application Tracking Section */}
                <section>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-4">
                        Application Tracking
                    </h2>
                    <div className="flex flex-col gap-4 pl-4">
                        <Tooltip content="The number of days past the latest event where an application is considered ghosted.">
                            <div className="w-48">
                                <Input
                                    label="Ghost Period"
                                    type="number"
                                    value={settings.ghostPeriod || ''}
                                    onChange={handleGhostPeriodChange}
                                    error={!ghostPeriodIsValid(settings.ghostPeriod) ? 'Must be greater than 0' : undefined}
                                />
                            </div>
                        </Tooltip>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="secondary" size="sm" onClick={handleConfigureApplicationEventsButton}>
                                Configure Application Events
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleConfigureSankeyDiagramButton}>
                                Configure Sankey Diagram
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone Section */}
                <section>
                    <h2 className="text-lg font-semibold text-negative border-b border-[var(--border-color)] pb-2 mb-4">
                        Danger Zone
                    </h2>
                    <div className="flex flex-col gap-4 pl-4">
                        <div className="flex flex-wrap gap-3">
                            <Button variant="danger" size="sm" onClick={() => setShowDeleteApplicationDataModal(true)}>
                                Delete Application Data
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => setShowDeleteAllDataModal(true)}>
                                Delete All Data
                            </Button>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">Version: {currentAppVersion}</span>
                    </div>
                </section>

                {/* Delete Application Data Modal */}
                <Dialog open={showDeleteApplicationDataModal} onOpenChange={(open) => !open && handleModalClose()}>
                    <DialogContent title="Delete Application Data">
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Are you sure you want to delete all application data?
                            </p>
                            <p className="text-sm text-[var(--text-muted)]">
                                This will permanently delete all Applications and any events associated with them.
                                Only company data, and the configurations for events and the sankey diagram will be preserved.
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">
                                This action cannot be undone. Please type <strong className="text-[var(--text-primary)]">"DELETE"</strong> to confirm.
                            </p>
                            <Input
                                label="Confirmation"
                                value={deleteConfirmationTextField}
                                onChange={handleDeleteApplicationDateTextFieldChange}
                                placeholder="Type DELETE to confirm"
                            />
                            <div className="flex gap-3 justify-end mt-2">
                                <DialogClose>
                                    <Button variant="secondary" onClick={handleModalClose}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="danger"
                                    onClick={handleDeleteApplicationData}
                                    disabled={deleteConfirmationTextField.toUpperCase() !== 'DELETE'}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete All Data Modal */}
                <Dialog open={showDeleteAllDataModal} onOpenChange={(open) => !open && handleModalClose()}>
                    <DialogContent title="Delete All Data">
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Are you sure you want to delete all data?
                            </p>
                            <p className="text-sm text-[var(--text-muted)]">
                                This will permanently delete all data. Effectively setting this application back to a fresh install state.
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">
                                This action cannot be undone. Please type <strong className="text-[var(--text-primary)]">"DELETE"</strong> to confirm.
                            </p>
                            <Input
                                label="Confirmation"
                                value={deleteConfirmationTextField}
                                onChange={handleDeleteApplicationDateTextFieldChange}
                                placeholder="Type DELETE to confirm"
                            />
                            <div className="flex gap-3 justify-end mt-2">
                                <DialogClose>
                                    <Button variant="secondary" onClick={handleModalClose}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="danger"
                                    onClick={handleDeleteAllData}
                                    disabled={deleteConfirmationTextField.toUpperCase() !== 'DELETE'}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    )
}
