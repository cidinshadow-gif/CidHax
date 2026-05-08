"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, Copy, CheckCircle, Eye, EyeOff, Package, Sparkles } from "lucide-react"
import type { Key as KeyType, Product } from "@/lib/types/database"

interface PurchasedKey extends KeyType {
  product: Product
}

export default function KeysPage() {
  const [keys, setKeys] = useState<PurchasedKey[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchKeys() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from("keys")
          .select(`
            *,
            product:products(*)
          `)
          .eq("sold_to", user.id)
          .order("sold_at", { ascending: false })
        
        if (data) {
          setKeys(data as PurchasedKey[])
        }
      }
      setLoading(false)
    }
    fetchKeys()
  }, [])

  function copyToClipboard(key: string, id: string) {
    navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function toggleReveal(id: string) {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function maskKey(key: string) {
    if (key.length <= 8) return "*".repeat(key.length)
    return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Keys</h1>
        <p className="text-muted-foreground mt-1">View and manage your purchased license keys</p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border animate-pulse">
              <CardContent className="pt-6">
                <div className="h-24 bg-secondary/50 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : keys.length > 0 ? (
        <div className="grid gap-4">
          {keys.map((key) => (
            <Card key={key.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Key className="h-7 w-7 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg text-foreground">{key.product?.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Purchased {new Date(key.sold_at || key.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-secondary/50 border border-border px-4 py-2.5 rounded-xl break-all">
                          {revealed.has(key.id) ? key.key_value : maskKey(key.key_value)}
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReveal(key.id)}
                      className="gap-2 border-border hover:bg-secondary h-10"
                    >
                      {revealed.has(key.id) ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Reveal
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(key.key_value, key.id)}
                      className="gap-2 border-border hover:bg-secondary h-10"
                    >
                      {copied === key.id ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="h-24 w-24 rounded-3xl bg-secondary/50 border border-border flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No keys yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {"You haven't purchased any keys yet. Visit the store to browse our collection of premium software and game keys."}
              </p>
              <Link href="/store">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Browse Store
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
