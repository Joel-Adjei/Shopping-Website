import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { focusRing } from '../lib/ui'

export default function AdminTopline() {
  return (
    <div className="flex items-center justify-between border-b border-navy-900/10 pb-5">
      <Link
        to="/"
        className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-navy-900/55 transition-colors hover:text-forest-700 ${focusRing}`}
      >
        <ArrowRight size={15} className="rotate-180" /> Storefront
      </Link>
      <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.17em] text-navy-900/45">
        <span className="h-1.5 w-1.5 rounded-full bg-linear-to-br from-gold-500 to-forest-600" /> ADMIN SPACE
      </span>
    </div>
  )
}
