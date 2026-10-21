export type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Dataset = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type TestCase = {
  id: string;
  dataset_id: string;
  input: unknown;
  expected: unknown | null;
  criteria: Record<string, unknown>;
  tags: string[];
};

export type RunMetrics = {
  total?: number;
  passed?: number;
  failed?: number;
  pass_rate?: number;
  error_rate?: number;
  avg_latency_ms?: number;
  p50_latency_ms?: number;
  p95_latency_ms?: number;
  [key: string]: unknown;
};

export type EvalRun = {
  id: string;
  project_id: string;
  dataset_id: string;
  adapter: string;
  profile: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  metrics: RunMetrics | null;
  error_summary: string | null;
};

export type EvalResult = {
  id: string;
  run_id: string;
  test_case_id: string;
  actual: unknown;
  expected: unknown | null;
  passed: boolean;
  scores: Record<string, unknown>;
  latency_ms: number;
  error: string | null;
};

export type Trace = {
  id: string;
  project_id: string;
  operation: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number;
  input_meta: Record<string, unknown>;
  output_meta: Record<string, unknown>;
  error: string | null;
};

export type Span = {
  id: string;
  trace_id: string;
  parent_span_id: string | null;
  name: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number;
  input_meta: Record<string, unknown>;
  output_meta: Record<string, unknown>;
  error: string | null;
};

export type Comparison = {
  id: string;
  project_id: string;
  base_run_id: string;
  candidate_run_id: string;
  created_at: string;
  result: Record<string, unknown>;
};

export type ProjectMetrics = {
  runs: number;
  completed: number;
};