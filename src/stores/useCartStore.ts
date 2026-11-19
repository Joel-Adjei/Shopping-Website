import { create } from 'zustand'
import { getDeliveryFee, MAX_CUSTOMIZATION_LENGTH } from '../lib/config'
import type { CartLine, Product } from '../types'

export const normalizeCustomization = (value: string | null | undefined) => {
  const text = value?.trim().replace(/\s+/g, ' ').slice(0, MAX_CUSTOMIZATION_LENGTH)
  return text || null
}

export const lineKey = (
  line: Pick<CartLine, 'size' | 'color' | 'customization'> & { product: Pick<Product, 'id'> },
) => `${line.product.id}|${line.size}|${line.color}|${line.customization ?? ''}`

type CartState = {
  lines: CartLine[]
  addItem: (
    product: Product,
    options?: { size?: string; color?: string; quantity?: number; customization?: string | null },
  ) => void
  changeQuantity: (key: string, delta: number) => void
  removeItem: (key: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()((set) => ({
  lines: [],

  // Quick-add (no options) picks the first size and colour; the product page passes its choices.
  addItem: (product, options = {}) =>
    set((state) => {
      const size = options.size ?? product.sizes[0] ?? 'One size'
      const color = options.color ?? product.colors[0] ?? 'Default'
      const quantity = options.quantity ?? 1
      // Personalisation only applies to products that offer it.
      const customization = product.customization_enabled
        ? normalizeCustomization(options.customization)
        : null
      const key = lineKey({ product, size, color, customization })
      const exists = state.lines.some((line) => lineKey(line) === key)
      return {
        lines: exists
          ? state.lines.map((line) =>
              lineKey(line) === key ? { ...line, quantity: line.quantity + quantity } : line,
            )
          : [...state.lines, { product, quantity, size, color, customization }],
      }
    }),

  // A quantity that reaches zero removes the line.
  changeQuantity: (key, delta) =>
    set((state) => ({
      lines: state.lines
        .map((line) => (lineKey(line) === key ? { ...line, quantity: line.quantity + delta } : line))
        .filter((line) => line.quantity > 0),
    })),

  removeItem: (key) => set((state) => ({ lines: state.lines.filter((line) => lineKey(line) !== key) })),

  clear: () => set({ lines: [] }),
}))

// Selectors return primitives, so a component re-renders only when its value changes.
export const selectCartCount = (state: CartState) =>
  state.lines.reduce((total, line) => total + line.quantity, 0)

export const selectSubtotal = (state: CartState) =>
  state.lines.reduce((total, line) => total + line.product.price * line.quantity, 0)

export const selectDeliveryFee = (state: CartState) => getDeliveryFee(selectSubtotal(state))
