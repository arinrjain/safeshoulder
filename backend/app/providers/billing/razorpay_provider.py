import hmac
import hashlib
import razorpay
from typing import Optional
from app.providers.billing.base import BillingProvider, CreditPack, PackDetails, OrderResult, SubscriptionResult
from app.config import settings


class RazorpayProvider(BillingProvider):
    """
    Razorpay — primary payment provider for India.

    Payment flow:
      1. Backend creates an Order  →  returns order_id + amount to frontend
      2. Frontend opens Razorpay checkout SDK with those details
      3. On success, frontend receives razorpay_payment_id + razorpay_order_id + razorpay_signature
      4. Frontend sends those three values to POST /billing/verify
      5. Backend verifies signature and credits the user's account

    Subscription flow:
      1. Backend creates a Razorpay Plan (done once in dashboard) + Subscription
      2. Frontend opens checkout with subscription_id
      3. Razorpay handles recurring billing and sends webhook events
    """

    CURRENCY = "INR"

    PACK_MAP = {
        CreditPack.SMALL: (settings.credit_pack_small_messages, settings.credit_pack_small_price),
        CreditPack.MEDIUM: (settings.credit_pack_medium_messages, settings.credit_pack_medium_price),
        CreditPack.LARGE: (settings.credit_pack_large_messages, settings.credit_pack_large_price),
    }

    def __init__(self):
        self._client = razorpay.Client(
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
        )

    def get_pack_details(self, pack: CreditPack) -> PackDetails:
        messages, price = self.PACK_MAP[pack]
        rupees = price // 100
        return PackDetails(
            pack=pack,
            messages=messages,
            price=price,
            currency=self.CURRENCY,
            label=f"₹{rupees} · {messages} messages",
        )

    def create_credit_order(self, user_id: str, email: str, pack: CreditPack) -> OrderResult:
        messages, amount = self.PACK_MAP[pack]
        order = self._client.order.create({
            "amount": amount,
            "currency": self.CURRENCY,
            "receipt": f"pack_{pack.value}_{user_id[:8]}",
            "notes": {
                "user_id": user_id,
                "email": email,
                "pack": pack.value,
                "messages": str(messages),
            },
        })
        return OrderResult(
            order_id=order["id"],
            amount=amount,
            currency=self.CURRENCY,
            provider="razorpay",
            client_payload={
                "key": settings.razorpay_key_id,
                "order_id": order["id"],
                "amount": amount,
                "currency": self.CURRENCY,
                "name": "SafeShoulder",
                "description": f"{messages} message credits",
                "prefill": {"email": email},
                "theme": {"color": "#6366f1"},
            },
        )

    def verify_credit_payment(self, payload: dict) -> tuple[bool, str]:
        """
        payload must contain:
          razorpay_order_id, razorpay_payment_id, razorpay_signature
        """
        try:
            self._client.utility.verify_payment_signature({
                "razorpay_order_id": payload["razorpay_order_id"],
                "razorpay_payment_id": payload["razorpay_payment_id"],
                "razorpay_signature": payload["razorpay_signature"],
            })
            return True, payload["razorpay_order_id"]
        except Exception:
            return False, ""

    def create_subscription(self, user_id: str, email: str) -> SubscriptionResult:
        """
        Requires RAZORPAY_SUBSCRIPTION_PLAN_ID set in env.
        Create the plan once in Razorpay dashboard and store the plan_id.
        """
        plan_id = getattr(settings, "razorpay_subscription_plan_id", None)
        if not plan_id:
            raise ValueError("RAZORPAY_SUBSCRIPTION_PLAN_ID is not configured")

        sub = self._client.subscription.create({
            "plan_id": plan_id,
            "total_count": 12,  # 12 billing cycles (auto-renew handled by Razorpay)
            "notes": {"user_id": user_id, "email": email},
        })
        return SubscriptionResult(
            subscription_id=sub["id"],
            provider="razorpay",
            client_payload={
                "key": settings.razorpay_key_id,
                "subscription_id": sub["id"],
                "name": "SafeShoulder Pro",
                "description": "Monthly subscription — up to 1000 messages",
                "prefill": {"email": email},
                "theme": {"color": "#6366f1"},
            },
        )

    def cancel_subscription(self, subscription_id: str) -> bool:
        try:
            self._client.subscription.cancel(subscription_id, {"cancel_at_cycle_end": 1})
            return True
        except Exception:
            return False

    def verify_subscription_event(self, payload: dict, signature: str) -> Optional[dict]:
        """Verify Razorpay webhook signature and return normalised event."""
        body = payload if isinstance(payload, bytes) else str(payload).encode()
        expected = hmac.new(
            settings.razorpay_webhook_secret.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected, signature):
            return None

        event_type = payload.get("event", "")
        entity = payload.get("payload", {}).get("subscription", {}).get("entity", {})

        return {
            "event": event_type,
            "subscription_id": entity.get("id"),
            "status": entity.get("status"),
            "notes": entity.get("notes", {}),
        }

    def get_customer_portal_url(self, customer_id: str) -> Optional[str]:
        # Razorpay does not provide a hosted billing portal — return None
        # Frontend should show an in-app cancel/manage UI instead
        return None
