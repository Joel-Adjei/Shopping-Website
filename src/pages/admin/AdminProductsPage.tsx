import { Package, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminProductsStore } from "../../stores/useAdminProductsStore";
import { useUIStore } from "../../stores/useUIStore";
import { money } from "../../util/export";
import {
  accentText,
  btnPrimary,
  eyebrow,
  fieldInput,
  panel,
  statusPill,
  tableCell,
  tableHead,
} from "../../lib/ui";

function AdminProductsPage() {
  const products = useAdminProductsStore((state) => state.products);
  const categories = useAdminProductsStore((state) => state.categories);
  const loading = useAdminProductsStore((state) => state.loading);
  const error = useAdminProductsStore((state) => state.error);
  const load = useAdminProductsStore((state) => state.load);
  const setActive = useAdminProductsStore((state) => state.setActive);
  const deleteProduct = useAdminProductsStore((state) => state.deleteProduct);
  const showToast = useUIStore((state) => state.showToast);

  const [query, setQuery] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    void load();
  }, [load]);

  const categoryName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const visible = products.filter((p) =>
    `${p.name} ${p.sku ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  async function toggle(id: string, isActive: boolean) {
    setActionError((await setActive(id, isActive)) ?? "");
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Delete “${name}”? This cannot be undone. Hiding it keeps the record.`)) return;
    const failure = await deleteProduct(id);
    setActionError(failure ?? "");
    if (!failure) showToast("Product deleted", `${name} was removed from the catalogue.`);
  }

  return (
    <div className="mx-auto my-8 max-w-[1100px] sm:my-10 lg:my-12">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <span className={eyebrow}>SSC / CATALOGUE</span>
          <h1 className="mb-2 mt-4 font-serif text-[clamp(2.2rem,4vw,3.2rem)] font-normal leading-[1.05] tracking-[-0.04em] text-navy-900">
            Your <em className={accentText}>products.</em>
          </h1>
          <p className="text-[11px] text-navy-900/55">Add, edit, hide or remove the pieces in your store.</p>
        </div>
        <Link to="/admin/products/new" className={btnPrimary}>
          <Plus size={15} /> Add product
        </Link>
      </div>

      <div className={`${panel} mt-8 p-4 sm:p-6`}>
        <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <span className={eyebrow}>{products.length} IN CATALOGUE</span>
            <h2 className="mt-2 font-serif text-[25px] font-normal text-navy-900 sm:text-[27px]">All products</h2>
          </div>
          <input
            className={`${fieldInput} w-full sm:w-[min(260px,100%)]`}
            type="search"
            placeholder="Search name or SKU…"
            aria-label="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {(error || actionError) && (
          <div className="mb-4 rounded-sm border border-red-900/20 bg-red-900/5 p-3 text-[10px] leading-relaxed text-red-900/80" role="alert">
            {error || actionError}
          </div>
        )}
        {loading && !products.length && <p className="py-3 text-[12px] text-navy-900/50">Loading products…</p>}

        {visible.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse whitespace-nowrap text-left">
              <thead>
                <tr>
                  <th className={tableHead}>PRODUCT</th>
                  <th className={tableHead}>CATEGORY</th>
                  <th className={tableHead}>PRICE</th>
                  <th className={tableHead}>STOCK</th>
                  <th className={tableHead}>STATUS</th>
                  <th className={tableHead} />
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-cream-100/60">
                    <td className={tableCell}>
                      <div className="flex items-center gap-3">
                        <div className="grid h-14 w-11 shrink-0 place-items-center overflow-hidden rounded-sm bg-cream-300 text-navy-900/30">
                          {p.image_url && <img className="h-full w-full object-cover" src={p.image_url} alt="" />}
                        </div>
                        <div>
                          <strong className="font-medium text-navy-900">{p.name}</strong>
                          <small className="mt-1 block text-[9px] text-navy-900/40">{p.sku || p.slug}</small>
                        </div>
                      </div>
                    </td>
                    <td className={tableCell}>{(p.category_id && categoryName[p.category_id]) || "—"}</td>
                    <td className={tableCell}>{money(p.price)}</td>
                    <td className={tableCell}>
                      <span
                        className={
                          p.stock_quantity <= 0
                            ? "font-semibold text-red-900/75"
                            : p.stock_quantity <= 5
                              ? "font-semibold text-gold-700"
                              : ""
                        }
                      >
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className={tableCell}>
                      <span
                        className={`${statusPill} ${
                          p.is_active ? "bg-forest-700/12 text-forest-700" : "bg-red-900/10 text-red-900/70"
                        }`}
                      >
                        {p.is_active ? "Live" : "Hidden"}
                      </span>
                    </td>
                    <td className={tableCell}>
                      <div className="flex justify-end gap-4 text-[10px]">
                        <Link
                          className="border-b border-gold-500/50 pb-0.5 text-navy-800 transition-colors hover:border-forest-700 hover:text-forest-700"
                          to={`/admin/products/${p.id}/edit`}
                        >
                          Edit
                        </Link>
                        <button
                          className="border-b border-gold-500/50 pb-0.5 text-navy-800 transition-colors hover:border-forest-700 hover:text-forest-700"
                          onClick={() => toggle(p.id, !p.is_active)}
                        >
                          {p.is_active ? "Hide" : "Show"}
                        </button>
                        <button
                          className="border-b border-red-900/25 pb-0.5 text-red-900/70 transition-colors hover:border-red-900/60 hover:text-red-900"
                          onClick={() => remove(p.id, p.name)}
                        >
                          Delete
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
            <div className="px-3 py-12 text-center text-navy-900/50">
              <Package size={26} className="mx-auto mb-4 text-gold-500" />
              <h3 className="mb-2 font-serif text-[23px] font-normal text-navy-900">
                {products.length ? "No products match your search." : "Your catalogue is empty."}
              </h3>
              <p className="text-[10px]">
                {products.length ? "Try a different name or SKU." : "Add your first piece to see it in the store."}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default AdminProductsPage;
