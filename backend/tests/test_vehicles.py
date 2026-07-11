from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app


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


def register_and_login(client: TestClient) -> str:
    register_payload = {"email": "seller@example.com", "password": "securepass123"}
    client.post("/api/auth/register", json=register_payload)

    login_response = client.post("/api/auth/login", json=register_payload)
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


@pytest.mark.parametrize(
    "method,url,payload",
    [
        ("post", "/api/vehicles", {"make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 25000, "quantity": 5}),
        ("get", "/api/vehicles", None),
    ],
)
def test_vehicle_endpoints_require_authentication(client_and_session_factory, method, url, payload):
    client, _ = client_and_session_factory

    if payload is None:
        response = getattr(client, method)(url)
    else:
        response = getattr(client, method)(url, json=payload)

    assert response.status_code == 401



def test_create_vehicle_requires_all_fields_when_authenticated(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    response = client.post(
        "/api/vehicles",
        json={"make": "Toyota", "model": "Corolla"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 422



def test_create_vehicle_returns_vehicle_data_for_authenticated_user(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)
    payload = {
        "make": "Toyota",
        "model": "Corolla",
        "category": "Sedan",
        "price": 25000,
        "quantity": 5,
    }

    response = client.post(
        "/api/vehicles",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["make"] == payload["make"]
    assert data["model"] == payload["model"]
    assert data["category"] == payload["category"]
    assert data["price"] == payload["price"]
    assert data["quantity"] == payload["quantity"]
    assert isinstance(data["id"], int)



def test_get_vehicles_returns_created_vehicle_for_authenticated_user(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)
    payload = {
        "make": "Honda",
        "model": "Civic",
        "category": "Sedan",
        "price": 27000,
        "quantity": 3,
    }

    create_response = client.post(
        "/api/vehicles",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201

    list_response = client.get("/api/vehicles", headers={"Authorization": f"Bearer {token}"})

    assert list_response.status_code == 200
    data = list_response.json()
    assert isinstance(data, list)
    assert any(vehicle["make"] == payload["make"] and vehicle["model"] == payload["model"] for vehicle in data)
