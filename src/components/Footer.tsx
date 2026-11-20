import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { focusRing } from "../lib/ui";
import { normalizeWhatsAppNumber } from "../lib/whatsapp";
import { useStoreSettingsStore } from "../stores/useStoreSettingsStore";

export default function Footer() {
  const settings = useStoreSettingsStore((state) => state.settings);
  const whatsapp = normalizeWhatsAppNumber(settings.whatsapp_number);

  return (
    <footer className="tone-dark relative overflow-hidden bg-linear-to-br from-navy-950 via-navy-900 to-forest-900 text-cream-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(188,153,69,0.16),transparent_55%)]" />
      <div className="relative px-5 pb-5 pt-10 sm:px-[4%] lg:px-[5.4%]">
        <div className="grid gap-7 border-b border-white/10 pb-8 sm:grid-cols-2 sm:items-center lg:grid-cols-[1fr_1fr_1fr] lg:gap-4">
          <Link
            to="/"
            className={`group flex w-max flex-col gap-2 ${focusRing}`}
          >
            <span className="relative inline-flex items-start font-serif text-[22px] font-semibold leading-none tracking-[0.02em] text-cream-50">
              SSC
              <span className="ml-0.5 mt-[-2px] text-[9px] text-gold-400">®</span>
            </span>
            <span className="bg-linear-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-[7px] font-semibold uppercase tracking-[0.28em] text-transparent">
              Stylish Steps Collection
            </span>
          </Link>
          <p className="font-serif text-[16px] italic text-cream-200/70 sm:text-center">
            Thoughtful fashion for a life well lived.
          </p>
          <div className="flex items-center gap-6 sm:justify-start lg:justify-end">
            <Link
              to="/contact"
              className={`text-[9px] uppercase tracking-[0.16em] text-cream-200/80 transition-colors hover:text-gold-300 ${focusRing}`}
            >
              Contact us
            </Link>
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className={`grid h-9 w-9 place-items-center rounded-full border border-white/15 text-cream-200 transition-colors hover:border-gold-400/60 hover:bg-white/10 hover:text-gold-300 ${focusRing}`}
              >
                <Instagram size={18} />
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer noopener"
                className={`text-[9px] uppercase tracking-[0.16em] text-cream-200/80 transition-colors hover:text-gold-300 ${focusRing}`}
              >
                WhatsApp us
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 text-[7px] uppercase tracking-[0.15em] text-cream-200/45 sm:text-[8px]">
          <span>© 2026 {settings.store_name}</span>
          <span className="hidden sm:inline">Made with intention</span>
          <span>{settings.contact_address || "Accra, Ghana"}</span>
        </div>
      </div>
    </footer>
  );
}
