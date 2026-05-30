from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from app.middleware.auth import get_current_user
from app.providers.billing.base import CreditPack
from app.providers.billing.factory import get_billing_provider
from app.config import settings
from supabase import create_client

router = APIRouter(prefix="/billing", tags=["billing"])

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


class CreditOrderRequest(BaseModel):
    pack: CreditPack


class VerifyPaymentRequest(BaseModel):
    # Razorpay: razorpay_order_id, razorpay_payment_id, razorpay_signature
    # Stripe:   payment_intent_id
    payload: dict


@router.get("/packs")
def list_packs():
    """Return all available credit packs with prices in current currency."""
    billing = get_billing_provider()
    return [
        {
            "id": pack.value,
            **vars(billing.get_pack_details(pack)),
        }
        for pack in CreditPack
    ]


@router.post("/orders")
def create_order(body: CreditOrderRequest, user: dict = Depends(get_current_user)):
    """Initiate a credit pack purchase. Frontend completes checkout with returned payload."""
    row = supabase.table("users").select("email").eq("id", user["user_id"]).execute()
    if not row.data:
        raise HTTPException(status_code=404, detail="User not found")

    billing = get_billing_provider()
    order = billing.create_credit_order(user["user_id"], row.data[0]["email"], body.pack)

    # Store pending order so we can credit on verification
    details = billing.get_pack_details(body.pack)
    supabase.table("credit_orders").insert({
        "order_id": order.order_id,
        "user_id": user["user_id"],
        "pack": body.pack.value,
        "messages": details.messages,
        "amount": order.amount,
        "currency": order.currency,
        "provider": order.provider,
        "status": "pending",
    }).execute()

    return {"order": vars(order)}


@router.post("/verify")
def verify_payment(body: VerifyPaymentRequest, user: dict = Depends(get_current_user)):
    """Called by frontend after user completes payment in checkout SDK."""
    billing = get_billing_provider()
    valid, order_id = billing.verify_credit_payment(body.payload)

    if not valid:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    order_row = supabase.table("credit_orders").select("*").eq("order_id", order_id).eq("user_id", user["user_id"]).execute()
    if not order_row.data:
        raise HTTPException(status_code=404, detail="Order not found")

    order = order_row.data[0]
    if order["status"] == "credited":
        return {"message": "Already credited", "credits": order["messages"]}

    # Mark credited and add messages to user balance
    supabase.table("credit_orders").update({"status": "credited"}).eq("order_id", order_id).execute()
    supabase.rpc("increment_credits", {"uid": user["user_id"], "amount": order["messages"]}).execute()

    return {"message": "Credits added", "credits": order["messages"]}


@router.post("/subscribe")
def subscribe(user: dict = Depends(get_current_user)):
    """Create a monthly subscription."""
    row = supabase.table("users").select("email").eq("id", user["user_id"]).execute()
    if not row.data:
        raise HTTPException(status_code=404, detail="User not found")

    billing = get_billing_provider()
    result = billing.create_subscription(user["user_id"], row.data[0]["email"])

    supabase.table("users").update(
        {"subscription_id": result.subscription_id, "billing_provider": result.provider}
    ).eq("id", user["user_id"]).execute()

    return vars(result)


@router.post("/cancel")
def cancel_subscription(user: dict = Depends(get_current_user)):
    row = supabase.table("users").select("subscription_id").eq("id", user["user_id"]).execute()
    if not row.data or not row.data[0].get("subscription_id"):
        raise HTTPException(status_code=400, detail="No active subscription")

    billing = get_billing_provider()
    ok = billing.cancel_subscription(row.data[0]["subscription_id"])
    if not ok:
        raise HTTPException(status_code=500, detail="Cancellation failed")

    return {"message": "Subscription will cancel at end of current period"}


@router.get("/usage")
def get_usage(user: dict = Depends(get_current_user)):
    row = supabase.table("users").select(
        "free_queries_used,message_credits,subscription_id"
    ).eq("id", user["user_id"]).execute()
    if not row.data:
        raise HTTPException(status_code=404, detail="User not found")

    data = row.data[0]
    free_used = data.get("free_queries_used", 0)
    credits = data.get("message_credits", 0)
    is_subscribed = bool(data.get("subscription_id"))

    return {
        "free_used": free_used,
        "free_total": settings.free_message_quota,
        "free_remaining": max(0, settings.free_message_quota - free_used),
        "message_credits": credits,
        "is_subscribed": is_subscribed,
        "currency": settings.currency,
    }


@router.post("/webhook")
async def payment_webhook(request: Request):
    """Unified webhook endpoint — handles both Razorpay and Stripe events."""
    body = await request.body()
    signature = (
        request.headers.get("x-razorpay-signature")
        or request.headers.get("stripe-signature", "")
    )

    billing = get_billing_provider()
    import json
    payload = json.loads(body)
    event = billing.verify_subscription_event(payload, signature)

    if not event:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    _handle_subscription_event(event)
    return {"received": True}


def _handle_subscription_event(event: dict) -> None:
    sub_id = event.get("subscription_id")
    ev_type = event.get("event", "")

    # Razorpay: subscription.activated / subscription.charged / subscription.cancelled
    # Stripe:   customer.subscription.created / deleted
    if any(k in ev_type for k in ("activated", "charged", "created")):
        notes = event.get("notes", {})
        user_id = notes.get("user_id") or event.get("customer_id")
        if user_id:
            supabase.table("users").update({"subscription_id": sub_id}).eq("id", user_id).execute()

    elif any(k in ev_type for k in ("cancelled", "deleted", "expired")):
        if sub_id:
            supabase.table("users").update({"subscription_id": None}).eq("subscription_id", sub_id).execute()
