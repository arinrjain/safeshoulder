from typing import Iterator
from openai import OpenAI
from app.providers.llm.base import LLMProvider, LLMResponse, LLMUsage


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str, model: str, max_tokens: int, temperature: float, base_url: str = None):
        self._client = OpenAI(api_key=api_key, base_url=base_url)
        self._model = model
        self._max_tokens = max_tokens
        self._temperature = temperature

    def _to_openai_messages(self, messages: list[dict], system_prompt: str) -> list[dict]:
        result = []
        if system_prompt:
            result.append({"role": "system", "content": system_prompt})
        result.extend(messages)
        return result

    def stream(self, messages: list[dict], system_prompt: str) -> Iterator[str]:
        oai_messages = self._to_openai_messages(messages, system_prompt)
        total_in, total_out = 0, 0

        with self._client.chat.completions.create(
            model=self._model,
            max_tokens=self._max_tokens,
            temperature=self._temperature,
            messages=oai_messages,
            stream=True,
            stream_options={"include_usage": True},
        ) as stream:
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                if chunk.usage:
                    total_in = chunk.usage.prompt_tokens
                    total_out = chunk.usage.completion_tokens

        self._last_usage = LLMUsage(total_in, total_out)

    def complete(self, messages: list[dict], system_prompt: str = "") -> LLMResponse:
        oai_messages = self._to_openai_messages(messages, system_prompt)
        resp = self._client.chat.completions.create(
            model=self._model,
            max_tokens=self._max_tokens,
            temperature=self._temperature,
            messages=oai_messages,
        )
        return LLMResponse(
            text=resp.choices[0].message.content,
            usage=LLMUsage(resp.usage.prompt_tokens, resp.usage.completion_tokens),
        )
