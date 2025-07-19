import { useState } from 'react'
import { Star, Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
  onProductClick: (productId: string) => void
}

export function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart(product.id)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
      onClick={() => onProductClick(product.id)}
    >
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={product.imageUrl}
            alt={product.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Discount badge */}
          {discountPercentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{discountPercentage}%
            </Badge>
          )}
          
          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={handleWishlistToggle}
          >
            <Heart 
              className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </Button>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Brand */}
          <div className="text-sm text-amazon-blue font-medium">{product.brand}</div>
          
          {/* Title */}
          <h3 className="font-medium text-sm line-clamp-2 text-gray-900 group-hover:text-amazon-blue transition-colors">
            {product.title}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({product.reviewCount.toLocaleString()})</span>
          </div>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Stock status */}
          <div className="text-xs">
            {product.inStock ? (
              <span className="text-green-600">In Stock</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-amazon-orange hover:bg-orange-600 text-white mt-3"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}