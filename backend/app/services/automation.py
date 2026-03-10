class ApplicationAutomationService:
    def describe_assisted_mode(self) -> dict:
        return {
            "mode": "assisted",
            "steps": [
                "open application page",
                "detect fields and labels",
                "propose mappings from profile or answer bank",
                "ask user to confirm edits",
                "block final submit until explicit confirmation",
            ],
            "failure_classes": [
                "captcha",
                "login_wall",
                "unsupported_layout",
                "ambiguous_mapping",
                "validation_error",
            ],
        }
