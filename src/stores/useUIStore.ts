import { create } from 'zustand'

type Toast = { title: string; message: string } | null

type UIState = {
  cartOpen: boolean
  mobileMenu: boolean
  searchOpen: boolean
  toast: Toast
  openCart: () => void
  closeCart: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  setSearchOpen: (open: boolean) => void
  showToast: (title: string, message: string) => void
  dismissToast: () => void
}

let toastTimer: number | undefined

export const useUIStore = create<UIState>()((set) => ({
  cartOpen: false,
  mobileMenu: false,
  searchOpen: false,
  toast: null,

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleMobileMenu: () => set((state) => ({ mobileMenu: !state.mobileMenu })),
  closeMobileMenu: () => set({ mobileMenu: false }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),

  // A toast dismisses itself after 3.6s; a newer toast restarts the timer.
  showToast: (title, message) => {
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => set({ toast: null }), 3600)
    set({ toast: { title, message } })
  },
  dismissToast: () => {
    window.clearTimeout(toastTimer)
    set({ toast: null })
  },
}))
