import { create } from 'zustand'
import type { Product } from '../types'

export type SortOption = 'featured' | 'price-low' | 'price-high' | 'name'

export const ALL_CATEGORIES = 'all'

export type ShopFilterCriteria = {
  search: string
  category: string
  priceMin: number | null
  priceMax: number | null
  sizes: string[]
  colors: string[]
  tags: string[]
  inStock: boolean
  customisable: boolean
}

type ShopFilterState = ShopFilterCriteria & {
  sort: SortOption
  setSearch: (search: string) => void
  setCategory: (category: string) => void
  setSort: (sort: SortOption) => void
  setPriceRange: (priceMin: number, priceMax: number) => void
  toggleSize: (size: string) => void
  toggleColor: (color: string) => void
  toggleTag: (tag: string) => void
  setInStock: (inStock: boolean) => void
  setCustomisable: (customisable: boolean) => void
  reset: () => void
}

const initialCriteria: ShopFilterCriteria = {
  search: '',
  category: ALL_CATEGORIES,
  priceMin: null,
  priceMax: null,
  sizes: [],
  colors: [],
  tags: [],
  inStock: false,
  customisable: false,
}

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

export const useShopFilterStore = create<ShopFilterState>()((set) => ({
  ...initialCriteria,
  sort: 'featured',
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
  setPriceRange: (priceMin, priceMax) => set({ priceMin, priceMax }),
  toggleSize: (size) => set((state) => ({ sizes: toggle(state.sizes, size) })),
  toggleColor: (color) => set((state) => ({ colors: toggle(state.colors, color) })),
  toggleTag: (tag) => set((state) => ({ tags: toggle(state.tags, tag) })),
  setInStock: (inStock) => set({ inStock }),
  setCustomisable: (customisable) => set({ customisable }),
  reset: () => set({ ...initialCriteria, sort: 'featured' }),
}))

// The range slider is bounded by what the catalogue actually stocks.
export const getPriceBounds = (products: Product[]) => {
  if (!products.length) return { min: 0, max: 0 }
  const prices = products.map((product) => product.price)
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  }
}

export const applyFilters = (
  products: Product[],
  filters: ShopFilterCriteria,
  sort: SortOption,
): Product[] => {
  const query = filters.search.trim().toLowerCase()
  const bounds = getPriceBounds(products)
  const priceMin = filters.priceMin ?? bounds.min
  const priceMax = filters.priceMax ?? bounds.max

  let items = products.filter((product) => {
    if (
      query &&
      !`${product.name} ${product.tags.join(' ')}`.toLowerCase().includes(query)
    ) {
      return false
    }
    if (filters.category !== ALL_CATEGORIES && product.category_id !== filters.category) {
      return false
    }
    if (product.price < priceMin || product.price > priceMax) return false
    if (filters.sizes.length && !product.sizes.some((size) => filters.sizes.includes(size))) {
      return false
    }
    if (filters.colors.length && !product.colors.some((color) => filters.colors.includes(color))) {
      return false
    }
    if (filters.tags.length && !product.tags.some((tag) => filters.tags.includes(tag))) {
      return false
    }
    if (filters.inStock && product.stock_quantity <= 0) return false
    if (filters.customisable && !product.customization_enabled) return false
    return true
  })

  if (sort === 'price-low') items = [...items].sort((a, b) => a.price - b.price)
  if (sort === 'price-high') items = [...items].sort((a, b) => b.price - a.price)
  if (sort === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name))
  return items
}
