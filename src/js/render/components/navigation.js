import { useContext, useState } from 'react'
import { ViewContext } from '../main-window/view-context.js'
import Stats from '../main-window/page/stats.js'
import CompanyList from '../main-window/page/company-list.js'
import ApplicationList from '../main-window/page/application-list.js'
import SettingsPage from '../main-window/page/settings.js'

// Icons
function MenuIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    )
}

function ChevronLeftIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function ListIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4H17M3 8H17M3 12H17M3 16H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    )
}

function BuildingIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17V5C3 4.44772 3.44772 4 4 4H10C10.5523 4 11 4.44772 11 5V17M11 17V9C11 8.44772 11.4477 8 12 8H16C16.5523 8 17 8.44772 17 9V17M3 17H17M6 7H8M6 10H8M6 13H8M14 11H15M14 14H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function SettingsIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M16.1667 10C16.1667 9.58333 16.125 9.16667 16.0417 8.79167L17.7083 7.5L16.2917 5L14.375 5.75C13.8333 5.29167 13.2083 4.91667 12.5 4.66667L12.0833 2.5H9.16667L8.75 4.66667C8.04167 4.91667 7.41667 5.29167 6.875 5.75L4.95833 5L3.54167 7.5L5.20833 8.79167C5.125 9.16667 5.08333 9.58333 5.08333 10C5.08333 10.4167 5.125 10.8333 5.20833 11.2083L3.54167 12.5L4.95833 15L6.875 14.25C7.41667 14.7083 8.04167 15.0833 8.75 15.3333L9.16667 17.5H12.0833L12.5 15.3333C13.2083 15.0833 13.8333 14.7083 14.375 14.25L16.2917 15L17.7083 12.5L16.0417 11.2083C16.125 10.8333 16.1667 10.4167 16.1667 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function ChevronRightIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

const NAV_ITEMS = [
    { name: 'Applications', icon: ListIcon, view: ApplicationList },
    { name: 'Companies', icon: BuildingIcon, view: CompanyList },
]

const BOTTOM_NAV_ITEMS = [
    { name: 'Settings', icon: SettingsIcon, view: SettingsPage },
]

export default function Navigation() {
    const [isExpanded, setIsExpanded] = useState(false)
    const { viewHistory, setViewHistory, currentView } = useContext(ViewContext)

    const handleNavClick = (item) => {
        setViewHistory([{ view: <item.view />, title: item.name }])
    }

    const handleBreadcrumbClick = (index) => {
        setViewHistory(viewHistory.slice(0, index + 1))
    }

    const NavButton = ({ item }) => {
        const Icon = item.icon
        const isActive = currentView.title === item.name

        return (
            <button
                onClick={() => handleNavClick(item)}
                className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md
                    transition-colors duration-150
                    ${isActive
                        ? 'bg-accent-500/20 text-accent-500'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                    }
                `}
                title={!isExpanded ? item.name : undefined}
            >
                <Icon />
                {isExpanded && (
                    <span className="text-sm font-medium whitespace-nowrap">
                        {item.name}
                    </span>
                )}
            </button>
        )
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside
                className={`
                    flex flex-col
                    bg-[var(--bg-secondary)] border-r border-[var(--border-color)]
                    transition-all duration-200 ease-in-out
                    ${isExpanded ? 'w-52' : 'w-14'}
                `}
            >
                {/* Sidebar Header */}
                <div className="h-12 flex items-center justify-center border-b border-[var(--border-color)]">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                        {isExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 flex flex-col justify-between p-2">
                    <div className="flex flex-col gap-1">
                        {NAV_ITEMS.map((item) => (
                            <NavButton key={item.name} item={item} />
                        ))}
                    </div>
                    <div className="flex flex-col gap-1">
                        {BOTTOM_NAV_ITEMS.map((item) => (
                            <NavButton key={item.name} item={item} />
                        ))}
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-12 flex items-center px-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1 text-sm">
                        {viewHistory.map((view, index) => (
                            <div key={index} className="flex items-center gap-1">
                                {index > 0 && (
                                    <ChevronRightIcon />
                                )}
                                {index === viewHistory.length - 1 ? (
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {view.title}
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleBreadcrumbClick(index)}
                                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                        {view.title}
                                    </button>
                                )}
                            </div>
                        ))}
                    </nav>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-[var(--bg-primary)] p-4">
                    {currentView.view}
                </main>
            </div>
        </div>
    )
}
