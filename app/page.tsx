import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Key, 
  Shield, 
  Zap, 
  Users, 
  Wallet, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Globe,
  Clock
} from "lucide-react"

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-gradient">CidHax</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/store" className="text-muted-foreground hover:text-foreground transition-colors">
                Store
              </Link>
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#referral" className="text-muted-foreground hover:text-foreground transition-colors">
                Referral
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                      Dashboard
                    </Button>
                  </Link>
                  {profile?.is_admin && (
                    <Link href="/admin">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Admin
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/3 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Premium Digital Keys Marketplace</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              <span className="text-foreground">Unlock Your </span>
              <span className="text-gradient">Digital World</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Get instant access to software and game license keys. 
              Secure transactions, instant delivery, and earn rewards through our referral program.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link href="/store">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 text-lg glow-primary group">
                  Browse Store
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {!user && (
                <Link href="/auth/sign-up">
                  <Button size="lg" variant="outline" className="border-border hover:bg-secondary h-14 px-8 text-lg">
                    Create Account
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
              <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/50">
                <div className="text-3xl md:text-4xl font-bold text-gradient">10K+</div>
                <div className="text-sm text-muted-foreground mt-1">Keys Sold</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/50">
                <div className="text-3xl md:text-4xl font-bold text-gradient">99.9%</div>
                <div className="text-sm text-muted-foreground mt-1">Valid Keys</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/50">
                <div className="text-3xl md:text-4xl font-bold text-gradient">30%</div>
                <div className="text-sm text-muted-foreground mt-1">Referral Bonus</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <span className="text-xs text-accent font-medium uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose CidHax?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We provide the best experience for buying digital keys with unmatched security and instant delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-500 group hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Delivery</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get your keys delivered instantly after purchase. No waiting, no delays - start using immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-500 group hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">100% Secure</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All transactions are encrypted and secure. Your data and payments are always protected.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-500 group hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Verified Keys</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every key is verified and guaranteed to work. No fake or used keys - 100% authentic.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-500 group hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <Wallet className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Wallet System</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Deposit funds and purchase instantly. Easy withdrawals anytime to your bank account.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-500 group hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Referral Program</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Earn 30% commission on every purchase made by your direct referrals. Passive income made easy.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-500 group hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <TrendingUp className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Best Prices</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Competitive pricing on all products. Get more value for your money with our deals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-card/30" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-xs text-primary font-medium uppercase tracking-wider">How It Works</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple & Fast</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Get your keys in just a few simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Account</h3>
              <p className="text-muted-foreground text-sm">Sign up with just a username and password in seconds.</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Deposit Funds</h3>
              <p className="text-muted-foreground text-sm">Add money to your wallet via bank transfer.</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Your Keys</h3>
              <p className="text-muted-foreground text-sm">Purchase and receive your keys instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section id="referral" className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-10 md:p-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary font-medium uppercase tracking-wider">Earn Money</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Referral Program</h2>
                    <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                      Share your unique referral link and earn 30% commission on every purchase made by your direct referrals.
                    </p>
                    <ul className="space-y-4 mb-10">
                      <li className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">Get your unique referral link</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">Share with friends and community</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">Earn 30% on every purchase they make</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">Withdraw your earnings anytime</span>
                      </li>
                    </ul>
                    {user ? (
                      <Link href="/dashboard/referrals">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary group">
                          View Referral Dashboard
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/auth/sign-up">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary group">
                          Start Earning Now
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="bg-secondary/30 border-l border-border p-10 md:p-14 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl md:text-9xl font-bold text-gradient mb-4">30%</div>
                      <div className="text-xl text-foreground font-medium">Commission Rate</div>
                      <div className="mt-4 text-muted-foreground">
                        On every purchase by your referrals
                      </div>
                      <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                        <div className="p-4 rounded-xl bg-card border border-border">
                          <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
                          <div className="text-muted-foreground">Instant Credit</div>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border">
                          <Globe className="h-5 w-5 text-primary mx-auto mb-2" />
                          <div className="text-muted-foreground">No Limits</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Join thousands of users who trust CidHax for their digital key needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link href="/store">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14 text-lg glow-primary">
                    Browse Store
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14 text-lg glow-primary">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/store">
                    <Button size="lg" variant="outline" className="border-border hover:bg-secondary h-14 px-10 text-lg">
                      Browse Products
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-bold text-gradient">CidHax</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/store" className="hover:text-foreground transition-colors">Store</Link>
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Login</Link>
              <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">Sign Up</Link>
            </div>
            <div className="text-sm text-muted-foreground">
              2024 CidHax. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
