function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  const nextTheme = isDark ? 'light' : 'dark'

  return (
    <button
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={isDark}
      className="theme-toggle"
      title={`Switch to ${nextTheme} mode`}
      type="button"
      onClick={onToggle}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? '☀' : '☾'}
      </span>
      <span className="theme-toggle__label">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}

export default ThemeToggle
