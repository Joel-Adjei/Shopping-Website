import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { eyebrow, eyebrowLine, focusRing } from "../lib/ui";
import { useCatalogStore } from "../stores/useCatalogStore";
import { useShopFilterStore } from "../stores/useShopFilterStore";

const starField = {
  backgroundImage: [
    "radial-gradient(circle at 12% 22%, rgba(255,255,255,0.55) 0 1px, transparent 1.6px)",
    "radial-gradient(circle at 68% 72%, rgba(255,255,255,0.35) 0 1px, transparent 1.4px)",
    "radial-gradient(circle at 85% 18%, rgba(255,255,255,0.5) 0 1px, transparent 1.5px)",
    "radial-gradient(circle at 40% 88%, rgba(255,255,255,0.3) 0 1px, transparent 1.4px)",
  ].join(", "),
  backgroundSize: "240px 200px, 320px 260px, 200px 220px, 280px 240px",
};

const finishes = [
  {
    name: "Bracelets",
    term: "bracelet",
    technique: "Engraved by hand",
    note: "A name, a date or a few words, cut into metal that stays with you.",
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85",
    alt: "A fine bracelet resting on the wrist",
  },
  {
    name: "Caps",
    term: "cap",
    technique: "Embroidered to order",
    note: "Initials or a short word, stitched front and centre.",
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=85",
    alt: "A plain cap ready for embroidery",
  },
];

const steps = [
  {
    title: "Choose the piece",
    note: "Start with a bracelet or a cap from the collection.",
  },
  {
    title: "Add your words",
    note: "A name, initials, a date or a short message.",
  },
  {
    title: "We finish it by hand",
    note: "Engraved or embroidered to order, then checked before dispatch.",
  },
];

const primaryButton = `inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-cream-50 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-950 transition-colors hover:bg-gold-300 active:scale-[0.985] ${focusRing}`;
const secondaryButton = `inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-white/25 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cream-100 transition-colors hover:border-gold-300 hover:text-gold-200 ${focusRing}`;

export default function CustomisationSpotlight() {
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
    <section
      id="customise"
      className="relative overflow-hidden bg-navy-950 py-14 text-cream-100 sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-0 opacity-80" style={starField} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(188,153,69,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(42,79,62,0.28),transparent_60%)]" />

      <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-11 px-5 sm:px-[4%] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14 lg:px-[5.4%]">
        <div>
          <span className={`${eyebrow} text-gold-300`}>
            <span className={eyebrowLine} />
            THE PERSONAL EDIT
          </span>
          <h2 className="mt-4 max-w-[420px] font-serif text-[clamp(2.3rem,4.6vw,3.3rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-cream-50">
            Your mark,{" "}
            <em className="font-hero font-normal italic text-gold-300">made to last.</em>
          </h2>
          <p className="mt-5 max-w-[330px] text-[11.5px] leading-[1.85] text-cream-200/60">
            Engrave a bracelet with a name, date or a few words. Embroider a cap with your
            initials. Each piece is finished by hand and checked before it leaves the studio.
          </p>

          <ol className="mt-7 grid gap-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold-400/35 text-[9px] font-semibold tabular-nums text-gold-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-100">
                    {step.title}
                  </h3>
                  <p className="mt-1 max-w-[300px] text-[10px] leading-relaxed text-cream-200/50">
                    {step.note}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/shop" className={primaryButton} onClick={() => openPiece("bracelet")}>
              Shop customisable pieces <ArrowRight size={14} />
            </Link>
            <Link to="/contact" className={secondaryButton}>
              Ask about a custom order
            </Link>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {finishes.map((piece) => (
              <Link
                key={piece.name}
                to="/shop"
                onClick={() => openPiece(piece.term)}
                className={`group relative block overflow-hidden rounded-sm bg-navy-900 ring-1 ring-white/10 transition-shadow duration-300 hover:ring-gold-400/50 ${focusRing}`}
                aria-label={`Shop customisable ${piece.name.toLowerCase()}`}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    className="h-full w-full object-cover saturate-[0.9] transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    src={piece.image}
                    alt={piece.alt}
                    loading="lazy"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-950/90 via-navy-950/15 to-transparent" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-navy-950/55 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-gold-200 backdrop-blur-sm">
                  <Sparkles size={10} />
                  {piece.technique}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                  <h3 className="font-serif text-[19px] font-semibold leading-tight text-cream-50">
                    {piece.name}
                  </h3>
                  <p className="mt-1.5 text-[9.5px] leading-relaxed text-cream-200/65">
                    {piece.note}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-gold-300 transition-colors group-hover:text-gold-200">
                    Make it yours <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-10 w-full max-w-[1440px] px-5 sm:px-[4%] lg:px-[5.4%]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <span className="text-[8px] uppercase tracking-[0.16em] text-cream-200/40">
            NAMES · INITIALS · DATES · SHORT MESSAGES
          </span>
          <Link
            to="/shop"
            className={`group inline-flex items-center gap-2.5 border-b border-gold-400/40 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-100 transition-colors hover:border-gold-300 hover:text-gold-200 ${focusRing}`}
            onClick={resetFilters}
          >
            Browse the collection <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
