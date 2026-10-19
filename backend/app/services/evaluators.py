import json
from dataclasses import dataclass


@dataclass
class EvalOutcome:
    score: float
    passed: bool
    reason: str

def normalize(s):
    return " ".join(str(s).strip().lower().split())

def exact_match(actual, expected, threshold=1.0):
    a = normalize(actual); e = normalize(expected)
    score = 1.0 if a == e else 0.0
    return EvalOutcome(score, score >= threshold, "exact match" if score==1 else f"expected '{e}', got '{a}'")

def keyword_check(actual, keywords):
    a = str(actual).lower()
    missing = [k for k in keywords if k.lower() not in a]
    score = 1.0 if not missing else max(0.0, 1 - len(missing)/max(1,len(keywords)))
    return EvalOutcome(score, len(missing)==0, "all keywords present" if not missing else f"missing: {missing}")

def valid_json(actual):
    try:
        json.loads(actual if isinstance(actual,str) else json.dumps(actual))
        return EvalOutcome(1.0, True, "valid json")
    except Exception as e:
        return EvalOutcome(0.0, False, f"invalid json: {e}")

def required_fields(actual, fields):
    try:
        obj = json.loads(actual) if isinstance(actual,str) else actual
        if not isinstance(obj, dict):
            return EvalOutcome(0.0, False, "not a json object")
        missing = [f for f in fields if f not in obj]
        score = 1.0 if not missing else max(0.0, 1 - len(missing)/max(1,len(fields)))
        return EvalOutcome(score, len(missing)==0, "all fields present" if not missing else f"missing fields: {missing}")
    except Exception as e:
        return EvalOutcome(0.0, False, f"parse error: {e}")

def non_empty(actual):
    ok = str(actual).strip() != ""
    return EvalOutcome(1.0 if ok else 0.0, ok, "non-empty" if ok else "empty output")
