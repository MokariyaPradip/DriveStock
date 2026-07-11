from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base, get_db
from app.core.security import hash_password
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


def create_user(session_factory, email: str, password: str, role: str = "user") -> User:
    db = session_factory()
    try:
        user = User(email=email, hashed_password=hash_password(password), role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def test_login_returns_token_for_valid_credentials(client_and_session_factory):
    client, session_factory = client_and_session_factory
    email = "login@example.com"
    password = "securepass123"
    create_user(session_factory, email=email, password=password, role="admin")

    response = client.post("/api/auth/login", json={"email": email, "password": password})

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]

    decoded_token = jwt.decode(
        data["access_token"],
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )
    assert decoded_token["sub"] == email
    assert decoded_token["role"] == "admin"


def test_login_rejects_invalid_credentials(client_and_session_factory):
    client, session_factory = client_and_session_factory
    email = "invalid@example.com"
    create_user(session_factory, email=email, password="securepass123")

    response = client.post("/api/auth/login", json={"email": email, "password": "wrongpass123"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


@pytest.mark.parametrize(
    "payload",
    [
        {"email": "missing-password@example.com"},
        {"password": "securepass123"},
        {},
    ],
)
def test_login_requires_all_fields(client_and_session_factory, payload):
    client, _ = client_and_session_factory

    response = client.post("/api/auth/login", json=payload)

    assert response.status_code == 422
