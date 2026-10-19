import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def now():
    return datetime.now(UTC)

def uid():
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    datasets = relationship("Dataset", back_populates="project", cascade="all, delete-orphan")
    runs = relationship("EvalRun", back_populates="project", cascade="all, delete-orphan")
    traces = relationship("Trace", back_populates="project", cascade="all, delete-orphan")

class Dataset(Base):
    __tablename__ = "datasets"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    project = relationship("Project", back_populates="datasets")
    cases = relationship("TestCase", back_populates="dataset", cascade="all, delete-orphan")
    runs = relationship("EvalRun", back_populates="dataset")

class TestCase(Base):
    __tablename__ = "test_cases"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    dataset_id: Mapped[str] = mapped_column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    input: Mapped[dict] = mapped_column(JSON, nullable=False)
    expected: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    criteria: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    dataset = relationship("Dataset", back_populates="cases")

class EvalRun(Base):
    __tablename__ = "eval_runs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    dataset_id: Mapped[str] = mapped_column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    adapter: Mapped[str] = mapped_column(String(60), nullable=False)
    profile: Mapped[str] = mapped_column(String(60), nullable=False, default="correct")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    metrics: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    error_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    project = relationship("Project", back_populates="runs")
    dataset = relationship("Dataset", back_populates="runs")
    results = relationship("EvalResult", back_populates="run", cascade="all, delete-orphan")

class EvalResult(Base):
    __tablename__ = "eval_results"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    run_id: Mapped[str] = mapped_column(String(36), ForeignKey("eval_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    actual: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    expected: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    passed: Mapped[bool] = mapped_column(nullable=False, default=False)
    scores: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    run = relationship("EvalRun", back_populates="results")

class Trace(Base):
    __tablename__ = "traces"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    operation: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ok")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    input_meta: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    output_meta: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    project = relationship("Project", back_populates="traces")
    spans = relationship("Span", back_populates="trace", cascade="all, delete-orphan")

class Span(Base):
    __tablename__ = "spans"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    trace_id: Mapped[str] = mapped_column(String(36), ForeignKey("traces.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_span_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ok")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    input_meta: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    output_meta: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    trace = relationship("Trace", back_populates="spans")

class Comparison(Base):
    __tablename__ = "comparisons"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    base_run_id: Mapped[str] = mapped_column(String(36), nullable=False)
    candidate_run_id: Mapped[str] = mapped_column(String(36), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    result: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
