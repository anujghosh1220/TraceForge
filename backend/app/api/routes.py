from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import (
    Comparison,
    Dataset,
    EvalResult,
    EvalRun,
    Project,
    Span,
    TestCase,
    Trace,
)
from app.schemas.all import (
    ComparisonCreate,
    ComparisonOut,
    DatasetCreate,
    DatasetOut,
    DatasetUpdate,
    ProjectCreate,
    ProjectOut,
    ProjectUpdate,
    ResultOut,
    RunCreate,
    RunOut,
    SpanOut,
    TestCaseIn,
    TestCaseOut,
    TraceOut,
)
from app.services.runner import run_evaluation

router = APIRouter(prefix="/api")

@router.get("/health")
def health():
    return {"status": "ok", "app": "TraceForge"}

@router.get("/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@router.post("/projects", response_model=ProjectOut, status_code=201)
def create_project(p: ProjectCreate, db: Session = Depends(get_db)):
    pr = Project(name=p.name, description=p.description)
    db.add(pr)
    db.commit()
    db.refresh(pr)
    return pr

@router.get("/projects/{pid}", response_model=ProjectOut)
def get_project(pid: str, db: Session = Depends(get_db)):
    pr = db.get(Project, pid)
    if not pr:
        raise HTTPException(404)
    return pr

@router.patch("/projects/{pid}", response_model=ProjectOut)
def update_project(pid: str, p: ProjectUpdate, db: Session = Depends(get_db)):
    pr = db.get(Project, pid)
    if not pr:
        raise HTTPException(404)
    if p.name is not None:
        pr.name = p.name
    if p.description is not None:
        pr.description = p.description
    db.commit()
    db.refresh(pr)
    return pr

@router.delete("/projects/{pid}", status_code=204)
def delete_project(pid: str, db: Session = Depends(get_db)):
    pr = db.get(Project, pid)
    if not pr:
        raise HTTPException(404)
    db.delete(pr)
    db.commit()

@router.get("/projects/{pid}/datasets", response_model=list[DatasetOut])
def list_datasets(pid: str, db: Session = Depends(get_db)):
    return db.query(Dataset).filter(Dataset.project_id == pid).all()

@router.post("/projects/{pid}/datasets", response_model=DatasetOut, status_code=201)
def create_dataset(pid: str, d: DatasetCreate, db: Session = Depends(get_db)):
    ds = Dataset(project_id=pid, name=d.name, description=d.description)
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return ds

@router.get("/datasets/{did}", response_model=DatasetOut)
def get_dataset(did: str, db: Session = Depends(get_db)):
    ds = db.get(Dataset, did)
    if not ds:
        raise HTTPException(404)
    return ds

@router.patch("/datasets/{did}", response_model=DatasetOut)
def update_dataset(did: str, d: DatasetUpdate, db: Session = Depends(get_db)):
    ds = db.get(Dataset, did)
    if not ds:
        raise HTTPException(404)
    if d.name is not None:
        ds.name = d.name
    if d.description is not None:
        ds.description = d.description
    db.commit()
    db.refresh(ds)
    return ds

@router.delete("/datasets/{did}", status_code=204)
def delete_dataset(did: str, db: Session = Depends(get_db)):
    ds = db.get(Dataset, did)
    if not ds:
        raise HTTPException(404)
    db.delete(ds)
    db.commit()

@router.get("/datasets/{did}/cases", response_model=list[TestCaseOut])
def list_cases(did: str, db: Session = Depends(get_db)):
    return db.query(TestCase).filter(TestCase.dataset_id == did).all()

@router.post("/datasets/{did}/cases", response_model=TestCaseOut, status_code=201)
def create_case(did: str, c: TestCaseIn, db: Session = Depends(get_db)):
    tc = TestCase(dataset_id=did, input=c.input, expected=c.expected, criteria=c.criteria, tags=c.tags)
    db.add(tc)
    db.commit()
    db.refresh(tc)
    return tc

@router.patch("/cases/{cid}", response_model=TestCaseOut)
def update_case(cid: str, c: TestCaseIn, db: Session = Depends(get_db)):
    tc = db.get(TestCase, cid)
    if not tc:
        raise HTTPException(404)
    tc.input = c.input
    tc.expected = c.expected
    tc.criteria = c.criteria
    tc.tags = c.tags
    db.commit()
    db.refresh(tc)
    return tc

@router.delete("/cases/{cid}", status_code=204)
def delete_case(cid: str, db: Session = Depends(get_db)):
    tc = db.get(TestCase, cid)
    if not tc:
        raise HTTPException(404)
    db.delete(tc)
    db.commit()

@router.post("/projects/{pid}/runs", response_model=RunOut, status_code=201)
def create_run(pid: str, r: RunCreate, db: Session = Depends(get_db)):
    run = EvalRun(project_id=pid, dataset_id=r.dataset_id, adapter=r.adapter, profile=r.profile)
    db.add(run)
    db.commit()
    db.refresh(run)
    run_evaluation(run.id)
    db.refresh(run)
    return run

@router.get("/projects/{pid}/runs", response_model=list[RunOut])
def list_runs(pid: str, db: Session = Depends(get_db)):
    return db.query(EvalRun).filter(EvalRun.project_id == pid).order_by(EvalRun.started_at.desc()).all()

@router.get("/runs/{rid}", response_model=RunOut)
def get_run(rid: str, db: Session = Depends(get_db)):
    run = db.get(EvalRun, rid)
    if not run:
        raise HTTPException(404)
    return run

@router.get("/runs/{rid}/results", response_model=list[ResultOut])
def list_results(rid: str, db: Session = Depends(get_db)):
    return db.query(EvalResult).filter(EvalResult.run_id == rid).all()

@router.get("/projects/{pid}/traces", response_model=list[TraceOut])
def list_traces(pid: str, db: Session = Depends(get_db)):
    return db.query(Trace).filter(Trace.project_id == pid).order_by(Trace.started_at.desc()).all()

@router.get("/traces/{tid}", response_model=TraceOut)
def get_trace(tid: str, db: Session = Depends(get_db)):
    tr = db.get(Trace, tid)
    if not tr:
        raise HTTPException(404)
    return tr

@router.get("/traces/{tid}/spans", response_model=list[SpanOut])
def list_spans(tid: str, db: Session = Depends(get_db)):
    return db.query(Span).filter(Span.trace_id == tid).all()

@router.get("/projects/{pid}/metrics")
def project_metrics(pid: str, db: Session = Depends(get_db)):
    runs = db.query(EvalRun).filter(EvalRun.project_id == pid).all()
    return {"runs": len(runs), "completed": sum(1 for r in runs if r.status == "completed")}

@router.post("/projects/{pid}/comparisons", response_model=ComparisonOut, status_code=201)
def create_comparison(pid: str, c: ComparisonCreate, db: Session = Depends(get_db)):
    base = db.get(EvalRun, c.base_run_id)
    cand = db.get(EvalRun, c.candidate_run_id)
    if not base or not cand:
        raise HTTPException(404)
    base_res = {r.test_case_id: r for r in db.query(EvalResult).filter(EvalResult.run_id == base.id).all()}
    cand_res = {r.test_case_id: r for r in db.query(EvalResult).filter(EvalResult.run_id == cand.id).all()}
    changed = []
    for tcid, br in base_res.items():
        cr = cand_res.get(tcid)
        if cr and br.passed != cr.passed:
            changed.append({"test_case_id": tcid, "base_passed": br.passed, "candidate_passed": cr.passed})
    result = {
        "base_metrics": base.metrics,
        "candidate_metrics": cand.metrics,
        "pass_rate_delta": cand.metrics.get("pass_rate", 0) - base.metrics.get("pass_rate", 0),
        "changed_cases": changed,
        "regressions": [x for x in changed if x["base_passed"] and not x["candidate_passed"]],
        "improvements": [x for x in changed if (not x["base_passed"]) and x["candidate_passed"]],
    }
    comp = Comparison(project_id=pid, base_run_id=c.base_run_id, candidate_run_id=c.candidate_run_id, result=result)
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

@router.get("/comparisons/{cid}", response_model=ComparisonOut)
def get_comparison(cid: str, db: Session = Depends(get_db)):
    comp = db.get(Comparison, cid)
    if not comp:
        raise HTTPException(404)
    return comp
