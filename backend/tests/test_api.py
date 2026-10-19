import os
import tempfile

os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(tempfile.mkdtemp(), "test.db")
os.environ["SEED_DEMO"] = "false"
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_project_crud():
    r = client.post("/api/projects", json={"name":"P1"})
    assert r.status_code == 201
    pid = r.json()["id"]
    r = client.get(f"/api/projects/{pid}")
    assert r.status_code == 200
    r = client.patch(f"/api/projects/{pid}", json={"name":"P2"})
    assert r.json()["name"] == "P2"
    r = client.delete(f"/api/projects/{pid}")
    assert r.status_code == 204
    r = client.get(f"/api/projects/{pid}")
    assert r.status_code == 404

def test_dataset_and_case():
    pid = client.post("/api/projects", json={"name":"P"}).json()["id"]
    ds = client.post(f"/api/projects/{pid}/datasets", json={"name":"D"}).json()["id"]
    tc = client.post(f"/api/datasets/{ds}/cases", json={"input":{"text":"hi"},"expected":{"text":"Paris"},"criteria":{"exact_match":True}}).json()["id"]
    assert tc
    r = client.get(f"/api/datasets/{ds}/cases")
    assert len(r.json()) == 1

def test_run_and_results():
    pid = client.post("/api/projects", json={"name":"P"}).json()["id"]
    ds = client.post(f"/api/projects/{pid}/datasets", json={"name":"D"}).json()["id"]
    client.post(f"/api/datasets/{ds}/cases", json={"input":{"text":"hi"},"expected":{"text":"Paris"},"criteria":{"exact_match":True,"non_empty":True}})
    run = client.post(f"/api/projects/{pid}/runs", json={"dataset_id":ds,"profile":"correct"}).json()
    assert run["status"] == "completed"
    res = client.get(f"/api/runs/{run['id']}/results").json()
    assert len(res) == 1
    assert res[0]["passed"] is True
    assert run["metrics"]["total"] == 1

def test_invalid_profile_still_runs():
    pid = client.post("/api/projects", json={"name":"P"}).json()["id"]
    ds = client.post(f"/api/projects/{pid}/datasets", json={"name":"D"}).json()["id"]
    client.post(f"/api/datasets/{ds}/cases", json={"input":{"text":"hi"},"expected":{"text":"Paris"},"criteria":{"exact_match":True}})
    run = client.post(f"/api/projects/{pid}/runs", json={"dataset_id":ds,"profile":"invalid_json"}).json()
    res = client.get(f"/api/runs/{run['id']}/results").json()
    assert res[0]["passed"] is False

def test_comparison():
    pid = client.post("/api/projects", json={"name":"P"}).json()["id"]
    ds = client.post(f"/api/projects/{pid}/datasets", json={"name":"D"}).json()["id"]
    client.post(f"/api/datasets/{ds}/cases", json={"input":{"text":"hi"},"expected":{"text":"Paris"},"criteria":{"exact_match":True}})
    r1 = client.post(f"/api/projects/{pid}/runs", json={"dataset_id":ds,"profile":"correct"}).json()["id"]
    r2 = client.post(f"/api/projects/{pid}/runs", json={"dataset_id":ds,"profile":"incorrect"}).json()["id"]
    comp = client.post(f"/api/projects/{pid}/comparisons", json={"base_run_id":r1,"candidate_run_id":r2}).json()
    assert comp["result"]["regressions"]

def test_missing_resource():
    r = client.get("/api/projects/nope")
    assert r.status_code == 404

def test_empty_dataset_run():
    pid = client.post("/api/projects", json={"name":"P"}).json()["id"]
    ds = client.post(f"/api/projects/{pid}/datasets", json={"name":"D"}).json()["id"]
    run = client.post(f"/api/projects/{pid}/runs", json={"dataset_id":ds}).json()
    assert run["status"] == "completed"
    assert run["metrics"]["total"] == 0
