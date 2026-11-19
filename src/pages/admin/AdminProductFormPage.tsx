import { ArrowRight, ImagePlus, Plus, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminProductsStore, type ProductInput } from "../../stores/useAdminProductsStore";
import { useUIStore } from "../../stores/useUIStore";
import type { AdminProduct } from "../../types";
import {
  accentText,
  btnPrimary,
  btnSecondary,
  cardTitle,
  eyebrow,
  fieldInput,
  fieldLabel,
  panel,
} from "../../lib/ui";

type FormState = {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  sku: string;
  price: string;
  compare_at_price: string;
  images: string[];
  sizes: string;
  colors: string;
  tags: string[];
  stock_quantity: string;
  is_featured: boolean;
  is_active: boolean;
  customization_enabled: boolean;
  customization_label: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  category_id: "",
  sku: "",
  price: "",
  compare_at_price: "",
  images: [],
  sizes: "",
  colors: "",
  tags: [],
  stock_quantity: "0",
  is_featured: false,
  is_active: true,
  customization_enabled: false,
  customization_label: "",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toList = (value: string) =>
  [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];

const fromProduct = (p: AdminProduct): FormState => ({
  name: p.name,
  slug: p.slug,
  description: p.description ?? "",
  category_id: p.category_id ?? "",
  sku: p.sku ?? "",
  price: String(p.price),
  compare_at_price: p.compare_at_price === null ? "" : String(p.compare_at_price),
  images: p.images?.length ? p.images : p.image_url ? [p.image_url] : [],
  sizes: p.sizes.join(", "),
  colors: p.colors.join(", "),
  tags: p.tags ?? [],
  stock_quantity: String(p.stock_quantity),
  is_featured: p.is_featured,
  is_active: p.is_active,
  customization_enabled: p.customization_enabled,
  customization_label: p.customization_label ?? "",
});

const cardShell = `${panel} p-5 sm:p-6`;
const stepNumber =
  "bg-linear-to-r from-gold-600 to-gold-400 bg-clip-text text-[9px] font-semibold tracking-[0.1em] text-transparent";
const MAX_IMAGES = 8;
const MAX_TAGS = 12;

const TAG_SUGGESTIONS = [
  "New in",
  "Bestseller",
  "Sale",
  "Limited edition",
  "Handmade",
  "Customisable",
  "Gift",
  "Everyday",
  "Tailored",
  "Statement",
];

// Multi-select tag picker: toggle popular tags or type your own.
function TagPicker({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const has = (tag: string) => value.some((item) => item.toLowerCase() === tag.toLowerCase());
  const atLimit = value.length >= MAX_TAGS;

  const toggle = (tag: string) =>
    onChange(
      has(tag)
        ? value.filter((item) => item.toLowerCase() !== tag.toLowerCase())
        : [...value, tag],
    );

  const addDraft = () => {
    const tag = draft.trim().replace(/\s+/g, " ").replace(/,/g, "").slice(0, 24);
    setDraft("");
    if (!tag || has(tag) || atLimit) return;
    onChange([...value, tag]);
  };

  return (
    <div className="flex flex-col gap-2.5 sm:col-span-2">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-800/80">
          Tags{" "}
          <span className="normal-case tracking-normal text-navy-900/35">
            (optional, select all that apply)
          </span>
        </span>
        <span className="text-[9px] tabular-nums text-navy-900/40">
          {value.length}/{MAX_TAGS}
        </span>
      </span>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Selected tags">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-navy-900 via-navy-800 to-forest-800 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.08em] text-cream-50"
            >
              {tag}
              <button
                type="button"
                className="text-cream-200/70 transition-colors hover:text-gold-300"
                onClick={() => toggle(tag)}
                aria-label={`Remove tag ${tag}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {TAG_SUGGESTIONS.filter((tag) => !has(tag)).map((tag) => (
          <button
            key={tag}
            type="button"
            disabled={atLimit}
            onClick={() => toggle(tag)}
            className="inline-flex items-center gap-1 rounded-full border border-navy-900/10 bg-white/50 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.08em] text-navy-900/60 transition-colors hover:border-gold-500/50 hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={10} /> {tag}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          className={fieldInput}
          value={draft}
          maxLength={24}
          disabled={atLimit}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          placeholder={atLimit ? "Tag limit reached" : "Add your own tag"}
          aria-label="Add a custom tag"
        />
        <button
          type="button"
          className={`${btnSecondary} shrink-0`}
          onClick={addDraft}
          disabled={atLimit || !draft.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const products = useAdminProductsStore((state) => state.products);
  const categories = useAdminProductsStore((state) => state.categories);
  const loaded = useAdminProductsStore((state) => state.loaded);
  const load = useAdminProductsStore((state) => state.load);
  const saveProduct = useAdminProductsStore((state) => state.saveProduct);
  const uploadImage = useAdminProductsStore((state) => state.uploadImage);
  const showToast = useUIStore((state) => state.showToast);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [hydrated, setHydrated] = useState(!isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  // Categories (and, when editing, the product) come from the admin store.
  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const existing = isEdit ? products.find((p) => p.id === id) : undefined;
  useEffect(() => {
    if (existing && !hydrated) {
      setForm(fromProduct(existing));
      setHydrated(true);
    }
  }, [existing, hydrated]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function onFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) {
      setError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    const batch = files.slice(0, room);
    setError(files.length > room ? `Only ${MAX_IMAGES} images per product — the first ${room} were added.` : "");
    setUploading(batch.length);
    for (const file of batch) {
      const result = await uploadImage(file);
      if ("error" in result) {
        setError(result.error);
        break;
      }
      setForm((current) =>
        current.images.length >= MAX_IMAGES
          ? current
          : { ...current, images: [...current.images, result.url] },
      );
      setUploading((count) => Math.max(0, count - 1));
    }
    setUploading(0);
  }

  function addImageUrl() {
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return setError("Image URLs must start with https://.");
    if (form.images.length >= MAX_IMAGES) return setError(`You can add up to ${MAX_IMAGES} images.`);
    if (form.images.includes(url)) {
      setImageUrl("");
      return;
    }
    setError("");
    setForm((current) => ({ ...current, images: [...current.images, url] }));
    setImageUrl("");
  }

  const removeImage = (url: string) =>
    setForm((current) => ({ ...current, images: current.images.filter((image) => image !== url) }));

  const makeCover = (url: string) =>
    setForm((current) => ({
      ...current,
      images: [url, ...current.images.filter((image) => image !== url)],
    }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const price = Number(form.price);
    const compare = form.compare_at_price.trim() === "" ? null : Number(form.compare_at_price);
    const stock = Number(form.stock_quantity);
    if (!form.slug) return setError("Add a URL slug using letters, numbers and hyphens.");
    if (!Number.isFinite(price) || price < 0) return setError("Enter a valid price.");
    if (compare !== null && (!Number.isFinite(compare) || compare < price))
      return setError("The compare-at price must be equal to or higher than the price.");
    if (!Number.isInteger(stock) || stock < 0) return setError("Stock must be a whole number, zero or more.");

    const images = [
      ...new Set(form.images.map((url) => url.trim()).filter(Boolean)),
    ].slice(0, MAX_IMAGES);

    const input: ProductInput = {
      name: form.name.trim(),
      slug: form.slug,
      description: form.description.trim() || null,
      category_id: form.category_id || null,
      sku: form.sku.trim() || null,
      price,
      compare_at_price: compare,
      image_url: images[0] ?? null,
      images,
      sizes: toList(form.sizes),
      colors: toList(form.colors),
      tags: form.tags,
      stock_quantity: stock,
      is_featured: form.is_featured,
      is_active: form.is_active,
      customization_enabled: form.customization_enabled,
      customization_label: form.customization_enabled
        ? form.customization_label.trim() || "Name or brand"
        : null,
    };

    setSaving(true);
    const failure = await saveProduct(id ?? null, input);
    setSaving(false);
    if (failure) return setError(failure);

    showToast(isEdit ? "Product updated" : "Product added", `${input.name} has been saved.`);
    navigate("/admin/products");
  }

  if (isEdit && !existing) {
    return loaded ? (
      <div className="px-3 py-16 text-center text-navy-900/50">
        <h3 className="mb-3 font-serif text-[23px] font-semibold text-navy-900">Product not found.</h3>
        <p>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 border-b border-gold-500/50 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-800 transition-colors hover:border-forest-700 hover:text-forest-700"
          >
            Back to products <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    ) : (
      <p className="py-3 text-[12px] text-navy-900/50">Loading product…</p>
    );
  }

  return (
    <div className="mx-auto my-8 max-w-[1100px] sm:my-10 lg:my-12">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <span className={eyebrow}>SSC / CATALOGUE</span>
          <h1 className="mb-2 mt-4 font-serif text-[clamp(2.2rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-navy-900">
            {isEdit ? "Edit" : "Add a"} <em className={accentText}>product.</em>
          </h1>
          <p className="text-[11px] text-navy-900/55">
            {isEdit ? "Changes go live in the store as soon as you save." : "New pieces appear in the store as soon as they are live."}
          </p>
        </div>
        <Link to="/admin/products" className={btnSecondary}>
          Cancel
        </Link>
      </div>

      <form className="mt-8 flex max-w-[820px] flex-col gap-4" onSubmit={submit}>
        <section className={cardShell}>
          <div className="mb-5 flex items-center gap-3 border-b border-navy-900/10 pb-4">
            <span className={stepNumber}>01</span>
            <h2 className={cardTitle}>Details</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`${fieldLabel} sm:col-span-2`}>
              Product name
              <input
                className={fieldInput}
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                placeholder="The Sculpted Blazer"
              />
            </label>
            <label className={fieldLabel}>
              URL slug
              <input
                className={fieldInput}
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                placeholder="sculpted-blazer"
              />
            </label>
            <label className={fieldLabel}>
              SKU <span className="normal-case tracking-normal text-navy-900/35">(optional)</span>
              <input className={fieldInput} value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="AT-BLZ-001" />
            </label>
            <label className={`${fieldLabel} sm:col-span-2`}>
              Category
              <select className={fieldInput} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${fieldLabel} sm:col-span-2`}>
              Description <span className="normal-case tracking-normal text-navy-900/35">(optional)</span>
              <textarea
                className={`${fieldInput} resize-y`}
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Fabric, fit and what makes it special…"
              />
            </label>
            <TagPicker value={form.tags} onChange={(tags) => set("tags", tags)} />
          </div>
        </section>

        <section className={cardShell}>
          <div className="mb-5 flex items-center gap-3 border-b border-navy-900/10 pb-4">
            <span className={stepNumber}>02</span>
            <h2 className={cardTitle}>Pricing &amp; stock</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={fieldLabel}>
              Price (GHS)
              <input className={fieldInput} required type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="680" />
            </label>
            <label className={fieldLabel}>
              Compare-at price <span className="normal-case tracking-normal text-navy-900/35">(optional, shows as a sale)</span>
              <input className={fieldInput} type="number" min="0" step="0.01" value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} placeholder="780" />
            </label>
            <label className={fieldLabel}>
              Stock quantity
              <input className={fieldInput} required type="number" min="0" step="1" value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} />
            </label>
            <div className="hidden sm:block" />
            <label className={`${fieldLabel} sm:col-span-2`}>
              Sizes <span className="normal-case tracking-normal text-navy-900/35">(comma separated; leave blank for one size)</span>
              <input className={fieldInput} value={form.sizes} onChange={(e) => set("sizes", e.target.value)} placeholder="XS, S, M, L, XL" />
            </label>
            <label className={`${fieldLabel} sm:col-span-2`}>
              Colours <span className="normal-case tracking-normal text-navy-900/35">(comma separated)</span>
              <input className={fieldInput} value={form.colors} onChange={(e) => set("colors", e.target.value)} placeholder="Oat, Black" />
            </label>
          </div>
        </section>

        <section className={cardShell}>
          <div className="mb-3 flex items-center gap-3 border-b border-navy-900/10 pb-4">
            <span className={stepNumber}>03</span>
            <h2 className={cardTitle}>Personalisation</h2>
          </div>
          <label htmlFor="product-customizable" className="flex cursor-pointer items-center justify-between gap-4 py-2.5">
            <span className="flex flex-col gap-1.5">
              <strong className="text-[11px] font-medium text-navy-900">Customisable</strong>
              <small className="text-[9px] leading-relaxed text-navy-900/50">
                Shows a textarea on the product page so shoppers can describe the customisation.
              </small>
            </span>
            <span className="relative inline-flex shrink-0">
              <input
                id="product-customizable"
                className="peer sr-only"
                type="checkbox"
                checked={form.customization_enabled}
                onChange={(e) => set("customization_enabled", e.target.checked)}
              />
              <span
                aria-hidden
                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500 ${
                  form.customization_enabled ? "bg-forest-700" : "bg-navy-900/20"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    form.customization_enabled ? "translate-x-[22px]" : "translate-x-0"
                  }`}
                />
              </span>
            </span>
          </label>
          {form.customization_enabled && (
            <label className={`${fieldLabel} mt-2`}>
              Prompt <span className="normal-case tracking-normal text-navy-900/35">(shown above the text field)</span>
              <input
                className={fieldInput}
                maxLength={80}
                value={form.customization_label}
                onChange={(e) => set("customization_label", e.target.value)}
                placeholder="Name or brand to emboss"
              />
            </label>
          )}
        </section>

        <section className={cardShell}>
          <div className="mb-5 flex items-center gap-3 border-b border-navy-900/10 pb-4">
            <span className={stepNumber}>04</span>
            <h2 className={cardTitle}>Images</h2>
            <span className="ml-auto text-[9px] tabular-nums text-navy-900/40">
              {form.images.length}/{MAX_IMAGES}
            </span>
          </div>

          {form.images.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.images.map((url, index) => (
                <figure
                  key={url}
                  className="group relative overflow-hidden rounded-sm border border-navy-900/10 bg-cream-200"
                >
                  <div className="relative aspect-[4/5]">
                    <img
                      className="h-full w-full object-cover"
                      src={url}
                      alt={`Product image ${index + 1}`}
                    />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 bg-navy-950/80 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-cream-50 backdrop-blur-sm">
                        Cover
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-navy-950/75 p-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    {index > 0 ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-cream-100 transition-colors hover:text-gold-300"
                        onClick={() => makeCover(url)}
                      >
                        <Star size={11} /> Cover
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-cream-100 transition-colors hover:text-red-300"
                      onClick={() => removeImage(url)}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                </figure>
              ))}
              {form.images.length < MAX_IMAGES && (
                <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-sm border border-dashed border-navy-900/20 bg-cream-100 text-navy-900/40 transition-colors hover:border-gold-500 hover:text-navy-900/70">
                  <span className="flex flex-col items-center gap-2 px-2 text-center">
                    <ImagePlus size={20} />
                    <span className="text-[8px] font-semibold uppercase tracking-[0.12em]">
                      {uploading ? `Uploading ${uploading}…` : "Add images"}
                    </span>
                  </span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading > 0}
                    onChange={(e) => {
                      void onFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-navy-900/20 bg-cream-100 px-4 py-10 text-navy-900/40 transition-colors hover:border-gold-500 hover:text-navy-900/70">
              <ImagePlus size={22} />
              <span className="text-center text-[9px] font-semibold uppercase tracking-[0.12em]">
                {uploading ? `Uploading ${uploading}…` : `Upload up to ${MAX_IMAGES} images`}
              </span>
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                multiple
                disabled={uploading > 0}
                onChange={(e) => {
                  void onFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-end">
            <label className={`${fieldLabel} flex-1`}>
              Or add an image by URL
              <input
                className={fieldInput}
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                placeholder="https://…"
              />
            </label>
            <button
              type="button"
              className={`${btnSecondary} justify-center`}
              onClick={addImageUrl}
              disabled={form.images.length >= MAX_IMAGES}
            >
              Add image
            </button>
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-navy-900/45">
            The first image is the cover used on the shop grid. Choose “Cover” on any image to
            move it to the front.
          </p>
        </section>

        <section className={cardShell}>
          <div className="mb-3 flex items-center gap-3 border-b border-navy-900/10 pb-4">
            <span className={stepNumber}>05</span>
            <h2 className={cardTitle}>Visibility</h2>
          </div>
          <label className="flex cursor-pointer items-start gap-3 py-2.5">
            <input className="mt-1 h-4 w-4 accent-forest-700" type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
            <span className="flex flex-col gap-1.5">
              <strong className="text-[11px] font-medium text-navy-900">Live in the store</strong>
              <small className="text-[9px] leading-relaxed text-navy-900/50">Untick to hide it from shoppers while keeping the record.</small>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 py-2.5">
            <input className="mt-1 h-4 w-4 accent-forest-700" type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />
            <span className="flex flex-col gap-1.5">
              <strong className="text-[11px] font-medium text-navy-900">Featured</strong>
              <small className="text-[9px] leading-relaxed text-navy-900/50">Featured pieces are shown first on the home page.</small>
            </span>
          </label>
        </section>

        {error && (
          <div className="rounded-sm border border-red-900/20 bg-red-900/5 p-3 text-[10px] leading-relaxed text-red-900/80" role="alert">
            {error}
          </div>
        )}
        <button className={`${btnPrimary} w-full justify-between`} disabled={saving || uploading > 0}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"} <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}

export default AdminProductFormPage;
