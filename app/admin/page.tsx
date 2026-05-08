import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, Key, DollarSign, ArrowDownToLine, ArrowUpFromLine, ShoppingBag } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()

  // Get counts
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  const { count: availableKeysCount } = await supabase
    .from("keys")
    .select("*", { count: "exact", head: true })
    .eq("is_sold", false)

  const { count: pendingDeposits } = await supabase
    .from("deposits")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: pendingWithdrawals } = await supabase
    .from("withdrawals")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: totalPurchases } = await supabase
    .from("purchases")
    .select("*", { count: "exact", head: true })

  // Get total revenue
  const { data: purchases } = await supabase
    .from("purchases")
    .select("amount")

  const totalRevenue = purchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const stats = [
    {
      label: "Total Users",
      value: userCount || 0,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Products",
      value: productCount || 0,
      icon: Package,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Available Keys",
      value: availableKeysCount || 0,
      icon: Key,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Total Purchases",
      value: totalPurchases || 0,
      icon: ShoppingBag,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      label: "Pending Deposits",
      value: pendingDeposits || 0,
      icon: ArrowDownToLine,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Pending Withdrawals",
      value: pendingWithdrawals || 0,
      icon: ArrowUpFromLine,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ]

  // Get recent activity
  const { data: recentDeposits } = await supabase
    .from("deposits")
    .select(`
      *,
      user:profiles(email, username)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your marketplace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
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

      {/* Recent Deposits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deposit Requests</CardTitle>
          <CardDescription>Latest deposit requests from users</CardDescription>
        </CardHeader>
        <CardContent>
          {recentDeposits && recentDeposits.length > 0 ? (
            <div className="space-y-4">
              {recentDeposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      deposit.status === "pending" ? "bg-warning/10" : 
                      deposit.status === "approved" ? "bg-success/10" : "bg-destructive/10"
                    }`}>
                      <ArrowDownToLine className={`h-5 w-5 ${
                        deposit.status === "pending" ? "text-warning" : 
                        deposit.status === "approved" ? "text-success" : "text-destructive"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {deposit.user?.username || deposit.user?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${Number(deposit.amount).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      deposit.status === "pending" ? "bg-warning/10 text-warning" : 
                      deposit.status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}>
                      {deposit.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ArrowDownToLine className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deposit requests yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
