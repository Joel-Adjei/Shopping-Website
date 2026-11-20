// Shared Tailwind recipes for the SSC palette. Keeping them here keeps gradients and
// focus states identical across the storefront and the admin.

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500';

export const layoutX = 'px-5 sm:px-[4%] lg:px-[5.4%]';

export const eyebrow =
  'flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-gold-600';

export const eyebrowLine =
  'inline-block h-px w-7 bg-linear-to-r from-gold-500 via-gold-400 to-transparent';

export const accentText =
  'bg-linear-to-r from-forest-700 via-forest-600 to-gold-600 bg-clip-text font-hero font-normal italic text-transparent';

export const sectionTitle =
  'mt-4 font-serif text-[clamp(2.6rem,5vw,4rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-navy-900';

export const displayTitle =
  'font-serif text-[clamp(3.4rem,6.2vw,5.5rem)] font-semibold leading-[1.01] tracking-[-0.055em] text-navy-900';

export const btnPrimary = `ssc-primary group inline-flex min-h-12 items-center justify-center gap-4 rounded-full border border-forest-700/30 bg-linear-to-r from-forest-800 via-forest-700 to-navy-900 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-50 shadow-[0_16px_34px_-18px_rgba(10,36,61,0.7)] transition-all duration-300 hover:from-navy-900 hover:via-navy-800 hover:to-forest-800 hover:shadow-[0_20px_44px_-18px_rgba(10,36,61,0.8)] active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const btnGold = `tone-dark group inline-flex min-h-12 items-center justify-center gap-4 rounded-full border border-gold-600/30 bg-linear-to-r from-gold-600 via-gold-500 to-gold-400 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-950 shadow-[0_16px_34px_-18px_rgba(166,128,47,0.8)] transition-all duration-300 hover:from-navy-900 hover:via-navy-800 hover:to-forest-800 hover:text-cream-50 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const btnSecondary =
  'inline-flex items-center justify-center gap-3 rounded-full border border-navy-900/15 bg-cream-50/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-800 backdrop-blur-sm transition-colors hover:border-gold-500/60 hover:bg-cream-50 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500 disabled:pointer-events-none disabled:opacity-50';

export const textLink =
  'group inline-flex items-center gap-2.5 border-b border-gold-500/50 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-800 transition-colors hover:border-forest-700 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500';

export const iconButton =
  'grid h-9 w-9 place-items-center rounded-full text-navy-800 transition-colors hover:bg-cream-200 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500';

export const fieldLabel =
  'flex flex-col gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-800/80';

export const fieldInput =
  'w-full min-w-0 rounded-sm border border-navy-900/10 bg-cream-50/70 px-3.5 py-3 text-[12px] font-normal normal-case tracking-normal text-navy-900 outline-none transition placeholder:text-navy-900/35 focus:border-gold-500 focus:bg-cream-50 focus:ring-4 focus:ring-gold-500/10 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:text-navy-900/40';

export const panel =
  'rounded-sm border border-navy-900/10 bg-cream-50/65 shadow-[0_30px_70px_-60px_rgba(10,36,61,0.65)] backdrop-blur-sm';

export const cardTitle = 'font-serif text-[23px] font-semibold text-navy-900';

export const tableHead =
  'whitespace-nowrap border-b border-navy-900/10 px-3.5 py-3.5 text-left text-[8px] font-semibold uppercase tracking-[0.16em] text-navy-900/45';

export const tableCell =
  'border-b border-navy-900/5 px-3.5 py-4 text-[10px] text-navy-900/65';

export const statusPill =
  'inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold capitalize tracking-[0.06em]';

export function orderStatusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-gold-500/15 text-gold-700';
    case 'confirmed':
    case 'processing':
      return 'bg-forest-600/10 text-forest-700';
    case 'shipped':
      return 'bg-navy-800/10 text-navy-800';
    case 'delivered':
      return 'bg-forest-700/15 text-forest-800';
    case 'cancelled':
      return 'bg-red-900/10 text-red-900/80';
    default:
      return 'bg-navy-900/8 text-navy-900/60';
  }
}
