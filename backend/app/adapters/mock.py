import time
from typing import Protocol


class ModelAdapter(Protocol):
    name: str
    def generate(self, prompt: str, profile: str = "correct", simulated_latency_ms: int = 0) -> dict: ...

class MockAdapter:
    name = "mock"
    PROFILES = ["correct","incorrect","invalid_json","empty","error"]
    def generate(self, prompt: str, profile: str = "correct", simulated_latency_ms: int = 0):
        if simulated_latency_ms and simulated_latency_ms > 0:
            time.sleep(min(simulated_latency_ms, 2000)/1000.0)
        if profile == "error":
            raise RuntimeError("simulated adapter error")
        if profile == "empty":
            return {"text": "", "latency_ms": simulated_latency_ms}
        if profile == "invalid_json":
            return {"text": "{not valid json", "latency_ms": simulated_latency_ms}
        if profile == "incorrect":
            return {"text": "wrong answer", "latency_ms": simulated_latency_ms}
        # correct: echo expected-ish
        return {"text": "Paris", "latency_ms": simulated_latency_ms}
