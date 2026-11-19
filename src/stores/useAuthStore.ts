import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

type AuthState = {
  session: Session | null
  initialized: boolean // true once the stored session has been checked
  loading: boolean
  error: string
  init: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

let initPromise: Promise<void> | null = null

// Who may see orders is enforced by Postgres row-level security, not by this store.
export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  initialized: false,
  loading: false,
  error: '',

  // Safe to call twice (React StrictMode): the work only runs once.
  init: () => {
    if (initPromise) return initPromise
    initPromise = (async () => {
      if (!supabase) {
        set({ initialized: true })
        return
      }
      const { data } = await supabase.auth.getSession()
      set({ session: data.session, initialized: true })
      supabase.auth.onAuthStateChange((_event, session) => set({ session }))
    })()
    return initPromise
  },

  signIn: async (email, password) => {
    if (!supabase) {
      set({ error: 'Connect your Supabase project in .env.local first.' })
      return
    }
    set({ loading: true, error: '' })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false, error: error?.message ?? '' })
  },

  signOut: async () => {
    await supabase?.auth.signOut()
    set({ session: null, error: '' })
  },
}))
