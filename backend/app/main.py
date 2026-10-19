from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import cors_list, settings
from app.db.session import Base, engine
from app.models.entities import *

Base.metadata.create_all(bind=engine)

# seed
from app.db.session import SessionLocal


def seed():
    if not settings.seed_demo: return
    db = SessionLocal()
    try:
        if db.query(Project).count() == 0:
            p = Project(name="Demo Project", description="Seeded demo")
            db.add(p)
            db.commit()
            db.refresh(p)
            ds = Dataset(project_id=p.id, name="Demo Dataset", description="Seeded")
            db.add(ds)
            db.commit()
            db.refresh(ds)
            for i in range(5):
                tc = TestCase(dataset_id=ds.id, input={"text": f"What is capital of France? case {i}"}, expected={"text":"Paris"}, criteria={"exact_match": True, "non_empty": True}, tags=["demo"])
                db.add(tc)
            db.commit()
    finally:
        db.close()
seed()

app = FastAPI(title="TraceForge")
app.add_middleware(CORSMiddleware, allow_origins=cors_list(), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router)
