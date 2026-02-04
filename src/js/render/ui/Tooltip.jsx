/**
 * Tooltip component - Using Radix Tooltip primitive with Tailwind styling
 * Theme-aware: responds to light/dark mode
 */

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export function TooltipProvider({ children, ...props }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300} {...props}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function Tooltip({ children, content, side = 'top', ...props }) {
  return (
    <TooltipPrimitive.Root {...props}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={4}
          className="
            px-3 py-2
            bg-[var(--bg-tertiary)] border border-[var(--border-color)]
            rounded shadow-elevated
            text-xs text-[var(--text-primary)]
            max-w-xs
            z-50
            animate-in fade-in-0 zoom-in-95
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
          "
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-[var(--bg-tertiary)]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export default Tooltip;
