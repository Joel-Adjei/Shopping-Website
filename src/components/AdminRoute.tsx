import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

// Sends signed-out visitors to the login page. This is only a convenience: the real
// protection is Postgres row-level security, which returns no orders to non-admins.
export default function AdminRoute({ children }: { children: ReactNode }) {
  const initialized = useAuthStore((state) => state.initialized)
  const session = useAuthStore((state) => state.session)

  if (!initialized) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-5">
        <p className="text-[12px] text-navy-900/50">Checking your session…</p>
      </main>
    )
  }
  if (!session) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
