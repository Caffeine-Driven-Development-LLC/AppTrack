/**
 * Select component - Using Radix Select primitive with Tailwind styling
 * Theme-aware: responds to light/dark mode
 */

import * as SelectPrimitive from '@radix-ui/react-select';

export function Select({ children, label, value, onValueChange, placeholder = 'Select...', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} {...props}>
        <SelectPrimitive.Trigger
          className="
            inline-flex items-center justify-between
            w-full min-w-[180px] px-3 py-2
            bg-[var(--bg-primary)] border border-[var(--border-color)]
            rounded text-sm text-[var(--text-primary)]
            hover:border-[var(--text-muted)]
            focus:border-accent-500 focus:ring-1 focus:ring-accent-500
            data-[placeholder]:text-[var(--text-muted)]
            transition-colors duration-150
          "
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className="ml-2 text-[var(--text-muted)]">
            <ChevronDownIcon />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="
              overflow-hidden
              bg-[var(--bg-secondary)] border border-[var(--border-color)]
              rounded-md shadow-overlay
              z-50
            "
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {children}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}

export function SelectItem({ children, value, ...props }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className="
        relative flex items-center
        px-8 py-2 rounded
        text-sm text-[var(--text-secondary)]
        cursor-pointer select-none
        data-[highlighted]:bg-[var(--bg-tertiary)] data-[highlighted]:text-[var(--text-primary)]
        data-[highlighted]:outline-none
        transition-colors duration-100
      "
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default Select;
