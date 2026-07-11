from fastapi import FastAPI

from app.core.database import init_db
from app.routers.auth import router as auth_router
from app.routers.vehicles import router as vehicles_router

app = FastAPI(title="DriveStock API")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(vehicles_router)
