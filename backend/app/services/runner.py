import json
import time

from app.adapters.mock import MockAdapter
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.entities import EvalResult, EvalRun, Trace
from app.services.evaluators import exact_match, keyword_check, valid_json, required_fields, non_empty


def normalize_input(inp):
    if isinstance(inp, dict):
        return inp.get("text", json.dumps(inp))
    return str(inp)

def run_evaluation(run_id: str):
    db = SessionLocal()
    try:
        run = db.get(EvalRun, run_id)
        if not run: return
        run.status = "running"
        run.started_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
        db.commit()
        adapter = MockAdapter()
        dataset = run.dataset
        cases = dataset.cases
        if len(cases) > settings.max_dataset_cases:
            run.status = "failed"; run.error_summary = "dataset too large"; db.commit(); return
        results = []
        time.time()
        for c in cases:
            case_start = time.time()
            inp = c.input
            prompt = normalize_input(inp)
            expected = c.expected
            criteria = c.criteria or {}
            profile = run.profile
            latency_sim = criteria.get("simulated_latency_ms", 0)
            try:
                out = adapter.generate(prompt, profile=profile, simulated_latency_ms=latency_sim)
                actual_text = out.get("text","")
                lat = out.get("latency_ms", latency_sim) + int((time.time()-case_start)*1000)
            except Exception as e:
                actual_text = None
                lat = int((time.time()-case_start)*1000)
                err = str(e)
                # persist failed
                res = EvalResult(run_id=run.id, test_case_id=c.id, actual=None, expected=expected, passed=False, scores={}, latency_ms=lat, error=err)
                db.add(res); db.commit(); results.append(res); continue
                err=None
            # eval
            scores = {}
            passed_all = True
            exp_text = expected.get("text") if isinstance(expected, dict) else (str(expected) if expected is not None else None)
            # exact
            if criteria.get("exact_match"):
                o = exact_match(actual_text, exp_text)
                scores["exact_match"] = {"score":o.score,"passed":o.passed,"reason":o.reason}; passed_all &= o.passed
            if criteria.get("keywords"):
                o = keyword_check(actual_text, criteria["keywords"])
                scores["keywords"] = {"score":o.score,"passed":o.passed,"reason":o.reason}; passed_all &= o.passed
            if criteria.get("valid_json"):
                o = valid_json(actual_text)
                scores["valid_json"] = {"score":o.score,"passed":o.passed,"reason":o.reason}; passed_all &= o.passed
            if criteria.get("required_fields"):
                o = required_fields(actual_text, criteria["required_fields"])
                scores["required_fields"] = {"score":o.score,"passed":o.passed,"reason":o.reason}; passed_all &= o.passed
            if criteria.get("non_empty", True):
                o = non_empty(actual_text)
                scores["non_empty"] = {"score":o.score,"passed":o.passed,"reason":o.reason}; passed_all &= o.passed
            if not scores:
                o = non_empty(actual_text); scores["non_empty"]= {"score":o.score,"passed":o.passed,"reason":o.reason}; passed_all=o.passed
            res = EvalResult(run_id=run.id, test_case_id=c.id, actual={"text":actual_text}, expected=expected, passed=passed_all, scores=scores, latency_ms=float(lat), error=None)
            db.add(res); db.commit(); results.append(res)
            # trace
            tr = Trace(project_id=run.project_id, operation="eval_case", status="ok" if passed_all else "error", duration_ms=float(lat), input_meta={"text":prompt}, output_meta={"text":actual_text})
            db.add(tr); db.commit()
        # aggregate
        total = len(results)
        passed = sum(1 for r in results if r.passed)
        failed = total-passed
        errors = sum(1 for r in results if r.error)
        lats = [r.latency_ms for r in results]
        lats_sorted = sorted(lats)
        def pct(p):
            if not lats_sorted: return 0
            idx = min(len(lats_sorted)-1, int(round(p/100*(len(lats_sorted)-1))))
            return lats_sorted[idx]
        metrics = {
            "total": total, "passed": passed, "failed": failed,
            "pass_rate": (passed/total if total else 0.0),
            "error_rate": (errors/total if total else 0.0),
            "avg_latency_ms": (sum(lats)/len(lats) if lats else 0.0),
            "p50_latency_ms": pct(50), "p95_latency_ms": pct(95),
        }
        run.metrics = metrics
        run.status = "completed"
        run.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
        db.commit()
    except Exception as e:
        run.status = "failed"
        run.error_summary = str(e)
        db.commit()
    finally:
        db.close()
