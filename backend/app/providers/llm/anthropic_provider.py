from typing import Iterator
import anthropic
from app.providers.llm.base import LLMProvider, LLMResponse, LLMUsage


class AnthropicProvider(LLMProvider):
    def __init__(self, api_key: str, model: str, max_tokens: int, temperature: float):
        self._client = anthropic.Anthropic(api_key=api_key)
        self._model = model
        self._max_tokens = max_tokens
        self._temperature = temperature

    def stream(self, messages: list[dict], system_prompt: str) -> Iterator[str]:
        with self._client.messages.stream(
            model=self._model,
            max_tokens=self._max_tokens,
            temperature=self._temperature,
            system=system_prompt,
            messages=messages,
        ) as s:
            for chunk in s.text_stream:
                yield chunk
            usage = s.get_final_message().usage
            self._last_usage = LLMUsage(usage.input_tokens, usage.output_tokens)

    def complete(self, messages: list[dict], system_prompt: str = "") -> LLMResponse:
        resp = self._client.messages.create(
            model=self._model,
            max_tokens=self._max_tokens,
            system=system_prompt,
            messages=messages,
        )
        return LLMResponse(
            text=resp.content[0].text,
            usage=LLMUsage(resp.usage.input_tokens, resp.usage.output_tokens),
        )
