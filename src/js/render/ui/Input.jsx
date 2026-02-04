/**
 * Input component - Custom styled text input using Tailwind
 * Theme-aware: responds to light/dark mode
 */

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2
          bg-[var(--bg-primary)] border border-[var(--border-color)]
          rounded
          text-sm text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)]
          hover:border-[var(--text-muted)]
          focus:border-accent-500 focus:ring-1 focus:ring-accent-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150
          ${error ? 'border-negative focus:border-negative focus:ring-negative' : ''}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      />
      {error && (
        <span className="text-xs text-negative">{error}</span>
      )}
    </div>
  );
}

export function TextArea({
  label,
  error,
  className = '',
  id,
  rows = 3,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`
          w-full px-3 py-2
          bg-[var(--bg-primary)] border border-[var(--border-color)]
          rounded
          text-sm text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)]
          hover:border-[var(--text-muted)]
          focus:border-accent-500 focus:ring-1 focus:ring-accent-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150
          resize-y
          ${error ? 'border-negative focus:border-negative focus:ring-negative' : ''}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      />
      {error && (
        <span className="text-xs text-negative">{error}</span>
      )}
    </div>
  );
}

export default Input;
