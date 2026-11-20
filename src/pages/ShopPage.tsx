import { ArrowDown, ArrowRight, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import ShopFilters from '../components/ShopFilters'
import { isSupabaseConfigured } from '../lib/supabase'
import { useCatalogStore } from '../stores/useCatalogStore'
import {
  ALL_CATEGORIES,
  applyFilters,
  useShopFilterStore,
  type SortOption,
} from '../stores/useShopFilterStore'
import { accentText, eyebrow, focusRing, sectionTitle } from '../lib/ui'

export default function ShopPage() {
  const products = useCatalogStore((state) => state.products)
  const categoryNames = useCatalogStore((state) => state.categoryNames)
  const isLoading = useCatalogStore((state) => state.isLoading)

  const search = useShopFilterStore((state) => state.search)
  const category = useShopFilterStore((state) => state.category)
  const sort = useShopFilterStore((state) => state.sort)
  const priceMin = useShopFilterStore((state) => state.priceMin)
  const priceMax = useShopFilterStore((state) => state.priceMax)
  const sizes = useShopFilterStore((state) => state.sizes)
  const colors = useShopFilterStore((state) => state.colors)
  const tags = useShopFilterStore((state) => state.tags)
  const inStock = useShopFilterStore((state) => state.inStock)
  const customisable = useShopFilterStore((state) => state.customisable)
  const setSort = useShopFilterStore((state) => state.setSort)
  const reset = useShopFilterStore((state) => state.reset)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const visible = useMemo(
    () =>
      applyFilters(
        products,
        { search, category, priceMin, priceMax, sizes, colors, tags, inStock, customisable },
        sort,
      ),
    [products, search, category, priceMin, priceMax, sizes, colors, tags, inStock, customisable, sort],
  )

  const activeCount =
    (category !== ALL_CATEGORIES ? 1 : 0) +
    (priceMin !== null || priceMax !== null ? 1 : 0) +
    sizes.length +
    colors.length +
    tags.length +
    (inStock ? 1 : 0) +
    (customisable ? 1 : 0)

  return (
    <main>
      <section className="px-5 py-14 sm:px-[4%] sm:py-20 lg:px-[5.4%] lg:py-24">
        <Reveal className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className={eyebrow}>A WARDROBE, REFINED</span>
            <h2 className={sectionTitle}>
              Pieces to <em className={accentText}>keep.</em>
            </h2>
          </div>
          <p className="max-w-[240px] text-[11px] leading-relaxed text-navy-900/50">
            Designed to move with you. Chosen to stay with you.
          </p>
        </Reveal>

        {!isSupabaseConfigured && (
          <div className="mb-6 flex items-center gap-2.5 rounded-sm border border-gold-500/30 bg-linear-to-r from-gold-100/80 via-cream-100 to-cream-200 px-4 py-3 text-[10px] leading-relaxed text-navy-900/65">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
            Preview mode — connect Supabase to load your live catalogue and accept real orders.
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[228px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[248px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-[102px] max-h-[calc(100vh-120px)] overflow-y-auto pr-1 [scrollbar-width:thin]">
              <ShopFilters products={products} categoryNames={categoryNames} />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-navy-900/10 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[8px] uppercase tracking-[0.16em] text-navy-900/45">
                  Showing {visible.length} of {products.length} pieces
                </span>
                <button
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-expanded={filtersOpen}
                  className={`inline-flex items-center gap-2 rounded-full border border-navy-900/15 bg-cream-50/60 px-3.5 py-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-navy-800 transition-colors hover:border-gold-500/60 lg:hidden ${focusRing}`}
                >
                  <SlidersHorizontal size={13} className="text-gold-600" />
                  Filters
                  {activeCount > 0 && (
                    <span className="grid h-4 min-w-4 place-items-center rounded-full bg-forest-700 px-1 text-[8px] text-cream-50">
                      {activeCount}
                    </span>
                  )}
                </button>
              </div>

              <label className="flex items-center gap-2 text-[10px] text-navy-900/55">
                <span className="uppercase tracking-[0.12em]">Sort</span>
                <span className="relative">
                  <select
                    className="max-w-[130px] cursor-pointer appearance-none bg-transparent pr-5 text-[10px] text-navy-900/75 outline-none"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    aria-label="Sort products"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                    <option value="name">Name</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-navy-900/50"
                  />
                </span>
              </label>
            </div>

            {filtersOpen && (
              <div className="mb-6 border border-navy-900/10 bg-cream-50/55 p-4 backdrop-blur-sm lg:hidden">
                <ShopFilters
                  products={products}
                  categoryNames={categoryNames}
                  resultCount={visible.length}
                  onDone={() => setFiltersOpen(false)}
                />
              </div>
            )}

            {isLoading && (
              <p className="py-3 text-[12px] text-navy-900/50">Curating the collection…</p>
            )}

            <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-4 md:grid-cols-3 md:gap-x-[18px] md:gap-y-[42px]">
              {visible.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            {!visible.length && (
              <div className="py-16 text-center text-[12px] text-navy-900/50">
                <p className="mb-4">No pieces found for this edit.</p>
                <button
                  className="inline-flex items-center gap-2 border-b border-gold-500/50 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-800 transition-colors hover:border-forest-700 hover:text-forest-700"
                  onClick={reset}
                >
                  Clear filters <ArrowRight size={15} />
                </button>
              </div>
            )}

            <div className="mt-12 flex items-center justify-between gap-3 border-t border-navy-900/10 pt-5 text-[7px] uppercase tracking-[0.15em] text-navy-900/40 sm:mt-14 sm:text-[8px]">
              <span>SHOWING {visible.length} CONSIDERED PIECES</span>
              <span className="hidden items-center gap-1.5 sm:flex">
                MADE FOR YOUR EVERYDAY <ArrowDown size={13} />
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
