"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Key, Plus, Trash2, Loader2, Upload } from "lucide-react"
import type { Product, Key as KeyType } from "@/lib/types/database"

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<(KeyType & { product: Product })[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState("")
  const [keyValues, setKeyValues] = useState("")
  const [filter, setFilter] = useState<"all" | "available" | "sold">("all")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .order("name")
    
    if (productsData) {
      setProducts(productsData)
    }

    const { data: keysData } = await supabase
      .from("keys")
      .select(`
        *,
        product:products(*)
      `)
      .order("created_at", { ascending: false })
    
    if (keysData) {
      setKeys(keysData as (KeyType & { product: Product })[])
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct) return

    setSubmitting(true)
    const supabase = createClient()

    // Split keys by newline and filter empty lines
    const keyList = keyValues
      .split("\n")
      .map(k => k.trim())
      .filter(k => k.length > 0)

    if (keyList.length === 0) {
      setSubmitting(false)
      return
    }

    // Insert all keys
    const keysToInsert = keyList.map(key_value => ({
      product_id: selectedProduct,
      key_value,
    }))

    await supabase.from("keys").insert(keysToInsert)

    setSubmitting(false)
    setDialogOpen(false)
    setSelectedProduct("")
    setKeyValues("")
    fetchData()
  }

  async function deleteKey(id: string) {
    if (!confirm("Are you sure you want to delete this key?")) return
    const supabase = createClient()
    await supabase.from("keys").delete().eq("id", id)
    fetchData()
  }

  const filteredKeys = keys.filter(key => {
    if (filter === "available") return !key.is_sold
    if (filter === "sold") return key.is_sold
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Keys Inventory</h1>
          <p className="text-muted-foreground">Manage your license keys</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Add Keys
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add License Keys</DialogTitle>
              <DialogDescription>
                Add one or more keys for a product. Enter each key on a new line.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keys">License Keys</Label>
                <Textarea
                  id="keys"
                  value={keyValues}
                  onChange={(e) => setKeyValues(e.target.value)}
                  placeholder={"XXXXX-XXXXX-XXXXX\nYYYYY-YYYYY-YYYYY\nZZZZZ-ZZZZZ-ZZZZZ"}
                  rows={6}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter each key on a new line. {keyValues.split("\n").filter(k => k.trim()).length} key(s) to add.
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !selectedProduct}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Keys"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({keys.length})
        </Button>
        <Button
          variant={filter === "available" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("available")}
        >
          Available ({keys.filter(k => !k.is_sold).length})
        </Button>
        <Button
          variant={filter === "sold" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("sold")}
        >
          Sold ({keys.filter(k => k.is_sold).length})
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading keys...</div>
          ) : filteredKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{key.product?.name}</p>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {key.key_value.slice(0, 10)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        key.is_sold 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-success/10 text-success"
                      }`}>
                        {key.is_sold ? "Sold" : "Available"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(key.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {!key.is_sold && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteKey(key.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No keys found</p>
              <p className="text-sm text-muted-foreground">Add keys for your products</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
