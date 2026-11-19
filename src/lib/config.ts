// Display-only values. The create-order Edge Function recalculates prices and the delivery
// fee on the server, so these are never trusted for billing.
export const FREE_DELIVERY_THRESHOLD = 1000
export const STANDARD_DELIVERY_FEE = 25
export const MAX_CUSTOMIZATION_LENGTH = 40

// International format, digits only (e.g. 233244000000). Checkout opens a wa.me chat with
// this number so the shopper can send the order details to the store.
export const WHATSAPP_ADMIN_NUMBER = (import.meta.env.VITE_WHATSAPP_ADMIN_NUMBER ?? '').replace(/\D/g, '')

export const getDeliveryFee = (subtotal: number) =>
  subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE
