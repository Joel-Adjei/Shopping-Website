import { ArrowDown, ArrowRight, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useMemo } from 'react'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import { isSupabaseConfigured } from '../lib/supabase'
import { useCatalogStore } from '../stores/useCatalogStore'
import {
  ALL_CATEGORIES,
  applyFilters,
  useShopFilterStore,
  type SortOption,
} from '../stores/useShopFilterStore'
import { accentText, eyebrow, sectionTitle } from '../lib/ui'

export default function ShopPage() {
  const products = useCatalogStore((state) => state.products)
  const categoryNames = useCatalogStore((state) => state.categoryNames)
  const isLoading = useCatalogStore((state) => state.isLoading)

  const search = useShopFilterStore((state) => state.search)
  const category = useShopFilterStore((state) => state.category)
  const sort = useShopFilterStore((state) => state.sort)
  const setCategory = useShopFilterStore((state) => state.setCategory)
  const setSort = useShopFilterStore((state) => state.setSort)
  const reset = useShopFilterStore((state) => state.reset)

  // Only categories that actually have products get a tab.
  const tabs = useMemo(() => {
    const ids = [...new Set(products.map((product) => product.category_id).filter((id): id is string => Boolean(id)))]
    return ids.map((id) => ({ id, name: categoryNames[id] ?? id }))
  }, [products, categoryNames])

  const visible = useMemo(
    () => applyFilters(products, search, category, sort),
    [products, search, category, sort],
  )

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

        <Reveal
          className="mb-7 flex flex-col-reverse gap-4 border-b border-navy-900/10 md:flex-row md:items-center md:justify-between md:gap-5"
          delay={0.08}
          y={16}
        >
          <div className="flex w-full gap-1.5 overflow-x-auto pb-3 md:w-auto md:gap-2 [scrollbar-width:none]">
            {[{ id: ALL_CATEGORIES, name: 'All pieces' }, ...tabs].map((tab) => (
              <button
                key={tab.id}
                className={`shrink-0 rounded-full border px-4 py-2 text-[9px] font-medium uppercase tracking-[0.14em] transition-all ${
                  category === tab.id
                    ? 'border-transparent bg-linear-to-r from-navy-900 via-navy-800 to-forest-800 text-cream-50 shadow-[0_8px_20px_-12px_rgba(10,36,61,0.8)]'
                    : 'border-navy-900/10 bg-white/50 text-navy-900/55 hover:border-gold-500/50 hover:text-forest-700'
                }`}
                onClick={() => setCategory(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 self-end pb-3 text-[10px] text-navy-900/55 md:self-auto">
            <SlidersHorizontal size={15} className="text-gold-600" />
            <span className="uppercase tracking-[0.12em]">Sort</span>
            <span className="relative">
              <select
                className="max-w-[118px] cursor-pointer appearance-none bg-transparent pr-5 text-[10px] text-navy-900/75 outline-none"
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
        </Reveal>

        {!isSupabaseConfigured && (
          <div className="mb-6 flex items-center gap-2.5 rounded-sm border border-gold-500/30 bg-linear-to-r from-gold-100/80 via-cream-100 to-cream-200 px-4 py-3 text-[10px] leading-relaxed text-navy-900/65">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
            Preview mode — connect Supabase to load your live catalogue and accept real orders.
          </div>
        )}
        {isLoading && <p className="py-3 text-[12px] text-navy-900/50">Curating the collection…</p>}

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
      </section>
    </main>
  )
}
