export const THEME_KEY = 'theme'
export const THEME_EVENT = 'flexibook-theme-change'

const THEMES = ['light', 'dark', 'color-blind']

export function getStoredTheme() {
  if (typeof window === 'undefined') return 'light'

  const savedTheme = window.localStorage.getItem(THEME_KEY)
  if (savedTheme && THEMES.includes(savedTheme)) return savedTheme

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return

  const nextTheme = THEMES.includes(theme) ? theme : 'light'
  const root = document.documentElement

  root.classList.remove('light', 'dark', 'color-blind')
  root.classList.add(nextTheme)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_KEY, nextTheme)
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: nextTheme }))
  }
}
