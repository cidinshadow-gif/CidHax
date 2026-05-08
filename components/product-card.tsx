"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, ShoppingCart, Loader2, Check, AlertCircle } from "lucide-react"
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

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <Package className="h-12 w-12 text-primary/50" />
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
            {product.category && (
              <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full shrink-0">
                {product.category}
              </span>
            )}
          </div>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">${Number(product.price).toFixed(2)}</span>
            {inStock && (
              <span className="text-xs text-muted-foreground">
                {product.stock_count} in stock
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full gap-2" 
            disabled={!inStock}
            onClick={() => setShowDialog(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            {!isLoggedIn ? "Sign in to Buy" : !canAfford ? "Add Funds" : "Buy Now"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          {purchaseResult ? (
            purchaseResult.success ? (
              <>
                <DialogHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="h-8 w-8 text-success" />
                    </div>
                  </div>
                  <DialogTitle className="text-center">Purchase Successful!</DialogTitle>
                  <DialogDescription className="text-center">
                    Your key has been added to your purchases.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Your License Key:</p>
                  <p className="font-mono text-sm text-foreground break-all select-all">
                    {purchaseResult.key}
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowDialog(false)} className="w-full">
                    Done
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                  </div>
                  <DialogTitle className="text-center">Purchase Failed</DialogTitle>
                  <DialogDescription className="text-center">
                    {purchaseResult.message}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full">
                    Close
                  </Button>
                </DialogFooter>
              </>
            )
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Purchase</DialogTitle>
                <DialogDescription>
                  Are you sure you want to purchase this product?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                <div className="flex justify-between py-3 border-t">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold text-foreground">${Number(product.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t">
                  <span className="text-muted-foreground">Your Balance</span>
                  <span className={`font-semibold ${canAfford ? "text-success" : "text-destructive"}`}>
                    ${Number(userBalance).toFixed(2)}
                  </span>
                </div>
                {!canAfford && (
                  <div className="mt-2 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                    Insufficient balance. Please add funds to your wallet.
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                {!isLoggedIn ? (
                  <Link href="/auth/login">
                    <Button>Sign in to Buy</Button>
                  </Link>
                ) : !canAfford ? (
                  <Link href="/dashboard/wallet">
                    <Button>Add Funds</Button>
                  </Link>
                ) : (
                  <Button onClick={handlePurchase} disabled={purchasing}>
                    {purchasing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Purchase"
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
