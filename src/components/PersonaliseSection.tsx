import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import { useCatalogStore } from "../stores/useCatalogStore";
import { useShopFilterStore } from "../stores/useShopFilterStore";
import { accentText, eyebrow, sectionTitle, textLink } from "../lib/ui";

const EASE = [0.22, 0.61, 0.36, 1] as const;

const pieces = [
  {
    name: "Bracelets",
    term: "bracelet",
    note: "Engraved with a name, date or short message.",
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=85",
    alt: "A fine bracelet worn on the wrist",
  },
  {
    name: "Suits",
    term: "suit",
    note: "Tailored to your fit, finished with your initials.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
    alt: "A well-tailored suit",
  },
  {
    name: "Caps",
    term: "cap",
    note: "Initials or a word, embroidered front and centre.",
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=85",
    alt: "A plain cap ready for personalisation",
  },
  {
    name: "Diaries",
    term: "diary",
    note: "A monogram for the pages you keep close.",
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=85",
    alt: "A bound diary and pen",
  },
  {
    name: "Bottles",
    term: "bottle",
    note: "Named for whoever carries it, engraved to last.",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=85",
    alt: "A reusable bottle",
  },
];

export default function PersonaliseSection() {
  const products = useCatalogStore((state) => state.products);
  const setSearch = useShopFilterStore((state) => state.setSearch);
  const resetFilters = useShopFilterStore((state) => state.reset);

  // Start from a clean shop view so old facets can't hide the pieces we're linking to.
  const openPiece = (term: string) => {
    resetFilters();
    const hasMatches = products.some((product) => product.name.toLowerCase().includes(term));
    setSearch(hasMatches ? term : "");
  };

  return (
    <section className="px-5 py-16 sm:px-[4%] sm:py-20 lg:px-[5.4%] lg:py-24">
      <Reveal className="mb-9 flex flex-col gap-4 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className={eyebrow}>MADE PERSONAL</span>
          <h2 className={sectionTitle}>
            Yours, down to the <em className={accentText}>detail.</em>
          </h2>
        </div>
        <div className="max-w-[300px]">
          <p className="text-[11px] leading-relaxed text-navy-900/50">
            Bracelets, suits, caps, diaries and bottles — add a name, initials or a message and
            we finish the piece to order.
          </p>
          <Link
            to="/shop"
            className={`${textLink} mt-4`}
            onClick={resetFilters}
          >
            Shop personalisable pieces <ArrowRight size={15} />
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-4">
        {pieces.map((piece, index) => (
          <motion.article
            key={piece.name}
            className="min-w-0"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: Math.min(index * 0.07, 0.28), ease: EASE }}
          >
            <Link
              to="/shop"
              onClick={() => openPiece(piece.term)}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500"
              aria-label={`Shop customisable ${piece.name.toLowerCase()}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream-200 ring-1 ring-transparent transition-all duration-300 group-hover:ring-gold-500/40">
                <img
                  src={piece.image}
                  alt={piece.alt}
                  className="h-full w-full object-cover saturate-[0.9] transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <div className="tone-dark pointer-events-none absolute inset-0 bg-linear-to-t from-navy-950/35 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-cream-50/92 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-navy-900 shadow-sm backdrop-blur-sm">
                  <Sparkles size={10} className="text-gold-600" />
                  Customisable
                </span>
                <span className="absolute bottom-3 right-3 grid h-8 w-8 translate-y-1.5 place-items-center rounded-full bg-cream-50 text-navy-900 opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight size={14} />
                </span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif text-[17px] font-semibold leading-snug text-navy-900">
                    {piece.name}
                  </h3>
                  <p className="mt-1 text-[10px] leading-relaxed text-navy-900/50">{piece.note}</p>
                </div>
                <span className="pt-1 text-[8px] tabular-nums tracking-[0.14em] text-navy-900/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      <Reveal className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-navy-900/10 pt-5">
        <span className="text-[8px] uppercase tracking-[0.16em] text-navy-900/40">
          FINISHED TO ORDER · ALLOW 3–5 WORKING DAYS
        </span>
        <Link
          to="/shop"
          className={textLink}
          onClick={resetFilters}
        >
          Browse the collection <ArrowRight size={15} />
        </Link>
      </Reveal>
    </section>
  );
}
