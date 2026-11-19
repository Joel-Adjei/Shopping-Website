import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { eyebrow, eyebrowLine, focusRing, textLink } from "../lib/ui";
import { useCatalogStore } from "../stores/useCatalogStore";
import { money } from "../util/export";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80";

const starField = {
  backgroundImage: [
    "radial-gradient(circle at 12% 22%, rgba(255,255,255,0.55) 0 1px, transparent 1.6px)",
    "radial-gradient(circle at 68% 72%, rgba(255,255,255,0.35) 0 1px, transparent 1.4px)",
    "radial-gradient(circle at 85% 18%, rgba(255,255,255,0.5) 0 1px, transparent 1.5px)",
    "radial-gradient(circle at 40% 88%, rgba(255,255,255,0.3) 0 1px, transparent 1.4px)",
  ].join(", "),
  backgroundSize: "240px 200px, 320px 260px, 200px 220px, 280px 240px",
};

const msUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};

const pad = (value: number) => String(value).padStart(2, "0");

export default function DealsOfTheDay() {
  const products = useCatalogStore((state) => state.products);
  const categoryNames = useCatalogStore((state) => state.categoryNames);
  const railRef = useRef<HTMLDivElement>(null);
  const [remaining, setRemaining] = useState(msUntilMidnight);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(msUntilMidnight()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const items = useMemo(() => {
    const onSale = products.filter(
      (product) => product.compare_at_price !== null && product.compare_at_price > product.price,
    );
    const remainingProducts = products.filter(
      (product) => !(product.compare_at_price !== null && product.compare_at_price > product.price),
    );
    return [...onSale, ...remainingProducts].slice(0, 8);
  }, [products]);

  if (!items.length) return null;

  const seconds = Math.max(0, Math.floor(remaining / 1000));
  const time = [
    { value: pad(Math.floor(seconds / 3600)), label: "hrs" },
    { value: pad(Math.floor((seconds % 3600) / 60)), label: "min" },
    { value: pad(seconds % 60), label: "sec" },
  ];

  const scrollRail = (direction: number) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(220, rail.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-navy-950 py-14 text-cream-100 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-80" style={starField} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(188,153,69,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(42,79,62,0.28),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-[4%] lg:px-[5.4%]">
        <div className="flex flex-col gap-9 lg:flex-row lg:items-center lg:gap-10">
          <div className="shrink-0 lg:w-[245px]">
            <span className={`${eyebrow} text-gold-300`}>
              <span className={eyebrowLine} />
              TODAY ONLY
            </span>
            <h2 className="mt-4 font-serif text-[clamp(2.2rem,4.4vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-cream-50">
              Deals of the{" "}
              <em className="font-hero font-normal italic text-gold-300">day.</em>
            </h2>

            <div className="mt-5 flex items-center gap-1.5" role="timer" aria-label="Time left today">
              {time.map((unit, index) => (
                <div key={unit.label} className="flex items-center gap-1.5">
                  {index > 0 && <span className="pb-3 text-[15px] text-gold-400/70">:</span>}
                  <div className="min-w-[46px] rounded-sm border border-white/10 bg-white/5 px-2 py-2 text-center backdrop-blur-sm">
                    <span className="block text-[19px] font-semibold leading-none tabular-nums text-cream-50">
                      {unit.value}
                    </span>
                    <span className="mt-1 block text-[7px] uppercase tracking-[0.18em] text-cream-200/45">
                      {unit.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 max-w-[240px] text-[10.5px] leading-[1.85] text-cream-200/55">
              A short list of pieces at their best price. When the clock resets, so does the edit.
            </p>

            <Link
              to="/shop"
              className={`${textLink} mt-5 border-gold-400/40 text-cream-100 hover:border-gold-300 hover:text-gold-200`}
            >
              Shop all pieces <ArrowRight size={14} />
            </Link>
          </div>

          <div className="relative min-w-0 flex-1">
            {items.length > 2 && (
              <>
                <button
                  type="button"
                  className={`absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream-50 text-navy-950 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.6)] transition-colors hover:bg-gold-300 sm:grid ${focusRing}`}
                  onClick={() => scrollRail(-1)}
                  aria-label="Scroll deals left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className={`absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream-50 text-navy-950 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.6)] transition-colors hover:bg-gold-300 sm:grid ${focusRing}`}
                  onClick={() => scrollRail(1)}
                  aria-label="Scroll deals right"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            <div
              ref={railRef}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((product) => {
                const image = product.images?.[0] || product.image_url || FALLBACK_IMAGE;
                const category = product.category_id
                  ? categoryNames[product.category_id] ?? null
                  : null;
                const discount =
                  product.compare_at_price && product.compare_at_price > product.price
                    ? Math.round((1 - product.price / product.compare_at_price) * 100)
                    : null;

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    className={`group w-[174px] shrink-0 snap-start rounded-sm bg-cream-50 p-2.5 text-navy-900 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.85)] transition-transform duration-300 hover:-translate-y-1 sm:w-[196px] ${focusRing}`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-sm bg-cream-200">
                      <img
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={image}
                        alt={product.name}
                      />
                      {discount !== null && (
                        <span className="absolute left-2 top-2 bg-forest-700 px-1.5 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-cream-50">
                          −{discount}%
                        </span>
                      )}
                    </div>
                    <div className="px-0.5 pb-1 pt-3">
                      <p className="truncate text-[11px] font-medium text-navy-900" title={product.name}>
                        {product.name}
                      </p>
                      <p className="mt-1 line-clamp-2 min-h-[25px] text-[8.5px] leading-relaxed text-navy-900/45">
                        {product.description ?? category ?? "A considered piece"}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                        <strong className="text-[10.5px] font-semibold tabular-nums text-navy-900">
                          {money(product.price)}
                        </strong>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <del className="text-[8px] tabular-nums text-navy-900/40">
                            {money(product.compare_at_price)}
                          </del>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
