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
} from '../../ui/index.js'

// Icons
function ChevronRightIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function SettingRow({ label, description, children }) {
    return (
        <div className="flex items-center justify-between gap-6 py-3">
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
                {description && (
                    <span className="text-xs text-[var(--text-muted)]">{description}</span>
                )}
            </div>
            <div className="flex-shrink-0">
                {children}
            </div>
        </div>
    )
}

function SettingLink({ label, description, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between gap-4 py-3 group text-left"
        >
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-accent-500 transition-colors">
                    {label}
                </span>
                {description && (
                    <span className="text-xs text-[var(--text-muted)]">{description}</span>
                )}
            </div>
            <span className="text-[var(--text-muted)] group-hover:text-accent-500 transition-colors flex-shrink-0">
                <ChevronRightIcon />
            </span>
        </button>
    )
}

function SettingsCard({ title, danger, children }) {
    return (
        <section className={`
            border rounded-lg overflow-hidden
            ${danger
                ? 'border-negative/30 bg-negative/5'
                : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
            }
        `}>
            <div className={`
                px-4 py-2.5 border-b
                ${danger
                    ? 'border-negative/30'
                    : 'border-[var(--border-color)]'
                }
            `}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${danger ? 'text-negative' : 'text-[var(--text-muted)]'}`}>
                    {title}
                </h3>
            </div>
            <div className="px-4 divide-y divide-[var(--border-color)]">
                {children}
            </div>
        </section>
    )
}

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
            window.settingsApi.removeListeners()
            window.updateApi.removeListeners()
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

    const handleDisplayThemeSelectChange = (value) => {
        setSettings((prevState) => ({
            ...prevState,
            displayTheme: value,
        }))
        window.settingsApi.setDisplayTheme(value)
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

    const renderUpdateStatus = () => {
        if (!updateState) return null
        if (updateState.updateDownloaded) {
            return (
                <Button size="sm" onClick={handleUpdateNow}>
                    Restart & Update
                </Button>
            )
        } else if (updateState.updateAvailable) {
            return <span className="text-xs text-[var(--text-muted)]">Downloading...</span>
        } else if (updateState.checkingForUpdate) {
            return <span className="text-xs text-[var(--text-muted)]">Checking...</span>
        } else if (!settings?.autoCheckForUpdates) {
            return (
                <Button variant="secondary" size="sm" onClick={handleManualCheckForUpdates}>
                    Check now
                </Button>
            )
        }
        return null
    }

    if (!settings) {
        return <div className="text-[var(--text-muted)]">Loading...</div>
    }

    return (
        <div className="flex flex-col gap-5 max-w-xl">
            {/* General */}
            <SettingsCard title="General">
                <SettingRow label="Theme" description="Choose light, dark, or match your system">
                    <div className="w-40">
                        <Select
                            value={settings.displayTheme}
                            onValueChange={handleDisplayThemeSelectChange}
                        >
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </Select>
                    </div>
                </SettingRow>
                <SettingRow label="Auto-update" description="Automatically check for new versions">
                    <div className="flex items-center gap-3">
                        {renderUpdateStatus()}
                        <Switch
                            checked={settings.autoCheckForUpdates}
                            onCheckedChange={handleAutoUpdateSwitchChange}
                        />
                    </div>
                </SettingRow>
            </SettingsCard>

            {/* Tracking */}
            <SettingsCard title="Tracking">
                <SettingRow
                    label="Ghost period"
                    description="Days of silence before an application is considered ghosted"
                >
                    <div className="w-20">
                        <Input
                            type="number"
                            value={settings.ghostPeriod || ''}
                            onChange={handleGhostPeriodChange}
                            error={!ghostPeriodIsValid(settings.ghostPeriod) ? 'Invalid' : undefined}
                        />
                    </div>
                </SettingRow>
                <SettingLink
                    label="Application Steps"
                    description="Define the stages of your hiring pipeline (e.g. Applied, Interview, Offer)"
                    onClick={(e) => {
                        e.stopPropagation()
                        pushView(<EventFlowConfig />, 'Application Steps')
                    }}
                />
                <SettingLink
                    label="Analytics Graph"
                    description="Customize how stages appear in your flow diagrams"
                    onClick={(e) => {
                        e.stopPropagation()
                        pushView(<SankeyConfig />, 'Analytics Graph')
                    }}
                />
            </SettingsCard>

            {/* Danger Zone */}
            <SettingsCard title="Danger Zone" danger>
                <div className="py-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-[var(--text-primary)]">Delete application data</span>
                            <span className="text-xs text-[var(--text-muted)]">
                                Removes all applications and events. Keeps companies and configuration.
                            </span>
                        </div>
                        <Button variant="danger" size="sm" onClick={() => setShowDeleteApplicationDataModal(true)}>
                            Delete
                        </Button>
                    </div>
                    <div className="border-t border-[var(--border-color)]" />
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-[var(--text-primary)]">Reset everything</span>
                            <span className="text-xs text-[var(--text-muted)]">
                                Deletes all data and restores factory settings. App will restart.
                            </span>
                        </div>
                        <Button variant="danger" size="sm" onClick={() => setShowDeleteAllDataModal(true)}>
                            Reset
                        </Button>
                    </div>
                </div>
            </SettingsCard>

            {/* Version footer */}
            <div className="text-xs text-[var(--text-muted)] text-center pt-2">
                AppTrack v{currentAppVersion}
            </div>

            {/* Delete Application Data Modal */}
            <Dialog open={showDeleteApplicationDataModal} onOpenChange={(open) => !open && handleModalClose()}>
                <DialogContent title="Delete Application Data">
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-[var(--text-secondary)]">
                            This will permanently delete all applications and their events.
                            Company data and your pipeline configuration will be preserved.
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Type <strong className="text-[var(--text-primary)]">DELETE</strong> to confirm.
                        </p>
                        <Input
                            value={deleteConfirmationTextField}
                            onChange={(e) => setDeleteConfirmationTextField(e.target.value)}
                            placeholder="Type DELETE to confirm"
                        />
                        <div className="flex gap-3 justify-end">
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
                <DialogContent title="Reset Everything">
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-[var(--text-secondary)]">
                            This will permanently delete all data and reset the app to a fresh install.
                            The app will restart automatically.
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Type <strong className="text-[var(--text-primary)]">DELETE</strong> to confirm.
                        </p>
                        <Input
                            value={deleteConfirmationTextField}
                            onChange={(e) => setDeleteConfirmationTextField(e.target.value)}
                            placeholder="Type DELETE to confirm"
                        />
                        <div className="flex gap-3 justify-end">
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
                                Reset
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
