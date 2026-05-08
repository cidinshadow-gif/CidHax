"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, Loader2, Gift, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react"

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const referralCode = searchParams.get("ref") || ""
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [referredBy, setReferredBy] = useState(referralCode)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const fakeEmail = `${username.toLowerCase()}@keyvault.local`

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          referred_by: referredBy || null,
        },
      },
    })

    if (error) {
      if (error.message.includes("already registered")) {
        setError("This username is already taken")
      } else if (error.message.includes("rate limit") || error.message.includes("email")) {
        setError("Too many signup attempts. Please wait a moment and try again.")
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password,
    })

    if (loginError) {
      setSuccess(true)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <Card className="w-full max-w-md bg-card border-border relative z-10">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Account Created!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your CidHax account has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Link href="/auth/login">
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium glow-primary">
                Sign in now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="bg-card border-border">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
                <Key className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join CidHax and start buying digital keys
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
                  {error}
                </div>
              )}
              
              {referralCode && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">You were invited!</p>
                    <p className="text-xs text-muted-foreground">Your referrer will earn rewards when you purchase.</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 bg-secondary/50 border-border focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral" className="text-sm font-medium">
                  Referral Code <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="referral"
                  type="text"
                  placeholder="Enter referral code"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value.toUpperCase())}
                  className="h-12 bg-secondary/50 border-border focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium glow-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create account
                  </>
                )}
              </Button>
            </form>
            <div className="mt-8 text-center">
              <span className="text-sm text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link href="/auth/login" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
