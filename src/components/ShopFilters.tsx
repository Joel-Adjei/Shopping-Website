import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import type { Product } from "../types";
import {
  ALL_CATEGORIES,
  getPriceBounds,
  useShopFilterStore,
} from "../stores/useShopFilterStore";
import { focusRing } from "../lib/ui";

type ShopFiltersProps = {
  products: Product[];
  categoryNames: Record<string, string>;
  resultCount?: number;
  onDone?: () => void;
};

// Only names we can reasonably represent get a swatch; the rest stay plain labels.
const SWATCHES: Record<string, string> = {
  black: "#1c1c1c",
  white: "#f5f5f2",
  ivory: "#f0e9dc",
  cream: "#efe7d7",
  oat: "#ddd2bd",
  sand: "#d9c8a9",
  stone: "#c8c3b8",
  beige: "#e4d7bf",
  sky: "#b7cfe0",
  blue: "#3d5f86",
  olive: "#7c7f52",
  green: "#4f6b52",
  tan: "#b98a5c",
  brown: "#6b4a34",
  charcoal: "#41454a",
  chocolate: "#4b3327",
  navy: "#0a243d",
  gold: "#bc9945",
  forest: "#2a4f3e",
  grey: "#9aa0a3",
  gray: "#9aa0a3",
  pink: "#e6c3c8",
  red: "#9e3a30",
};

const SIZE_ORDER = new Map(
  ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"].map((size, index) => [size, index]),
);

const sizeRank = (size: string) => {
  const upper = size.toUpperCase();
  if (SIZE_ORDER.has(upper)) return 100 + SIZE_ORDER.get(upper)!;
  if (/^\d+(\.\d+)?$/.test(size)) return Number(size);
  return 1000;
};

const countValues = (values: string[]) => {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].map(([value, count]) => ({ value, count }));
};

const priceLabel = (value: number) => `GHS ${value.toLocaleString("en-GH")}`;

