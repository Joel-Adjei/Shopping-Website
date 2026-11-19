import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore, lineKey, selectCartCount, selectDeliveryFee, selectSubtotal } from "../stores/useCartStore";
import { useCheckoutStore, type CheckoutDetails } from "../stores/useCheckoutStore";
import { useUIStore } from "../stores/useUIStore";
import { useStoreSettingsStore } from "../stores/useStoreSettingsStore";
import { money } from "../util/export";
import { buildOrderWhatsAppUrl } from "../lib/whatsapp";
import { accentText, btnPrimary, cardTitle, eyebrow, fieldInput, fieldLabel, focusRing, panel } from "../lib/ui";

const cardShell = `${panel} p-5 sm:p-6`;

function CheckoutPage() {
  const navigate = useNavigate();

  // Shared state comes from the stores; only the half-typed form stays local to this page.
  const cart = useCartStore((state) => state.lines);
  const cartCount = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectSubtotal);
  const deliveryFee = useCartStore(selectDeliveryFee);
  const clearCart = useCartStore((state) => state.clear);
  const submitting = useCheckoutStore((state) => state.submitting);
  const error = useCheckoutStore((state) => state.error);
  const unreachable = useCheckoutStore((state) => state.unreachable);
  const placeOrder = useCheckoutStore((state) => state.placeOrder);
  const clearError = useCheckoutStore((state) => state.clearError);
  const showToast = useUIStore((state) => state.showToast);
  const whatsappNumber = useStoreSettingsStore((state) => state.settings.whatsapp_number);

  const [form, setForm] = useState<CheckoutDetails>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Accra",
    notes: "",
    payment: "cash_on_delivery",
  });
  const total = subtotal + deliveryFee;

  // When the ordering service cannot be reached, the same order can still reach the store
  // through WhatsApp, with every detail already filled in.
  const whatsappFallbackUrl = unreachable
    ? buildOrderWhatsAppUrl({
        orderNumber: "",
        details: form,
        lines: cart,
        subtotal,
        deliveryFee,
        total,
        whatsappNumber,
      })
    : null;

  // Don't show an error left over from an earlier visit.
  useEffect(() => clearError, [clearError]);

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    const placed = await placeOrder(form, cart);
    if (!placed) return;

    // The direct WhatsApp handoff is built from the checkout snapshot before the cart clears.
    const whatsappUrl = buildOrderWhatsAppUrl({
      orderNumber: placed.orderNumber,
      details: form,
      lines: cart,
      subtotal,
      deliveryFee,
      total,
      whatsappNumber,
    });
    clearCart();
    showToast(
      "Order received",
      whatsappUrl
        ? `Order ${placed.orderNumber} — send the details to us on WhatsApp to confirm.`
        : `Order ${placed.orderNumber} was saved. We'll be in touch shortly.`,
    );

    if (whatsappUrl) {
      const opened = window.open(whatsappUrl, "_blank");
      if (opened) {
        opened.opener = null;
        navigate("/");
      } else {
        // Pop-up blocked: take this tab to WhatsApp instead.
        window.location.assign(whatsappUrl);
      }
      return;
    }
    navigate("/");
  }

  return (
    <main className="mx-auto max-w-[1440px] px-5 pb-20 pt-6 sm:px-[4%] lg:px-[5.4%] lg:pb-24">
      <button
        className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-navy-900/55 transition-colors hover:text-forest-700 ${focusRing}`}
        onClick={() => navigate("/shop")}
      >
        <ArrowRight size={15} className="rotate-180" /> Back to the collection
      </button>
      <div className="px-1 py-10 text-center sm:py-12">
        <span className={`${eyebrow} justify-center`}>THE FINAL DETAIL</span>
        <h1 className="my-4 font-serif text-[clamp(2.8rem,5vw,4rem)] font-normal leading-[1.04] tracking-[-0.045em] text-navy-900">
          Make it <em className={accentText}>yours.</em>
        </h1>
        <p className="text-[11px] text-navy-900/55">
          A few details and your chosen pieces will be on their way.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:gap-10">
        <form className="flex flex-col gap-4" onSubmit={submitOrder}>
          <section className={cardShell}>
            <div className="mb-5 flex items-center gap-3 border-b border-navy-900/10 pb-4">
              <span className="bg-linear-to-r from-gold-600 to-gold-400 bg-clip-text text-[9px] font-semibold tracking-[0.1em] text-transparent">
                01
              </span>
              <h2 className={cardTitle}>Contact details</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`${fieldLabel} sm:col-span-2`}>
                Full name
                <input
                  className={fieldInput}
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </label>
              <label className={fieldLabel}>
                Phone number
                <input
                  className={fieldInput}
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+233 24 000 0000"
                  autoComplete="tel"
                />
              </label>
              <label className={fieldLabel}>
                Email address <span className="normal-case tracking-normal text-navy-900/35">(optional)</span>
                <input
                  className={fieldInput}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
            </div>
          </section>
          <section className={cardShell}>
            <div className="mb-5 flex items-center gap-3 border-b border-navy-900/10 pb-4">
              <span className="bg-linear-to-r from-gold-600 to-gold-400 bg-clip-text text-[9px] font-semibold tracking-[0.1em] text-transparent">
                02
              </span>
              <h2 className={cardTitle}>Delivery address</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`${fieldLabel} sm:col-span-2`}>
                Street address / landmark
                <input
                  className={fieldInput}
                  required
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="House number, street or landmark"
                  autoComplete="street-address"
                />
              </label>
              <label className={fieldLabel}>
                City / town
                <input
                  className={fieldInput}
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Accra"
                />
              </label>
              <label className={fieldLabel}>
                Country
                <input className={fieldInput} value="Ghana" disabled />
              </label>
              <label className={`${fieldLabel} sm:col-span-2`}>
                Delivery notes <span className="normal-case tracking-normal text-navy-900/35">(optional)</span>
                <textarea
                  className={`${fieldInput} resize-y`}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Anything that will help us find you…"
                />
              </label>
            </div>
          </section>
          <section className={cardShell}>
            <div className="mb-2 flex items-center gap-3 border-b border-navy-900/10 pb-4">
              <span className="bg-linear-to-r from-gold-600 to-gold-400 bg-clip-text text-[9px] font-semibold tracking-[0.1em] text-transparent">
                03
              </span>
              <h2 className={cardTitle}>Payment preference</h2>
            </div>
            <label
              className={`relative mt-2.5 flex cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors ${
                form.payment === "cash_on_delivery"
                  ? "border-forest-600/60 bg-linear-to-r from-forest-600/8 via-cream-50 to-gold-100/40"
                  : "border-navy-900/10 bg-white/40 hover:border-gold-500/50"
              }`}
            >
              <input
                className="sr-only"
                type="radio"
                name="payment"
                value="cash_on_delivery"
                checked={form.payment === "cash_on_delivery"}
                onChange={(e) => setForm({ ...form, payment: e.target.value })}
              />
              <span className="flex flex-1 flex-col gap-1.5">
                <strong className="text-[11px] font-medium text-navy-900">Cash on delivery</strong>
                <small className="text-[9px] leading-relaxed text-navy-900/50">Pay when your order arrives, where available.</small>
              </span>
              <span
                className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                  form.payment === "cash_on_delivery" ? "border-forest-600" : "border-navy-900/25"
                }`}
              >
                {form.payment === "cash_on_delivery" && (
                  <span className="h-2 w-2 rounded-full bg-linear-to-br from-forest-700 to-navy-900" />
                )}
              </span>
            </label>
            <label
              className={`relative mt-2.5 flex cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors ${
                form.payment === "mobile_money_manual"
                  ? "border-forest-600/60 bg-linear-to-r from-forest-600/8 via-cream-50 to-gold-100/40"
                  : "border-navy-900/10 bg-white/40 hover:border-gold-500/50"
              }`}
            >
              <input
                className="sr-only"
                type="radio"
                name="payment"
                value="mobile_money_manual"
                checked={form.payment === "mobile_money_manual"}
                onChange={(e) => setForm({ ...form, payment: e.target.value })}
              />
              <span className="flex flex-1 flex-col gap-1.5">
                <strong className="text-[11px] font-medium text-navy-900">Mobile Money — confirm manually</strong>
                <small className="text-[9px] leading-relaxed text-navy-900/50">We'll contact you with payment instructions.</small>
              </span>
              <span
                className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                  form.payment === "mobile_money_manual" ? "border-forest-600" : "border-navy-900/25"
                }`}
              >
                {form.payment === "mobile_money_manual" && (
                  <span className="h-2 w-2 rounded-full bg-linear-to-br from-forest-700 to-navy-900" />
                )}
              </span>
            </label>
          </section>
          {unreachable && whatsappFallbackUrl ? (
            <div
              className="flex flex-col items-start gap-2.5 rounded-sm border border-gold-500/40 bg-linear-to-br from-gold-100 via-cream-100 to-cream-200 p-4"
              role="alert"
            >
              <strong className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gold-700">
                Order by WhatsApp
              </strong>
              <p className="text-[10px] leading-relaxed text-navy-900/65">
                Our online ordering service is unavailable right now. Send
                your order to us on WhatsApp — every item, your address and the
                total are already written out.
              </p>
              <a
                className={`${btnPrimary} w-full justify-between`}
                href={whatsappFallbackUrl}
                target="_blank"
                rel="noreferrer"
              >
                Send order on WhatsApp <ArrowRight size={16} />
              </a>
            </div>
          ) : (
            error && (
              <div className="rounded-sm border border-red-900/20 bg-red-900/5 p-3 text-[10px] leading-relaxed text-red-900/80" role="alert">
                {error}
              </div>
            )
          )}
          <button
            className={`${btnPrimary} w-full justify-between`}
            disabled={submitting || !cart.length}
          >
            {submitting ? "Placing your order…" : "Place order"}{" "}
            <ArrowRight size={16} />
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[9px] text-navy-900/45">
            <ShieldCheck size={14} /> Your information is used only to process
            and deliver your order.
          </p>
        </form>

        <aside className="relative order-first overflow-hidden rounded-sm bg-linear-to-br from-navy-950 via-navy-900 to-forest-900 p-5 text-cream-100 shadow-[0_40px_80px_-50px_rgba(10,36,61,0.8)] sm:p-6 lg:order-last lg:sticky lg:top-[110px]">
          <div className="pointer-events-none absolute -right-12 top-0 h-52 w-52 rounded-full bg-gold-500/15 blur-3xl" />
          <div className="relative">
            <span className={`${eyebrow} text-gold-300`}>YOUR SELECTION</span>
            <h2 className="mb-6 mt-2 font-serif text-[27px] font-normal tracking-[-0.03em] text-cream-50">
              Order summary <span className="font-sans text-[12px] text-cream-200/50">({cartCount})</span>
            </h2>
            {cart.length ? (
              cart.map((line) => (
                <div className="grid grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-white/10 py-3.5" key={lineKey(line)}>
                  <img className="h-[68px] w-[52px] bg-white/5 object-cover" src={line.product.image_url || ""} alt="" />
                  <div className="flex flex-col gap-1.5">
                    <strong className="text-[10px] font-medium text-cream-50">{line.product.name}</strong>
                    <span className="text-[9px] text-cream-200/50">
                      {line.color} / {line.size} · Qty {line.quantity}
                    </span>
                    {line.customization && (
                      <span className="text-[9px] leading-snug text-gold-300">
                        Personalised · “{line.customization}”
                      </span>
                    )}
                  </div>
                  <b className="whitespace-nowrap text-[10px] font-medium text-cream-100">
                    {money(line.product.price * line.quantity)}
                  </b>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-cream-200/50">Your bag is empty.</p>
            )}
            <div className="flex flex-col gap-3.5 pt-4 text-[10px] text-cream-200/55">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {deliveryFee === 0 ? "Complimentary" : money(deliveryFee)}
                </span>
              </div>
              <div className="mt-0.5 flex justify-between border-t border-white/15 pt-4 text-[13px] font-semibold text-cream-50">
                <strong>Total</strong>
                <strong>{money(total)}</strong>
              </div>
            </div>
            <div className="mt-5 flex gap-2.5 rounded-sm border border-gold-400/20 bg-white/5 p-3.5 text-gold-300">
              <Sparkles size={16} className="shrink-0" />
              <p className="text-[9px] leading-relaxed text-cream-200/55">
                Every order is packed with care. Thank you for choosing a more
                considered wardrobe.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default CheckoutPage;
