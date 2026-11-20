import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Package,
  PenLine,
  Plus,
  ShieldCheck,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { MAX_CUSTOMIZATION_LENGTH } from "../lib/config";
import { isSupabaseConfigured } from "../lib/supabase";
import { buildProductEnquiryWhatsAppUrl } from "../lib/whatsapp";
import { normalizeCustomization, useCartStore } from "../stores/useCartStore";
import { useCatalogStore } from "../stores/useCatalogStore";
import { useReviewsStore } from "../stores/useReviewsStore";
import { useStoreSettingsStore } from "../stores/useStoreSettingsStore";
import { useUIStore } from "../stores/useUIStore";
import type { Product, ProductReview } from "../types";
import { money } from "../util/export";
import {
  accentText,
  btnPrimary,
  btnSecondary,
  cardTitle,
  eyebrow,
  fieldInput,
  fieldLabel,
  focusRing,
  panel,
  sectionTitle,
} from "../lib/ui";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85";

const EMPTY_REVIEWS: ProductReview[] = [];

const optionChip =
  "min-w-[46px] rounded-full border px-3.5 py-2.5 text-[10px] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500";

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          strokeWidth={1.5}
          className={star <= Math.round(value) ? "fill-gold-500 text-gold-500" : "text-navy-900/20"}
        />
      ))}
    </span>
  );
}

const formatReviewDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });


function ProductPage() {
  const { slug } = useParams();
  const products = useCatalogStore((state) => state.products);
  const hasFetched = useCatalogStore((state) => state.hasFetched);
  const product = products.find((p) => p.slug === slug);

  // A direct visit can arrive before the live catalogue has loaded.
  if (!product) {
    if (isSupabaseConfigured && !hasFetched) {
      return (
        <main className="flex min-h-[50vh] items-center justify-center px-5">
          <p className="text-[12px] text-navy-900/50">Loading the piece…</p>
        </main>
      );
    }
    return (
      <main className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden bg-linear-to-br from-cream-100 via-cream-50 to-cream-200 px-5 py-20 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300/25 blur-3xl" />
        <span className={`${eyebrow} relative`}>PIECE NOT FOUND</span>
        <h1 className="relative my-6 font-serif text-[clamp(3rem,7vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-navy-900">
          This piece has
          <br />
          <em className={accentText}>left the rack.</em>
        </h1>
        <Link to="/shop" className={`${btnPrimary} relative`}>
          Back to the collection <ArrowRight size={16} />
        </Link>
      </main>
    );
  }

  // Keyed by product so choices reset when moving between pieces.
  return <ProductDetails key={product.id} product={product} />;
}

