import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Clock, CheckCircle, XCircle } from "lucide-react"

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-warning" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-success bg-success/10"
      case "rejected":
        return "text-destructive bg-destructive/10"
      default:
        return "text-warning bg-warning/10"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground">Manage your funds</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-4xl font-bold text-foreground">
                  ${Number(profile?.balance || 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/wallet/deposit">
                <Button className="gap-2">
                  <ArrowDownToLine className="h-4 w-4" />
                  Deposit
                </Button>
              </Link>
              <Link href="/dashboard/wallet/withdraw">
                <Button variant="outline" className="gap-2">
                  <ArrowUpFromLine className="h-4 w-4" />
                  Withdraw
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent deposits and withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      tx.type === "deposit" ? "bg-success/10" : "bg-destructive/10"
                    }`}>
                      {tx.type === "deposit" ? (
                        <ArrowDownToLine className="h-5 w-5 text-success" />
                      ) : (
                        <ArrowUpFromLine className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {tx.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                    <p className={`font-semibold ${
                      tx.type === "deposit" ? "text-success" : "text-destructive"
                    }`}>
                      {tx.type === "deposit" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Make a deposit to start buying keys!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
