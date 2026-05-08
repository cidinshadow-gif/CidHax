import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ShoppingBag, Users, TrendingUp, ArrowRight, Key } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  // Get purchase count
  const { count: purchaseCount } = await supabase
    .from("purchases")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  // Get recent purchases
  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      *,
      product:products(name, category)
    `)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get referral stats
  const { data: referralEarnings } = await supabase
    .from("referral_earnings")
    .select("commission_amount")
    .eq("referrer_id", user!.id)

  const totalEarnings = referralEarnings?.reduce(
    (sum, e) => sum + Number(e.commission_amount), 
    0
  ) || 0

  const { count: referralCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("referred_by", user!.id)

  const stats = [
    {
      label: "Wallet Balance",
      value: `$${Number(profile?.balance || 0).toFixed(2)}`,
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      href: "/dashboard/wallet",
    },
    {
      label: "Total Purchases",
      value: purchaseCount || 0,
      icon: ShoppingBag,
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/20",
      href: "/dashboard/keys",
    },
    {
      label: "Referrals",
      value: referralCount || 0,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      href: "/dashboard/referrals",
    },
    {
      label: "Referral Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/20",
      href: "/dashboard/referrals",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="text-gradient">{profile?.username}</span>
          </h1>
          <p className="text-muted-foreground mt-1">{"Here's"} an overview of your account</p>
        </div>
        <Link href="/store">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 glow-primary">
            Browse Store
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className={`bg-card border-border hover:${stat.border} transition-all duration-300 group cursor-pointer h-full`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`${stat.bg} h-14 w-14 rounded-2xl flex items-center justify-center border ${stat.border} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Purchases */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Recent Purchases</CardTitle>
            <CardDescription>Your latest key purchases</CardDescription>
          </div>
          <Link href="/dashboard/keys">
            <Button variant="ghost" size="sm" className="text-primary gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {purchases && purchases.length > 0 ? (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 rounded-xl border border-border transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Key className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {purchase.product?.name || "Unknown Product"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gradient">
                      ${Number(purchase.amount).toFixed(2)}
                    </p>
                    {purchase.product?.category && (
                      <span className="text-xs text-muted-foreground">{purchase.product.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">No purchases yet</p>
              <p className="text-muted-foreground mb-6">Browse the store to buy your first key!</p>
              <Link href="/store">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Browse Store
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
