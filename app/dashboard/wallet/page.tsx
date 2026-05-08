import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Clock, CheckCircle, XCircle, Sparkles } from "lucide-react"

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  // Get recent transactions
  const { data: deposits } = await supabase
    .from("deposits")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const transactions = [
    ...(deposits?.map(d => ({ ...d, type: "deposit" as const })) || []),
    ...(withdrawals?.map(w => ({ ...w, type: "withdrawal" as const })) || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-primary bg-primary/10 border-primary/20"
      case "rejected":
        return "text-destructive bg-destructive/10 border-destructive/20"
      default:
        return "text-accent bg-accent/10 border-accent/20"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your funds</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-card border-border overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <CardContent className="pt-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Available Balance</p>
                <p className="text-5xl font-bold text-gradient">
                  ${Number(profile?.balance || 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard/wallet/deposit">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 glow-primary">
                  <ArrowDownToLine className="h-5 w-5" />
                  Deposit
                </Button>
              </Link>
              <Link href="/dashboard/wallet/withdraw">
                <Button size="lg" variant="outline" className="gap-2 border-border hover:bg-secondary h-12 px-6">
                  <ArrowUpFromLine className="h-5 w-5" />
                  Withdraw
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl">Transaction History</CardTitle>
          <CardDescription>Your recent deposits and withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-5 bg-secondary/30 hover:bg-secondary/50 rounded-xl border border-border transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
                      tx.type === "deposit" 
                        ? "bg-primary/10 border-primary/20" 
                        : "bg-accent/10 border-accent/20"
                    }`}>
                      {tx.type === "deposit" ? (
                        <ArrowDownToLine className="h-6 w-6 text-primary" />
                      ) : (
                        <ArrowUpFromLine className="h-6 w-6 text-accent" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground capitalize">
                        {tx.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                    <p className={`font-bold text-lg ${
                      tx.type === "deposit" ? "text-primary" : "text-foreground"
                    }`}>
                      {tx.type === "deposit" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">No transactions yet</p>
              <p className="text-muted-foreground mb-6">Make a deposit to start buying keys!</p>
              <Link href="/dashboard/wallet/deposit">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Make First Deposit
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
