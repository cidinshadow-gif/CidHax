"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Key, User, Wallet, ShoppingBag, Users, LogOut, Settings, ChevronDown } from "lucide-react"
import type { Profile } from "@/lib/types/database"

interface HeaderProps {
  profile: Profile | null
}

export function Header({ profile }: HeaderProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-gradient">CidHax</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/store" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Store
          </Link>
          {profile && (
            <>
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/wallet" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Wallet
              </Link>
              <Link 
                href="/dashboard/referrals" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Referrals
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  ${Number(profile.balance).toFixed(2)}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-3 hover:bg-secondary/80">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium">{profile.username || "Account"}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card border-border">
                  <div className="px-3 py-3">
                    <p className="text-sm font-semibold text-foreground">{profile.username}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Balance: <span className="text-primary font-medium">${Number(profile.balance).toFixed(2)}</span>
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <ShoppingBag className="mr-3 h-4 w-4" />
                      My Purchases
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/wallet" className="cursor-pointer">
                      <Wallet className="mr-3 h-4 w-4" />
                      Wallet
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/referrals" className="cursor-pointer">
                      <Users className="mr-3 h-4 w-4" />
                      Referrals
                    </Link>
                  </DropdownMenuItem>
                  {profile.is_admin && (
                    <>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="mr-3 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign in</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
