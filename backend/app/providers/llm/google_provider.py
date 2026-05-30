from typing import Iterator
from app.providers.llm.base import LLMProvider, LLMResponse, LLMUsage


class GoogleProvider(LLMProvider):
    """Google Gemini via google-generativeai SDK."""

    def __init__(self, api_key: str, model: str, max_tokens: int, temperature: float):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self._genai = genai
        self._model_name = model
        self._max_tokens = max_tokens
        self._temperature = temperature

    def _build_model(self):
        return self._genai.GenerativeModel(
            model_name=self._model_name,
            generation_config=self._genai.GenerationConfig(
                max_output_tokens=self._max_tokens,
                temperature=self._temperature,
            ),
        )

    def _to_gemini_messages(self, messages: list[dict], system_prompt: str):
        # Gemini uses "model" instead of "assistant"
        history = []
        for m in messages[:-1]:
            history.append({
                "role": "model" if m["role"] == "assistant" else "user",
                "parts": [m["content"]],
            })
        last = messages[-1]["content"] if messages else ""
        return history, last, system_prompt

    def stream(self, messages: list[dict], system_prompt: str) -> Iterator[str]:
        model = self._build_model()
        history, last_msg, sys_prompt = self._to_gemini_messages(messages, system_prompt)
        chat = model.start_chat(history=history, system_instruction=sys_prompt)
        response = chat.send_message(last_msg, stream=True)

        for chunk in response:
            if chunk.text:
                yield chunk.text

        usage = response.usage_metadata
        self._last_usage = LLMUsage(
            usage.prompt_token_count if usage else 0,
            usage.candidates_token_count if usage else 0,
        )

    def complete(self, messages: list[dict], system_prompt: str = "") -> LLMResponse:
        model = self._build_model()
        history, last_msg, sys_prompt = self._to_gemini_messages(messages, system_prompt)
        chat = model.start_chat(history=history, system_instruction=sys_prompt)
        response = chat.send_message(last_msg)
        usage = response.usage_metadata
        return LLMResponse(
            text=response.text,
            usage=LLMUsage(
                usage.prompt_token_count if usage else 0,
                usage.candidates_token_count if usage else 0,
            ),
        )
