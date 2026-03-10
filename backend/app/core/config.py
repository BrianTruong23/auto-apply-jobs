from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Job Application Hub API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./job_application_hub.db"
    brave_search_api_key: str = ""
    llm_answer_service_url: str = ""
    google_sheets_credentials_json: str = ""
    google_sheets_spreadsheet_id: str = ""
    allowed_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
