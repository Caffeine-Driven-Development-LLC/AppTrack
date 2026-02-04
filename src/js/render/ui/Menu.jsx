/**
 * Menu/Dropdown component - Using Radix DropdownMenu
 * Theme-aware: responds to light/dark mode
 */

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function Menu({ children, trigger, align = 'start' }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="
            min-w-[160px] py-1
            bg-[var(--bg-secondary)] border border-[var(--border-color)]
            rounded-md shadow-overlay
            z-50
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          "
          sideOffset={4}
          align={align}
          collisionPadding={8}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export function MenuItem({ children, onClick, disabled = false, destructive = false }) {
  return (
    <DropdownMenu.Item
      className={`
        px-3 py-2 text-sm outline-none cursor-pointer
        transition-colors duration-100
        ${destructive
          ? 'text-negative hover:bg-negative/10 focus:bg-negative/10'
          : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus:bg-[var(--bg-tertiary)]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </DropdownMenu.Item>
  )
}

export function MenuSeparator() {
  return (
    <DropdownMenu.Separator className="h-px my-1 bg-[var(--border-color)]" />
  )
}

export default Menu
