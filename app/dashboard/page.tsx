import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ShoppingBag, Users, TrendingUp } from "lucide-react"

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
    },
    {
      label: "Total Purchases",
      value: purchaseCount || 0,
      icon: ShoppingBag,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Referrals",
      value: referralCount || 0,
      icon: Users,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      label: "Referral Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.username || profile?.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={cn(stat.bg, "h-12 w-12 rounded-lg flex items-center justify-center")}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
          <CardDescription>Your latest key purchases</CardDescription>
        </CardHeader>
        <CardContent>
          {purchases && purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {purchase.product?.name || "Unknown Product"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">
                    ${Number(purchase.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No purchases yet</p>
              <p className="text-sm">Browse the store to buy your first key!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
