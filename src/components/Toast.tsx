import { Check, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '../stores/useUIStore'

export default function Toast() {
  const toast = useUIStore((state) => state.toast)
  const dismissToast = useUIStore((state) => state.dismissToast)

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={`${toast.title}-${toast.message}`}
          className="fixed right-4 top-4 z-[80] flex w-[min(370px,calc(100%-2rem))] items-center gap-3 rounded-sm border border-gold-500/25 bg-cream-50/95 p-4 shadow-[0_24px_60px_-24px_rgba(10,36,61,0.45)] backdrop-blur-xl sm:right-5 sm:top-5"
          role="status"
          initial={{ opacity: 0, y: -14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="tone-dark grid h-8 w-8 shrink-0 place-items-center rounded-full bg-linear-to-br from-forest-700 to-navy-900 text-cream-50">
            <Check size={16} />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <strong className="text-[11px] font-semibold text-navy-900">{toast.title}</strong>
            <span className="text-[10px] leading-relaxed text-navy-900/60">{toast.message}</span>
          </div>
          <button
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-navy-900/50 transition-colors hover:bg-cream-200 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            onClick={dismissToast}
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
