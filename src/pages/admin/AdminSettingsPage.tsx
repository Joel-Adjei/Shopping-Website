import { Plus, Save, Settings2, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useAdminProductsStore,
  type AdminCategory,
  type CategoryInput,
} from "../../stores/useAdminProductsStore";
import { useStoreSettingsStore, type StoreSettingsInput } from "../../stores/useStoreSettingsStore";
import { useUIStore } from "../../stores/useUIStore";
import type { StoreSettings } from "../../types";
import {
  accentText,
  btnPrimary,
  eyebrow,
  fieldInput,
  fieldLabel,
  panel,
  statusPill,
  tableCell,
  tableHead,
} from "../../lib/ui";

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  sort_order: string;
  is_active: boolean;
};

const emptyCategory: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  sort_order: "0",
  is_active: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toInput = (settings: StoreSettings): StoreSettingsInput => ({
  store_name: settings.store_name,
  support_email: settings.support_email ?? "",
  contact_phone: settings.contact_phone ?? "",
  whatsapp_number: settings.whatsapp_number ?? "",
  instagram_url: settings.instagram_url ?? "",
  tiktok_url: settings.tiktok_url ?? "",
  contact_address: settings.contact_address ?? "",
});

function AdminSettingsPage() {
  const settings = useStoreSettingsStore((state) => state.settings);
  const settingsLoaded = useStoreSettingsStore((state) => state.loaded);
  const settingsError = useStoreSettingsStore((state) => state.error);
  const loadSettings = useStoreSettingsStore((state) => state.load);
  const saveSettings = useStoreSettingsStore((state) => state.save);

  const categories = useAdminProductsStore((state) => state.categories);
  const loading = useAdminProductsStore((state) => state.loading);
  const load = useAdminProductsStore((state) => state.load);
  const saveCategory = useAdminProductsStore((state) => state.saveCategory);
  const showToast = useUIStore((state) => state.showToast);

  const [contact, setContact] = useState<StoreSettingsInput>(() => toInput(settings));
  const [hydrated, setHydrated] = useState(settingsLoaded);
  const [savingContact, setSavingContact] = useState(false);
  const [contactError, setContactError] = useState("");

  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategory);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    void loadSettings();
    void load();
  }, [loadSettings, load]);

  // Fill the form once the saved settings arrive, without overwriting edits.
  useEffect(() => {
    if (!settingsLoaded || hydrated) return;
    setContact(toInput(settings));
    setHydrated(true);
  }, [settingsLoaded, hydrated, settings]);

  const setContactField = (key: keyof StoreSettingsInput, value: string) =>
    setContact((current) => ({ ...current, [key]: value }));

  async function submitContact(e: React.FormEvent) {
    e.preventDefault();
    setContactError("");

    const email = contact.support_email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setContactError("Enter a valid support email address.");

    const whatsapp = contact.whatsapp_number.replace(/\D/g, "");
    if (whatsapp && whatsapp.length < 9)
      return setContactError("Enter the WhatsApp number in international format, digits only (e.g. 233593054022).");

    const links = [
      ["Instagram", contact.instagram_url],
      ["TikTok", contact.tiktok_url],
    ] as const;
    const badLink = links.find(([, value]) => value.trim() && !/^https?:\/\//i.test(value.trim()));
    if (badLink) return setContactError(`${badLink[0]} link must start with https://`);

    setSavingContact(true);
    const failure = await saveSettings(contact);
    setSavingContact(false);
    if (failure) return setContactError(failure);
    showToast("Settings updated", "Contact details are live across the store.");
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setSlugTouched(true);
    setCategoryError("");
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      sort_order: String(category.sort_order),
      is_active: category.is_active,
    });
    document.getElementById("category-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function resetCategoryForm() {
    setEditingId(null);
    setSlugTouched(false);
    setCategoryForm(emptyCategory);
    setCategoryError("");
  }

  async function submitCategory(e: React.FormEvent) {
    e.preventDefault();
    setCategoryError("");

    const name = categoryForm.name.trim();
    const slug = slugify(categoryForm.slug || categoryForm.name);
    const sortOrder = Number(categoryForm.sort_order);
    if (!name) return setCategoryError("Give the category a name.");
    if (!slug) return setCategoryError("Add a URL slug using letters, numbers and hyphens.");
    if (!Number.isInteger(sortOrder) || sortOrder < 0)
      return setCategoryError("Sort order must be a whole number, zero or more.");

    const input: CategoryInput = {
      name,
      slug,
      description: categoryForm.description.trim() || null,
      sort_order: sortOrder,
      is_active: categoryForm.is_active,
    };

    setSavingCategory(true);
    const failure = await saveCategory(editingId, input);
    setSavingCategory(false);
    if (failure) return setCategoryError(failure);

    showToast(
      editingId ? "Category updated" : "Category added",
      `${name} is ${input.is_active ? "live" : "hidden"} in the shop.`,
    );
    resetCategoryForm();
  }

  return (
    <div className="mx-auto my-8 max-w-[1000px] sm:my-10 lg:my-12">
      <div>
        <span className={eyebrow}>SSC / SETTINGS</span>
        <h1 className="mb-2 mt-4 font-serif text-[clamp(2.2rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-navy-900">
          Store <em className={accentText}>details.</em>
        </h1>
        <p className="max-w-[440px] text-[11px] leading-relaxed text-navy-900/55">
          Contact details and categories shoppers see across the store.
        </p>
      </div>

      <form className={`${panel} mt-7 p-5 sm:p-6`} onSubmit={submitContact}>
        <div className="flex items-start gap-3 border-b border-navy-900/10 pb-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-forest-700 to-navy-900 text-cream-50">
            <Settings2 size={16} />
          </span>
          <div>
            <h2 className="font-serif text-[23px] font-semibold text-navy-900">Contact details</h2>
            <p className="mt-1 text-[10px] leading-relaxed text-navy-900/50">
              Shown in the footer, the About page and the checkout WhatsApp handoff.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className={`${fieldLabel} sm:col-span-2`}>
            Store name
            <input
              className={fieldInput}
              required
              maxLength={80}
              value={contact.store_name}
              onChange={(e) => setContactField("store_name", e.target.value)}
              placeholder="Stylish Steps Collection"
            />
          </label>
          <label className={fieldLabel}>
            Support email <span className="normal-case tracking-normal text-navy-900/40">(optional)</span>
            <input
              className={fieldInput}
              type="email"
              value={contact.support_email}
              onChange={(e) => setContactField("support_email", e.target.value)}
              placeholder="hello@yourstore.com"
            />
          </label>
          <label className={fieldLabel}>
            Contact phone
            <input
              className={fieldInput}
              value={contact.contact_phone}
              onChange={(e) => setContactField("contact_phone", e.target.value)}
              placeholder="+233 59 305 4022"
            />
          </label>
          <label className={fieldLabel}>
            WhatsApp number
            <input
              className={fieldInput}
              value={contact.whatsapp_number}
              onChange={(e) => setContactField("whatsapp_number", e.target.value)}
              placeholder="233593054022"
            />
            <span className="normal-case tracking-normal text-[9px] font-normal text-navy-900/40">
              International format, digits only — no + or spaces.
            </span>
          </label>
          <label className={fieldLabel}>
            Address
            <input
              className={fieldInput}
              value={contact.contact_address}
              onChange={(e) => setContactField("contact_address", e.target.value)}
              placeholder="Accra, Ghana"
            />
          </label>
          <label className={fieldLabel}>
            Instagram URL
            <input
              className={fieldInput}
              type="url"
              value={contact.instagram_url}
              onChange={(e) => setContactField("instagram_url", e.target.value)}
              placeholder="https://www.instagram.com/…"
            />
          </label>
          <label className={fieldLabel}>
            TikTok URL
            <input
              className={fieldInput}
              type="url"
              value={contact.tiktok_url}
              onChange={(e) => setContactField("tiktok_url", e.target.value)}
              placeholder="https://www.tiktok.com/@…"
            />
          </label>
        </div>

        {(contactError || settingsError) && (
          <div
            className="mt-4 rounded-sm border border-red-900/20 bg-red-900/5 p-3 text-[10px] leading-relaxed text-red-900/80"
            role="alert"
          >
            {contactError || settingsError}
          </div>
        )}

        <button className={`${btnPrimary} mt-5 w-full justify-between sm:w-auto sm:justify-center`} disabled={savingContact}>
          {savingContact ? "Saving…" : "Save contact details"} <Save size={15} />
        </button>
      </form>

      <div className={`${panel} mt-6 p-5 sm:p-6`}>
        <div className="flex flex-col items-start justify-between gap-3 border-b border-navy-900/10 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-gold-600 to-gold-400 text-navy-950">
              <Tags size={16} />
            </span>
            <div>
              <h2 className="font-serif text-[23px] font-semibold text-navy-900">Categories</h2>
              <p className="mt-1 text-[10px] leading-relaxed text-navy-900/50">
                Add a category or rename the ones already in the shop.
              </p>
            </div>
          </div>
          <span className={`${statusPill} bg-navy-900/8 text-navy-900/60`}>{categories.length} total</span>
        </div>

        <form id="category-form" className="mt-5 rounded-sm border border-navy-900/10 bg-cream-100/60 p-4" onSubmit={submitCategory}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[9px] font-semibold uppercase tracking-[0.16em] text-navy-800/70">
              {editingId ? "Edit category" : "Add a category"}
            </h3>
            {editingId && (
              <button type="button" className="text-[9px] uppercase tracking-[0.12em] text-navy-900/50 underline-offset-4 hover:text-forest-700 hover:underline" onClick={resetCategoryForm}>
                Cancel edit
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className={fieldLabel}>
              Name
              <input
                className={fieldInput}
                required
                maxLength={60}
                value={categoryForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCategoryForm((current) => ({
                    ...current,
                    name,
                    slug: slugTouched ? current.slug : slugify(name),
                  }));
                }}
                placeholder="Leather goods"
              />
            </label>
            <label className={fieldLabel}>
              Slug
              <input
                className={fieldInput}
                required
                value={categoryForm.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setCategoryForm((current) => ({ ...current, slug: slugify(e.target.value) }));
                }}
                placeholder="leather-goods"
              />
            </label>
            <label className={`${fieldLabel} sm:col-span-2`}>
              Description <span className="normal-case tracking-normal text-navy-900/40">(optional)</span>
              <input
                className={fieldInput}
                maxLength={160}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((current) => ({ ...current, description: e.target.value }))}
                placeholder="A short line shown alongside the category."
              />
            </label>
            <label className={fieldLabel}>
              Sort order
              <input
                className={fieldInput}
                type="number"
                min="0"
                step="1"
                value={categoryForm.sort_order}
                onChange={(e) => setCategoryForm((current) => ({ ...current, sort_order: e.target.value }))}
              />
            </label>
            <label className="flex items-start gap-2.5 self-end pb-2 text-[10px] font-medium text-navy-800/80">
              <input
                type="checkbox"
                className="mt-0.5 accent-forest-700"
                checked={categoryForm.is_active}
                onChange={(e) => setCategoryForm((current) => ({ ...current, is_active: e.target.checked }))}
              />
              Live in the shop
            </label>
          </div>

          {categoryError && (
            <div className="mt-4 rounded-sm border border-red-900/20 bg-red-900/5 p-3 text-[10px] leading-relaxed text-red-900/80" role="alert">
              {categoryError}
            </div>
          )}

          <button className={`${btnPrimary} mt-4 w-full justify-center sm:w-auto`} disabled={savingCategory}>
            {editingId ? <Save size={15} /> : <Plus size={15} />}
            {savingCategory ? "Saving…" : editingId ? "Save category" : "Add category"}
          </button>
        </form>

        {loading && !categories.length && <p className="py-3 text-[12px] text-navy-900/50">Loading categories…</p>}

        {categories.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse whitespace-nowrap text-left">
              <thead>
                <tr>
                  <th className={tableHead}>CATEGORY</th>
                  <th className={tableHead}>SLUG</th>
                  <th className={tableHead}>ORDER</th>
                  <th className={tableHead}>STATUS</th>
                  <th className={tableHead} />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-cream-100/60">
                    <td className={tableCell}>
                      <strong className="font-medium text-navy-900">{category.name}</strong>
                      {category.description && (
                        <small className="mt-1 block max-w-[260px] truncate text-[9px] text-navy-900/40">
                          {category.description}
                        </small>
                      )}
                    </td>
                    <td className={tableCell}>{category.slug}</td>
                    <td className={tableCell}>{category.sort_order}</td>
                    <td className={tableCell}>
                      <span
                        className={`${statusPill} ${
                          category.is_active ? "bg-forest-700/12 text-forest-700" : "bg-red-900/10 text-red-900/70"
                        }`}
                      >
                        {category.is_active ? "Live" : "Hidden"}
                      </span>
                    </td>
                    <td className={tableCell}>
                      <div className="flex justify-end">
                        <button
                          className="border-b border-gold-500/50 pb-0.5 text-[10px] text-navy-800 transition-colors hover:border-forest-700 hover:text-forest-700"
                          onClick={() => startEdit(category)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && (
            <div className="px-3 py-10 text-center text-navy-900/50">
              <Tags size={24} className="mx-auto mb-3 text-gold-500" />
              <h3 className="mb-2 font-serif text-[21px] font-semibold text-navy-900">No categories yet.</h3>
              <p className="text-[10px]">Add your first category above, then assign products to it.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default AdminSettingsPage;
