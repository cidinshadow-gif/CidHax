"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowDownToLine, CheckCircle, XCircle, Loader2 } from "lucide-react"
import type { Deposit, Profile } from "@/lib/types/database"

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<(Deposit & { user: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")

  useEffect(() => {
    fetchDeposits()
  }, [])

  async function fetchDeposits() {
    const supabase = createClient()
    const { data } = await supabase
      .from("deposits")
      .select(`
        *,
        user:profiles(*)
      `)
      .order("created_at", { ascending: false })
    
    if (data) {
      setDeposits(data as (Deposit & { user: Profile })[])
    }
    setLoading(false)
  }

  async function handleAction() {
    if (!selectedDeposit || !actionType) return
    setProcessing(true)

    const supabase = createClient()
    const newStatus = actionType === "approve" ? "approved" : "rejected"

    // Update deposit status
    await supabase
      .from("deposits")
      .update({
        status: newStatus,
        admin_note: adminNote || null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", selectedDeposit.id)

    // If approved, add to user balance
    if (actionType === "approve") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", selectedDeposit.user_id)
        .single()

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            balance: Number(profile.balance) + Number(selectedDeposit.amount),
          })
          .eq("id", selectedDeposit.user_id)
      }
    }

    setProcessing(false)
    setSelectedDeposit(null)
    setActionType(null)
    setAdminNote("")
    fetchDeposits()
  }

  const filteredDeposits = deposits.filter(d => {
    if (filter === "all") return true
    return d.status === filter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Deposit Requests</h1>
        <p className="text-muted-foreground">Review and process user deposit requests</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending ({deposits.filter(d => d.status === "pending").length})
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("approved")}
        >
          Approved
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("rejected")}
        >
          Rejected
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading deposits...</div>
          ) : filteredDeposits.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {deposit.user?.username || deposit.user?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">{deposit.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${Number(deposit.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {deposit.bank_reference || "-"}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(deposit.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        deposit.status === "pending" ? "bg-warning/10 text-warning" :
                        deposit.status === "approved" ? "bg-success/10 text-success" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {deposit.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {deposit.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="gap-1 bg-success hover:bg-success/90"
                            onClick={() => {
                              setSelectedDeposit(deposit)
                              setActionType("approve")
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => {
                              setSelectedDeposit(deposit)
                              setActionType("reject")
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <ArrowDownToLine className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No deposits found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedDeposit && !!actionType} onOpenChange={(open) => {
        if (!open) {
          setSelectedDeposit(null)
          setActionType(null)
          setAdminNote("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Deposit" : "Reject Deposit"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? "This will add the deposit amount to the user's wallet balance."
                : "This will reject the deposit request."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User</span>
                <span className="font-medium">{selectedDeposit?.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">${Number(selectedDeposit?.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank Reference</span>
                <span className="font-mono">{selectedDeposit?.bank_reference || "-"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Admin Note (optional)</Label>
              <Input
                id="note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedDeposit(null)
              setActionType(null)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              className={actionType === "approve" ? "bg-success hover:bg-success/90" : ""}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : actionType === "approve" ? (
                "Approve Deposit"
              ) : (
                "Reject Deposit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
