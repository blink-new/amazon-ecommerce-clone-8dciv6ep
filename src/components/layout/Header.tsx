import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Menu, User, MapPin, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { blink } from '@/blink/client'
import type { User as UserType, CartItem } from '@/types'

interface HeaderProps {
  onSearch: (query: string) => void
  onCategorySelect: (category: string) => void
  cartItems: CartItem[]
  onCartClick: () => void
}

export function Header({ onSearch, onCategorySelect, cartItems, onCartClick }: HeaderProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setIsLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleSignOut = () => {
    blink.auth.logout()
  }

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const categories = [
    'Electronics',
    'Books',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors'
  ]

  if (isLoading) {
    return (
      <header className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-lg">Loading...</div>
          </div>
        </div>
      </header>
    )
  }

  if (!user) {
    return (
      <header className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <Button 
              onClick={() => blink.auth.login()}
              className="bg-amazon-orange hover:bg-orange-600 text-white"
            >
              Sign In to Continue
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50">
      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-slate-800">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="py-4">
                <h3 className="font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onCategorySelect(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-white">amazon</span>
              <span className="text-orange-400">.clone</span>
            </div>
          </div>

          {/* Delivery location */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4" />
            <div>
              <div className="text-xs text-gray-300">Deliver to</div>
              <div className="font-medium">New York 10001</div>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="flex">
              <Input
                type="text"
                placeholder="Search Amazon.clone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none border-r-0 bg-white text-black"
              />
              <Button 
                type="submit"
                className="rounded-l-none bg-amazon-orange hover:bg-orange-600 px-4"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* User account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-slate-800 hidden md:flex">
                  <User className="h-4 w-4 mr-1" />
                  <div className="text-left">
                    <div className="text-xs">Hello, {user.displayName || user.email}</div>
                    <div className="text-sm font-medium">Account & Lists</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Your Account</DropdownMenuItem>
                <DropdownMenuItem>Your Orders</DropdownMenuItem>
                <DropdownMenuItem>Your Lists</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Button variant="ghost" className="text-white hover:bg-slate-800 hidden md:flex">
              <Heart className="h-4 w-4 mr-1" />
              <div className="text-left">
                <div className="text-xs">Returns</div>
                <div className="text-sm font-medium">& Orders</div>
              </div>
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              className="text-white hover:bg-slate-800 relative"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-amazon-orange text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                  {cartItemCount}
                </Badge>
              )}
              <span className="ml-1 hidden md:inline">Cart</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="bg-slate-800 border-t border-slate-700">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-6 text-sm">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-slate-700 p-2"
              onClick={() => onCategorySelect('')}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                className="text-white hover:bg-slate-700 p-2 hidden md:inline-flex"
                onClick={() => onCategorySelect(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}