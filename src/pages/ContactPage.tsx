import { ArrowRight, Clock, Instagram, Mail, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import {
  accentText,
  btnPrimary,
  displayTitle,
  eyebrow,
  eyebrowLine,
  fieldInput,
  fieldLabel,
  focusRing,
  panel,
  textLink,
} from "../lib/ui";
import { normalizeWhatsAppNumber } from "../lib/whatsapp";
import { useStoreSettingsStore } from "../stores/useStoreSettingsStore";

const hours = [
  { day: "Monday – Friday", time: "9:00 — 18:00" },
  { day: "Saturday", time: "10:00 — 16:00" },
  { day: "Sunday", time: "Closed" },
];

type ChannelProps = {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

function Channel({ icon: Icon, label, value, href, external }: ChannelProps) {
  const body = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-gold-100 to-cream-200 text-gold-700">
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <span className="block text-[8px] font-semibold uppercase tracking-[0.16em] text-navy-900/40">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-navy-900">{value}</span>
      </span>
      {href && (
        <ArrowRight
          size={15}
          className="ml-auto shrink-0 text-navy-900/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-forest-700"
        />
      )}
    </>
  );

  const className = `group flex items-center gap-3.5 rounded-sm border border-navy-900/10 bg-white/50 p-3 transition-colors ${
    href ? `hover:border-gold-500/50 hover:bg-white ${focusRing}` : ""
  }`;

  if (!href) return <div className={className}>{body}</div>;
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className={className}
    >
      {body}
    </a>
  );
}

