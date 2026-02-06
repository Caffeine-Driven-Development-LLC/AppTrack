import { parseDateToLocalString } from '../utils/date-utils.js'

export default function TimelineEvent({ date, header, comment, handleEditClick }) {
    return (
        <div className="group flex flex-col rounded-md px-2 py-1.5 -ml-2 hover:bg-[var(--bg-secondary)] transition-colors duration-150">
            <div className="flex items-baseline gap-2">
                {header && (
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {header}
                    </span>
                )}
                <span className="text-xs text-[var(--text-muted)]">
                    {parseDateToLocalString(date)}
                </span>
                {handleEditClick && (
                    <button
                        onClick={handleEditClick}
                        className="text-xs text-accent-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                    >
                        Edit
                    </button>
                )}
            </div>
            {comment && (
                <p className="text-sm text-[var(--text-secondary)] mt-0.5 whitespace-pre-wrap">
                    {comment}
                </p>
            )}
        </div>
    )
}
