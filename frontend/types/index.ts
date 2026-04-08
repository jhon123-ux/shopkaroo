export interface Product {
  id: string
  name: string
  name_urdu?: string
  slug: string
  description: string
  price_pkr: number
  sale_price?: number | null
  category: string
  material: string
  dimensions?: { L: number; W: number; H: number; unit: string }
  images: string[]
  stock_qty: number
  weight_kg?: number
  is_active: boolean
  created_at: string
}

export interface OrderItem {
  product_id: string
  name: string
  qty: number
  price_pkr: number
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  phone: string
  city: string
  address: string
  items: OrderItem[]
  subtotal_pkr: number
  delivery_fee: number
  total_pkr: number
  payment: 'COD'
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  image?: string
  parent_id?: string | null
  children?: Category[]
}

export interface Review {
  id: string
  product_id: string
  name: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
}

export interface CartItem {
  product: Product
  qty: number
}

export interface Banner {
  id: string
  title: string
  subtitle: string
  badge_text: string
  badge_color: string
  cta_primary_text: string
  cta_primary_link: string
  cta_secondary_text: string
  cta_secondary_link: string
  bg_image_url: string | null
  bg_overlay: string
  sort_order: number
  is_active: boolean
  created_at?: string
}

