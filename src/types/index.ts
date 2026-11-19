export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
}

export type StoreSettings = {
  store_name: string
  support_email: string | null
  contact_phone: string | null
  whatsapp_number: string | null
  instagram_url: string | null
  tiktok_url: string | null
  contact_address: string | null
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category_id: string | null
  image_url: string | null
  images: string[]
  sizes: string[]
  colors: string[]
  stock_quantity: number
  is_featured: boolean
  is_active: boolean
  customization_enabled: boolean
  customization_label: string | null
}

// A product as the admin sees it (includes inactive items and the SKU).
export type AdminProduct = Product & { sku: string | null; created_at: string }

export type CartLine = {
  product: Product
  quantity: number
  size: string
  color: string
  customization: string | null
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// The columns the admin dashboard lists.
export type AdminOrder = {
  id: string
  order_number: string
  total: number
  order_status: OrderStatus
  created_at: string
}
