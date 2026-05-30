import stripe
from typing import Optional
from app.providers.billing.base import BillingProvider, CreditPack, PackDetails, OrderResult, SubscriptionResult
from app.config import settings


class StripeProvider(BillingProvider):
    """
    Stripe — international / fallback provider.
    Uses Payment Intents for credit packs and Subscriptions for monthly plan.
    Amounts in smallest currency unit (paise for INR, cents for USD).
    """

    def __init__(self):
        stripe.api_key = settings.stripe_secret_key
        self._currency = settings.currency.lower()

    PACK_MAP = {
        CreditPack.SMALL: (settings.credit_pack_small_messages, settings.credit_pack_small_price),
        CreditPack.MEDIUM: (settings.credit_pack_medium_messages, settings.credit_pack_medium_price),
        CreditPack.LARGE: (settings.credit_pack_large_messages, settings.credit_pack_large_price),
    }

    def _currency_symbol(self) -> str:
        return "₹" if settings.currency == "INR" else "$"

    def get_pack_details(self, pack: CreditPack) -> PackDetails:
        messages, price = self.PACK_MAP[pack]
        major = price // 100
        sym = self._currency_symbol()
        return PackDetails(
            pack=pack,
            messages=messages,
            price=price,
            currency=settings.currency,
            label=f"{sym}{major} · {messages} messages",
        )

    def _get_or_create_customer(self, user_id: str, email: str) -> str:
        existing = stripe.Customer.list(metadata={"user_id": user_id}, limit=1)
        if existing.data:
            return existing.data[0].id
        customer = stripe.Customer.create(email=email, metadata={"user_id": user_id})
        return customer.id

    def create_credit_order(self, user_id: str, email: str, pack: CreditPack) -> OrderResult:
        messages, amount = self.PACK_MAP[pack]
        customer_id = self._get_or_create_customer(user_id, email)

        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=self._currency,
            customer=customer_id,
            metadata={"user_id": user_id, "pack": pack.value, "messages": str(messages)},
            automatic_payment_methods={"enabled": True},
        )
        return OrderResult(
            order_id=intent.id,
            amount=amount,
            currency=settings.currency,
            provider="stripe",
            client_payload={"client_secret": intent.client_secret},
        )

    def verify_credit_payment(self, payload: dict) -> tuple[bool, str]:
        payment_intent_id = payload.get("payment_intent_id", "")
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent.status == "succeeded", intent.id
        except Exception:
            return False, ""

    def create_subscription(self, user_id: str, email: str) -> SubscriptionResult:
        customer_id = self._get_or_create_customer(user_id, email)
        sub = stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": settings.stripe_metered_price_id}],
            payment_behavior="default_incomplete",
            expand=["latest_invoice.payment_intent"],
        )
        return SubscriptionResult(
            subscription_id=sub.id,
            provider="stripe",
            client_payload={
                "client_secret": sub.latest_invoice.payment_intent.client_secret
            },
        )

    def cancel_subscription(self, subscription_id: str) -> bool:
        try:
            stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)
            return True
        except Exception:
            return False

    def verify_subscription_event(self, payload: dict, signature: str) -> Optional[dict]:
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, settings.stripe_webhook_secret
            )
        except stripe.error.SignatureVerificationError:
            return None

        obj = event["data"]["object"]
        return {
            "event": event["type"],
            "subscription_id": obj.get("id") or obj.get("subscription"),
            "status": obj.get("status"),
            "customer_id": obj.get("customer"),
        }

    def get_customer_portal_url(self, customer_id: str) -> Optional[str]:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{settings.app_url}/dashboard",
        )
        return session.url
