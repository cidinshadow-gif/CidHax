"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, CheckCircle, Wallet, AlertCircle, ArrowUpFromLine } from "lucide-react"

export default function WithdrawPage() {
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchBalance() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", user.id)
          .single()
        
        if (profile) {
          setBalance(Number(profile.balance))
        }
      }
    }
    fetchBalance()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const withdrawAmount = parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (withdrawAmount < 10) {
      setError("Minimum withdrawal is $10")
      return
    }

    if (withdrawAmount > balance) {
      setError("Insufficient balance")
      return
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setError("Please fill in all bank details")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const { error: insertError } = await supabase
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount: withdrawAmount,
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        status: "pending",
      })

    if (insertError) {
      setError("Failed to submit withdrawal request. Please try again.")
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="bg-card border-border">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl">Withdrawal Request Submitted</CardTitle>
            <CardDescription>
              Your withdrawal request has been submitted successfully. It will be processed within 1-3 business days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Link href="/dashboard/wallet">
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground">Back to Wallet</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/wallet">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-border hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Withdraw Funds</h1>
          <p className="text-muted-foreground mt-1">Transfer money to your bank account</p>
        </div>
      </div>

      <div className="max-w-lg">
        {/* Balance Card */}
        <Card className="mb-6 bg-card border-border overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold text-gradient">${balance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Withdrawal Details</CardTitle>
            <CardDescription>Enter your bank details and the amount to withdraw</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="10"
                  max={balance}
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum: $10 | Maximum: ${balance.toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-sm font-medium">Bank Name</Label>
                <Input
                  id="bankName"
                  type="text"
                  placeholder="Enter your bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName" className="text-sm font-medium">Account Holder Name</Label>
                <Input
                  id="accountName"
                  type="text"
                  placeholder="Enter account holder name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm font-medium">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Enter your account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="p-4 bg-secondary/30 rounded-xl border border-border text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Processing Information</p>
                <p>Processing time: 1-3 business days</p>
                <p>A small processing fee may apply</p>
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground glow-primary" disabled={loading || balance < 10}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : balance < 10 ? (
                  "Insufficient Balance"
                ) : (
                  <>
                    <ArrowUpFromLine className="mr-2 h-4 w-4" />
                    Submit Withdrawal Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
