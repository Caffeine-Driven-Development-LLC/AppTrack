import { useContext, useState } from 'react'
import { ViewContext } from '../main-window/view-context.js'
import Dashboard from '../main-window/page/dashboard.js'
import Stats from '../main-window/page/stats.js'
import CompanyList from '../main-window/page/company-list.js'
import ApplicationList from '../main-window/page/application-list.js'
import SettingsPage from '../main-window/page/settings.js'
import ApplicationInputEdit from './application-input-edit.js'
import { Dialog, DialogContent } from '../ui/index.js'

function PlusIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    )
}

function BackIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function SettingsIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 8C13 7.66667 12.97 7.33333 12.91 7.03333L14.17 6L13.1 4L11.5 4.6C11.07 4.23333 10.57 3.93333 10 3.73333L9.67 2H7.33L7 3.73333C6.43 3.93333 5.93 4.23333 5.5 4.6L3.9 4L2.83 6L4.09 7.03333C4.03 7.33333 4 7.66667 4 8C4 8.33333 4.03 8.66667 4.09 8.96667L2.83 10L3.9 12L5.5 11.4C5.93 11.7667 6.43 12.0667 7 12.2667L7.33 14H9.67L10 12.2667C10.57 12.0667 11.07 11.7667 11.5 11.4L13.1 12L14.17 10L12.91 8.96667C12.97 8.66667 13 8.33333 13 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

const NAV_ITEMS = [
    { name: 'Dashboard', view: Dashboard },
    { name: 'Applications', view: ApplicationList },
    { name: 'Companies', view: CompanyList },
    { name: 'Analytics', view: Stats },
]

export default function Navigation() {
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
    const { viewHistory, setViewHistory, currentView } = useContext(ViewContext)

    const canGoBack = viewHistory.length > 1

    // The top-level page name (first in history)
    const rootPage = viewHistory[0]?.title
    // Are we on a detail/sub page?
    const isOnSubPage = viewHistory.length > 1
    const currentTitle = currentView.title

    const handleNavClick = (item) => {
        setViewHistory([{ view: <item.view />, title: item.name }])
    }

    const handleBack = () => {
        if (canGoBack) {
            setViewHistory(viewHistory.slice(0, -1))
        }
    }

    const handleSettingsClick = () => {
        setViewHistory([{ view: <SettingsPage />, title: 'Settings' }])
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Top Navigation Bar */}
            <header className="h-11 flex items-center bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-3 gap-1 flex-shrink-0">
                {/* Back button + breadcrumb when on sub-page */}
                {isOnSubPage ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                        <button
                            onClick={handleBack}
                            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex-shrink-0"
                        >
                            <BackIcon />
                        </button>
                        <button
                            onClick={handleBack}
                            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
                        >
                            {rootPage}
                        </button>
                        <span className="text-xs text-[var(--text-muted)]">/</span>
                        <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                            {currentTitle}
                        </span>
                    </div>
                ) : (
                    /* Nav tabs when on a root page */
                    <nav className="flex items-center gap-0.5 flex-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = rootPage === item.name
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => handleNavClick(item)}
                                    className={`
                                        px-3 py-1.5 rounded-md text-sm font-medium
                                        transition-colors duration-150
                                        ${isActive
                                            ? 'bg-accent-500/15 text-accent-500'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                                        }
                                    `}
                                >
                                    {item.name}
                                </button>
                            )
                        })}
                    </nav>
                )}

                {/* Right side: quick add + settings */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => setIsQuickAddOpen(true)}
                        className="
                            flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                            bg-accent-500 text-white text-sm font-medium
                            hover:bg-accent-600 active:bg-accent-700
                            transition-colors duration-150
                        "
                    >
                        <PlusIcon />
                        <span>Track</span>
                    </button>
                    <button
                        onClick={handleSettingsClick}
                        className={`
                            p-1.5 rounded-md transition-colors
                            ${rootPage === 'Settings'
                                ? 'text-accent-500 bg-accent-500/15'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                            }
                        `}
                        title="Settings"
                    >
                        <SettingsIcon />
                    </button>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto bg-[var(--bg-primary)] p-4">
                {currentView.view}
            </main>

            {/* Global Quick Add Modal */}
            <Dialog open={isQuickAddOpen} onOpenChange={(open) => !open && setIsQuickAddOpen(false)}>
                <DialogContent title="Track Application">
                    <ApplicationInputEdit onClose={() => setIsQuickAddOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
