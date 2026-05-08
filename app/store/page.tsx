import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Search, Package } from "lucide-react"

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
      <Header profile={profile} />
      
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Store</h1>
          <p className="text-muted-foreground">Browse our collection of software and game keys</p>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-10"
          />
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No products available</h3>
            <p className="text-muted-foreground max-w-md">
              {"We're"} currently restocking our inventory. Check back soon for new products!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
