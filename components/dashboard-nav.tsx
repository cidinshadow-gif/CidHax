"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ShoppingBag, Wallet, Users, Key, ArrowDownToLine, ArrowUpFromLine, LayoutDashboard } from "lucide-react"

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
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
    <nav className="space-y-2">
      <div className="px-3 py-2 mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</h3>
      </div>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
