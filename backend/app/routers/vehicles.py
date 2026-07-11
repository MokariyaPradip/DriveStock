from fastapi import APIRouter, Depends, status
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
    return db.query(Vehicle).order_by(Vehicle.id.asc()).all()