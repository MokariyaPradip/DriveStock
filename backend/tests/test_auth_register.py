from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.core.security import verify_password
from app.main import app
from app.models import User


@pytest.fixture()
def client_and_session_factory(tmp_path: Path):
    database_path = tmp_path / "test.db"
    engine = create_engine(
        f"sqlite:///{database_path}",
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client, TestingSessionLocal
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


def test_register_hashes_password_and_returns_user(client_and_session_factory):
    client, session_factory = client_and_session_factory
    payload = {"email": "user@example.com", "password": "securepass123"}

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["role"] == "user"
    assert isinstance(data["id"], int)

    db = session_factory()
    try:
        user = db.query(User).filter(User.email == payload["email"]).one()
        assert user.hashed_password != payload["password"]
        assert verify_password(payload["password"], user.hashed_password)
    finally:
        db.close()


def test_register_rejects_duplicate_email(client_and_session_factory):
    client, _ = client_and_session_factory
    payload = {"email": "duplicate@example.com", "password": "securepass123"}

    first_response = client.post("/api/auth/register", json=payload)
    second_response = client.post("/api/auth/register", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 400
    assert second_response.json()["detail"] == "Email already registered"


@pytest.mark.parametrize("payload", [{"email": "missing-password@example.com"}, {"password": "securepass123"}])
def test_register_requires_all_fields(client_and_session_factory, payload):
    client, _ = client_and_session_factory

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 422
