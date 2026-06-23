import { useEffect, useState } from 'react'
import { applyTheme, getStoredTheme, THEME_EVENT, THEME_KEY } from '../lib/theme'

export function useTheme() {
  const [theme, setThemeState] = useState(() => getStoredTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const syncTheme = (nextTheme) => setThemeState(nextTheme)
    const onThemeChange = (event) => syncTheme(event.detail)
    const onStorage = (event) => {
      if (event.key === THEME_KEY && event.newValue) {
        syncTheme(event.newValue)
      }
    }

    window.addEventListener(THEME_EVENT, onThemeChange)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(THEME_EVENT, onThemeChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme)
  }

  const toggleTheme = () => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  }
}
