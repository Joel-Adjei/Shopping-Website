import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { btnPrimary, displayTitle, eyebrow, eyebrowLine } from "../lib/ui";

const EASE = [0.22, 0.61, 0.36, 1] as const;

const heroSlides = [
  {
    kicker: "STEP INTO YOUR STYLE",
    title: (
      <>
        Every step
        <br />
        <em>starts with you.</em>
      </>
    ),
    body: "Discover shoes and fashion pieces that bring comfort, confidence and personality to every moment.",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1500&q=90",
    label: "THE EVERYDAY EDIT",
    count: "01 / 03",
  },
  {
    kicker: "MADE TO MAKE AN IMPRESSION",
    title: (
      <>
        Walk bold.
        <br />
        <em>Live beautifully.</em>
      </>
    ),
    body: "From everyday essentials to statement looks, find pieces that make every outfit feel intentional.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1500&q=90",
    label: "THE STATEMENT EDIT",
    count: "02 / 03",
  },
  {
    kicker: "YOUR STYLE, YOUR STORY",
    title: (
      <>
        Find your
        <br />
        <em>next favourite.</em>
      </>
    ),
    body: "Explore a collection curated for your pace, your plans and the way you want to show up.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1500&q=90",
    label: "NEW SEASON FINDS",
    count: "03 / 03",
  },
];

function HeroCarousel() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % heroSlides.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const slide = heroSlides[active];
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-cream-100 via-cream-50 to-cream-200 px-5 pb-12 pt-7 sm:px-[4%] sm:pb-14 lg:px-[5.4%] lg:pb-16 lg:pt-9">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-gold-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-forest-500/10 blur-3xl" />
      <div className="relative grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-[6%]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`copy-${active}`}
            className="relative z-10 max-w-[460px] py-5 lg:py-4"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className={eyebrow}>
              <span className={eyebrowLine} />
              {slide.kicker}
            </div>
            <h1 className={`${displayTitle} my-5 sm:my-6`}>{slide.title}</h1>
            <p className="mb-7 max-w-[360px] text-[12px] leading-[1.95] text-navy-900/65 sm:mb-8 sm:text-[13px]">
              {slide.body}
            </p>
            <Link className={btnPrimary} to="/#shop">
              Shop the collection <ArrowRight size={16} />
            </Link>
            <div className="mt-9 flex flex-wrap items-center gap-3 text-[8px] uppercase tracking-[0.16em] text-navy-900/40 sm:mt-12">
              <span className="text-navy-900/70">{slide.count}</span>
              <span className="h-px w-9 bg-linear-to-r from-gold-500 to-navy-900/10" />
              <span>{slide.label}</span>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="relative h-[340px] overflow-hidden rounded-sm bg-cream-300 shadow-[0_40px_90px_-50px_rgba(10,36,61,0.65)] sm:h-[420px] lg:h-[52vw] lg:max-h-[670px] lg:min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.img
              key={slide.image}
              className="absolute inset-0 h-full w-full object-cover object-center saturate-[0.9]"
              src={slide.image}
              alt={slide.label}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.6 },
                scale: { duration: 6.4, ease: "linear" },
              }}
            />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-950/60 via-navy-950/5 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-navy-950/25 to-transparent" />
          <div className="absolute inset-x-5 bottom-4 z-10 flex justify-between text-[8px] uppercase tracking-[0.15em] text-cream-50/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.45)]">
            <span>{slide.label}</span>
            <span className="hidden sm:inline">Stylish Steps Collection</span>
          </div>
          <motion.div
            className="absolute right-4 top-4 z-10 flex h-[72px] w-[72px] flex-col items-center justify-center gap-1 rounded-full border border-cream-50/45 bg-navy-950/15 text-[7px] uppercase tracking-[0.16em] text-cream-50 backdrop-blur-sm lg:h-[86px] lg:w-[86px]"
            initial={{ opacity: 0, rotate: -14 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          >
            <span className="font-semibold tracking-[0.2em]">SSC</span>
            <span className="text-[23px] leading-none text-gold-300">✳</span>
            <span className="text-[6px] sm:text-[7px]">STYLE · COMFORT</span>
          </motion.div>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-2" aria-label="Choose hero slide">
            {heroSlides.map((item, index) => (
              <button
                key={item.label}
                className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 ${
                  index === active ? "w-7 bg-gold-400" : "w-2.5 bg-cream-50/50 hover:bg-cream-50/80"
                }`}
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
