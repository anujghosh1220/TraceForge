from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
class ProjectOut(BaseModel):
    id: str; name: str; description: str | None; created_at: datetime
    model_config = {"from_attributes": True}

class TestCaseIn(BaseModel):
    input: Any
    expected: Any | None = None
    criteria: dict = {}
    tags: list[str] = []
class TestCaseOut(BaseModel):
    id: str; dataset_id: str; input: Any; expected: Any | None; criteria: dict; tags: list[str]
    model_config = {"from_attributes": True}

class DatasetCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
class DatasetUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
class DatasetOut(BaseModel):
    id: str; project_id: str; name: str; description: str | None; created_at: datetime
    model_config = {"from_attributes": True}

class RunCreate(BaseModel):
    dataset_id: str
    adapter: str = "mock"
    profile: str = "correct"
    criteria_override: dict | None = None

class RunOut(BaseModel):
    id: str; project_id: str; dataset_id: str; adapter: str; profile: str; status: str
    started_at: datetime | None; completed_at: datetime | None; metrics: dict; error_summary: str | None
    model_config = {"from_attributes": True}

class ResultOut(BaseModel):
    id: str; run_id: str; test_case_id: str; actual: Any | None; expected: Any | None
    passed: bool; scores: dict; latency_ms: float; error: str | None
    model_config = {"from_attributes": True}

class TraceOut(BaseModel):
    id: str; project_id: str; operation: str; status: str; started_at: datetime
    ended_at: datetime | None; duration_ms: float; input_meta: dict; output_meta: dict; error: str | None
    model_config = {"from_attributes": True}

class SpanOut(BaseModel):
    id: str; trace_id: str; parent_span_id: str | None; name: str; status: str
    started_at: datetime; ended_at: datetime | None; duration_ms: float; input_meta: dict; output_meta: dict; error: str | None
    model_config = {"from_attributes": True}

class ComparisonCreate(BaseModel):
    base_run_id: str; candidate_run_id: str
class ComparisonOut(BaseModel):
    id: str; project_id: str; base_run_id: str; candidate_run_id: str; created_at: datetime; result: dict
    model_config = {"from_attributes": True}