function ProductDetails({ product }: { product: Product }) {
  const navigate = useNavigate();
  const products = useCatalogStore((state) => state.products);
  const categoryNames = useCatalogStore((state) => state.categoryNames);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);
  const showToast = useUIStore((state) => state.showToast);
  const settings = useStoreSettingsStore((state) => state.settings);
  const reviews = useReviewsStore((state) => state.byProduct[product.id]) ?? EMPTY_REVIEWS;
  const reviewsLoading = useReviewsStore((state) => state.loading[product.id]) ?? false;
  const reviewsError = useReviewsStore((state) => state.error[product.id]) ?? "";
  const loadReviews = useReviewsStore((state) => state.load);
  const addReview = useReviewsStore((state) => state.add);

  const sizes = product.sizes.length ? product.sizes : ["One size"];
  const colors = product.colors.length ? product.colors : ["Default"];
  const images = product.images?.length
    ? product.images
    : product.image_url
      ? [product.image_url]
      : [FALLBACK_IMAGE];
  const [size, setSize] = useState(sizes[0]);
  const [color, setColor] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState("");
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewFormError, setReviewFormError] = useState("");

  useEffect(() => {
    void loadReviews(product.id);
  }, [product.id, loadReviews]);

  const customizing = product.customization_enabled && customizationOpen;
  const customizationText = customizing ? normalizeCustomization(customization) : null;

  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviewCount
    : 0;

  const enquiryUrl = buildProductEnquiryWhatsAppUrl({
    productName: product.name,
    price: product.price,
    productUrl: `${window.location.origin}/product/${product.slug}`,
    size,
    color,
    customization: customizationText,
    whatsappNumber: settings.whatsapp_number,
  });

  const soldOut = product.stock_quantity <= 0;
  const maxQuantity = Math.max(1, Math.min(product.stock_quantity, 10));
  const category = product.category_id
    ? (categoryNames[product.category_id] ?? "")
    : "";
  const related = products
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 3);

  function addToBag() {
    addItem(product, { size, color, quantity, customization: customizationText });
    showToast(
      "Added to your bag",
      customizationText
        ? `${quantity} × ${product.name} (${color} / ${size}) — personalised “${customizationText}”.`
        : `${quantity} × ${product.name} (${color} / ${size}).`,
    );
    openCart();
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reviewSaving) return;
    setReviewFormError("");
    if (!reviewName.trim()) {
      setReviewFormError("Please add your name.");
      return;
    }
    if (reviewRating < 1) {
      setReviewFormError("Please choose a star rating.");
      return;
    }
    setReviewSaving(true);
    const error = await addReview({
      productId: product.id,
      authorName: reviewName,
      rating: reviewRating,
      body: reviewBody,
    });
    setReviewSaving(false);
    if (error) {
      setReviewFormError(error);
      return;
    }
    setReviewName("");
    setReviewRating(0);
    setReviewBody("");
    showToast("Thank you for your review", `${product.name} now carries your rating.`);
  }

  return (
    <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-6 sm:px-[4%] lg:px-[5.4%] lg:pb-24 lg:pt-9">
      <button
        className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-navy-900/55 transition-colors hover:text-forest-700 ${focusRing}`}
        onClick={() => navigate(-1)}
      >
        <ArrowRight size={15} className="rotate-180" /> Back
      </button>

      <div className="mt-7 grid items-start gap-8 lg:mt-9 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-[6%]">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream-300 shadow-[0_40px_90px_-60px_rgba(10,36,61,0.6)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={images[activeImage]}
                className="absolute inset-0 h-full w-full object-cover saturate-[0.85]"
                src={images[activeImage]}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>
            {product.compare_at_price && (
              <span className="absolute left-4 top-4 z-10 bg-cream-50/90 px-2.5 py-1.5 text-[8px] uppercase tracking-[0.12em] text-navy-900 backdrop-blur-sm">
                The edit
              </span>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  className="tone-dark absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-cream-50/90 text-navy-900 backdrop-blur-sm transition-colors hover:bg-navy-900 hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                  onClick={() => setActiveImage((index) => (index - 1 + images.length) % images.length)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  className="tone-dark absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-cream-50/90 text-navy-900 backdrop-blur-sm transition-colors hover:bg-navy-900 hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                  onClick={() => setActiveImage((index) => (index + 1) % images.length)}
                >
                  <ChevronRight size={16} />
                </button>
                <span className="tone-dark absolute bottom-3 right-3 z-10 rounded-full bg-navy-950/55 px-2.5 py-1 text-[8px] tabular-nums tracking-[0.12em] text-cream-50 backdrop-blur-sm">
                  {activeImage + 1} / {images.length}
                </span>
              </>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex justify-center px-4">
              {customizationText && (
                <motion.span
                  className="max-w-full truncate rounded-sm border border-gold-500/30 bg-cream-50/90 px-3.5 py-2.5 text-[9px] font-medium uppercase tracking-[0.22em] text-navy-900 shadow-lg backdrop-blur-sm"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {customizationText}
                </motion.span>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={index === activeImage}
                  className={`relative aspect-[4/5] overflow-hidden rounded-sm border-2 bg-cream-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
                    index === activeImage
                      ? "border-gold-500"
                      : "border-transparent hover:border-navy-900/20"
                  }`}
                >
                  <img className="h-full w-full object-cover" src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-[460px] pt-1 lg:pt-2.5">
          <span className={eyebrow}>
            {category ? category.toUpperCase() : "SSC"}
          </span>
          <h1 className="mb-4 mt-5 font-serif text-[clamp(2.4rem,4.4vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-navy-900">
            {product.name}
          </h1>
          <div className="flex items-baseline gap-3 text-[15px]">
            <strong className="font-medium text-navy-900">{money(product.price)}</strong>
            {product.compare_at_price && (
              <del className="text-[12px] text-navy-900/40">{money(product.compare_at_price)}</del>
            )}
          </div>
          <a
            href="#reviews"
            className={`mt-3 inline-flex items-center gap-2 rounded-full py-1 text-[10px] text-navy-900/55 transition-colors hover:text-forest-700 ${focusRing}`}
          >
            <Stars value={averageRating} size={13} />
            <span>
              {reviewCount
                ? `${averageRating.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
                : "No reviews yet — write the first"}
            </span>
          </a>
          {product.description && (
            <p className="mb-2 mt-5 text-[12px] leading-[1.95] text-navy-900/60">
              {product.description}
            </p>
          )}
          {product.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gold-500/30 bg-gold-100/60 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-forest-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <fieldset className="mt-6 border-0 p-0">
            <legend className="mb-3 text-[10px] uppercase tracking-[0.12em] text-navy-900/70">
              Colour <span className="ml-2 normal-case tracking-normal text-navy-900/40">{color}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${optionChip} ${
                    c === color
                      ? "border-transparent bg-linear-to-r from-navy-900 to-forest-800 text-cream-50 shadow-md"
                      : "border-navy-900/15 bg-cream-50/40 text-navy-900/70 hover:border-gold-500/60"
                  }`}
                  aria-pressed={c === color}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6 border-0 p-0">
            <legend className="mb-3 text-[10px] uppercase tracking-[0.12em] text-navy-900/70">
              Size <span className="ml-2 normal-case tracking-normal text-navy-900/40">{size}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${optionChip} ${
                    s === size
                      ? "border-transparent bg-linear-to-r from-navy-900 to-forest-800 text-cream-50 shadow-md"
                      : "border-navy-900/15 bg-cream-50/40 text-navy-900/70 hover:border-gold-500/60"
                  }`}
                  aria-pressed={s === size}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          {product.customization_enabled && (
            <div className="mt-6">
              {!customizationOpen ? (
                <motion.button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-sm border border-dashed border-navy-900/20 bg-cream-50/40 px-4 py-3.5 text-left transition-colors hover:border-gold-500/60 hover:bg-cream-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setCustomizationOpen(true)}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-linear-to-br from-gold-100 to-cream-200 text-gold-600">
                      <PenLine size={15} />
                    </span>
                    <span>
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-900">
                        Add customisation
                      </span>
                      <span className="mt-1 block text-[10px] text-navy-900/50">
                        {product.customization_label ?? "Name or brand"} — optional
                      </span>
                    </span>
                  </span>
                  <Plus size={16} className="shrink-0 text-navy-900/40" />
                </motion.button>
              ) : (
                <motion.fieldset
                  className="overflow-hidden border-0 p-0"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <legend className="text-[10px] uppercase tracking-[0.12em] text-navy-900/70">
                      Personalise{" "}
                      <span className="ml-2 normal-case tracking-normal text-navy-900/40">optional</span>
                    </legend>
                    <button
                      type="button"
                      className={`text-[9px] uppercase tracking-[0.12em] text-navy-900/45 underline-offset-4 transition-colors hover:text-forest-700 hover:underline ${focusRing}`}
                      onClick={() => {
                        setCustomization("");
                        setCustomizationOpen(false);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mb-3 text-[10px] leading-relaxed text-navy-900/50">
                    {product.customization_label ?? "Add a name or brand"}. Describe what you would
                    like and each piece is finished to order — please check the spelling.
                  </p>
                  <div className="rounded-sm border border-navy-900/15 bg-cream-50/70 px-3 transition focus-within:border-gold-500 focus-within:ring-4 focus-within:ring-gold-500/10">
                    <textarea
                      className="w-full resize-y bg-transparent py-3 text-[12px] leading-relaxed text-navy-900 outline-none placeholder:text-navy-900/35"
                      rows={3}
                      maxLength={MAX_CUSTOMIZATION_LENGTH}
                      value={customization}
                      onChange={(e) => setCustomization(e.target.value)}
                      placeholder={`${product.customization_label ?? "Name or brand"} — colours, sizing, references, anything we should know`}
                      aria-label="Customisation details"
                    />
                    <span className="block pb-2 text-right text-[9px] tabular-nums text-navy-900/40">
                      {customization.length}/{MAX_CUSTOMIZATION_LENGTH}
                    </span>
                  </div>
                </motion.fieldset>
              )}
            </div>
          )}

          <div className="mt-8 flex items-stretch gap-3">
            <div className="inline-flex items-center gap-4 rounded-full border border-navy-900/15 bg-cream-50/40 px-2.5 py-1">
              <button
                className="grid place-items-center p-0.5 text-navy-800 transition-colors hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-35"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || soldOut}
                aria-label="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <span className="text-[10px] text-navy-900">{quantity}</span>
              <button
                className="grid place-items-center p-0.5 text-navy-800 transition-colors hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-35"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity || soldOut}
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>
            <button
              className={`${btnPrimary} flex-1 justify-between`}
              onClick={addToBag}
              disabled={soldOut}
            >
              {soldOut ? "Sold out" : "Add to bag"} <ArrowRight size={16} />
            </button>
          </div>

          {enquiryUrl && (
            <div className="mt-3">
              <a
                href={enquiryUrl}
                target="_blank"
                rel="noreferrer"
                className={`${btnSecondary} w-full justify-between px-5 py-3.5`}
              >
                <span className="flex items-center gap-2.5">
                  <MessageCircle size={16} /> Chat with the vendor
                </span>
                <ArrowRight size={14} className="-rotate-45" />
              </a>
              <p className="mt-2 text-center text-[9px] text-navy-900/40">
                Ask about sizing, colour or delivery on WhatsApp.
              </p>
            </div>
          )}

          {!soldOut && product.stock_quantity <= 5 && (
            <p className="mt-3.5 text-[10px] text-gold-700">Only {product.stock_quantity} left.</p>
          )}

          <ul className="mt-7 flex list-none flex-col gap-3 border-t border-navy-900/10 p-0 pt-5 text-[10px] text-navy-900/60">
            <li className="flex items-center gap-2.5">
              <Package size={16} className="text-gold-600" /> Delivery across Ghana
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-gold-600" /> Pay on delivery or by Mobile Money
            </li>
          </ul>
        </div>
      </div>

      <section
        id="reviews"
        className="mt-16 scroll-mt-28 border-t border-navy-900/10 pt-10 sm:mt-20 sm:pt-12"
      >
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className={eyebrow}>REVIEWS &amp; RATINGS</span>
            <h2 className={sectionTitle}>
              What people <em className={accentText}>say.</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Stars value={averageRating} size={16} />
            <span className="text-[9px] uppercase tracking-[0.14em] text-navy-900/45">
              {reviewCount
                ? `${averageRating.toFixed(1)} out of 5 · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
                : "Be the first to review"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-[5%]">
          <form onSubmit={submitReview} className={`${panel} p-5 sm:p-6`}>
            <h3 className={cardTitle}>Share your thoughts</h3>
            <p className="mt-2 text-[10px] leading-relaxed text-navy-900/50">
              Tell other shoppers how this piece fits, feels and wears.
            </p>
            <div className="mt-5 flex flex-col gap-4">
              <label className={fieldLabel}>
                Your name
                <input
                  className={fieldInput}
                  value={reviewName}
                  maxLength={60}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Ama K."
                  autoComplete="name"
                />
              </label>
              <div>
                <span className={fieldLabel}>Your rating</span>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`rounded-full p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
                        star <= reviewRating ? "text-gold-500" : "text-navy-900/20"
                      }`}
                      aria-label={`${star} star${star === 1 ? "" : "s"}`}
                      aria-pressed={star <= reviewRating}
                      onClick={() => setReviewRating(star)}
                    >
                      <Star
                        size={22}
                        strokeWidth={1.5}
                        className={star <= reviewRating ? "fill-gold-500" : ""}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-[10px] text-navy-900/45">
                    {reviewRating ? `${reviewRating} / 5` : "Select"}
                  </span>
                </div>
              </div>
              <label className={fieldLabel}>
                Review{" "}
                <span className="normal-case tracking-normal text-navy-900/40">optional</span>
                <textarea
                  className={`${fieldInput} resize-y leading-relaxed`}
                  rows={4}
                  maxLength={600}
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Fit, fabric, styling — anything that helps."
                />
              </label>
            </div>
            {(reviewFormError || reviewsError) && (
              <p role="alert" className="mt-4 text-[10px] text-red-900/80">
                {reviewFormError || reviewsError}
              </p>
            )}
            <button
              type="submit"
              className={`${btnPrimary} mt-5 w-full justify-between`}
              disabled={reviewSaving}
            >
              {reviewSaving ? "Saving…" : "Submit review"} <ArrowRight size={15} />
            </button>
            <p className="mt-3 text-[9px] leading-relaxed text-navy-900/35">
              Reviews are published with the name you give and appear immediately.
            </p>
          </form>

          <div>
            {reviewsLoading ? (
              <p className={`${panel} p-5 text-[11px] text-navy-900/50`}>Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <div
                className={`${panel} flex min-h-[190px] flex-col items-center justify-center p-8 text-center`}
              >
                <Stars value={0} size={18} />
                <p className="mt-4 font-serif text-[21px] font-medium text-navy-900">No reviews yet</p>
                <p className="mt-2 max-w-[260px] text-[10px] leading-relaxed text-navy-900/50">
                  Be the first to share how this piece looks and feels.
                </p>
              </div>
            ) : (
              <ul className="flex list-none flex-col gap-3 p-0">
                {reviews.map((review) => (
                  <li key={review.id} className={`${panel} p-5`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-navy-900">{review.author_name}</p>
                      <span className="text-[9px] uppercase tracking-[0.12em] text-navy-900/40">
                        {formatReviewDate(review.created_at)}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <Stars value={review.rating} size={12} />
                    </div>
                    {review.body && (
                      <p className="mt-3 text-[11px] leading-[1.9] text-navy-900/65">{review.body}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-20 sm:mt-24">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className={eyebrow}>COMPLETE THE EDIT</span>
              <h2 className={sectionTitle}>
                You may also <em className={accentText}>like.</em>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-4 md:grid-cols-3 md:gap-x-[18px] md:gap-y-[42px]">
            {related.map((p, index) => (
              <ProductCard key={p.id} product={p} index={index} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductPage;
