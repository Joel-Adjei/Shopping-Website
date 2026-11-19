import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { accentText, btnPrimary, displayTitle, eyebrow } from '../lib/ui'

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden bg-linear-to-br from-cream-100 via-cream-50 to-cream-200 px-5 py-20 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300/25 blur-3xl" />
      <span className={`${eyebrow} relative`}>
        <span className="inline-block h-px w-7 bg-linear-to-r from-gold-500 to-transparent" />
        PAGE NOT FOUND
      </span>
      <h1 className={`${displayTitle} relative my-6 text-[clamp(3.2rem,8vw,4.5rem)]`}>
        This page is
        <br />
        <em className={accentText}>off the rack.</em>
      </h1>
      <Link to="/" className={`${btnPrimary} relative mt-2`}>
        Return to the store <ArrowRight size={16} />
      </Link>
    </main>
  )
}
