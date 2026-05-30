from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
from enum import Enum


class CreditPack(str, Enum):
    SMALL = "small"      # 100 messages
    MEDIUM = "medium"    # 300 messages
    LARGE = "large"      # 800 messages


@dataclass
class PackDetails:
    pack: CreditPack
    messages: int
    price: int           # smallest currency unit (paise / cents)
    currency: str        # "INR" | "USD"
    label: str           # e.g. "₹99 · 100 messages"


@dataclass
class OrderResult:
    """Provider-specific order/intent details sent to the frontend to complete payment."""
    order_id: str
    amount: int
    currency: str
    provider: str
    client_payload: dict  # provider-specific fields (key_id, client_secret, etc.)


@dataclass
class SubscriptionResult:
    subscription_id: str
    provider: str
    client_payload: dict


class BillingProvider(ABC):
    """Swappable payment backend. Implement this to add any payment provider."""

    @abstractmethod
    def get_pack_details(self, pack: CreditPack) -> PackDetails:
        """Return human-readable and machine-readable details for a credit pack."""

    @abstractmethod
    def create_credit_order(self, user_id: str, email: str, pack: CreditPack) -> OrderResult:
        """Initiate a one-time payment order for a credit pack."""

    @abstractmethod
    def verify_credit_payment(self, payload: dict) -> tuple[bool, str]:
        """Verify webhook/callback payload. Returns (is_valid, order_id)."""

    @abstractmethod
    def create_subscription(self, user_id: str, email: str) -> SubscriptionResult:
        """Create a monthly subscription for unlimited messages."""

    @abstractmethod
    def cancel_subscription(self, subscription_id: str) -> bool:
        """Cancel an active subscription."""

    @abstractmethod
    def verify_subscription_event(self, payload: dict, signature: str) -> Optional[dict]:
        """Parse and verify a subscription webhook. Returns normalised event dict or None."""

    @abstractmethod
    def get_customer_portal_url(self, customer_id: str) -> Optional[str]:
        """Return a self-service billing portal URL (not all providers support this)."""
