import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "../stores/useUIStore";
import { accentText, eyebrow, eyebrowLine } from "../lib/ui";

const EASE = [0.22, 0.61, 0.36, 1] as const;

export default function NewsletterSection() {
  const showToast = useUIStore((state) => state.showToast);

  return (
    <motion.section
      className="relative mx-5 my-10 overflow-hidden rounded-sm border border-gold-500/20 bg-linear-to-br from-cream-200 via-gold-100 to-cream-300 px-6 py-14 sm:mx-[4%] lg:mx-[5.4%] lg:px-[8%] lg:py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
          }}
        >
          <span className={eyebrow}>
            <span className={eyebrowLine} />A NOTE FROM SSC
          </span>
          <h2 className="mt-4 font-serif text-[clamp(2.4rem,4.5vw,3.2rem)] font-normal leading-[1.08] tracking-[-0.04em] text-navy-900">
            Good things,
            <br />
            <em className={accentText}>occasionally.</em>
          </h2>
        </motion.div>
        <motion.form
          className="flex w-full max-w-[410px] flex-col gap-3"
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
          }}
          onSubmit={(e) => {
            e.preventDefault();
            showToast(
              "You’re on the list",
              "Newsletter signup will be connected to your backend before launch.",
            );
          }}
        >
          <label htmlFor="newsletter-email" className="text-[11px] leading-relaxed text-navy-900/60">
            Thoughtful updates, new arrivals and a little inspiration.
          </label>
          <div className="flex border-b border-navy-900/25 transition-colors focus-within:border-forest-700">
            <input
              id="newsletter-email"
              className="min-w-0 flex-1 bg-transparent py-3.5 text-[12px] text-navy-900 outline-none placeholder:text-navy-900/35"
              type="email"
              placeholder="Your email address"
              required
            />
            <button
              className="group grid w-10 place-items-center text-navy-900 transition-colors hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
              aria-label="Subscribe"
            >
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
          <small className="text-[9px] leading-relaxed text-navy-900/40">
            By subscribing, you agree to receive occasional emails from Stylish
            Steps Collection.
          </small>
        </motion.form>
      </div>
    </motion.section>
  );
}
