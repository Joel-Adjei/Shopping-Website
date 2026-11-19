import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { StoreSettings } from '../types'

export const defaultStoreSettings: StoreSettings = {
  store_name: 'Stylish Steps Collection',
  support_email: null,
  contact_phone: '+233 59 305 4022',
  whatsapp_number: '233593054022',
  instagram_url: 'https://www.instagram.com/stylish_steps_collection',
  tiktok_url: 'https://www.tiktok.com/@stylishstepsfol',
  contact_address: 'Accra, Ghana',
}

export type StoreSettingsInput = {
  store_name: string
  support_email: string
  contact_phone: string
  whatsapp_number: string
  instagram_url: string
  tiktok_url: string
  contact_address: string
}

type StoreSettingsState = {
  settings: StoreSettings
  loaded: boolean
  loading: boolean
  error: string
  load: () => Promise<void>
  // Resolves to an error message, or null on success.
  save: (input: StoreSettingsInput) => Promise<string | null>
}

const blankToNull = (value: string) => (value.trim() ? value.trim() : null)

const friendlyError = (error: { code?: string; message: string }): string => {
  if (error.code === '42P01') return 'The store settings table is missing. Apply supabase/migrations/001_initial_schema.sql.'
  if (error.code === '42703' || /contact_phone|whatsapp_number|instagram_url|tiktok_url|contact_address/i.test(error.message))
    return 'The database is missing the contact columns. Apply supabase/migrations/003_store_contact.sql and try again.'
  if (error.code === '42501' || /row-level security/i.test(error.message))
    return 'You do not have permission. Only users with the admin role can change store settings.'
  return error.message
}

export const useStoreSettingsStore = create<StoreSettingsState>()((set, get) => ({
  settings: defaultStoreSettings,
  loaded: false,
  loading: false,
  error: '',

  load: async () => {
    if (!supabase || get().loaded || get().loading) return
    set({ loading: true })
    const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle()
    if (error) {
      // The storefront keeps working with the defaults when settings cannot be read.
      set({ loading: false, loaded: true, error: friendlyError(error) })
      return
    }
    set({
      loading: false,
      loaded: true,
      settings: data ? { ...defaultStoreSettings, ...data } : defaultStoreSettings,
    })
  },

  save: async (input) => {
    if (!supabase) return 'Supabase is not configured.'
    const payload: StoreSettings = {
      store_name: input.store_name.trim() || defaultStoreSettings.store_name,
      support_email: blankToNull(input.support_email),
      contact_phone: blankToNull(input.contact_phone),
      whatsapp_number: input.whatsapp_number.replace(/\D/g, '') || null,
      instagram_url: blankToNull(input.instagram_url),
      tiktok_url: blankToNull(input.tiktok_url),
      contact_address: blankToNull(input.contact_address),
    }
    const { data, error } = await supabase.from('store_settings').update(payload).eq('id', 1).select('id')
    if (error) return friendlyError(error)
    if (!data?.length) return 'Nothing was saved. You may not have permission to edit store settings.'
    set({ settings: payload, loaded: true, error: '' })
    return null
  },
}))
