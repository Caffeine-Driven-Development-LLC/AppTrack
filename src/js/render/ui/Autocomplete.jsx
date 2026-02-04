/**
 * Autocomplete component - Combobox with search and create functionality
 * Theme-aware: responds to light/dark mode
 */

import { useState, useRef, useEffect } from 'react'

export function Autocomplete({
  label,
  value,
  onChange,
  options = [],
  getOptionLabel = (opt) => opt?.label || opt || '',
  placeholder = 'Search...',
  freeSolo = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Sync input value with selected value
  useEffect(() => {
    if (value) {
      setInputValue(getOptionLabel(value))
    } else {
      setInputValue('')
    }
  }, [value, getOptionLabel])

  // Filter options based on input
  useEffect(() => {
    const filtered = options.filter((opt) =>
      getOptionLabel(opt).toLowerCase().includes(inputValue.toLowerCase())
    )
    setFilteredOptions(filtered)
  }, [inputValue, options, getOptionLabel])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setIsOpen(true)
    if (freeSolo) {
      onChange(e.target.value)
    }
  }

  const handleSelect = (option) => {
    onChange(option)
    setInputValue(getOptionLabel(option))
    setIsOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' && freeSolo && inputValue) {
      onChange(inputValue)
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="
          w-full px-3 py-2
          bg-[var(--bg-primary)] border border-[var(--border-color)]
          rounded-md
          text-sm text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)]
          hover:border-[var(--text-muted)]
          focus:border-accent-500 focus:ring-1 focus:ring-accent-500 focus:outline-none
          transition-colors duration-150
        "
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="
          absolute z-50 w-full mt-1 py-1
          bg-[var(--bg-secondary)] border border-[var(--border-color)]
          rounded-md shadow-overlay
          max-h-60 overflow-auto
        ">
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className={`
                w-full px-3 py-2 text-left text-sm
                transition-colors duration-100
                ${getOptionLabel(option) === getOptionLabel(value)
                  ? 'bg-accent-500/10 text-accent-500'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }
              `}
            >
              {getOptionLabel(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Autocomplete
