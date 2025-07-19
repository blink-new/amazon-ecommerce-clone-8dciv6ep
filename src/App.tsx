import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { ProductCard } from '@/components/product/ProductCard'
import { ShoppingCart } from '@/components/cart/ShoppingCart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Filter, SlidersHorizontal } from 'lucide-react'
import { blink } from '@/blink/client'
import type { Product, CartItem, Category, User } from '@/types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  // Handle authentication state
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setAuthLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Load initial data when app starts
  useEffect(() => {
    loadInitialData()
  }, [])

  // Load cart items only after user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadCartItems()
    } else if (!user && !authLoading) {
      setCartItems([]) // Clear cart if user logs out
    }
  }, [user, authLoading, loadCartItems])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      // Load products and categories
      const [productsData, categoriesData] = await Promise.all([
        blink.db.products.list({
          orderBy: { createdAt: 'desc' },
          limit: 50
        }),
        blink.db.categories.list({
          orderBy: { name: 'asc' }
        })
      ])

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCartItems = useCallback(async () => {
    if (!user) return
    
    try {
      const userCartItems = await blink.db.cartItems.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setCartItems(userCartItems)
    } catch (error) {
      console.error('Failed to load cart items:', error)
      setCartItems([]) // Set empty array on error
    }
  }, [user])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
  }

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      console.error('User not authenticated')
      return
    }
    
    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.productId === productId)
      
      if (existingItem) {
        // Update quantity
        await blink.db.cartItems.update(existingItem.id, {
          quantity: existingItem.quantity + 1,
          updatedAt: new Date().toISOString()
        })
      } else {
        // Add new item
        await blink.db.cartItems.create({
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          productId,
          quantity: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      loadCartItems()
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const handleProductClick = (productId: string) => {
    // TODO: Navigate to product detail page
    console.log('Product clicked:', productId)
  }

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || 
      selectedCategory === 'All' ||
      product.category === `cat_${selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    
    const matchesPriceRange = 
      (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
      (!priceRange.max || product.price <= parseFloat(priceRange.max))
    
    return matchesSearch && matchesCategory && matchesPriceRange
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  // Show loading screen while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
        cartItems={cartItems}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Filters and Search Results */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Results Info */}
            <div className="flex-1">
              {searchQuery && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600">
                    Results for "{searchQuery}" ({filteredProducts.length} products)
                  </span>
                </div>
              )}
              {selectedCategory && selectedCategory !== 'All' && (
                <Badge variant="secondary" className="mr-2">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">Price:</span>
            <Input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-20"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-20"
            />
            {(priceRange.min || priceRange.max) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPriceRange({ min: '', max: '' })}
                className="text-gray-500"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('')
                setPriceRange({ min: '', max: '' })
              }}
              className="bg-amazon-orange hover:bg-orange-600"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && filteredProducts.length > 0 && filteredProducts.length >= 20 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        )}
      </main>

      {/* Shopping Cart */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateCart={loadCartItems}
      />
    </div>
  )
}

export default App