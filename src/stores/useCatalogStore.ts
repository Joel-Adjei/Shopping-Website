import { create } from 'zustand'
import { demoCategories, demoProducts } from '../data/demoProducts'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'

type CatalogState = {
  products: Product[]
  categoryNames: Record<string, string> // category id -> display name
  isLoading: boolean
  hasFetched: boolean
  fetchProducts: () => Promise<void>
}

const demoCategoryNames = Object.fromEntries(demoCategories.map((category) => [category.id, category.name]))

const PRODUCT_FIELDS =
  'id,name,slug,description,price,compare_at_price,category_id,image_url,sizes,colors,stock_quantity,is_featured,is_active'

// Each group flips off once the deployed schema proves it predates a migration.
let supportsImageColumns = true
let supportsCustomizationColumns = true

const isMissingColumn = (error: { code?: string; message: string } | null, pattern: RegExp) =>
  Boolean(error && (error.code === '42703' || pattern.test(error.message)))

export const useCatalogStore = create<CatalogState>()((set, get) => ({
  // Starts with the demo catalogue; replaced when Supabase returns active products.
  products: demoProducts,
  categoryNames: demoCategoryNames,
  isLoading: false,
  hasFetched: false,

  fetchProducts: async () => {
    if (!supabase || get().isLoading || get().hasFetched) return
    set({ isLoading: true })

    const fetchProducts = (fields: string) =>
      supabase!
        .from('products')
        .select(fields)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    const selectFields = () =>
      [
        PRODUCT_FIELDS,
        supportsImageColumns ? 'images' : '',
        supportsCustomizationColumns ? 'customization_enabled,customization_label' : '',
      ]
        .filter(Boolean)
        .join(',')

    let productsResult = await fetchProducts(selectFields())
    // Before a migration lands, keep the catalogue working without those columns.
    while (productsResult.error) {
      if (supportsImageColumns && isMissingColumn(productsResult.error, /images/i)) {
        supportsImageColumns = false
      } else if (supportsCustomizationColumns && isMissingColumn(productsResult.error, /customization_/i)) {
        supportsCustomizationColumns = false
      } else {
        break
      }
      productsResult = await fetchProducts(selectFields())
    }
    const categoriesResult = await supabase.from('categories').select('id,name').eq('is_active', true)

    const rows = productsResult.data as Product[] | null
    set((state) => ({
      isLoading: false,
      hasFetched: true,
      // On error or an empty table the demo catalogue stays, as before.
      products:
        !productsResult.error && rows?.length
          ? rows.map((row) => ({
              ...row,
              price: Number(row.price),
              compare_at_price: row.compare_at_price === null ? null : Number(row.compare_at_price),
              sizes: row.sizes ?? [],
              colors: row.colors ?? [],
              images: row.images?.length ? row.images : row.image_url ? [row.image_url] : [],
              customization_enabled: Boolean(row.customization_enabled),
              customization_label: row.customization_label ?? null,
            }))
          : state.products,
      categoryNames: categoriesResult.data?.length
        ? {
            ...state.categoryNames,
            ...Object.fromEntries(categoriesResult.data.map((c: { id: string; name: string }) => [c.id, c.name])),
          }
        : state.categoryNames,
    }))
  },
}))
