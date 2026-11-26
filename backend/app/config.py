from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    env: str = "production"
    cors_origins: str = (
        "https://starfieldcosmicchess.com,"
        "https://www.starfieldcosmicchess.com,"
        "http://localhost:5173"
    )
    pi_api_base_url: str = "https://api.minepi.com"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
