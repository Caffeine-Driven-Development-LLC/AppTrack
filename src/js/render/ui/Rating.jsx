/**
 * Rating component - Star rating display/input
 * Theme-aware: responds to light/dark mode
 */

import { useState } from 'react'

function StarIcon({ filled }) {
  if (filled) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 1L12.39 6.36L18.18 7.27L14.09 11.48L15 17.27L10 14.77L5 17.27L5.91 11.48L1.82 7.27L7.61 6.36L10 1Z"/>
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1L12.39 6.36L18.18 7.27L14.09 11.48L15 17.27L10 14.77L5 17.27L5.91 11.48L1.82 7.27L7.61 6.36L10 1Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function Rating({ value = 0, onChange, max = 5, readOnly = false, size = 'md' }) {
  const [hoverValue, setHoverValue] = useState(null)

  const displayValue = hoverValue !== null ? hoverValue : value

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div
      className={`flex gap-0.5 ${readOnly ? '' : 'cursor-pointer'}`}
      onMouseLeave={() => !readOnly && setHoverValue(null)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={`
            ${sizeClasses[size]}
            ${star <= displayValue ? 'text-warning' : 'text-[var(--text-muted)]'}
            ${readOnly ? 'cursor-default' : 'hover:scale-110 transition-transform'}
            disabled:cursor-default
          `}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHoverValue(star)}
        >
          <StarIcon filled={star <= displayValue} />
        </button>
      ))}
    </div>
  )
}

export default Rating
