import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FREE_DELIVERY_THRESHOLD } from '../lib/config'
import { lineKey, selectCartCount, selectSubtotal, useCartStore } from '../stores/useCartStore'
import { useUIStore } from '../stores/useUIStore'
import { btnPrimary, eyebrow } from '../lib/ui'
import { money } from '../util/export'

export default function CartDrawer() {
  const navigate = useNavigate()
  const open = useUIStore((state) => state.cartOpen)
  const closeCart = useUIStore((state) => state.closeCart)

  const lines = useCartStore((state) => state.lines)
  const cartCount = useCartStore(selectCartCount)
  const subtotal = useCartStore(selectSubtotal)
  const changeQuantity = useCartStore((state) => state.changeQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-navy-950/50 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCart()
          }}
        >
          <motion.aside
            className="flex h-full w-full max-w-[480px] flex-col bg-cream-50 px-5 pb-5 pt-6 shadow-[-24px_0_60px_rgba(7,26,46,0.18)] sm:px-7 sm:pt-7"
            aria-label="Shopping bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
        <div className="flex items-start justify-between border-b border-navy-900/10 pb-5">
          <div>
            <span className={eyebrow}>YOUR SELECTION</span>
            <h2 className="mt-2 font-serif text-[31px] font-semibold tracking-[-0.03em] text-navy-900">
              Your bag <span className="font-sans text-[12px] text-navy-900/45">({cartCount})</span>
            </h2>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-full text-navy-800 transition-colors hover:bg-cream-200 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            aria-label="Close bag"
            onClick={closeCart}
          >
            <X size={20} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
            <span className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-linear-to-br from-cream-200 to-gold-100 text-forest-600">
              <ShoppingBag size={30} strokeWidth={1.2} />
            </span>
            <h3 className="max-w-[250px] font-serif text-[25px] font-semibold leading-snug text-navy-900">
              A little room for something good.
            </h3>
            <p className="mb-6 mt-2.5 max-w-[260px] text-[11px] leading-relaxed text-navy-900/55">
              Your bag is waiting for its first considered piece.
            </p>
            <button
              className={btnPrimary}
              onClick={() => {
                closeCart()
                navigate('/shop')
              }}
            >
              Explore the collection <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2.5 border-b border-navy-900/10 py-5 text-[10px] text-navy-900/60">
              <span>Complimentary delivery over {money(FREE_DELIVERY_THRESHOLD).replace('.00', '')}</span>
              <div className="h-1 overflow-hidden rounded-full bg-navy-900/10">
                <span
                  className="block h-full rounded-full bg-linear-to-r from-forest-700 via-forest-500 to-gold-500 transition-[width] duration-200"
                  style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                />
              </div>
              <small className="text-[9px] text-navy-900/45">
                {subtotal >= FREE_DELIVERY_THRESHOLD
                  ? 'Your delivery is on us.'
                  : `${money(FREE_DELIVERY_THRESHOLD - subtotal)} away from complimentary delivery`}
              </small>
            </div>

            <div className="flex-1 overflow-y-auto">
              {lines.map((line) => {
                const key = lineKey(line)
                return (
                  <div className="grid grid-cols-[78px_1fr_24px] gap-3.5 border-b border-navy-900/10 py-4 sm:grid-cols-[85px_1fr_25px]" key={key}>
                    <img
                      className="h-[100px] w-[78px] bg-cream-300 object-cover sm:h-[108px] sm:w-[85px]"
                      src={line.product.image_url || ''}
                      alt=""
                    />
                    <div className="flex flex-col items-start gap-1.5">
                      <h3 className="my-0.5 text-[11px] font-medium text-navy-900">{line.product.name}</h3>
                      <span className="text-[9px] text-navy-900/50">
                        {line.color} · {line.size}
                      </span>
                      {line.customization && (
                        <span className="text-[9px] leading-snug text-gold-700">
                          Personalised · “{line.customization}”
                        </span>
                      )}
                      <strong className="mt-0.5 text-[10px] font-medium text-navy-900">{money(line.product.price * line.quantity)}</strong>
                      <div className="mt-1 inline-flex items-center gap-3 rounded-full border border-navy-900/10 bg-white/50 px-2 py-0.5">
                        <button className="grid place-items-center p-0.5 text-navy-800 transition-colors hover:text-forest-700" onClick={() => changeQuantity(key, -1)} aria-label="Decrease quantity">
                          <Minus size={13} />
                        </button>
                        <span className="text-[10px] text-navy-900">{line.quantity}</span>
                        <button className="grid place-items-center p-0.5 text-navy-800 transition-colors hover:text-forest-700" onClick={() => changeQuantity(key, 1)} aria-label="Increase quantity">
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="self-start text-navy-900/35 transition-colors hover:text-red-900/70"
                      aria-label="Remove item"
                      onClick={() => removeItem(key)}
                    >
                      <X size={15} />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 rounded-sm border border-gold-500/20 bg-linear-to-br from-cream-200 via-cream-100 to-gold-100/60 p-4">
              <div className="flex justify-between text-[12px] text-navy-900">
                <span>Subtotal</span>
                <strong className="font-medium">{money(subtotal)}</strong>
              </div>
              <small className="mb-4 mt-2.5 block text-[9px] leading-relaxed text-navy-900/50">
                Delivery and any applicable fees are calculated at checkout.
              </small>
              <button
                className={`${btnPrimary} w-full justify-between`}
                onClick={() => {
                  closeCart()
                  navigate('/checkout')
                }}
              >
                Continue to checkout <ArrowRight size={16} />
              </button>
              <span className="mt-3.5 flex items-center justify-center gap-1.5 text-[9px] text-navy-900/45">
                <ShieldCheck size={14} /> Secure checkout
              </span>
            </div>
          </>
        )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
