from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Vehicle
from app.routers.auth import get_current_user
from app.schemas import VehicleCreate, VehicleRead

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.post("", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
) -> Vehicle:
    vehicle = Vehicle(
        make=payload.make,
        model=payload.model,
        category=payload.category,
        price=payload.price,
        quantity=payload.quantity,
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("", response_model=list[VehicleRead])
def list_vehicles(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
) -> list[Vehicle]:
    return db.scalars(select(Vehicle).order_by(Vehicle.id.asc())).all()


@router.get("/search", response_model=list[VehicleRead])
def search_vehicles(
    make: str | None = Query(default=None),
    model: str | None = Query(default=None),
    category: str | None = Query(default=None),
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
) -> list[Vehicle]:
    conditions = []

    if make:
        conditions.append(Vehicle.make.ilike(f"%{make.strip()}%"))
    if model:
        conditions.append(Vehicle.model.ilike(f"%{model.strip()}%"))
    if category:
        conditions.append(Vehicle.category.ilike(f"%{category.strip()}%"))
    if min_price is not None:
        conditions.append(Vehicle.price >= min_price)
    if max_price is not None:
        conditions.append(Vehicle.price <= max_price)

    query = select(Vehicle).order_by(Vehicle.id.asc())
    if conditions:
        query = query.where(and_(*conditions))

    return db.scalars(query).all()


@router.put("/{vehicle_id}", response_model=VehicleRead)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
) -> Vehicle:
    vehicle = db.scalar(select(Vehicle).where(Vehicle.id == vehicle_id))
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    vehicle.make = payload.make
    vehicle.model = payload.model
    vehicle.category = payload.category
    vehicle.price = payload.price
    vehicle.quantity = payload.quantity

    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.post("/{vehicle_id}/purchase", response_model=VehicleRead)
def purchase_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
) -> Vehicle:
    try:
        vehicle = db.scalar(select(Vehicle).where(Vehicle.id == vehicle_id))
        if vehicle is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

        if vehicle.quantity <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vehicle out of stock")

        vehicle.quantity -= 1
        db.commit()
        db.refresh(vehicle)
        return vehicle
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise