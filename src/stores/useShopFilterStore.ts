import { create } from 'zustand'
import type { Product } from '../types'

export type SortOption = 'featured' | 'price-low' | 'price-high' | 'name'

export const ALL_CATEGORIES = 'all'

type ShopFilterState = {
  search: string
  category: string // a category id, or ALL_CATEGORIES
  sort: SortOption
  setSearch: (search: string) => void
  setCategory: (category: string) => void
  setSort: (sort: SortOption) => void
  reset: () => void
}

export const useShopFilterStore = create<ShopFilterState>()((set) => ({
  search: '',
  category: ALL_CATEGORIES,
  sort: 'featured',
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
  reset: () => set({ search: '', category: ALL_CATEGORIES, sort: 'featured' }),
}))

export const applyFilters = (
  products: Product[],
  search: string,
  category: string,
  sort: SortOption,
): Product[] => {
  const query = search.toLowerCase()
  let items = products.filter((product) => product.name.toLowerCase().includes(query))
  if (category !== ALL_CATEGORIES) items = items.filter((product) => product.category_id === category)
  if (sort === 'price-low') items = [...items].sort((a, b) => a.price - b.price)
  if (sort === 'price-high') items = [...items].sort((a, b) => b.price - a.price)
  if (sort === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name))
  return items
}
