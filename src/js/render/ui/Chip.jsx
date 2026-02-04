/**
 * Chip component - For displaying tags/badges with optional delete
 * Theme-aware: responds to light/dark mode
 */

export function Chip({ children, onDelete, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        bg-[var(--bg-tertiary)] text-[var(--text-primary)]
        text-xs font-medium
        rounded-full
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="
            p-0.5 -mr-1
            rounded-full
            text-[var(--text-muted)] hover:text-[var(--text-primary)]
            hover:bg-[var(--bg-secondary)]
            transition-colors
          "
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </span>
  );
}

export default Chip;
