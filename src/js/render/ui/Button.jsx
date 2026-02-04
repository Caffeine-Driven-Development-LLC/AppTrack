/**
 * Button component - Custom styled button using Tailwind
 * Theme-aware: responds to light/dark mode
 */

const baseStyles = `
  inline-flex items-center justify-center
  px-3 py-1.5
  text-sm font-medium
  rounded
  transition-colors duration-150
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500
  disabled:opacity-50 disabled:cursor-not-allowed
`.replace(/\s+/g, ' ').trim();

const variants = {
  primary: `
    bg-accent-500 text-white
    hover:bg-accent-600
    active:bg-accent-700
  `.replace(/\s+/g, ' ').trim(),

  secondary: `
    bg-[var(--bg-tertiary)] text-[var(--text-primary)]
    hover:bg-[var(--bg-secondary)]
    active:opacity-80
    border border-[var(--border-color)]
  `.replace(/\s+/g, ' ').trim(),

  ghost: `
    bg-transparent text-[var(--text-secondary)]
    hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]
    active:bg-[var(--bg-tertiary)]
  `.replace(/\s+/g, ' ').trim(),

  danger: `
    bg-negative text-white
    hover:opacity-90
    active:opacity-80
  `.replace(/\s+/g, ' ').trim(),
};

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
