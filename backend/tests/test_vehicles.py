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


def register_admin_and_login(client: TestClient) -> str:
    register_payload = {"email": "admin@example.com", "password": "securepass123"}
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


def create_vehicle(client: TestClient, token: str, payload: dict) -> None:
    response = client.post(
        "/api/vehicles",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201


def test_update_vehicle_returns_updated_vehicle_for_authenticated_user(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)
    original_payload = {
        "make": "Toyota",
        "model": "Corolla",
        "category": "Sedan",
        "price": 25000,
        "quantity": 5,
    }

    create_response = client.post(
        "/api/vehicles",
        json=original_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201
    vehicle_id = create_response.json()["id"]

    update_payload = {
        "make": "Toyota",
        "model": "Camry",
        "category": "Sedan",
        "price": 28000,
        "quantity": 4,
    }

    response = client.put(
        f"/api/vehicles/{vehicle_id}",
        json=update_payload,
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == vehicle_id
    assert data["make"] == update_payload["make"]
    assert data["model"] == update_payload["model"]
    assert data["category"] == update_payload["category"]
    assert data["price"] == update_payload["price"]
    assert data["quantity"] == update_payload["quantity"]


def test_update_vehicle_requires_all_fields_when_authenticated(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    create_response = client.post(
        "/api/vehicles",
        json={"make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 25000, "quantity": 5},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201
    vehicle_id = create_response.json()["id"]

    response = client.put(
        f"/api/vehicles/{vehicle_id}",
        json={"make": "Toyota", "model": "Camry"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 422


def test_update_missing_vehicle_returns_not_found(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    response = client.put(
        "/api/vehicles/9999",
        json={
            "make": "Toyota",
            "model": "Camry",
            "category": "Sedan",
            "price": 28000,
            "quantity": 4,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


def test_purchase_vehicle_decrements_stock_by_one(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    create_response = client.post(
        "/api/vehicles",
        json={"make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 25000, "quantity": 5},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201
    vehicle_id = create_response.json()["id"]

    response = client.post(
        f"/api/vehicles/{vehicle_id}/purchase",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == vehicle_id
    assert data["quantity"] == 4


def test_purchase_vehicle_blocks_when_out_of_stock(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    create_response = client.post(
        "/api/vehicles",
        json={"make": "Honda", "model": "Civic", "category": "Sedan", "price": 27000, "quantity": 0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201
    vehicle_id = create_response.json()["id"]

    response = client.post(
        f"/api/vehicles/{vehicle_id}/purchase",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Vehicle out of stock"


def test_purchase_missing_vehicle_returns_not_found(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    response = client.post(
        "/api/vehicles/9999/purchase",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


def test_delete_vehicle_requires_admin_access(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    create_response = client.post(
        "/api/vehicles",
        json={"make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 25000, "quantity": 5},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201
    vehicle_id = create_response.json()["id"]

    response = client.delete(
        f"/api/vehicles/{vehicle_id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"


def test_delete_vehicle_allows_admin_user(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_admin_and_login(client)

    create_response = client.post(
        "/api/vehicles",
        json={"make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 25000, "quantity": 5},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201
    vehicle_id = create_response.json()["id"]

    response = client.delete(
        f"/api/vehicles/{vehicle_id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["id"] == vehicle_id


def test_delete_missing_vehicle_returns_not_found(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_admin_and_login(client)

    response = client.delete(
        "/api/vehicles/9999",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


def test_restock_vehicle_requires_admin_access(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    create_response = client.post(
        "/api/vehicles",
        json={"make": "Honda", "model": "Civic", "category": "Sedan", "price": 27000, "quantity": 3},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201
    vehicle_id = create_response.json()["id"]

    response = client.post(
        f"/api/vehicles/{vehicle_id}/restock",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"


def test_restock_vehicle_allows_admin_user(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_admin_and_login(client)

    create_response = client.post(
        "/api/vehicles",
        json={"make": "Honda", "model": "Civic", "category": "Sedan", "price": 27000, "quantity": 3},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201
    vehicle_id = create_response.json()["id"]

    response = client.post(
        f"/api/vehicles/{vehicle_id}/restock",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == vehicle_id
    assert data["quantity"] == 4


def test_restock_missing_vehicle_returns_not_found(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_admin_and_login(client)

    response = client.post(
        "/api/vehicles/9999/restock",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


def test_search_vehicles_by_make(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    create_vehicle(
        client,
        token,
        {"make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 25000, "quantity": 5},
    )
    create_vehicle(
        client,
        token,
        {"make": "Honda", "model": "Civic", "category": "Sedan", "price": 27000, "quantity": 3},
    )

    response = client.get("/api/vehicles/search", params={"make": "toyota"}, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["make"] == "Toyota"


def test_search_vehicles_by_model(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    create_vehicle(
        client,
        token,
        {"make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 25000, "quantity": 5},
    )
    create_vehicle(
        client,
        token,
        {"make": "Honda", "model": "Civic", "category": "Sedan", "price": 27000, "quantity": 3},
    )

    response = client.get("/api/vehicles/search", params={"model": "civic"}, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["model"] == "Civic"


def test_search_vehicles_by_category(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    create_vehicle(
        client,
        token,
        {"make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 25000, "quantity": 5},
    )
    create_vehicle(
        client,
        token,
        {"make": "Ford", "model": "Ranger", "category": "Truck", "price": 35000, "quantity": 2},
    )

    response = client.get("/api/vehicles/search", params={"category": "sedan"}, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "Sedan"


def test_search_vehicles_by_price_range(client_and_session_factory):
    client, _ = client_and_session_factory
    token = register_and_login(client)

    create_vehicle(
        client,
        token,
        {"make": "Toyota", "model": "Corolla", "category": "Sedan", "price": 25000, "quantity": 5},
    )
    create_vehicle(
        client,
        token,
        {"make": "BMW", "model": "X5", "category": "SUV", "price": 65000, "quantity": 1},
    )

    response = client.get(
        "/api/vehicles/search",
        params={"min_price": 20000, "max_price": 30000},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["price"] == 25000