export default function ContactPage() {
  const settings = useStoreSettingsStore((state) => state.settings);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const whatsappDigits = normalizeWhatsAppNumber(settings.whatsapp_number);
  const phoneDisplay = settings.contact_phone || (whatsappDigits ? `+${whatsappDigits}` : "");

  const composed = [
    "Hello Stylish Steps Collection,",
    "",
    name.trim() ? `Name: ${name.trim()}` : null,
    email.trim() ? `Email: ${email.trim()}` : null,
    "",
    message.trim(),
  ]
    .filter((line) => line !== null)
    .join("\n");

  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(composed)}`
    : null;
  const mailtoUrl = settings.support_email
    ? `mailto:${settings.support_email}?subject=${encodeURIComponent("Website enquiry")}&body=${encodeURIComponent(composed)}`
    : null;
  const sendUrl = whatsappUrl ?? mailtoUrl;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sendUrl) return;
    window.open(sendUrl, "_blank", "noopener");
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-linear-to-b from-cream-50 via-cream-100 to-cream-100 px-5 pb-14 pt-14 sm:px-[4%] sm:pb-16 sm:pt-20 lg:px-[5.4%] lg:pb-20 lg:pt-24">
        <div className="pointer-events-none absolute -left-24 top-6 h-80 w-80 rounded-full bg-gold-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-forest-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1200px]">
          <Reveal>
            <span className={eyebrow}>
              <span className={eyebrowLine} />
              SAY HELLO
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className={`${displayTitle} mt-5 max-w-[760px]`}>
              Let&rsquo;s talk <em className={accentText}>style.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-[520px] text-[13px] leading-[1.95] text-navy-900/60">
              Questions about a piece, a customisation idea or an order on its way? Send a note
              and the studio will reply personally — usually within one working day.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Based in Accra", "Nationwide delivery", "Custom orders welcome"].map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-900/10 bg-white/60 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-navy-800/75 backdrop-blur-sm"
                >
                  <span className="h-1 w-1 rounded-full bg-gold-500" />
                  {chip}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-16 pt-10 sm:px-[4%] sm:pb-20 sm:pt-12 lg:px-[5.4%] lg:pb-24">
        <div className="mx-auto grid max-w-[1200px] items-start gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          <Reveal className={`${panel} p-5 sm:p-7`}>
            <span className={eyebrow}>SEND A NOTE</span>
            <h2 className="mt-3 font-serif text-[clamp(1.7rem,3.2vw,2.2rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-navy-900">
              What can we help with?
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed text-navy-900/50">
              Your message opens in WhatsApp, ready to send to the studio.
            </p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={fieldLabel}>
                  Your name
                  <input
                    className={fieldInput}
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ama Mensah"
                    autoComplete="name"
                  />
                </label>
                <label className={fieldLabel}>
                  Email <span className="normal-case tracking-normal text-navy-900/35">(optional)</span>
                  <input
                    className={fieldInput}
                    type="email"
                    maxLength={120}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>
              </div>
              <label className={fieldLabel}>
                Message
                <textarea
                  className={`${fieldInput} resize-y`}
                  required
                  rows={6}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the piece, the size or the customisation you have in mind…"
                />
              </label>
              <button
                className={`${btnPrimary} w-full justify-between`}
                type="submit"
                disabled={!sendUrl}
              >
                {whatsappUrl ? "Send via WhatsApp" : "Send by email"} <ArrowRight size={16} />
              </button>
              {!sendUrl && (
                <p className="text-[10px] leading-relaxed text-navy-900/50">
                  Add a WhatsApp number or support email in the admin settings to receive messages.
                </p>
              )}
              <p className="text-[9px] leading-relaxed text-navy-900/40">
                Prefer email? Write to{" "}
                {settings.support_email ? (
                  <a
                    className={`border-b border-gold-500/50 text-navy-800 transition-colors hover:border-forest-700 hover:text-forest-700 ${focusRing}`}
                    href={`mailto:${settings.support_email}`}
                  >
                    {settings.support_email}
                  </a>
                ) : (
                  <span>the studio via WhatsApp</span>
                )}
                .
              </p>
            </form>
          </Reveal>

          <div className="flex flex-col gap-5">
            <Reveal className={`${panel} p-5 sm:p-6`} delay={0.08}>
              <span className={eyebrow}>DIRECT LINES</span>
              <div className="mt-4 grid gap-2.5">
                {whatsappDigits && (
                  <Channel
                    icon={MessageCircle}
                    label="WhatsApp"
                    value={phoneDisplay || `+${whatsappDigits}`}
                    href={`https://wa.me/${whatsappDigits}`}
                    external
                  />
                )}
                {settings.support_email && (
                  <Channel
                    icon={Mail}
                    label="Email"
                    value={settings.support_email}
                    href={`mailto:${settings.support_email}`}
                  />
                )}
                {settings.contact_phone && (
                  <Channel
                    icon={Phone}
                    label="Call"
                    value={settings.contact_phone}
                    href={`tel:${settings.contact_phone.replace(/[^\d+]/g, "")}`}
                  />
                )}
                <Channel
                  icon={MapPin}
                  label="Studio"
                  value={settings.contact_address || "Accra, Ghana"}
                />
              </div>
            </Reveal>

            <Reveal
              className="relative overflow-hidden rounded-sm bg-linear-to-br from-navy-950 via-navy-900 to-forest-900 p-5 text-cream-100 sm:p-6"
              delay={0.16}
            >
              <div className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-gold-500/15 blur-3xl" />
              <div className="relative">
                <span className={`${eyebrow} text-gold-300`}>FOLLOW THE STUDIO</span>
                <p className="mt-3 max-w-[300px] text-[11px] leading-relaxed text-cream-200/70">
                  New arrivals, restocks and behind-the-scenes work, shared as it happens.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {settings.instagram_url && (
                    <a
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-cream-100 transition-colors hover:border-gold-400/60 hover:bg-white/10 hover:text-gold-300 ${focusRing}`}
                    >
                      <Instagram size={14} /> Instagram
                    </a>
                  )}
                  {settings.tiktok_url && (
                    <a
                      href={settings.tiktok_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-cream-100 transition-colors hover:border-gold-400/60 hover:bg-white/10 hover:text-gold-300 ${focusRing}`}
                    >
                      <Music2 size={14} /> TikTok
                    </a>
                  )}
                </div>
              </div>
            </Reveal>

            <Reveal className={`${panel} p-5 sm:p-6`} delay={0.24}>
              <span className={`${eyebrow} gap-2`}>
                <Clock size={12} /> STUDIO HOURS
              </span>
              <dl className="mt-4 flex flex-col divide-y divide-navy-900/8">
                {hours.map((slot) => (
                  <div key={slot.day} className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
                    <dt className="text-[11px] text-navy-900/60">{slot.day}</dt>
                    <dd className="text-[10px] font-medium uppercase tracking-[0.08em] text-navy-900">
                      {slot.time}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>

        <Reveal className="mx-auto mt-12 flex max-w-[1200px] flex-wrap items-center justify-between gap-4 border-t border-navy-900/10 pt-6 sm:mt-14">
          <p className="text-[10px] leading-relaxed text-navy-900/50">
            Shopping for something specific? The full collection is always open.
          </p>
          <Link to="/shop" className={textLink}>
            Browse the collection <ArrowRight size={15} />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
