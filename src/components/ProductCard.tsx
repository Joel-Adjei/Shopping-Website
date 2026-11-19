import { Heart, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { money } from '../util/export'
import { useCartStore } from '../stores/useCartStore'
import { useUIStore } from '../stores/useUIStore'
import type { Product } from '../types'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85'

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useUIStore((state) => state.openCart)
  const showToast = useUIStore((state) => state.showToast)

  const quickAdd = () => {
    addItem(product)
    showToast('Added to your bag', `${product.name} is ready when you are.`)
    openCart()
  }

  return (
    <motion.article
      className="group min-w-0"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          delay: Math.min(index * 0.08, 0.32),
          ease: [0.22, 0.61, 0.36, 1],
        },
      }}
      whileHover={{ y: -5, transition: { duration: 0.25, ease: 'easeOut' } }}
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream-300">
        <img
          className="h-full w-full object-cover saturate-[0.82] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          src={product.image_url || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-950/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {/* Covers the image; the buttons below sit above it, so they stay clickable. */}
        <Link to={`/product/${product.slug}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />
        {product.compare_at_price && (
          <span className="absolute left-3 top-3 z-10 bg-cream-50/90 px-2.5 py-1.5 text-[8px] uppercase tracking-[0.12em] text-navy-900 backdrop-blur-sm">
            The edit
          </span>
        )}
        {product.customization_enabled && (
          <span className="absolute left-3 top-11 z-10 bg-linear-to-r from-gold-600 via-gold-500 to-gold-400 px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-navy-950 shadow-sm">
            Personalise
          </span>
        )}
        <button
          className="absolute inset-x-3 bottom-3 z-10 flex h-10 items-center justify-center gap-2 rounded-full border border-white/40 bg-cream-50/95 text-[10px] font-semibold uppercase tracking-[0.12em] text-navy-900 opacity-100 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-navy-900 hover:text-cream-50 md:translate-y-1.5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
          onClick={quickAdd}
        >
          <Plus size={15} /> Quick add
        </button>
        <motion.button
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-cream-50/90 text-navy-800 backdrop-blur-sm transition-colors hover:text-gold-600"
          aria-label={`Save ${product.name}`}
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: 1.08 }}
          onClick={() =>
            showToast('A little love', 'Wishlist functionality can be connected in the next iteration.')
          }
        >
          <Heart size={16} />
        </motion.button>
      </div>
      <div className="flex flex-col gap-2 pt-3.5 sm:flex-row sm:justify-between sm:gap-2.5">
        <div>
          <h3 className="mb-1.5 text-[10px] font-medium leading-snug text-navy-900 sm:text-[12px]">
            <Link to={`/product/${product.slug}`} className="transition-colors hover:text-forest-700">
              {product.name}
            </Link>
          </h3>
          <span className="text-[8px] text-navy-900/45 sm:text-[9px]">
            {product.colors.slice(0, 3).join(' · ') || 'Considered design'}
          </span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap sm:flex-col sm:items-end sm:gap-1">
          <strong className="text-[9px] font-medium text-navy-900 sm:text-[10px]">{money(product.price)}</strong>
          {product.compare_at_price && (
            <del className="text-[8px] text-navy-900/35 sm:text-[9px]">{money(product.compare_at_price)}</del>
          )}
        </div>
      </div>
      <div className="mt-2.5 text-[8px] uppercase tracking-[0.15em] text-navy-900/30 sm:mt-3.5">
        AT. {String(index + 1).padStart(2, '0')}
      </div>
    </motion.article>
  )
}
