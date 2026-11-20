import { ArrowRight, Package, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import NewsletterSection from "../components/NewsletterSection";
import PersonaliseSection from "../components/PersonaliseSection";
import CustomisationSpotlight from "../components/CustomisationSpotlight";
import SpotlightCarousel from "../components/SpotlightCarousel";
import ProductCard from "../components/ProductCard";
import PromoBento from "../components/PromoBento";
import Reveal from "../components/Reveal";
import { useCatalogStore } from "../stores/useCatalogStore";
import HeroCarousel from "../components/HeroCarousel";
import { accentText, eyebrow, sectionTitle, textLink } from "../lib/ui";

const trustItems = [
  { icon: Sparkles, label: "Considered essentials" },
  { icon: ShieldCheck, label: "Quality over quantity" },
  { icon: Package, label: "Delivery across Ghana" },
];

export default function HomePage() {
  const products = useCatalogStore((state) => state.products);
  const featured = products.filter((product) => product.is_featured);
  const picks = (featured.length ? featured : products).slice(0, 3);

  return (
    <main>
      <HeroCarousel />

      <motion.section
        className="mx-5 grid gap-3 border-y border-navy-900/10 bg-white/40 py-5 backdrop-blur-sm sm:mx-[4%] sm:grid-cols-3 sm:gap-4 lg:mx-[5.4%]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
      >
        {trustItems.map(({ icon: Icon, label }) => (
          <motion.div
            key={label}
            className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.1em] text-navy-900/60 sm:justify-center"
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-gold-100 to-cream-200 text-gold-600">
              <Icon size={15} />
            </span>
            <span>{label}</span>
          </motion.div>
        ))}
      </motion.section>

      <PromoBento />

      <SpotlightCarousel />

      <section className="px-5 py-16 sm:px-[4%] sm:py-20 lg:px-[5.4%] lg:py-28">
        <Reveal className="mb-9 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className={eyebrow}>A WARDROBE, REFINED</span>
            <h2 className={sectionTitle}>
              Pieces to <em className={accentText}>keep.</em>
            </h2>
          </div>
          <p className="max-w-[240px] text-[11px] leading-relaxed text-navy-900/50">
            Designed to move with you. Chosen to stay with you.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-4 md:grid-cols-3 md:gap-x-[18px] md:gap-y-[42px]">
          {picks.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
        <Reveal className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-navy-900/10 pt-5 sm:mt-14">
          <span className="text-[7px] uppercase tracking-[0.16em] text-navy-900/40 sm:text-[8px]">
            A FEW OF OUR FAVOURITES
          </span>
          <Link to="/shop" className={textLink}>
            Shop the full collection <ArrowRight size={15} />
          </Link>
        </Reveal>
      </section>

      <CustomisationSpotlight />

      <PersonaliseSection />

      <NewsletterSection />
    </main>
  );
}
