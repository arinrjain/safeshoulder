from typing import Iterator
from app.providers.llm.base import LLMProvider, LLMResponse, LLMUsage
from openai import OpenAI  # Ollama exposes an OpenAI-compatible API


class OllamaProvider(LLMProvider):
    """Self-hosted Ollama / vLLM / LM Studio — any OpenAI-compatible local endpoint."""

    def __init__(self, base_url: str, model: str, max_tokens: int, temperature: float):
        self._client = OpenAI(base_url=f"{base_url}/v1", api_key="ollama")
        self._model = model
        self._max_tokens = max_tokens
        self._temperature = temperature

    def _build_messages(self, messages: list[dict], system_prompt: str) -> list[dict]:
        result = []
        if system_prompt:
            result.append({"role": "system", "content": system_prompt})
        result.extend(messages)
        return result

    def stream(self, messages: list[dict], system_prompt: str) -> Iterator[str]:
        built = self._build_messages(messages, system_prompt)
        total_in, total_out = 0, 0

        with self._client.chat.completions.create(
            model=self._model,
            max_tokens=self._max_tokens,
            temperature=self._temperature,
            messages=built,
            stream=True,
        ) as stream:
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        self._last_usage = LLMUsage(total_in, total_out)

    def complete(self, messages: list[dict], system_prompt: str = "") -> LLMResponse:
        built = self._build_messages(messages, system_prompt)
        resp = self._client.chat.completions.create(
            model=self._model,
            max_tokens=self._max_tokens,
            temperature=self._temperature,
            messages=built,
        )
        return LLMResponse(
            text=resp.choices[0].message.content,
            usage=LLMUsage(
                resp.usage.prompt_tokens if resp.usage else 0,
                resp.usage.completion_tokens if resp.usage else 0,
            ),
        )
