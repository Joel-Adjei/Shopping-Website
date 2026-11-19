import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import AdminRoute from './components/AdminRoute'
import AppLayout from './components/AppLayout'
import { useAuthStore } from './stores/useAuthStore'

// Every page lives in its own file and is code-split into its own chunk.
const HomePage = lazy(() => import('./pages/HomePage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {
  const initAuth = useAuthStore((state) => state.init)

  useEffect(() => {
    void initAuth()
  }, [initAuth])

  return (
    <Routes>
      {/* The login screen is standalone: no storefront header, footer or bag drawer. */}
      <Route path="/admin/login" element={<Page><AdminLoginPage /></Page>} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Page><HomePage /></Page>} />
        <Route path="/shop" element={<Page><ShopPage /></Page>} />
        <Route path="/product/:slug" element={<Page><ProductPage /></Page>} />
        <Route path="/about" element={<Page><AboutPage /></Page>} />
        <Route path="/checkout" element={<Page><CheckoutPage /></Page>} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:id/edit" element={<AdminProductFormPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<Page><NotFoundPage /></Page>} />
      </Route>
    </Routes>
  )
}

// Suspense sits per page so the header and footer stay put while a page chunk loads.
function Page({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center px-5">
          <p className="text-[12px] text-navy-900/50">Loading…</p>
        </main>
      }
    >
      {children}
    </Suspense>
  )
}

export default App
