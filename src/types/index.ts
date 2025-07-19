export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  category: string
  brand: string
  imageUrl: string
  images: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  stockQuantity: number
  features: string[]
  specifications: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  parentId?: string
  createdAt: string
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  createdAt: string
  updatedAt: string
  product?: Product
}

export interface Order {
  id: string
  userId: string
  totalAmount: number
  status: string
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  createdAt: string
  product?: Product
}

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  title: string
  comment: string
  verifiedPurchase: boolean
  helpfulCount: number
  createdAt: string
}

export interface Address {
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface User {
  id: string
  email: string
  displayName?: string
  avatar?: string
}