import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { AdminProduct } from '../types'
import { useCatalogStore } from './useCatalogStore'

export type ProductInput = {
  name: string
  slug: string
  description: string | null
  category_id: string | null
  sku: string | null
  price: number
  compare_at_price: number | null
  image_url: string | null
  images: string[]
  sizes: string[]
  colors: string[]
  tags: string[]
  stock_quantity: number
  is_featured: boolean
  is_active: boolean
  customization_enabled: boolean
  customization_label: string | null
}

export type AdminCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
}

export type CategoryInput = {
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
}

type AdminProductsState = {
  products: AdminProduct[]
  categories: AdminCategory[]
  loaded: boolean
  loading: boolean
  error: string
  load: () => Promise<void>
  // Each action below resolves to an error message, or null on success.
  saveProduct: (id: string | null, input: ProductInput) => Promise<string | null>
  setActive: (id: string, isActive: boolean) => Promise<string | null>
  deleteProduct: (id: string) => Promise<string | null>
  saveCategory: (id: string | null, input: CategoryInput) => Promise<string | null>
  uploadImage: (file: File) => Promise<{ url: string } | { error: string }>
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const friendlyError = (error: { code?: string; message: string }): string => {
  if (error.code === '23505') return 'That slug or SKU is already used by another product.'
  if (error.code === '42501' || /row-level security/i.test(error.message))
    return 'You do not have permission. Only users with the admin role can change products.'
  if (error.code === '23514') return 'A value is out of range. Check that the compare-at price is not below the price.'
  if (/images/i.test(error.message))
    return 'The database is missing the product images column. Apply supabase/migrations/004_product_images.sql and try again.'
  if (/tags/i.test(error.message))
    return 'The database is missing the product tags column. Apply supabase/migrations/006_product_tags.sql and try again.'
  if (error.code === '42703' || /customization_/i.test(error.message))
    return 'The database is missing the personalisation columns. Apply supabase/migrations/002_product_customization.sql and try again.'
  return error.message
}

// The storefront caches its catalogue; mark it stale so shoppers see edits straight away.
const refreshStorefront = () => {
  useCatalogStore.setState({ hasFetched: false })
  void useCatalogStore.getState().fetchProducts()
}

export const useAdminProductsStore = create<AdminProductsState>()((set, get) => ({
  products: [],
  categories: [],
  loaded: false,
  loading: false,
  error: '',

  load: async () => {
    if (!supabase) return
    set({ loading: true, error: '' })
    const [productsResult, categoriesResult] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    if (productsResult.error) {
      set({ loading: false, error: friendlyError(productsResult.error) })
      return
    }
    set({
      loading: false,
      loaded: true,
      products: (productsResult.data as AdminProduct[]).map((row) => ({
        ...row,
        price: Number(row.price),
        compare_at_price: row.compare_at_price === null ? null : Number(row.compare_at_price),
        sizes: row.sizes ?? [],
        colors: row.colors ?? [],
        tags: row.tags ?? [],
        images: row.images?.length ? row.images : row.image_url ? [row.image_url] : [],
      })),
      categories: (categoriesResult.data ?? []) as AdminCategory[],
    })
  },

  saveProduct: async (id, input) => {
    if (!supabase) return 'Supabase is not configured.'
    const query = id
      ? supabase.from('products').update(input).eq('id', id)
      : supabase.from('products').insert(input)
    // .select() makes a silently RLS-blocked update visible as "no rows".
    const { data, error } = await query.select('id')
    if (error) return friendlyError(error)
    if (!data?.length) return 'Nothing was saved. You may not have permission to edit products.'
    await get().load()
    refreshStorefront()
    return null
  },

  saveCategory: async (id, input) => {
    if (!supabase) return 'Supabase is not configured.'
    const query = id
      ? supabase.from('categories').update(input).eq('id', id)
      : supabase.from('categories').insert(input)
    const { data, error } = await query.select('id')
    if (error) {
      if (error.code === '23505') return 'That slug is already used by another category.'
      if (error.code === '42501' || /row-level security/i.test(error.message))
        return 'You do not have permission. Only users with the admin role can change categories.'
      return error.message
    }
    if (!data?.length) return 'Nothing was saved. You may not have permission to edit categories.'
    await get().load()
    refreshStorefront()
    return null
  },

  setActive: async (id, isActive) => {
    if (!supabase) return 'Supabase is not configured.'
    const { data, error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id).select('id')
    if (error) return friendlyError(error)
    if (!data?.length) return 'Nothing was changed. You may not have permission to edit products.'
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, is_active: isActive } : p)),
    }))
    refreshStorefront()
    return null
  },

  deleteProduct: async (id) => {
    if (!supabase) return 'Supabase is not configured.'
    const { data, error } = await supabase.from('products').delete().eq('id', id).select('id')
    if (error) return friendlyError(error)
    if (!data?.length) return 'Nothing was deleted. You may not have permission to delete products.'
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }))
    refreshStorefront()
    return null
  },

  uploadImage: async (file) => {
    if (!supabase) return { error: 'Supabase is not configured.' }
    if (!file.type.startsWith('image/')) return { error: 'Please choose an image file.' }
    if (file.size > MAX_IMAGE_BYTES) return { error: 'The image must be 5 MB or smaller.' }

    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `products/${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('product-images').upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
    })
    if (error) return { error: friendlyError(error) }
    return { url: supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl }
  },
}))
