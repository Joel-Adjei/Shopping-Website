import type { CartLine } from '../types'
import { money } from '../util/export'
import type { CheckoutDetails } from '../stores/useCheckoutStore'
import { WHATSAPP_ADMIN_NUMBER } from './config'

type OrderWhatsAppInput = {
  orderNumber: string
  details: CheckoutDetails
  lines: CartLine[]
  subtotal: number
  deliveryFee: number
  total: number
  whatsappNumber?: string | null
}

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'Cash on delivery',
  mobile_money_manual: 'Mobile Money (confirm manually)',
  online: 'Online payment',
}

// wa.me needs country-coded digits. Ghanaian numbers typed locally start with 0.
export const normalizeWhatsAppNumber = (value: string | null | undefined) => {
  const digits = (value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.length === 10 && digits.startsWith('0') ? `233${digits.slice(1)}` : digits
}

// wa.me opens the shopper's own WhatsApp with a chat already addressed to the store,
// so they only need to press send. Returns null until an admin number is configured.
export const buildOrderWhatsAppUrl = (input: OrderWhatsAppInput): string | null => {
  const number = normalizeWhatsAppNumber(input.whatsappNumber) || normalizeWhatsAppNumber(WHATSAPP_ADMIN_NUMBER)
  if (!number || !input.lines.length) return null

  const items = input.lines.map((line) => {
    const personalisation = line.customization ? `, personalised “${line.customization}”` : ''
    return `• ${line.product.name} (${line.color} / ${line.size}${personalisation}) × ${line.quantity} — ${money(line.product.price * line.quantity)}`
  })

  const message = [
    input.orderNumber
      ? 'Hello Stylish Steps Collection, I just placed an order.'
      : "Hello Stylish Steps Collection, I'd like to place this order.",
    '',
    input.orderNumber ? `Order: ${input.orderNumber}` : null,
    `Name: ${input.details.name}`,
    `Phone: ${input.details.phone}`,
    `Address: ${input.details.address}, ${input.details.city}, Ghana`,
    `Payment: ${PAYMENT_LABELS[input.details.payment] ?? input.details.payment}`,
    input.details.notes ? `Notes: ${input.details.notes}` : null,
    '',
    'Items:',
    ...items,
    '',
    `Subtotal: ${money(input.subtotal)}`,
    `Delivery: ${input.deliveryFee === 0 ? 'Complimentary' : money(input.deliveryFee)}`,
    `Total: ${money(input.total)}`,
  ]
    .filter((line) => line !== null)
    .join('\n')

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

type ProductEnquiryInput = {
  productName: string
  price: number
  productUrl?: string
  size?: string | null
  color?: string | null
  customization?: string | null
  whatsappNumber?: string | null
}

// A shopper can ask the vendor about a specific piece; the message carries the
// product, selected options and the link back to the product page.
export const buildProductEnquiryWhatsAppUrl = (input: ProductEnquiryInput): string | null => {
  const number = normalizeWhatsAppNumber(input.whatsappNumber) || normalizeWhatsAppNumber(WHATSAPP_ADMIN_NUMBER)
  if (!number) return null

  const message = [
    'Hello Stylish Steps Collection, I have a question about this piece.',
    '',
    `Product: ${input.productName}`,
    `Price: ${money(input.price)}`,
    input.size ? `Size: ${input.size}` : null,
    input.color ? `Colour: ${input.color}` : null,
    input.customization ? `Customisation: ${input.customization}` : null,
    input.productUrl ? `Link: ${input.productUrl}` : null,
    '',
    'My question: ',
  ]
    .filter((line) => line !== null)
    .join('\n')

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
