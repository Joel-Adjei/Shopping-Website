import { ClipboardList, ExternalLink, LogOut, Package, Plus, Settings } from 'lucide-react'
import { Suspense } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAdminOrdersStore } from '../stores/useAdminOrdersStore'
import { useAuthStore } from '../stores/useAuthStore'

const navBase =
  'flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-left text-[11px] text-cream-200/70 transition-colors hover:bg-white/10 hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 max-lg:w-auto'

const navActive = 'bg-white/10 font-semibold text-cream-50'

// Shell for every /admin page: a navigation panel on the left, the page on the right.
export default function AdminLayout() {
  const { pathname } = useLocation()
  const email = useAuthStore((state) => state.session?.user.email)
  const signOut = useAuthStore((state) => state.signOut)
  const clearOrders = useAdminOrdersStore((state) => state.clear)

  // "Products" covers the list and the edit page, but not "Add product", which has its own link.
  const productsActive = pathname.startsWith('/admin/products') && pathname !== '/admin/products/new'

  async function handleSignOut() {
    await signOut()
    clearOrders()
  }

  return (
    <main className="min-h-[calc(100vh-118px)] px-5 pb-20 pt-5 sm:px-[4%] lg:px-[5.4%] lg:pt-7">
      <div className="mx-auto grid max-w-[1400px] items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10 lg:pt-3">
        <aside className="flex flex-col gap-4 rounded-sm bg-linear-to-b from-navy-950 via-navy-900 to-forest-900 p-3 text-cream-100 shadow-[0_30px_60px_-45px_rgba(10,36,61,0.8)] max-lg:flex-row max-lg:flex-wrap max-lg:items-center lg:sticky lg:top-[110px] lg:gap-6 lg:p-[22px_18px]">
          <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.17em] text-cream-200/60 max-lg:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" /> ADMIN SPACE
          </span>
          <nav className="flex flex-col gap-1 max-lg:flex-row max-lg:flex-wrap" aria-label="Admin navigation">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `${navBase} ${isActive ? navActive : ''}`}
            >
              <ClipboardList size={16} /> Orders
            </NavLink>
            <NavLink
              to="/admin/products"
              end
              className={({ isActive }) => `${navBase} ${isActive || productsActive ? navActive : ''}`}
            >
              <Package size={16} /> Products
            </NavLink>
            <NavLink
              to="/admin/products/new"
              className={({ isActive }) => `${navBase} ${isActive ? navActive : ''}`}
            >
              <Plus size={16} /> Add product
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) => `${navBase} ${isActive ? navActive : ''}`}
            >
              <Settings size={16} /> Settings
            </NavLink>
          </nav>
          <div className="flex flex-col gap-0.5 border-t border-white/10 pt-4 max-lg:ml-auto max-lg:flex-row max-lg:flex-wrap max-lg:border-t-0 max-lg:pt-0">
            {email && (
              <small className="truncate px-3 pb-2 text-[9px] text-cream-200/45 max-lg:hidden" title={email}>
                {email}
              </small>
            )}
            <Link to="/" className={navBase}>
              <ExternalLink size={15} /> View storefront
            </Link>
            <button className={navBase} onClick={handleSignOut}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </aside>
        <div className="min-w-0">
          <Suspense fallback={<p className="py-3 text-[12px] text-navy-900/50">Loading…</p>}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