const thumbClasses =
  "ssc-range-thumb pointer-events-none absolute inset-x-0 top-1/2 z-10 h-5 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:h-[3px] [&::-moz-range-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cream-50 [&::-webkit-slider-thumb]:bg-forest-700 [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(10,36,61,0.35)] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cream-50 [&::-moz-range-thumb]:bg-forest-700";

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details open className="group border-t border-navy-900/10 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-navy-900/70 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          size={13}
          className="shrink-0 text-navy-900/40 transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="pt-3.5">{children}</div>
    </details>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
  swatch,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
  swatch?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`group/row flex w-full items-center justify-between gap-3 rounded-sm py-1.5 text-left transition-colors ${focusRing}`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[2px] border transition-colors ${
            checked
              ? "border-forest-700 bg-forest-700 text-cream-50"
              : "border-navy-900/25 bg-cream-50/60"
          }`}
        >
          {checked && <Check size={10} strokeWidth={3} />}
        </span>
        {swatch && (
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-full border border-navy-900/15"
            style={{ backgroundColor: swatch }}
          />
        )}
        <span
          className={`truncate text-[10.5px] transition-colors ${
            checked
              ? "font-medium text-forest-700"
              : "text-navy-900/65 group-hover/row:text-navy-900"
          }`}
        >
          {label}
        </span>
      </span>
      <span className="shrink-0 text-[8.5px] tabular-nums text-navy-900/35">{count}</span>
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[10.5px] text-navy-900/65">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${focusRing} ${
          checked ? "bg-forest-700" : "bg-navy-900/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-cream-50 shadow transition-transform duration-200 ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function ShopFilters({
  products,
  categoryNames,
  resultCount,
  onDone,
}: ShopFiltersProps) {
  const search = useShopFilterStore((state) => state.search);
  const category = useShopFilterStore((state) => state.category);
  const priceMin = useShopFilterStore((state) => state.priceMin);
  const priceMax = useShopFilterStore((state) => state.priceMax);
  const sizes = useShopFilterStore((state) => state.sizes);
  const colors = useShopFilterStore((state) => state.colors);
  const tags = useShopFilterStore((state) => state.tags);
  const inStock = useShopFilterStore((state) => state.inStock);
  const customisable = useShopFilterStore((state) => state.customisable);
  const setCategory = useShopFilterStore((state) => state.setCategory);
  const setPriceRange = useShopFilterStore((state) => state.setPriceRange);
  const toggleSize = useShopFilterStore((state) => state.toggleSize);
  const toggleColor = useShopFilterStore((state) => state.toggleColor);
  const toggleTag = useShopFilterStore((state) => state.toggleTag);
  const setInStock = useShopFilterStore((state) => state.setInStock);
  const setCustomisable = useShopFilterStore((state) => state.setCustomisable);
  const reset = useShopFilterStore((state) => state.reset);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      if (product.category_id) {
        counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);
      }
    });
    return [...counts.entries()].map(([id, count]) => ({
      id,
      name: categoryNames[id] ?? id,
      count,
    }));
  }, [products, categoryNames]);

  const colorFacets = useMemo(
    () =>
      countValues(products.flatMap((product) => product.colors)).sort(
        (a, b) => b.count - a.count || a.value.localeCompare(b.value),
      ),
    [products],
  );

  const sizeFacets = useMemo(
    () =>
      countValues(products.flatMap((product) => product.sizes)).sort(
        (a, b) =>
          sizeRank(a.value) - sizeRank(b.value) || a.value.localeCompare(b.value),
      ),
    [products],
  );

  const tagFacets = useMemo(
    () =>
      countValues(products.flatMap((product) => product.tags)).sort(
        (a, b) => b.count - a.count || a.value.localeCompare(b.value),
      ),
    [products],
  );

  const bounds = useMemo(() => getPriceBounds(products), [products]);
  const rangeMin = priceMin ?? bounds.min;
  const rangeMax = priceMax ?? bounds.max;
  const span = Math.max(bounds.max - bounds.min, 1);
  const step = span > 500 ? 10 : span > 100 ? 5 : 1;
  const leftPct = Math.min(100, Math.max(0, ((rangeMin - bounds.min) / span) * 100));
  const rightPct = Math.min(100, Math.max(0, 100 - ((rangeMax - bounds.min) / span) * 100));

  const activeCount =
    (category !== ALL_CATEGORIES ? 1 : 0) +
    (priceMin !== null || priceMax !== null ? 1 : 0) +
    sizes.length +
    colors.length +
    tags.length +
    (inStock ? 1 : 0) +
    (customisable ? 1 : 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-navy-900/10 pb-4">
        <span className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-navy-900">
          <SlidersHorizontal size={14} className="text-gold-600" />
          Filters
          {activeCount > 0 && (
            <span className="grid h-4 min-w-4 place-items-center rounded-full bg-forest-700 px-1 text-[8px] text-cream-50">
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className={`text-[8.5px] uppercase tracking-[0.12em] text-navy-900/45 underline-offset-4 transition-colors hover:text-forest-700 hover:underline ${focusRing}`}
          >
            Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Category">
        <div className="grid gap-0.5">
          <button
            type="button"
            onClick={() => setCategory(ALL_CATEGORIES)}
            aria-pressed={category === ALL_CATEGORIES}
            className={`group/row flex w-full items-center justify-between gap-3 py-1.5 text-left ${focusRing}`}
          >
            <span className="flex items-center gap-2.5">
              <span
                className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${
                  category === ALL_CATEGORIES ? "border-forest-700" : "border-navy-900/25"
                }`}
              >
                {category === ALL_CATEGORIES && (
                  <span className="h-1.5 w-1.5 rounded-full bg-forest-700" />
                )}
              </span>
              <span
                className={`text-[10.5px] ${
                  category === ALL_CATEGORIES
                    ? "font-medium text-forest-700"
                    : "text-navy-900/65 group-hover/row:text-navy-900"
                }`}
              >
                All pieces
              </span>
            </span>
            <span className="text-[8.5px] tabular-nums text-navy-900/35">{products.length}</span>
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              aria-pressed={category === item.id}
              className={`group/row flex w-full items-center justify-between gap-3 py-1.5 text-left ${focusRing}`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${
                    category === item.id ? "border-forest-700" : "border-navy-900/25"
                  }`}
                >
                  {category === item.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-forest-700" />
                  )}
                </span>
                <span
                  className={`text-[10.5px] ${
                    category === item.id
                      ? "font-medium text-forest-700"
                      : "text-navy-900/65 group-hover/row:text-navy-900"
                  }`}
                >
                  {item.name}
                </span>
              </span>
              <span className="text-[8.5px] tabular-nums text-navy-900/35">{item.count}</span>
            </button>
          ))}
        </div>
      </FilterGroup>

      {bounds.max > bounds.min && (
        <FilterGroup title="Price">
          <div className="px-0.5">
            <div className="relative h-5">
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-navy-900/10" />
              <div
                className="pointer-events-none absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-forest-700"
                style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
              />
              <input
                type="range"
                min={bounds.min}
                max={bounds.max}
                step={step}
                value={rangeMin}
                onChange={(e) =>
                  setPriceRange(Math.min(Number(e.target.value), rangeMax), rangeMax)
                }
                aria-label="Minimum price"
                className={`${thumbClasses} z-20`}
              />
              <input
                type="range"
                min={bounds.min}
                max={bounds.max}
                step={step}
                value={rangeMax}
                onChange={(e) =>
                  setPriceRange(rangeMin, Math.max(Number(e.target.value), rangeMin))
                }
                aria-label="Maximum price"
                className={thumbClasses}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[9px] tabular-nums text-navy-900/55">
              <span>{priceLabel(rangeMin)}</span>
              <span>{priceLabel(rangeMax)}</span>
            </div>
          </div>
        </FilterGroup>
      )}

      {sizeFacets.length > 0 && (
        <FilterGroup title="Size">
          <div className="flex flex-wrap gap-1.5">
            {sizeFacets.map((item) => {
              const selected = sizes.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleSize(item.value)}
                  aria-pressed={selected}
                  className={`min-w-[34px] rounded-sm border px-2 py-1.5 text-[9px] transition-colors ${focusRing} ${
                    selected
                      ? "border-navy-900 bg-navy-900 text-cream-50"
                      : "border-navy-900/15 bg-cream-50/50 text-navy-900/65 hover:border-gold-500/60 hover:text-navy-900"
                  }`}
                >
                  {item.value}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {colorFacets.length > 0 && (
        <FilterGroup title="Colour">
          <div className="grid gap-0.5">
            {colorFacets.map((item) => (
              <CheckRow
                key={item.value}
                label={item.value}
                count={item.count}
                checked={colors.includes(item.value)}
                onChange={() => toggleColor(item.value)}
                swatch={SWATCHES[item.value.toLowerCase()]}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      {tagFacets.length > 0 && (
        <FilterGroup title="Tags">
          <div className="grid gap-0.5">
            {tagFacets.map((item) => (
              <CheckRow
                key={item.value}
                label={item.value}
                count={item.count}
                checked={tags.includes(item.value)}
                onChange={() => toggleTag(item.value)}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Availability">
        <div className="grid gap-0.5">
          <ToggleRow
            label="In stock"
            checked={inStock}
            onChange={() => setInStock(!inStock)}
          />
          <ToggleRow
            label="Customisable"
            checked={customisable}
            onChange={() => setCustomisable(!customisable)}
          />
        </div>
      </FilterGroup>

      {search && (
        <p className="mt-3 truncate text-[9px] text-navy-900/45">
          Searching “{search}”
        </p>
      )}

      {onDone && (
        <button
          type="button"
          onClick={onDone}
          className={`ssc-primary mt-5 w-full rounded-full bg-linear-to-r from-navy-900 via-navy-800 to-forest-800 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-cream-50 transition-opacity hover:opacity-90 ${focusRing}`}
        >
          Show {resultCount ?? 0} piece{(resultCount ?? 0) === 1 ? "" : "s"}
        </button>
      )}
    </div>
  );
}
