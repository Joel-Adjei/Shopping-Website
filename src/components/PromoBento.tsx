import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import { useCatalogStore } from "../stores/useCatalogStore";
import { ALL_CATEGORIES, useShopFilterStore } from "../stores/useShopFilterStore";
import { accentText, eyebrow, sectionTitle, textLink } from "../lib/ui";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type PromoTileProps = {
  category: string;
  label: string;
  title: string;
  note?: string;
  image: string;
  imageAlt: string;
  background: string;
  scrim: string;
  className?: string;
  compact?: boolean;
  badge?: string;
};

// Each tile sends the shopper to the shop with the matching category already applied.
function PromoTile({
  category,
  label,
  title,
  note,
  image,
  imageAlt,
  background,
  scrim,
  className = "",
  compact = false,
  badge,
}: PromoTileProps) {
  const categoryNames = useCatalogStore((state) => state.categoryNames);
  const products = useCatalogStore((state) => state.products);
  const setCategory = useShopFilterStore((state) => state.setCategory);
  const resetFilters = useShopFilterStore((state) => state.reset);

  const openCategory = () => {
    const match = Object.entries(categoryNames).find(
      ([, name]) => name.toLowerCase() === category.toLowerCase(),
    );
    const categoryId = match?.[0];
    // Until a category has stock, send the shopper to the full collection instead of an empty grid.
    const hasPieces = categoryId
      ? products.some((product) => product.category_id === categoryId)
      : false;
    resetFilters();
    setCategory(hasPieces ? categoryId! : ALL_CATEGORIES);
  };

  return (
    <Link
      to="/shop"
      onClick={openCategory}
      className={`promo-card group relative flex min-h-[210px] items-center overflow-hidden rounded-sm ${background} ${className}`}
    >
      <img
        src={image}
        alt={imageAlt}
        className={`absolute inset-y-0 right-0 h-full object-cover saturate-[0.9] transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] ${
          compact ? "w-[52%]" : "w-[58%]"
        }`}
      />
      <div
        className={`promo-scrim pointer-events-none absolute inset-y-0 left-0 w-[82%] bg-linear-to-r ${scrim} to-transparent`}
      />
      <div className={`relative z-10 px-6 py-7 sm:px-7 ${compact ? "max-w-[70%]" : "max-w-[62%]"}`}>
        <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-700">
          {label}
        </span>
        <h3
          className={`mt-2 font-serif font-semibold leading-[1.1] tracking-[-0.03em] text-navy-900 ${
            compact ? "text-[21px]" : "text-[clamp(1.5rem,2.2vw,2rem)]"
          }`}
        >
          {title}
        </h3>
        {note && (
          <p className="mt-2 text-[10px] leading-relaxed text-navy-900/55">{note}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-2 border-b border-navy-900/30 pb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-navy-900 transition-colors group-hover:border-forest-700 group-hover:text-forest-700">
          Shop now <ArrowUpRight size={12} />
        </span>
      </div>
      {badge && (
        <span className="tone-dark absolute right-4 top-4 z-10 bg-gold-500 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-navy-950 shadow-sm">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function PromoBento() {
  const resetFilters = useShopFilterStore((state) => state.reset);

  return (
    <section className="px-5 py-16 sm:px-[4%] sm:py-20 lg:px-[5.4%] lg:py-24">
      <Reveal className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className={eyebrow}>SHOP BY MOOD</span>
          <h2 className={sectionTitle}>
            More to <em className={accentText}>discover.</em>
          </h2>
        </div>
        <p className="max-w-[250px] text-[11px] leading-relaxed text-navy-900/50">
          From the pair you reach for daily to the detail that finishes the look.
        </p>
      </Reveal>

      <motion.div
        className="grid gap-3 lg:grid-cols-[1.45fr_1fr]"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        <Link
          to="/shop"
          onClick={resetFilters}
          className="tone-dark group relative flex min-h-[460px] flex-col justify-end overflow-hidden rounded-sm bg-navy-900 p-7 sm:min-h-[540px] sm:p-9 lg:min-h-full lg:p-11"
        >
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85"
            alt="A shopper in considered everyday layers"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-navy-950/92 via-navy-950/45 to-navy-950/5" />
          <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-navy-950/35 to-transparent" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-6 right-1 select-none font-serif text-[150px] leading-none text-cream-50/10 sm:text-[190px]"
          >
            SSC
          </span>
          <motion.div
            className="relative z-10 max-w-[430px]"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-cream-50/25 bg-cream-50/10 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-cream-50 backdrop-blur-sm">
              New arrivals
            </span>
            <h3 className="mt-4 font-serif text-[clamp(2.5rem,4.5vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-cream-50">
              The everyday <em className="font-hero font-normal italic text-gold-300">edit.</em>
            </h3>
            <p className="mt-3 max-w-[340px] text-[11px] leading-[1.9] text-cream-100/75">
              Soft layers, grounded tones and pieces made to be worn on repeat — from first
              coffee to last light.
            </p>
            <span className="mt-6 inline-flex items-center gap-2.5 border-b border-cream-50/50 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-50 transition-colors group-hover:border-gold-400 group-hover:text-gold-300">
              Discover the collection <ArrowRight size={14} />
            </span>
            <span className="mt-8 flex items-center gap-2" aria-hidden="true">
              <span className="h-0.5 w-7 bg-cream-50" />
              <span className="h-0.5 w-7 bg-cream-50/30" />
              <span className="h-0.5 w-7 bg-cream-50/30" />
            </span>
          </motion.div>
        </Link>

        <div className="grid gap-3">
          <PromoTile
            category="Shoes"
            label="Shoes"
            title="Grounded in comfort."
            note="Everyday pairs, quietly elevated."
            image="https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=1000&q=85"
            imageAlt="A clean everyday sneaker"
            background="bg-[#f1e4d6]"
            scrim="from-[#f1e4d6] via-[#f1e4d6]/85"
            badge="New in"
            className="min-h-[220px] sm:min-h-[250px] lg:min-h-[290px]"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <PromoTile
              category="Women"
              label="Women"
              title="Softly structured."
              image="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85"
              imageAlt="A woman in a structured neutral outfit"
              background="bg-[#e9eee7]"
              scrim="from-[#e9eee7] via-[#e9eee7]/85"
              compact
              className="min-h-[195px] lg:min-h-[245px]"
            />
            <PromoTile
              category="Accessories"
              label="Accessories"
              title="The finishing touch."
              image="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85"
              imageAlt="A leather handbag"
              background="bg-[#f3ead9]"
              scrim="from-[#f3ead9] via-[#f3ead9]/85"
              compact
              className="min-h-[195px] lg:min-h-[245px]"
            />
          </div>
        </div>
      </motion.div>

      <Reveal className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-navy-900/10 pt-5">
        <span className="text-[8px] uppercase tracking-[0.16em] text-navy-900/40">
          CURATED FOR THE SEASON
        </span>
        <Link to="/shop" className={textLink}>
          Browse everything <ArrowRight size={15} />
        </Link>
      </Reveal>
    </section>
  );
}
