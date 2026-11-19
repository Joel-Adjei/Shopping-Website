import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Gift,
  Instagram,
  MessageCircle,
  Music2,
  Package,
  PenLine,
  Phone,
  Scissors,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from "../lib/config";
import { normalizeWhatsAppNumber } from "../lib/whatsapp";
import { useStoreSettingsStore } from "../stores/useStoreSettingsStore";
import { money } from "../util/export";
import {
  accentText,
  btnGold,
  btnPrimary,
  displayTitle,
  eyebrow,
  eyebrowLine,
  focusRing,
  panel,
  sectionTitle,
} from "../lib/ui";

const EASE = [0.22, 0.61, 0.36, 1] as const;

function socialHandle(url: string | null): string | null {
  if (!url) return null;
  const segment = url.replace(/\/+$/, "").split("/").filter(Boolean).pop();
  return segment ? `@${segment.replace(/^@/, "")}` : null;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const riseIn = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const collections = [
  { name: "Suits", note: "Tailored two- and three-piece" },
  { name: "Dresses", note: "Cut to your measurements" },
  { name: "T-shirts", note: "Printed or embroidered" },
  { name: "Men’s shoes", note: "Leather, polished and ready" },
  { name: "Leather bags", note: "Embossed with your name" },
  { name: "Caps", note: "Logos stitched to order" },
  { name: "Bracelets", note: "Engraved by hand" },
  { name: "Necklaces", note: "Personalised pendants" },
  { name: "Watches", note: "Your name on the dial" },
  { name: "Diaries & bottles", note: "Gift-ready engraving" },
  { name: "Any customisation", note: "Send us the idea" },
  { name: "Many more", note: "Ask what we can make" },
];

const customOptions = [
  {
    icon: PenLine,
    title: "Names & initials",
    text: "Embossed, engraved or embroidered onto leather, caps, watches, diaries and bottles.",
  },
  {
    icon: Scissors,
    title: "Made to fit",
    text: "Suits and dresses cut to your measurements, then finished with the details you choose.",
  },
  {
    icon: Gift,
    title: "Gifts & team orders",
    text: "Curated boxes, bulk pieces and corporate gifts, each one personalised for the person receiving it.",
  },
];

const steps = [
  {
    icon: MessageCircle,
    title: "Tell us your idea",
    text: "Send a reference, a name or a logo. We confirm the piece, the finish and the price.",
  },
  {
    icon: ShieldCheck,
    title: "Check out simply",
    text: "Pay on delivery, or by Mobile Money — we’ll contact you with instructions.",
  },
  {
    icon: Package,
    title: "Delivered to you",
    text: `Delivery across Ghana. Complimentary over ${money(FREE_DELIVERY_THRESHOLD).replace(".00", "")}, otherwise ${money(STANDARD_DELIVERY_FEE).replace(".00", "")}.`,
  },
];

const gallery = [
  {
    src: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
    alt: "Tailored blazer from the collection",
    label: "Tailoring",
  },
  {
    src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    alt: "Essential cotton t-shirt from the collection",
    label: "T-shirts",
  },
  {
    src: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
    alt: "Leather bag from the collection",
    label: "Leather goods",
  },
  {
    src: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=900&q=85",
    alt: "Classic leather shoes from the collection",
    label: "Shoes",
  },
];

export default function AboutPage() {
  const settings = useStoreSettingsStore((state) => state.settings);
  const whatsappDigits = normalizeWhatsAppNumber(settings.whatsapp_number);
  const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}` : null;
  const phoneDisplay = settings.contact_phone || (whatsappDigits ? `+${whatsappDigits}` : "");
  const instagramHandle = socialHandle(settings.instagram_url);
  const tiktokHandle = socialHandle(settings.tiktok_url);

  return (
    <main>
      <section className="relative overflow-hidden bg-linear-to-b from-cream-50 via-cream-100 to-cream-100 px-5 pb-16 pt-16 sm:px-[4%] sm:pb-20 sm:pt-20 lg:px-[5.4%] lg:pb-24 lg:pt-24">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-gold-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-forest-600/10 blur-3xl" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <span className={eyebrow}>
                <span className={eyebrowLine} />
                STYLISH STEPS COLLECTION
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className={`${displayTitle} my-6`}>
                Collection.
                <br />
                Customised.
                <br />
                <em className={accentText}>Yours.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="max-w-[520px] text-[13px] leading-[1.95] text-navy-900/60">
                A Ghanaian fashion and accessories house for people who want
                their pieces to feel personal. Tailored suits and dresses,
                leather goods, watches, jewellery, gifts and everyday
                essentials — finished with your name, your brand or your idea.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Based in Accra", "Made to order", "Name & logo personalisation", "Nationwide delivery"].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1.5 rounded-full border border-navy-900/10 bg-white/60 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-navy-800/75 backdrop-blur-sm"
                    >
                      <Sparkles size={11} className="text-gold-600" />
                      {chip}
                    </span>
                  ),
                )}
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link to="/shop" className={btnPrimary}>
                  Shop the collection <ArrowRight size={16} />
                </Link>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`group inline-flex items-center gap-2 border-b border-gold-500/50 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-800 transition-colors hover:border-forest-700 hover:text-forest-700 ${focusRing}`}
                  >
                    Start a custom order <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 rounded-sm bg-linear-to-br from-gold-200/50 via-transparent to-forest-600/10 blur-xl" />
            <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
              {gallery.map((item, index) => (
                <motion.figure
                  key={item.label}
                  className={`group relative overflow-hidden bg-cream-300 ${
                    index % 2 === 1 ? "lg:translate-y-7" : ""
                  }`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.65, delay: index * 0.08, ease: EASE }}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="aspect-[3/4] w-full object-cover saturate-[0.82] transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-950/55 via-navy-950/5 to-transparent" />
                  <figcaption className="absolute inset-x-3 bottom-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-cream-100 sm:inset-x-4 sm:bottom-4">
                    {item.label}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
            <span className="absolute -bottom-5 left-1/2 hidden -translate-x-1/2 rotate-[-2deg] rounded-full bg-navy-900 px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-300 shadow-[0_18px_40px_-20px_rgba(10,36,61,0.9)] lg:inline-flex">
              Collection / Customize
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-[4%] sm:py-20 lg:px-[5.4%] lg:py-24">
        <Reveal className="mb-9 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className={eyebrow}>WHAT WE MAKE</span>
            <h2 className={sectionTitle}>
              An edit — plus anything <em className={accentText}>you can imagine.</em>
            </h2>
          </div>
          <p className="max-w-[260px] text-[11px] leading-relaxed text-navy-900/50">
            From the boardroom to the weekend, and from a single gift to a full
            team order.
          </p>
        </Reveal>

        <motion.div
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {collections.map((item) => (
            <motion.article
              key={item.name}
              variants={riseIn}
              className={`${panel} group relative overflow-hidden px-4 py-5 sm:px-5 sm:py-6`}
            >
              <span className="absolute inset-x-0 top-0 h-[2px] bg-linear-to-r from-gold-600 via-gold-400 to-forest-600 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
              <h3 className="font-serif text-[19px] font-normal leading-tight tracking-[-0.02em] text-navy-900 sm:text-[21px]">
                {item.name}
              </h3>
              <p className="mt-2 text-[9.5px] leading-relaxed text-navy-900/55 sm:text-[10px]">{item.note}</p>
            </motion.article>
          ))}
        </motion.div>

        <Reveal className="mt-6">
          <div className="relative overflow-hidden rounded-sm bg-linear-to-r from-navy-950 via-navy-900 to-forest-900 px-5 py-6 text-cream-100 sm:px-7 sm:py-7">
            <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-gold-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold-300">
                  ANY CUSTOMISATION
                </span>
                <p className="mt-2 max-w-[440px] font-serif text-[20px] leading-snug text-cream-50 sm:text-[23px]">
                  Have something else in mind? Send a reference and we’ll make it.
                </p>
              </div>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${btnGold} shrink-0 ${focusRing}`}
                >
                  Talk to us <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="grid lg:grid-cols-2">
        <motion.div
          className="relative overflow-hidden bg-linear-to-br from-navy-950 via-navy-900 to-forest-900 px-6 py-16 text-cream-100 sm:px-[8%] lg:px-[11%] lg:py-20"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />
          <div className="relative z-10">
            <span className={`${eyebrow} text-gold-300`}>THE CUSTOMIZE PART</span>
            <h2 className="my-6 font-serif text-[clamp(2.4rem,4.8vw,3.8rem)] font-normal leading-[1.08] tracking-[-0.04em] text-cream-50">
              Your name, your brand,
              <br />
              <em className="bg-linear-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text font-normal italic text-transparent">
                your idea.
              </em>
            </h2>
            <p className="mb-8 max-w-[380px] text-[12px] leading-[2] text-cream-200/65">
              Personalisation is not an afterthought here — it is the point. A
              name pressed into leather, a monogram on a watch dial, a logo on a
              cap or a set made for your team. You choose the piece; we make it
              unmistakably yours.
            </p>
            <div className="flex flex-col gap-5">
              {customOptions.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold-400/30 bg-white/5 text-gold-300">
                    <Icon size={16} />
                  </span>
                  <div>
                    <h3 className="font-serif text-[18px] font-normal tracking-[-0.01em] text-cream-50">{title}</h3>
                    <p className="mt-1 max-w-[300px] text-[10.5px] leading-[1.8] text-cream-200/60">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={`group mt-8 inline-flex items-center gap-2.5 border-b border-gold-400/45 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-100 transition-colors hover:border-gold-300 hover:text-gold-300 ${focusRing}`}
              >
                Send your idea on WhatsApp <ArrowUpRight size={16} />
              </a>
            )}
          </div>
          <div className="pointer-events-none absolute -bottom-16 right-[8%] font-serif text-[230px] leading-none text-white/[0.04]">
            S.
          </div>
        </motion.div>

        <motion.div
          className="relative min-h-[340px] overflow-hidden bg-cream-300 sm:min-h-[440px] lg:min-h-[560px]"
          initial={{ opacity: 0, x: 26 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
        >
          <img
            className="h-full w-full object-cover saturate-[0.8]"
            src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85"
            alt="Leather bag prepared for personalisation"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-950/60 via-navy-950/5 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-7 sm:bottom-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-cream-50/95 px-4 py-2 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-navy-900 backdrop-blur-sm">
              <BadgeCheck size={13} className="text-forest-700" />
              Personalised in-house
            </span>
            <span className="hidden text-right font-serif text-[32px] italic leading-none text-cream-100/80 sm:block">
              Yours.
            </span>
          </div>
        </motion.div>
      </section>

      <section className="grid lg:grid-cols-2">
        <motion.div
          className="relative bg-linear-to-br from-cream-200 via-gold-100/70 to-cream-300 px-6 py-14 sm:px-[8%] lg:self-center lg:px-[11%] lg:py-16"
          initial={{ opacity: 0, x: -26 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className={eyebrow}>OUR STORY</span>
          <h2 className="mt-4 font-serif text-[clamp(2.3rem,4.6vw,3.6rem)] font-normal leading-[1.08] tracking-[-0.04em] text-navy-900">
            Started in Accra,
            <br />
            <em className={accentText}>made for you.</em>
          </h2>
          <p className="mt-5 max-w-[420px] text-[12px] leading-[2] text-navy-900/60">
            Stylish Steps Collection began with a simple belief: the pieces you
            wear should say something about you. So we built a house that pairs a
            considered collection — suits, dresses, tees, shoes, bags, caps,
            jewellery, watches and gifts — with the freedom to customise any of
            it.
          </p>
          <p className="mt-5 max-w-[420px] text-[12px] leading-[2] text-navy-900/60">
            Every order passes through our hands, from the fabric chosen to the
            name pressed into the leather. And when what you want isn’t in the
            collection, we make it from your idea.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-navy-800/60">
            <span className="inline-flex items-center gap-2">
              <PenLine size={13} className="text-gold-600" /> Names & logos
            </span>
            <span className="inline-flex items-center gap-2">
              <Scissors size={13} className="text-gold-600" /> Made to measure
            </span>
            <span className="inline-flex items-center gap-2">
              <Gift size={13} className="text-gold-600" /> Gift ready
            </span>
          </div>
        </motion.div>
        <motion.div
          className="relative min-h-[320px] overflow-hidden bg-cream-300 sm:min-h-[420px] lg:min-h-[480px]"
          initial={{ opacity: 0, x: 26 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
        >
          <img
            className="h-full w-full object-cover object-[center_35%] saturate-[0.75]"
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85"
            alt="Editorial fashion portrait in a tailored outfit"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-950/30 via-transparent to-transparent" />
        </motion.div>
      </section>

      <section className="px-5 pb-16 pt-16 sm:px-[4%] sm:pb-20 sm:pt-20 lg:px-[5.4%] lg:pb-20">
        <Reveal className="mb-9 flex flex-col gap-4 sm:mb-11">
          <div>
            <span className={eyebrow}>ORDERING WITH US</span>
            <h2 className={sectionTitle}>
              Easy from first message <em className={accentText}>to doorstep.</em>
            </h2>
          </div>
        </Reveal>
        <motion.div
          className="grid gap-8 sm:grid-cols-3 sm:gap-5"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {steps.map(({ icon: Icon, title, text }) => (
            <motion.div key={title} variants={riseIn}>
              <span className="block h-[2px] w-full bg-linear-to-r from-gold-600 via-gold-400 to-forest-600" />
              <div className="pt-5">
                <Icon size={20} className="text-gold-600" />
                <h3 className="mb-2.5 mt-4 font-serif text-[23px] font-normal tracking-[-0.02em] text-navy-900">
                  {title}
                </h3>
                <p className="text-[11px] leading-[1.9] text-navy-900/55">{text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Reveal className="relative mx-5 my-12 overflow-hidden rounded-sm bg-linear-to-br from-navy-950 via-navy-900 to-forest-900 px-6 py-16 text-center text-cream-100 sm:mx-[4%] lg:mx-[5.4%] lg:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="relative">
          <span className={`${eyebrow} justify-center text-gold-300`}>READY WHEN YOU ARE</span>
          <h2 className="mx-auto mt-4 max-w-[640px] font-serif text-[clamp(2.4rem,5vw,3.8rem)] font-normal leading-[1.08] tracking-[-0.04em] text-cream-50">
            Tell us what{" "}
            <em className="bg-linear-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text font-normal italic text-transparent">
              you have in mind.
            </em>
          </h2>
          <p className="mx-auto mt-5 max-w-[440px] text-[11.5px] leading-[1.9] text-cream-200/60">
            One message is all it takes. We’ll help with sizing, materials,
            personalisation and delivery.
          </p>

          <div className="mx-auto mt-8 grid max-w-[760px] gap-3 sm:grid-cols-3">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={`group flex flex-col items-center gap-2 rounded-sm border border-white/12 bg-white/5 px-4 py-5 transition-colors hover:border-gold-400/50 hover:bg-white/10 ${focusRing}`}
              >
                <MessageCircle size={18} className="text-gold-300" />
                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-cream-200/55">WhatsApp</span>
                <span className="text-[11px] text-cream-50">{phoneDisplay || "Message us"}</span>
              </a>
            )}
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer noopener"
                className={`group flex flex-col items-center gap-2 rounded-sm border border-white/12 bg-white/5 px-4 py-5 transition-colors hover:border-gold-400/50 hover:bg-white/10 ${focusRing}`}
              >
                <Instagram size={18} className="text-gold-300" />
                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-cream-200/55">Instagram</span>
                <span className="text-[11px] text-cream-50">{instagramHandle ?? "Follow us"}</span>
              </a>
            )}
            {settings.tiktok_url && (
              <a
                href={settings.tiktok_url}
                target="_blank"
                rel="noreferrer noopener"
                className={`group flex flex-col items-center gap-2 rounded-sm border border-white/12 bg-white/5 px-4 py-5 transition-colors hover:border-gold-400/50 hover:bg-white/10 ${focusRing}`}
              >
                <Music2 size={18} className="text-gold-300" />
                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-cream-200/55">TikTok</span>
                <span className="text-[11px] text-cream-50">{tiktokHandle ?? "Watch our clips"}</span>
              </a>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={btnGold}
              >
                <Phone size={15} /> Chat on WhatsApp
              </a>
            )}
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 border-b border-cream-100/30 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-100 transition-colors hover:border-gold-300 hover:text-gold-300"
            >
              Shop the collection <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
