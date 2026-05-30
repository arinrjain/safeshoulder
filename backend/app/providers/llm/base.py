from abc import ABC, abstractmethod
from typing import Iterator
from dataclasses import dataclass


@dataclass
class LLMUsage:
    input_tokens: int
    output_tokens: int


@dataclass
class LLMResponse:
    text: str
    usage: LLMUsage


class LLMProvider(ABC):
    """Swappable LLM backend. Implement this to add any provider."""

    @abstractmethod
    def stream(
        self,
        messages: list[dict],
        system_prompt: str,
    ) -> Iterator[str]:
        """Yield text chunks as they stream. Must set self._last_usage after completion."""

    @abstractmethod
    def complete(
        self,
        messages: list[dict],
        system_prompt: str = "",
    ) -> LLMResponse:
        """Non-streaming completion. Used for summarisation and classification."""

    def get_last_usage(self) -> LLMUsage:
        """Call after stream() finishes to retrieve token counts."""
        return getattr(self, "_last_usage", LLMUsage(0, 0))
