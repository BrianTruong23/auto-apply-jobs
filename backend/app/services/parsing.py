import re


class JobParsingService:
    def normalize_text(self, value: str) -> str:
        lowered = value.strip().lower()
        lowered = re.sub(r"[^a-z0-9\s]+", " ", lowered)
        return re.sub(r"\s+", " ", lowered).strip()

    def canonical_key(self, company: str, title: str, location: str) -> str:
        normalized = "|".join(
            [
                self.normalize_text(company),
                self.normalize_text(title),
                self.normalize_text(location),
            ]
        )
        return normalized.replace(" ", "-")
