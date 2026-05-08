"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, CheckCircle, Copy, Building2, Sparkles, AlertCircle } from "lucide-react"

const BANK_DETAILS = {
  bankName: "Sample Bank",
  accountName: "CidHax Inc.",
  accountNumber: "1234567890",
  routingNumber: "021000021",
}

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [bankReference, setBankReference] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const depositAmount = parseFloat(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (depositAmount < 10) {
      setError("Minimum deposit is $10")
      return
    }

    if (!bankReference.trim()) {
      setError("Please enter your bank reference number")
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
      .from("deposits")
      .insert({
        user_id: user.id,
        amount: depositAmount,
        bank_reference: bankReference.trim(),
        status: "pending",
      })

    if (insertError) {
      setError("Failed to submit deposit request. Please try again.")
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
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
            <CardTitle className="text-xl">Deposit Request Submitted</CardTitle>
            <CardDescription>
              Your deposit request has been submitted successfully. It will be processed within 24 hours after we confirm your bank transfer.
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
          <h1 className="text-3xl font-bold text-foreground">Deposit Funds</h1>
          <p className="text-muted-foreground mt-1">Add money to your wallet via bank transfer</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bank Details */}
        <Card className="bg-card border-border overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="relative">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Bank Transfer Details</CardTitle>
                <CardDescription>Transfer funds to this account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            {Object.entries({
              "Bank Name": BANK_DETAILS.bankName,
              "Account Name": BANK_DETAILS.accountName,
              "Account Number": BANK_DETAILS.accountNumber,
              "Routing Number": BANK_DETAILS.routingNumber,
            }).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 rounded-xl border border-border transition-colors">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="font-semibold text-foreground">{value}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(value, label)}
                  className="shrink-0 h-10 w-10 rounded-lg border border-border hover:bg-secondary"
                >
                  {copied === label ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Important Notes</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Use your username as the payment reference</li>
                    <li>Minimum deposit: $10</li>
                    <li>Processing time: Up to 24 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Submit Deposit Request</CardTitle>
            <CardDescription>After making your bank transfer, fill in the details below</CardDescription>
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
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-sm font-medium">Bank Reference / Transaction ID</Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="Enter your bank reference"
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the reference number from your bank transfer confirmation
                </p>
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground glow-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Submit Deposit Request
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
