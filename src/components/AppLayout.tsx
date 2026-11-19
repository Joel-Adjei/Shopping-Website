import { useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCatalogStore } from '../stores/useCatalogStore'
import { useStoreSettingsStore } from '../stores/useStoreSettingsStore'
import { useUIStore } from '../stores/useUIStore'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Header from './Header'
import Toast from './Toast'

// Shared chrome for every route: announcement bar, header, footer, bag drawer and toast.
export default function AppLayout() {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  // The admin shell stays mounted while moving between its pages.
  const routeKey = pathname.startsWith('/admin') ? '/admin' : pathname
  const fetchProducts = useCatalogStore((state) => state.fetchProducts)
  const loadSettings = useStoreSettingsStore((state) => state.load)
  const closeMobileMenu = useUIStore((state) => state.closeMobileMenu)

  useEffect(() => {
    void fetchProducts()
    void loadSettings()
  }, [fetchProducts, loadSettings])

  // Each page starts at the top, with the mobile menu closed.
  useEffect(() => {
    window.scrollTo(0, 0)
    closeMobileMenu()
  }, [pathname, closeMobileMenu])

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-cream-100 font-sans text-navy-900 antialiased selection:bg-gold-500/30">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_at_top_left,rgba(188,153,69,0.16),transparent_58%),radial-gradient(ellipse_at_top_right,rgba(42,79,62,0.10),transparent_55%)]" />
      <div className="bg-linear-to-r from-navy-950 via-navy-900 to-forest-900 text-cream-200">
        <div className="flex h-8 items-center justify-center gap-2.5 px-4 text-[8px] uppercase tracking-[0.14em] sm:text-[9px]">
          <span>Complimentary delivery on orders over GHS 1,000</span>
          <span className="text-gold-400">·</span>
          <span className="hidden sm:inline">Thoughtfully chosen. Made to be worn.</span>
        </div>
      </div>
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={routeKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
      <Footer />
      <CartDrawer />
      <Toast />
    </div>
  )
}
