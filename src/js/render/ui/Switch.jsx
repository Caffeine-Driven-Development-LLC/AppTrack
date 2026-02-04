/**
 * Switch component - Using Radix Switch primitive with Tailwind styling
 * Theme-aware: responds to light/dark mode
 */

import * as SwitchPrimitive from '@radix-ui/react-switch';

export function Switch({ checked, onCheckedChange, label, id, ...props }) {
  const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-center gap-3">
      <SwitchPrimitive.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="
          relative w-10 h-5
          bg-[var(--bg-tertiary)] rounded-full
          data-[state=checked]:bg-accent-500
          transition-colors duration-200
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500
        "
        {...props}
      >
        <SwitchPrimitive.Thumb
          className="
            block w-4 h-4
            bg-white rounded-full
            shadow-sm
            transition-transform duration-200
            translate-x-0.5
            data-[state=checked]:translate-x-[22px]
          "
        />
      </SwitchPrimitive.Root>
      {label && (
        <label
          htmlFor={switchId}
          className="text-sm text-[var(--text-primary)] cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}

export default Switch;
