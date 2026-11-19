import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { ProductReview } from '../types'

type ReviewInput = {
  productId: string
  authorName: string
  rating: number
  body: string
}

type ReviewsState = {
  byProduct: Record<string, ProductReview[]>
  loading: Record<string, boolean>
  loaded: Record<string, boolean>
  error: Record<string, string>
  load: (productId: string) => Promise<void>
  // Resolves to an error message, or null on success.
  add: (input: ReviewInput) => Promise<string | null>
}

const REVIEW_FIELDS = 'id,product_id,author_name,rating,body,created_at'

const friendlyError = (error: { code?: string; message: string }): string => {
  if (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /could not find the table|schema cache/i.test(error.message)
  )
    return 'Reviews are not enabled yet. Apply supabase/migrations/005_product_reviews.sql.'
  if (error.code === '23503') return 'This piece is not in the live catalogue yet, so the review could not be saved.'
  if (error.code === '42501' || /row-level security/i.test(error.message))
    return 'Reviews cannot be saved right now. Please try again later.'
  return error.message
}

export const useReviewsStore = create<ReviewsState>()((set, get) => ({
  byProduct: {},
  loading: {},
  loaded: {},
  error: {},

  load: async (productId) => {
    if (get().loaded[productId] || get().loading[productId]) return
    if (!supabase) {
      set((state) => ({ loaded: { ...state.loaded, [productId]: true } }))
      return
    }
    set((state) => ({ loading: { ...state.loading, [productId]: true } }))
    const { data, error } = await supabase
      .from('product_reviews')
      .select(REVIEW_FIELDS)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(50)
    set((state) => ({
      loading: { ...state.loading, [productId]: false },
      loaded: { ...state.loaded, [productId]: true },
      byProduct: error
        ? state.byProduct
        : { ...state.byProduct, [productId]: (data ?? []) as ProductReview[] },
      error: { ...state.error, [productId]: error ? friendlyError(error) : '' },
    }))
  },

  add: async (input) => {
    const authorName = input.authorName.trim()
    const body = input.body.trim() || null
    const rating = Math.round(input.rating)
    if (!authorName || rating < 1 || rating > 5) return 'Please add your name and a star rating.'

    if (!supabase) {
      // Without a backend the review lives for this session so the flow stays testable.
      const review: ProductReview = {
        id: crypto.randomUUID(),
        product_id: input.productId,
        author_name: authorName,
        rating,
        body,
        created_at: new Date().toISOString(),
      }
      set((state) => ({
        loaded: { ...state.loaded, [input.productId]: true },
        byProduct: {
          ...state.byProduct,
          [input.productId]: [review, ...(state.byProduct[input.productId] ?? [])],
        },
      }))
      return null
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({ product_id: input.productId, author_name: authorName, rating, body })
      .select(REVIEW_FIELDS)
      .single()
    if (error) return friendlyError(error)

    set((state) => ({
      loaded: { ...state.loaded, [input.productId]: true },
      error: { ...state.error, [input.productId]: '' },
      byProduct: {
        ...state.byProduct,
        [input.productId]: [data as ProductReview, ...(state.byProduct[input.productId] ?? [])],
      },
    }))
    return null
  },
}))
