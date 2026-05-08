import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Get product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check balance
    if (Number(profile.balance) < Number(product.price)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Get an available key
    const { data: key, error: keyError } = await supabase
      .from("keys")
      .select("*")
      .eq("product_id", productId)
      .eq("is_sold", false)
      .limit(1)
      .single()

    if (keyError || !key) {
      return NextResponse.json({ error: "No keys available" }, { status: 400 })
    }

    // Calculate referral commission (30% if user was referred)
    let referralCommission = 0
    let referrerId = null
    
    if (profile.referred_by) {
      referralCommission = Number(product.price) * 0.30
      referrerId = profile.referred_by
    }

    // Start transaction-like operations
    // 1. Mark key as sold
    const { error: updateKeyError } = await supabase
      .from("keys")
      .update({
        is_sold: true,
        sold_to: user.id,
        sold_at: new Date().toISOString(),
      })
      .eq("id", key.id)
      .eq("is_sold", false) // Optimistic lock

    if (updateKeyError) {
      return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 })
    }

    // 2. Deduct user balance
    const { error: updateBalanceError } = await supabase
      .from("profiles")
      .update({
        balance: Number(profile.balance) - Number(product.price),
      })
      .eq("id", user.id)

    if (updateBalanceError) {
      // Rollback key
      await supabase
        .from("keys")
        .update({ is_sold: false, sold_to: null, sold_at: null })
        .eq("id", key.id)
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
    }

    // 3. Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: user.id,
        product_id: productId,
        key_id: key.id,
        amount: product.price,
        referral_commission: referralCommission,
        referrer_id: referrerId,
      })
      .select()
      .single()

    if (purchaseError) {
      // Log but don't fail - key is already assigned
      console.error("Failed to create purchase record:", purchaseError)
    }

    // 4. Credit referrer if applicable
    if (referrerId && referralCommission > 0 && purchase) {
      // Update referrer balance
      const { data: referrer } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", referrerId)
        .single()

      if (referrer) {
        await supabase
          .from("profiles")
          .update({
            balance: Number(referrer.balance) + referralCommission,
          })
          .eq("id", referrerId)

        // Create referral earning record
        await supabase
          .from("referral_earnings")
          .insert({
            referrer_id: referrerId,
            referred_id: user.id,
            purchase_id: purchase.id,
            commission_amount: referralCommission,
          })
      }
    }

    return NextResponse.json({
      success: true,
      key: key.key_value,
      purchase_id: purchase?.id,
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
