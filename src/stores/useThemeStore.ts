import { create } from 'zustand'

export type ThemeMode = 'light' | 'noir'

const STORAGE_KEY = 'ssc-theme'

const readStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'noir' ? 'noir' : 'light'
  } catch {
    return 'light'
  }
}

const persist = (theme: ThemeMode) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* Safari private mode and similar can reject writes */
  }
}

type ThemeState = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: readStoredTheme(),

  setTheme: (theme) => {
    persist(theme)
    set({ theme })
  },

  toggleTheme: () =>
    set((state) => {
      const theme: ThemeMode = state.theme === 'noir' ? 'light' : 'noir'
      persist(theme)
      return { theme }
    }),
}))
