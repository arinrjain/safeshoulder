from functools import lru_cache
from app.providers.billing.base import BillingProvider
from app.config import settings


@lru_cache(maxsize=1)
def get_billing_provider() -> BillingProvider:
    provider = settings.billing_provider.lower()

    if provider == "razorpay":
        from app.providers.billing.razorpay_provider import RazorpayProvider
        return RazorpayProvider()

    if provider == "stripe":
        from app.providers.billing.stripe_provider import StripeProvider
        return StripeProvider()

    raise ValueError(
        f"Unknown billing provider: '{provider}'. "
        "Supported: 'razorpay', 'stripe'"
    )
