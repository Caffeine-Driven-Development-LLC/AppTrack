/**
 * ColorInput component - Color picker with hex display
 * Uses react-colorful for a nice picker UI in a popover
 * Theme-aware: responds to light/dark mode
 */

import { useState, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import * as Popover from '@radix-ui/react-popover';

// Preset colors for quick selection
const PRESET_COLORS = [
  '#5bbbbb', // teal (default accent)
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
  '#1e1e1e', // dark
];

export function ColorInput({ label, value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = useCallback((newColor) => {
    onChange(newColor);
  }, [onChange]);

  const handleHexInput = useCallback((e) => {
    const hex = e.target.value;
    // Allow typing and auto-format
    if (hex.match(/^#?[0-9a-fA-F]{0,6}$/)) {
      const formatted = hex.startsWith('#') ? hex : `#${hex}`;
      onChange(formatted);
    }
  }, [onChange]);

  const currentColor = value || '#5bbbbb';

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="
                w-10 h-10 rounded border-2 border-[var(--border-color)]
                cursor-pointer transition-all duration-150
                hover:border-[var(--text-muted)] hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]
              "
              style={{ backgroundColor: currentColor }}
              aria-label="Pick color"
            />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="
                z-50 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)]
                rounded-lg shadow-overlay
                data-[state=open]:animate-in data-[state=closed]:animate-out
                data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
              "
              sideOffset={8}
              align="start"
              collisionPadding={16}
              avoidCollisions={true}
            >
              <div className="flex flex-col gap-3">
                {/* Color picker */}
                <HexColorPicker
                  color={currentColor}
                  onChange={handleColorChange}
                  style={{ width: '200px', height: '160px' }}
                />

                {/* Preset swatches */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleColorChange(preset)}
                      className={`
                        w-6 h-6 rounded border transition-all duration-150
                        hover:scale-110
                        ${currentColor.toLowerCase() === preset.toLowerCase()
                          ? 'border-[var(--text-primary)] ring-1 ring-[var(--text-primary)]'
                          : 'border-[var(--border-color)]'
                        }
                      `}
                      style={{ backgroundColor: preset }}
                      aria-label={`Select ${preset}`}
                    />
                  ))}
                </div>

                {/* Hex input inside popover */}
                <input
                  type="text"
                  value={currentColor}
                  onChange={handleHexInput}
                  className="
                    w-full px-2 py-1.5
                    bg-[var(--bg-primary)] border border-[var(--border-color)]
                    rounded text-sm text-[var(--text-primary)] font-mono text-center
                    focus:border-accent-500 focus:ring-1 focus:ring-accent-500
                    transition-colors duration-150
                  "
                  placeholder="#000000"
                />
              </div>
              <Popover.Arrow className="fill-[var(--bg-secondary)]" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Hex display outside */}
        <span className="text-sm font-mono text-[var(--text-muted)]">
          {currentColor}
        </span>
      </div>
    </div>
  );
}

export default ColorInput;
