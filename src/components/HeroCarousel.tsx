import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const EASE = [0.22, 0.61, 0.36, 1] as const;

const heroSlides = [
  {
    kicker: "STEP INTO YOUR STYLE",
    title: (
      <>
        Every step
        <br />
        <em className="font-hero font-normal italic tracking-[-0.02em] text-gold-300">
          starts with you.
        </em>
      </>
    ),
    body: "Discover shoes and fashion pieces that bring comfort, confidence and personality to every moment.",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1900&q=90",
    label: "The everyday edit",
  },
  {
    kicker: "MADE TO MAKE AN IMPRESSION",
    title: (
      <>
        Walk bold.
        <br />
        <em className="font-hero font-normal italic tracking-[-0.02em] text-gold-300">
          Live beautifully.
        </em>
      </>
    ),
    body: "From everyday essentials to statement looks, find pieces that make every outfit feel intentional.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1900&q=90",
    label: "The statement edit",
  },
  {
    kicker: "YOUR STYLE, YOUR STORY",
    title: (
      <>
        Find your
        <br />
        <em className="font-hero font-normal italic tracking-[-0.02em] text-gold-300">
          next favourite.
        </em>
      </>
    ),
    body: "Explore a collection curated for your pace, your plans and the way you want to show up.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1900&q=90",
    label: "New season finds",
  },
];

const arrowButton =
  "absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/45 bg-navy-950/25 text-cream-50 backdrop-blur-md transition-colors duration-300 hover:bg-cream-50 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400 lg:grid";

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % heroSlides.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  const slide = heroSlides[active];

  const goTo = (index: number) =>
    setActive((index + heroSlides.length) % heroSlides.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="tone-dark relative isolate h-[calc(100svh-72px)] max-h-[860px] min-h-[560px] w-full overflow-hidden bg-navy-950 text-cream-50 sm:h-[calc(100svh-78px)] lg:h-[calc(100svh-86px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={slide.image}
          className="absolute inset-0 h-full w-full object-cover object-center"
          src={slide.image}
          alt={slide.label}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.7 },
            scale: { duration: 7, ease: "linear" },
          }}
        />
      </AnimatePresence>

      {/* Dark scrim keeps the copy readable over any photo. */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-navy-950/95 via-navy-950/60 to-navy-950/10" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-950/85 via-transparent to-navy-950/25" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] items-center px-5 sm:px-[4%] lg:px-[5.4%]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`copy-${active}`}
            className="max-w-[660px] pb-24 sm:pb-14 lg:pb-2"
            initial={reduceMotion ? false : { opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <span className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-300">
              <span className="inline-block h-px w-8 bg-linear-to-r from-gold-400 to-transparent" />
              {slide.kicker}
            </span>

            <h1 className="mt-5 text-[clamp(2.7rem,6.2vw,5.6rem)] font-semibold uppercase leading-[0.96] tracking-[-0.03em] text-cream-50 [text-shadow:0_2px_26px_rgba(7,26,46,0.45)]">
              {slide.title}
            </h1>

            <p className="mt-5 max-w-[430px] text-[14px] leading-[1.75] text-cream-100/75 sm:text-[15px]">
              {slide.body}
            </p>

            <Link
              to="/shop"
              className="group mt-8 inline-flex h-12 items-center justify-center gap-3 bg-cream-50 px-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-950 transition-colors duration-300 hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream-50"
            >
              Shop the collection
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        className={`${arrowButton} left-3`}
        aria-label="Previous slide"
        onClick={() => goTo(active - 1)}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        className={`${arrowButton} right-3`}
        aria-label="Next slide"
        onClick={() => goTo(active + 1)}
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-5 right-5 z-20 flex items-end gap-2 sm:bottom-7 sm:right-[4%] lg:bottom-8 lg:right-[5.4%]">
        <span className="mb-1 mr-1 hidden text-[10px] font-medium tabular-nums tracking-[0.22em] text-cream-100/60 sm:block">
          {String(active + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
        </span>
        {heroSlides.map((item, index) => (
          <button
            key={item.label}
            className={`relative h-14 w-11 overflow-hidden border-2 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 sm:h-[74px] sm:w-[58px] ${
              index === active
                ? "border-cream-50 opacity-100"
                : "border-white/20 opacity-50 hover:opacity-90"
            }`}
            aria-label={`Show slide ${index + 1}: ${item.label}`}
            aria-current={index === active}
            onClick={() => setActive(index)}
          >
            <img className="h-full w-full object-cover" src={item.image} alt="" />
          </button>
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
