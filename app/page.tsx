import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { KeyRound, Shield, Zap, Users, ArrowRight, Wallet, Gift } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profile = data
  }

  const features = [
    {
      icon: Zap,
      title: "Instant Delivery",
      description: "Get your license keys instantly after purchase. No waiting, no delays."
    },
    {
      icon: Shield,
      title: "100% Authentic",
      description: "All our keys are genuine and sourced directly from authorized distributors."
    },
    {
      icon: Wallet,
      title: "Easy Wallet System",
      description: "Deposit funds to your wallet and purchase keys with a single click."
    },
    {
      icon: Gift,
      title: "Earn with Referrals",
      description: "Invite friends and earn 30% commission on their first purchases."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header profile={profile} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container relative px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <KeyRound className="h-4 w-4" />
              Digital Keys Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance mb-6">
              Buy Software & Game Keys Instantly
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
              Get legitimate license keys for your favorite software and games. Fast delivery, secure transactions, and earn rewards with our referral program.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/store">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Browse Store
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!user && (
                <Link href="/auth/sign-up">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose KeyVault?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide the best experience for buying digital keys with instant delivery and amazing rewards.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 bg-background">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Earn 30% Commission
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Share your unique referral link with friends. When they sign up and make purchases, you earn 30% of each transaction. {"It's"} that simple!
                    </p>
                    {user ? (
                      <Link href="/dashboard/referrals">
                        <Button>View Referral Dashboard</Button>
                      </Link>
                    ) : (
                      <Link href="/auth/sign-up">
                        <Button>Start Earning Today</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">KeyVault</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 KeyVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
