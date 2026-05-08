import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Package, Key, ArrowLeft, Sparkles } from "lucide-react"

export default async function StorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profile = data
  }

  // Fetch products with stock count
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      keys!inner(id)
    `)
    .eq("is_active", true)
    .eq("keys.is_sold", false)

  // Group by product and count keys
  const productMap = new Map()
  products?.forEach(p => {
    if (!productMap.has(p.id)) {
      productMap.set(p.id, { ...p, stock_count: 0, keys: undefined })
    }
    productMap.get(p.id).stock_count++
  })

  const productsWithStock = Array.from(productMap.values())

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-gradient">CidHax</span>
            </Link>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                      Dashboard
                    </Button>
                  </Link>
                  <div className="h-9 px-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center">
                    <span className="text-sm font-medium text-primary">${Number(profile?.balance || 0).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary font-medium uppercase tracking-wider">Store</span>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Digital Keys</h1>
              <p className="text-muted-foreground text-lg">Browse our collection of premium software and game keys</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-11 h-12 bg-secondary/50 border-border focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {productsWithStock.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsWithStock.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                userBalance={profile?.balance || 0}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-24 w-24 rounded-3xl bg-secondary/50 border border-border flex items-center justify-center mb-6">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No products available</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {"We're"} currently restocking our inventory. Check back soon for new products!
            </p>
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
