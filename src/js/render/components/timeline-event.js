import { parseDateToLocalString } from '../utils/date-utils.js'

export default function TimelineEvent({ date, header, comment, handleEditClick }) {
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">
                    {parseDateToLocalString(date)}
                </span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                    {header}
                </span>
            </div>
            {comment && (
                <p className="text-sm text-[var(--text-secondary)] pb-1 whitespace-pre-wrap">
                    {comment}
                </p>
            )}
            {handleEditClick && (
                <button
                    onClick={handleEditClick}
                    className="text-xs text-accent-500 hover:underline w-fit"
                >
                    Edit
                </button>
            )}
        </div>
    )
}
