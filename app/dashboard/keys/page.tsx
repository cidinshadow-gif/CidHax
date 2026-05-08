"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, Copy, CheckCircle, Eye, EyeOff, Package } from "lucide-react"
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Keys</h1>
        <p className="text-muted-foreground">View and manage your purchased license keys</p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-muted rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : keys.length > 0 ? (
        <div className="grid gap-4">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Key className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground">{key.product?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Purchased {new Date(key.sold_at || key.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                          {revealed.has(key.id) ? key.key_value : maskKey(key.key_value)}
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReveal(key.id)}
                      className="gap-2"
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
                      className="gap-2"
                    >
                      {copied === key.id ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-success" />
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
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No keys yet</h3>
              <p className="text-muted-foreground">
                {"You haven't purchased any keys yet. Visit the store to browse products."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
