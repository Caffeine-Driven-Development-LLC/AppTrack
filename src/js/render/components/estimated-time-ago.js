import { Tooltip } from '../ui/index.js'

export default function EstimatedTimeAgo({ date, prefix = '' }) {
    const now = new Date()
    const dateParts = date.split('-')
    const pastDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
    const diff = now - pastDate

    const days = Math.floor(diff / 86400000)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(months / 12)

    const dayPastInLaymenTerms =
        years > 0
            ? `${years} year${years > 1 ? 's' : ''} ago`
            : months > 1
              ? `${months} month${months > 1 ? 's' : ''} ago`
              : weeks > 0
                ? `${weeks} week${weeks > 1 ? 's' : ''} ago`
                : days <= 0
                  ? 'today'
                  : `${days} day${days > 1 ? 's' : ''} ago`

    const displayedText = `${prefix} ${dayPastInLaymenTerms}`.trim()

    return (
        <Tooltip content={pastDate.toDateString()}>
            <span className="text-sm text-[var(--text-secondary)]">{displayedText}</span>
        </Tooltip>
    )
}
