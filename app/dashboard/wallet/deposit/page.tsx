"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, CheckCircle, Copy, Building2 } from "lucide-react"

const BANK_DETAILS = {
  bankName: "Sample Bank",
  accountName: "KeyVault Inc.",
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
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <CardTitle>Deposit Request Submitted</CardTitle>
            <CardDescription>
              Your deposit request has been submitted successfully. It will be processed within 24 hours after we confirm your bank transfer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/wallet">
              <Button className="w-full">Back to Wallet</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/wallet">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deposit Funds</h1>
          <p className="text-muted-foreground">Add money to your wallet via bank transfer</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bank Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Bank Transfer Details</CardTitle>
                <CardDescription>Transfer funds to this account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries({
              "Bank Name": BANK_DETAILS.bankName,
              "Account Name": BANK_DETAILS.accountName,
              "Account Number": BANK_DETAILS.accountNumber,
              "Routing Number": BANK_DETAILS.routingNumber,
            }).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{value}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(value, label)}
                  className="shrink-0"
                >
                  {copied === label ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
            <div className="p-3 bg-warning/10 text-warning-foreground rounded-lg text-sm">
              <p className="font-medium">Important:</p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                <li>Use your email as the payment reference</li>
                <li>Minimum deposit: $10</li>
                <li>Processing time: Up to 24 hours</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submit Deposit Request</CardTitle>
            <CardDescription>After making your bank transfer, fill in the details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="10"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Bank Reference / Transaction ID</Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="Enter your bank reference"
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the reference number from your bank transfer confirmation
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Deposit Request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
