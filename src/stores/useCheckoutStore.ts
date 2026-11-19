import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { getDeliveryFee } from '../lib/config'
import type { CartLine } from '../types'

export type CheckoutDetails = {
  name: string
  phone: string
  email: string
  address: string
  city: string
  notes: string
  payment: string
}

type PlacedOrder = {
  orderNumber: string
  total: number
}

type CheckoutState = {
  submitting: boolean
  error: string
  unreachable: boolean
  clearError: () => void
  // Resolves with the saved order on success, or null (with `error` set) on failure.
  placeOrder: (details: CheckoutDetails, lines: CartLine[]) => Promise<PlacedOrder | null>
}

const FALLBACK_ERROR = 'We could not submit your order. Please try again.'
const UNREACHABLE_ERROR = 'We could not reach our ordering service. Please try again in a moment.'

// A FunctionsFetchError means the request never got a usable reply (function missing,
// blocked or offline), as opposed to the function rejecting the order itself.
const isTransportFailure = (error: unknown) => {
  const name = (error as { name?: string } | null)?.name
  const message = error instanceof Error ? error.message : ''
  return name === 'FunctionsFetchError' || /failed to send a request to the edge function/i.test(message)
}

// supabase-js wraps a non-2xx Edge Function reply; the server's own message is in error.context.
const readFunctionError = async (error: unknown): Promise<string> => {
  const response = (error as { context?: Response } | null)?.context
  if (response && typeof response.json === 'function') {
    try {
      const body = (await response.json()) as { error?: string }
      if (body?.error) return body.error
    } catch {
      /* use the fallback below */
    }
  }
  return error instanceof Error && error.message ? error.message : FALLBACK_ERROR
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  submitting: false,
  error: '',
  unreachable: false,

  clearError: () => set({ error: '', unreachable: false }),

  placeOrder: async (details, lines) => {
    if (!lines.length) {
      set({ error: 'Your bag is empty. Add a piece before checking out.', unreachable: false })
      return null
    }
    if (!supabase) {
      set({
        unreachable: false,
        error:
          'Connect Supabase and deploy the create-order Edge Function before accepting real orders. Your cart is safe, but this preview cannot submit a live order.',
      })
      return null
    }

    set({ submitting: true, error: '', unreachable: false })
    const { data, error } = await supabase.functions.invoke('create-order', {
      body: {
        customer: { name: details.name, phone: details.phone, email: details.email || null },
        address: { line1: details.address, city: details.city, country: 'Ghana' },
        payment_method: details.payment,
        notes: details.notes || null,
        // Only ids and choices go to the server; it reads prices from the database.
        items: lines.map((line) => ({
          product_id: line.product.id,
          quantity: line.quantity,
          size: line.size,
          color: line.color,
          customization: line.customization,
        })),
      },
    })

    if (error) {
      const unreachable = isTransportFailure(error)
      set({
        submitting: false,
        unreachable,
        error: unreachable ? UNREACHABLE_ERROR : await readFunctionError(error),
      })
      return null
    }

    set({ submitting: false })
    const serverTotal = Number(data?.total)
    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
    return {
      orderNumber: String(data?.order_number ?? ''),
      total: Number.isFinite(serverTotal) ? serverTotal : subtotal + getDeliveryFee(subtotal),
    }
  },
}))
