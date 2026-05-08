"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ShoppingBag, Wallet, Users, Key, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

const navItems = [
  {
    label: "My Purchases",
    href: "/dashboard",
    icon: ShoppingBag,
  },
  {
    label: "My Keys",
    href: "/dashboard/keys",
    icon: Key,
  },
  {
    label: "Wallet",
    href: "/dashboard/wallet",
    icon: Wallet,
  },
  {
    label: "Deposit",
    href: "/dashboard/wallet/deposit",
    icon: ArrowDownToLine,
  },
  {
    label: "Withdraw",
    href: "/dashboard/wallet/withdraw",
    icon: ArrowUpFromLine,
  },
  {
    label: "Referrals",
    href: "/dashboard/referrals",
    icon: Users,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
