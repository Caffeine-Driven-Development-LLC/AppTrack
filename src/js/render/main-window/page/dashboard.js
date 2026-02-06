import { useContext, useEffect, useState } from 'react'
import { ViewContext } from '../view-context.js'
import ApplicaionDetails from './applicaion-details.js'

function StatCard({ label, value, sublabel }) {
    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 flex flex-col gap-1">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
                {value}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
                {label}
            </span>
            {sublabel && (
                <span className="text-xs text-[var(--text-muted)]">
                    {sublabel}
                </span>
            )}
        </div>
    )
}

function GhostBar({ percentage }) {
    const clamped = Math.min(percentage, 100)
    const color =
        clamped < 50
            ? 'var(--color-warning)'
            : 'var(--color-negative)'
    return (
        <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${clamped}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-xs text-[var(--text-muted)] w-8 text-right">
                {Math.round(clamped)}%
            </span>
        </div>
    )
}

function NeedsAttentionItem({ app, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[var(--bg-secondary)] transition-colors text-left"
        >
            {app.companyLogoPath ? (
                <img
                    src={app.companyLogoPath}
                    alt=""
                    className="w-7 h-7 rounded object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-7 h-7 rounded bg-accent-500/15 text-accent-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {app.companyName?.charAt(0) || '?'}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {app.role}
                </div>
                <div className="text-xs text-[var(--text-muted)] truncate">
                    {app.companyName}
                </div>
            </div>
            <GhostBar percentage={app.percentGhosted} />
        </button>
    )
}

function ActivityItem({ event, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-[var(--bg-secondary)] transition-colors text-left"
        >
            {event.companyLogoPath ? (
                <img
                    src={event.companyLogoPath}
                    alt=""
                    className="w-6 h-6 rounded object-cover flex-shrink-0 mt-0.5"
                />
            ) : (
                <div className="w-6 h-6 rounded bg-accent-500/15 text-accent-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {event.companyName?.charAt(0) || '?'}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {event.role}
                    </span>
                    {event.status && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] flex-shrink-0">
                            {event.status}
                        </span>
                    )}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                    {event.companyName} &middot; {event.date}
                </div>
            </div>
        </button>
    )
}

export default function Dashboard() {
    const [data, setData] = useState(null)
    const { pushView } = useContext(ViewContext)

    useEffect(() => {
        window.applicationApi.onGetDashboardData((event, dashboardData) => {
            setData(dashboardData)
        })

        window.applicationApi.getDashboardData()

        return () => {
            window.applicationApi.removeListeners()
        }
    }, [])

    const handleAppClick = (app) => {
        pushView(
            <ApplicaionDetails initialApplication={app} />,
            app.role
        )
    }

    const handleEventClick = (event) => {
        window.applicationApi.onGetApplication((e, application) => {
            pushView(
                <ApplicaionDetails initialApplication={application} />,
                application.role
            )
        })
        window.applicationApi.getApplication(event.applicationId)
    }

    if (!data) {
        return (
            <div className="flex justify-center py-12">
                <svg
                    className="animate-spin h-6 w-6 text-accent-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        )
    }

    const hasNoData =
        data.totalCount === 0 &&
        data.recentEvents.length === 0

    if (hasNoData) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-lg font-medium text-[var(--text-secondary)]">
                    Welcome to AppTrack
                </p>
                <p className="text-sm text-[var(--text-muted)] text-center max-w-sm">
                    Start tracking your job applications by clicking the "Track" button above. Your dashboard will come to life as you add applications.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
                <StatCard label="Active" value={data.activeCount} />
                <StatCard label="Total Tracked" value={data.totalCount} />
                <StatCard label="This Week" value={data.appliedThisWeek} />
                <StatCard label="This Month" value={data.appliedThisMonth} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Needs Attention */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] px-1">
                        Needs Attention
                    </h3>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
                        {data.needsAttention.length === 0 ? (
                            <div className="text-center py-8 text-sm text-[var(--text-muted)]">
                                All caught up! No applications need follow-up right now.
                            </div>
                        ) : (
                            <div className="flex flex-col py-1">
                                {data.needsAttention.slice(0, 8).map((app) => (
                                    <NeedsAttentionItem
                                        key={app.id}
                                        app={app}
                                        onClick={() => handleAppClick(app)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] px-1">
                        Recent Activity
                    </h3>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
                        {data.recentEvents.length === 0 ? (
                            <div className="text-center py-8 text-sm text-[var(--text-muted)]">
                                No recent activity yet.
                            </div>
                        ) : (
                            <div className="flex flex-col py-1">
                                {data.recentEvents.slice(0, 8).map((evt) => (
                                    <ActivityItem
                                        key={evt.id}
                                        event={evt}
                                        onClick={() => handleEventClick(evt)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
