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

export type JsonValue = unknown;

class ApiError extends Error {
  status?: number;
  body?: string;
  constructor(message: string, status?: number, body?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function request(path: string, opts: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...opts.headers },
    ...opts,
  });
  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      // ignore body read failures
    }
    throw new ApiError(`${res.status} ${body}`, res.status, body);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function api(path: string, opts?: RequestInit): Promise<unknown> {
  return request(path, opts);
}

export function listProjects(signal?: AbortSignal): Promise<Project[]> {
  return request("/api/projects", { signal }) as Promise<Project[]>;
}

export function createProject(body: { name: string; description?: string | null }): Promise<Project> {
  return request("/api/projects", { method: "POST", body: JSON.stringify(body) }) as Promise<Project>;
}

export function getProject(id: string, signal?: AbortSignal): Promise<Project> {
  return request(`/api/projects/${id}`, { signal }) as Promise<Project>;
}

export function updateProject(id: string, body: { name?: string; description?: string | null }): Promise<Project> {
  return request(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }) as Promise<Project>;
}

export function deleteProject(id: string): Promise<void> {
  return request(`/api/projects/${id}`, { method: "DELETE" }) as Promise<void>;
}

export function listDatasets(projectId: string, signal?: AbortSignal): Promise<Dataset[]> {
  return request(`/api/projects/${projectId}/datasets`, { signal }) as Promise<Dataset[]>;
}

export function createDataset(projectId: string, body: { name: string; description?: string | null }): Promise<Dataset> {
  return request(`/api/projects/${projectId}/datasets`, { method: "POST", body: JSON.stringify(body) }) as Promise<Dataset>;
}

export function getDataset(id: string, signal?: AbortSignal): Promise<Dataset> {
  return request(`/api/datasets/${id}`, { signal }) as Promise<Dataset>;
}

export function updateDataset(id: string, body: { name?: string; description?: string | null }): Promise<Dataset> {
  return request(`/api/datasets/${id}`, { method: "PATCH", body: JSON.stringify(body) }) as Promise<Dataset>;
}

export function deleteDataset(id: string): Promise<void> {
  return request(`/api/datasets/${id}`, { method: "DELETE" }) as Promise<void>;
}

export function listCases(datasetId: string, signal?: AbortSignal): Promise<TestCase[]> {
  return request(`/api/datasets/${datasetId}/cases`, { signal }) as Promise<TestCase[]>;
}

export function createCase(
  datasetId: string,
  body: { input: unknown; expected?: unknown | null; criteria?: Record<string, unknown>; tags?: string[] },
): Promise<TestCase> {
  return request(`/api/datasets/${datasetId}/cases`, { method: "POST", body: JSON.stringify(body) }) as Promise<TestCase>;
}

export function updateCase(id: string, body: { input: unknown; expected?: unknown | null; criteria?: Record<string, unknown>; tags?: string[] }): Promise<TestCase> {
  return request(`/api/cases/${id}`, { method: "PATCH", body: JSON.stringify(body) }) as Promise<TestCase>;
}

export function deleteCase(id: string): Promise<void> {
  return request(`/api/cases/${id}`, { method: "DELETE" }) as Promise<void>;
}

export type RunCreate = {
  dataset_id: string;
  adapter?: string;
  profile?: string;
  criteria_override?: Record<string, unknown> | null;
};

export function createRun(projectId: string, body: RunCreate): Promise<EvalRun> {
  return request(`/api/projects/${projectId}/runs`, { method: "POST", body: JSON.stringify(body) }) as Promise<EvalRun>;
}

export function listRuns(projectId: string, signal?: AbortSignal): Promise<EvalRun[]> {
  return request(`/api/projects/${projectId}/runs`, { signal }) as Promise<EvalRun[]>;
}

export function getRun(id: string, signal?: AbortSignal): Promise<EvalRun> {
  return request(`/api/runs/${id}`, { signal }) as Promise<EvalRun>;
}

export function listResults(runId: string, signal?: AbortSignal): Promise<EvalResult[]> {
  return request(`/api/runs/${runId}/results`, { signal }) as Promise<EvalResult[]>;
}

export function listTraces(projectId: string, signal?: AbortSignal): Promise<Trace[]> {
  return request(`/api/projects/${projectId}/traces`, { signal }) as Promise<Trace[]>;
}

export function getTrace(id: string, signal?: AbortSignal): Promise<Trace> {
  return request(`/api/traces/${id}`, { signal }) as Promise<Trace>;
}

export function listSpans(traceId: string, signal?: AbortSignal): Promise<Span[]> {
  return request(`/api/traces/${traceId}/spans`, { signal }) as Promise<Span[]>;
}

export function projectMetrics(projectId: string, signal?: AbortSignal): Promise<ProjectMetrics> {
  return request(`/api/projects/${projectId}/metrics`, { signal }) as Promise<ProjectMetrics>;
}

export type ComparisonCreate = { base_run_id: string; candidate_run_id: string };

export function createComparison(projectId: string, body: ComparisonCreate): Promise<Comparison> {
  return request(`/api/projects/${projectId}/comparisons`, { method: "POST", body: JSON.stringify(body) }) as Promise<Comparison>;
}

export function getComparison(id: string, signal?: AbortSignal): Promise<Comparison> {
  return request(`/api/comparisons/${id}`, { signal }) as Promise<Comparison>;
}

export function health(): Promise<{ status: string; app: string }> {
  return request("/api/health") as Promise<{ status: string; app: string }>;
}

export { ApiError, isApiError };
