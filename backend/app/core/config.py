from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Job Application Hub API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    database_url: str = Field(
        default="sqlite:///./job_application_hub.db",
        validation_alias=AliasChoices("DATABASE_URL", "SUPABASE_DB_URL"),
    )
    brave_search_api_key: str = ""
    openrouter_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("OPENROUTER_API_KEY", "OPENREUTER_API", "OPENROUTER_API"),
    )
    openrouter_model: str = "google/gemini-2.5-flash"
    google_sheets_credentials_json: str = ""
    google_sheets_spreadsheet_id: str = ""
    allowed_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
