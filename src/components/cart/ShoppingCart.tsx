import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { blink } from '@/blink/client'
import type { CartItem, Product } from '@/types'

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onUpdateCart: () => void
}

export function ShoppingCart({ isOpen, onClose, cartItems, onUpdateCart }: ShoppingCartProps) {
  const [cartProducts, setCartProducts] = useState<Record<string, Product>>({})
  const [isLoading, setIsLoading] = useState(false)

  const loadCartProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const productIds = cartItems.map(item => item.productId)
      const products = await blink.db.products.list({
        where: {
          id: { in: productIds }
        }
      })
      
      const productMap = products.reduce((acc, product) => {
        acc[product.id] = product
        return acc
      }, {} as Record<string, Product>)
      
      setCartProducts(productMap)
    } catch (error) {
      console.error('Failed to load cart products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [cartItems])

  useEffect(() => {
    if (cartItems.length > 0) {
      loadCartProducts()
    }
  }, [cartItems, loadCartProducts])

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId)
      return
    }

    try {
      await blink.db.cartItems.update(itemId, {
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      })
      onUpdateCart()
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await blink.db.cartItems.delete(itemId)
      onUpdateCart()
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const clearCart = async () => {
    try {
      // Clear all current cart items
      for (const item of cartItems) {
        await blink.db.cartItems.delete(item.id)
      }
      
      onUpdateCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = cartProducts[item.productId]
      return total + (product ? product.price * item.quantity : 0)
    }, 0)
  }

  const totalAmount = calculateTotal()
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart
              {itemCount > 0 && (
                <Badge variant="secondary">{itemCount} items</Badge>
              )}
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-4">Add some products to get started</p>
                <Button onClick={onClose} className="bg-amazon-orange hover:bg-orange-600">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = cartProducts[item.productId]
                  if (!product) return null

                  return (
                    <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {product.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-600 hover:text-red-700"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right mt-2">
                          <span className="font-bold text-lg">
                            ${(product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cartItems.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full bg-amazon-orange hover:bg-orange-600 text-white"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}