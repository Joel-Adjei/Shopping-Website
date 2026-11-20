import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { accentText, eyebrow, focusRing, textLink } from "../lib/ui";
import { useCatalogStore } from "../stores/useCatalogStore";
import { money } from "../util/export";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85";

// Center-peek product spotlight. Slides scroll natively with snap points so
// touch, trackpad and the arrow buttons all stay in sync.
export default function SpotlightCarousel() {
  const products = useCatalogStore((state) => state.products);
  const categoryNames = useCatalogStore((state) => state.categoryNames);

  const featured = products.filter((product) => product.is_featured);
  const rest = products.filter((product) => !product.is_featured);
  const items = [...featured, ...rest].slice(0, 5);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const center = useCallback((index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const slide = viewport.children[index] as HTMLElement | undefined;
    if (!slide) return;
    const slideRect = slide.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const delta = slideRect.left + slideRect.width / 2 - (viewportRect.left + viewportRect.width / 2);
    viewport.scrollTo({ left: viewport.scrollLeft + delta, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onScroll = () => {
      const viewportRect = viewport.getBoundingClientRect();
      const middle = viewportRect.left + viewportRect.width / 2;
      let nearest = 0;
      let best = Number.POSITIVE_INFINITY;
      Array.from(viewport.children).forEach((child, index) => {
        const rect = (child as HTMLElement).getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - middle);
        if (distance < best) {
          best = distance;
          nearest = index;
        }
      });
      setActive(nearest);
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    const frame = requestAnimationFrame(() => center(0));
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", onScroll);
    };
  }, [center, items.length]);

  if (!items.length) return null;

  const step = (direction: number) => {
    const next = (active + direction + items.length) % items.length;
    setActive(next);
    center(next);
  };

  return (
    <section className="px-5 pb-4 pt-14 sm:px-[4%] sm:pt-16 lg:px-[5.4%] lg:pt-20">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className={eyebrow}>IN THE SPOTLIGHT</span>
          <h2 className="mt-3 font-serif text-[clamp(2rem,3.6vw,2.8rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-navy-900">
            The pieces <em className={accentText}>to know.</em>
          </h2>
        </div>
        <Link to="/shop" className={`${textLink} self-start sm:self-auto`}>
          Shop the collection <ArrowRight size={15} />
        </Link>
      </div>

      <div className="relative">
        {items.length > 1 && (
          <>
            <button
              type="button"
              className={`absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream-50/95 text-navy-900 shadow-[0_10px_30px_-12px_rgba(7,26,46,0.65)] backdrop-blur-sm transition-colors hover:bg-gold-300 sm:left-6 sm:h-11 sm:w-11 ${focusRing}`}
              onClick={() => step(-1)}
              aria-label="Previous spotlight piece"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              className={`absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream-50/95 text-navy-900 shadow-[0_10px_30px_-12px_rgba(7,26,46,0.65)] backdrop-blur-sm transition-colors hover:bg-gold-300 sm:right-6 sm:h-11 sm:w-11 ${focusRing}`}
              onClick={() => step(1)}
              aria-label="Next spotlight piece"
            >
              <ChevronRight size={19} />
            </button>
          </>
        )}

        <div
          ref={viewportRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[7%] pb-2 [scrollbar-width:none] sm:gap-4 sm:px-[13%] lg:px-[16%] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-roledescription="carousel"
          aria-label="Featured pieces"
        >
          {items.map((product) => {
            const image = product.images?.[0] || product.image_url || FALLBACK_IMAGE;
            const category = product.category_id
              ? categoryNames[product.category_id] ?? null
              : null;
            return (
              <div
                key={product.id}
                className="relative h-[380px] shrink-0 basis-[86%] snap-center overflow-hidden rounded-sm border border-navy-900/10 bg-navy-950 sm:h-[430px] sm:basis-[74%] lg:h-[470px] lg:basis-[68%]"
              >
                <img
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  src={image}
                  alt={product.name}
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-950/90 via-navy-950/35 to-navy-950/10" />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-navy-950/70 via-transparent to-transparent" />

                <Link
                  to={`/product/${product.slug}`}
                  className={`absolute inset-0 z-10 flex flex-col justify-end p-5 text-cream-50 sm:p-8 ${focusRing}`}
                >
                  <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gold-300">
                    {category ?? "A considered piece"}
                  </span>
                  <h3 className="mt-3 max-w-[520px] font-serif text-[clamp(1.9rem,4vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
                    {product.name}
                  </h3>
                  <p className="mt-3 hidden max-w-[420px] text-[11.5px] leading-[1.85] text-cream-100/70 sm:line-clamp-2">
                    {product.description ?? "Chosen for the way it moves through your week."}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <span className="inline-flex h-11 items-center gap-3 bg-cream-50 px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-950 transition-colors duration-300 hover:bg-gold-300">
                      Shop now <ArrowRight size={14} />
                    </span>
                    <span className="flex items-baseline gap-2 text-[12px]">
                      <strong className="font-medium">{money(product.price)}</strong>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <del className="text-[10px] text-cream-200/50">
                          {money(product.compare_at_price)}
                        </del>
                      )}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {items.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
            {items.map((product, index) => (
              <span
                key={product.id}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === active ? "w-6 bg-gold-500" : "w-2.5 bg-navy-900/15"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
