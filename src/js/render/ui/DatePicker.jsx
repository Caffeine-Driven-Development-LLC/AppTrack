import React, { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { DayPicker } from 'react-day-picker'
import dayjs from 'dayjs'

function CalendarIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 1V3M11 1V3M2 6H14M3 2.5H13C13.5523 2.5 14 2.94772 14 3.5V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3.5C2 2.94772 2.44772 2.5 3 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

function ChevronLeftIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

function ClearIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

export function DatePicker({
    label,
    value,
    onChange,
    error = false,
    required = false,
    clearable = false,
    placeholder = 'Select date...',
    className = ''
}) {
    const [open, setOpen] = useState(false)

    // Convert value to Date object for DayPicker
    const selectedDate = value ? dayjs(value).toDate() : undefined

    // Format display value
    const displayValue = value ? dayjs(value).format('MMM D, YYYY') : ''

    const handleSelect = (date) => {
        if (date) {
            onChange?.(dayjs(date).format('YYYY-MM-DD'))
        }
        setOpen(false)
    }

    const handleClear = (e) => {
        e.stopPropagation()
        onChange?.(null)
    }

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    {label}
                    {required && <span className="text-negative ml-1">*</span>}
                </label>
            )}
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        className={`
                            w-full flex items-center justify-between gap-2 px-3 py-2
                            bg-[var(--bg-primary)] border rounded text-sm text-left
                            transition-colors
                            ${error
                                ? 'border-negative focus:border-negative focus:ring-1 focus:ring-negative'
                                : 'border-[var(--border-color)] hover:border-[var(--text-muted)] focus:border-accent-500 focus:ring-1 focus:ring-accent-500'
                            }
                            focus:outline-none
                        `}
                    >
                        <span className={displayValue ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
                            {displayValue || placeholder}
                        </span>
                        <div className="flex items-center gap-1">
                            {clearable && value && (
                                <span
                                    role="button"
                                    tabIndex={-1}
                                    onClick={handleClear}
                                    className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-tertiary)]"
                                >
                                    <ClearIcon />
                                </span>
                            )}
                            <span className="text-[var(--text-muted)]">
                                <CalendarIcon />
                            </span>
                        </div>
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        className="z-50 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl p-3 animate-in fade-in-0 zoom-in-95"
                        sideOffset={4}
                        align="start"
                        collisionPadding={16}
                        avoidCollisions={true}
                    >
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleSelect}
                            showOutsideDays
                            classNames={{
                                root: 'text-[var(--text-primary)]',
                                months: 'flex flex-col',
                                month: 'space-y-2',
                                month_caption: 'flex justify-center relative items-center h-8',
                                caption_label: 'text-sm font-semibold text-[var(--text-primary)]',
                                nav: 'flex items-center justify-between absolute inset-x-0',
                                button_previous: 'p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors',
                                button_next: 'p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors',
                                month_grid: 'w-full border-collapse',
                                weekdays: 'flex',
                                weekday: 'w-8 h-8 text-xs font-medium text-[var(--text-muted)] flex items-center justify-center',
                                week: 'flex',
                                day: 'w-8 h-8 text-sm p-0',
                                day_button: 'w-full h-full flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] transition-colors',
                                selected: 'bg-accent-500 text-white hover:bg-accent-600 rounded',
                                today: 'font-bold text-accent-500',
                                outside: 'text-[var(--text-muted)] opacity-50',
                                disabled: 'text-[var(--text-muted)] opacity-30 cursor-not-allowed',
                            }}
                            components={{
                                Chevron: ({ orientation }) =>
                                    orientation === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />
                            }}
                        />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    )
}
