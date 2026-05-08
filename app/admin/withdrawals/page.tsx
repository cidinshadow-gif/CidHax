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
import { ArrowUpFromLine, CheckCircle, XCircle, Loader2 } from "lucide-react"
import type { Withdrawal, Profile } from "@/lib/types/database"

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<(Withdrawal & { user: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  async function fetchWithdrawals() {
    const supabase = createClient()
    const { data } = await supabase
      .from("withdrawals")
      .select(`
        *,
        user:profiles(*)
      `)
      .order("created_at", { ascending: false })
    
    if (data) {
      setWithdrawals(data as (Withdrawal & { user: Profile })[])
    }
    setLoading(false)
  }

  async function handleAction() {
    if (!selectedWithdrawal || !actionType) return
    setProcessing(true)

    const supabase = createClient()
    const newStatus = actionType === "approve" ? "approved" : "rejected"

    // If approving, first check and deduct balance
    if (actionType === "approve") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", selectedWithdrawal.user_id)
        .single()

      if (!profile || Number(profile.balance) < Number(selectedWithdrawal.amount)) {
        alert("Insufficient balance to approve this withdrawal")
        setProcessing(false)
        return
      }

      // Deduct from balance
      await supabase
        .from("profiles")
        .update({
          balance: Number(profile.balance) - Number(selectedWithdrawal.amount),
        })
        .eq("id", selectedWithdrawal.user_id)
    }

    // Update withdrawal status
    await supabase
      .from("withdrawals")
      .update({
        status: newStatus,
        admin_note: adminNote || null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", selectedWithdrawal.id)

    setProcessing(false)
    setSelectedWithdrawal(null)
    setActionType(null)
    setAdminNote("")
    fetchWithdrawals()
  }

  const filteredWithdrawals = withdrawals.filter(w => {
    if (filter === "all") return true
    return w.status === filter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Withdrawal Requests</h1>
        <p className="text-muted-foreground">Review and process user withdrawal requests</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending ({withdrawals.filter(w => w.status === "pending").length})
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
            <div className="p-8 text-center text-muted-foreground">Loading withdrawals...</div>
          ) : filteredWithdrawals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {withdrawal.user?.username || withdrawal.user?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">{withdrawal.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${Number(withdrawal.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{withdrawal.bank_name}</p>
                        <p className="text-muted-foreground">{withdrawal.account_name}</p>
                        <p className="text-muted-foreground font-mono">{withdrawal.account_number}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        withdrawal.status === "pending" ? "bg-warning/10 text-warning" :
                        withdrawal.status === "approved" ? "bg-success/10 text-success" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {withdrawal.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {withdrawal.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="gap-1 bg-success hover:bg-success/90"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal)
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
                              setSelectedWithdrawal(withdrawal)
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
              <ArrowUpFromLine className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No withdrawals found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedWithdrawal && !!actionType} onOpenChange={(open) => {
        if (!open) {
          setSelectedWithdrawal(null)
          setActionType(null)
          setAdminNote("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? "This will deduct the amount from the user's balance. Make sure you've processed the bank transfer."
                : "This will reject the withdrawal request."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User</span>
                <span className="font-medium">{selectedWithdrawal?.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">${Number(selectedWithdrawal?.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank</span>
                <span>{selectedWithdrawal?.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span className="font-mono">{selectedWithdrawal?.account_number}</span>
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
              setSelectedWithdrawal(null)
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
                "Approve Withdrawal"
              ) : (
                "Reject Withdrawal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
