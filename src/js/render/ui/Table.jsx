/**
 * Table components - Simple table with theme-aware styling
 */

export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children, className = '' }) {
  return (
    <thead className={`bg-[var(--bg-tertiary)] ${className}`}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className = '' }) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className = '', onClick, hover = true }) {
  return (
    <tr
      className={`
        border-b border-[var(--border-color)]
        ${hover ? 'hover:bg-[var(--bg-secondary)]/50' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '', header = false, align = 'left' }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align]

  if (header) {
    return (
      <th className={`px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider ${alignClass} ${className}`}>
        {children}
      </th>
    )
  }

  return (
    <td className={`px-4 py-3 text-sm text-[var(--text-primary)] ${alignClass} ${className}`}>
      {children}
    </td>
  )
}

export default Table
