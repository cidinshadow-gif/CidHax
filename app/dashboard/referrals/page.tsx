"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Copy, CheckCircle, DollarSign, UserPlus, TrendingUp, Sparkles, Gift } from "lucide-react"
import type { Profile, ReferralEarning } from "@/lib/types/database"

export default function ReferralsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [referrals, setReferrals] = useState<Profile[]>([])
  const [earnings, setEarnings] = useState<ReferralEarning[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        
        if (profileData) setProfile(profileData)

        const { data: referralsData } = await supabase
          .from("profiles")
          .select("*")
          .eq("referred_by", user.id)
          .order("created_at", { ascending: false })
        
        if (referralsData) setReferrals(referralsData)

        const { data: earningsData } = await supabase
          .from("referral_earnings")
          .select("*")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false })
        
        if (earningsData) setEarnings(earningsData)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const referralLink = profile 
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/auth/sign-up?ref=${profile.referral_code}`
    : ""

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.commission_amount), 0)

  function copyLink() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stats = [
    {
      label: "Total Referrals",
      value: referrals.length,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Total Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/20",
    },
    {
      label: "Commission Rate",
      value: "30%",
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Referral Program</h1>
        <p className="text-muted-foreground mt-1">Invite friends and earn 30% commission on their purchases</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
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

      {/* Referral Link */}
      <Card className="bg-card border-border overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link with friends. When they sign up and make purchases, you earn 30% commission!
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex gap-3">
            <Input
              readOnly
              value={referralLink}
              className="font-mono text-sm h-12 bg-secondary/50 border-border"
            />
            <Button onClick={copyLink} className="gap-2 shrink-0 h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground glow-primary">
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
          <div className="mt-5 p-4 bg-secondary/30 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Your referral code:</span>{" "}
              <code className="bg-background px-3 py-1 rounded-lg border border-border font-mono text-primary">{profile?.referral_code}</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Share Your Link</h4>
              <p className="text-sm text-muted-foreground">Send your referral link to friends and family</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">They Sign Up</h4>
              <p className="text-sm text-muted-foreground">Friends create an account using your link</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Earn Commission</h4>
              <p className="text-sm text-muted-foreground">Get 30% of their purchase amounts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl">Your Referrals</CardTitle>
          <CardDescription>Users who signed up using your referral link</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-secondary/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-5 bg-secondary/30 hover:bg-secondary/50 rounded-xl border border-border transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {referral.username || referral.email?.split("@")[0]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(referral.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center mx-auto mb-4">
                <Gift className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">No referrals yet</p>
              <p className="text-muted-foreground">Share your link to start earning!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earnings History */}
      {earnings.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Earnings History</CardTitle>
            <CardDescription>Your referral commission earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-5 bg-secondary/30 hover:bg-secondary/50 rounded-xl border border-border transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Referral Commission</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-gradient">
                    +${Number(earning.commission_amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
