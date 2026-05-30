from functools import lru_cache
from app.providers.llm.base import LLMProvider
from app.config import settings


@lru_cache(maxsize=1)
def get_llm_provider() -> LLMProvider:
    provider = settings.llm_provider.lower()

    if provider == "anthropic":
        from app.providers.llm.anthropic_provider import AnthropicProvider
        return AnthropicProvider(
            api_key=settings.anthropic_api_key,
            model=settings.llm_model,
            max_tokens=settings.llm_max_tokens,
            temperature=settings.llm_temperature,
        )

    if provider == "openai":
        from app.providers.llm.openai_provider import OpenAIProvider
        return OpenAIProvider(
            api_key=settings.openai_api_key,
            model=settings.llm_model,
            max_tokens=settings.llm_max_tokens,
            temperature=settings.llm_temperature,
        )

    if provider == "google":
        from app.providers.llm.google_provider import GoogleProvider
        return GoogleProvider(
            api_key=settings.google_api_key,
            model=settings.llm_model,
            max_tokens=settings.llm_max_tokens,
            temperature=settings.llm_temperature,
        )

    if provider == "ollama":
        from app.providers.llm.ollama_provider import OllamaProvider
        return OllamaProvider(
            base_url=settings.ollama_base_url,
            model=settings.llm_model,
            max_tokens=settings.llm_max_tokens,
            temperature=settings.llm_temperature,
        )

    raise ValueError(
        f"Unknown LLM provider: '{provider}'. "
        "Supported: 'anthropic', 'openai', 'google', 'ollama'"
    )
