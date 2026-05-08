"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, ShoppingCart, Loader2, Check, AlertCircle, Copy, Sparkles } from "lucide-react"
import type { Product } from "@/lib/types/database"

interface ProductCardProps {
  product: Product
  userBalance: number
  isLoggedIn: boolean
}

export function ProductCard({ product, userBalance, isLoggedIn }: ProductCardProps) {
  const [purchasing, setPurchasing] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<{
    success: boolean
    key?: string
    message?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const canAfford = userBalance >= product.price
  const inStock = (product.stock_count || 0) > 0

  async function handlePurchase() {
    if (!isLoggedIn) {
      router.push("/auth/login")
      return
    }

    if (!canAfford) {
      router.push("/dashboard/wallet")
      return
    }

    setPurchasing(true)
    setPurchaseResult(null)

    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPurchaseResult({ success: false, message: data.error })
      } else {
        setPurchaseResult({ success: true, key: data.key })
        router.refresh()
      }
    } catch {
      setPurchaseResult({ success: false, message: "Something went wrong. Please try again." })
    } finally {
      setPurchasing(false)
    }
  }

  function copyKey() {
    if (purchaseResult?.key) {
      navigator.clipboard.writeText(purchaseResult.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <Card className="overflow-hidden bg-card border-border hover:border-primary/30 transition-all duration-300 group">
        <div className="aspect-[4/3] bg-secondary/30 flex items-center justify-center relative overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package className="h-8 w-8 text-primary/50" />
              </div>
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
              <span className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-muted-foreground">Out of Stock</span>
            </div>
          )}
          {inStock && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1.5 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-lg text-xs font-medium text-primary">
                {product.stock_count} left
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-foreground text-lg line-clamp-1">{product.name}</h3>
          </div>
          {product.category && (
            <span className="inline-flex text-xs px-2.5 py-1 bg-secondary text-muted-foreground rounded-md mb-3">
              {product.category}
            </span>
          )}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-2xl font-bold text-gradient">${Number(product.price).toFixed(2)}</span>
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" 
              disabled={!inStock}
              onClick={() => setShowDialog(true)}
            >
              <ShoppingCart className="h-4 w-4" />
              {!isLoggedIn ? "Sign in" : !canAfford ? "Add Funds" : "Buy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border">
          {purchaseResult ? (
            purchaseResult.success ? (
              <>
                <DialogHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
                      <Check className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <DialogTitle className="text-center text-xl">Purchase Successful!</DialogTitle>
                  <DialogDescription className="text-center">
                    Your key has been added to your purchases.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-secondary/50 border border-border p-5 rounded-xl mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Your License Key</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={copyKey}
                    >
                      {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <p className="font-mono text-sm text-foreground break-all select-all bg-background p-3 rounded-lg border border-border">
                    {purchaseResult.key}
                  </p>
                </div>
                <DialogFooter className="mt-6">
                  <Button onClick={() => setShowDialog(false)} className="w-full bg-primary hover:bg-primary/90">
                    Done
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                      <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>
                  </div>
                  <DialogTitle className="text-center text-xl">Purchase Failed</DialogTitle>
                  <DialogDescription className="text-center">
                    {purchaseResult.message}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full">
                    Close
                  </Button>
                </DialogFooter>
              </>
            )
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Confirm Purchase</DialogTitle>
                <DialogDescription>
                  Review your purchase details before confirming.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="flex items-center gap-5 p-5 bg-secondary/30 rounded-xl border border-border mb-6">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">{product.name}</h4>
                    {product.category && (
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold text-foreground">${Number(product.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Your Balance</span>
                    <span className={`font-semibold ${canAfford ? "text-primary" : "text-destructive"}`}>
                      ${Number(userBalance).toFixed(2)}
                    </span>
                  </div>
                </div>
                {!canAfford && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    Insufficient balance. Please add funds to your wallet.
                  </div>
                )}
              </div>
              <DialogFooter className="gap-3">
                <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                  Cancel
                </Button>
                {!isLoggedIn ? (
                  <Link href="/auth/login" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90">Sign in to Buy</Button>
                  </Link>
                ) : !canAfford ? (
                  <Link href="/dashboard/wallet" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90">Add Funds</Button>
                  </Link>
                ) : (
                  <Button onClick={handlePurchase} disabled={purchasing} className="flex-1 bg-primary hover:bg-primary/90">
                    {purchasing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Confirm Purchase
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
