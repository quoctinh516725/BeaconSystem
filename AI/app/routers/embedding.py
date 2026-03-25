from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.schemas.person import PersonResponse, PersonCreate, PersonUpdate
from app.services import embedding
router = APIRouter(prefix="/embedding")

# Create Person and FaceRecord
@router.post("/", response_model=PersonResponse)
def create_person(data: PersonCreate, db: Session = Depends(get_db)):
    embedding= embedding.create_person(db, data)
    if embedding is None:
        raise HTTPException(status_code=400, detail="Không phát hiện khuôn mặt trong ảnh. Vui lòng thử lại với ảnh khác!")
    return embedding

@router.patch("/{person_id}", response_model=PersonResponse)
def update_person(person_id: int, data: PersonUpdate, db: Session = Depends(get_db)):
    person = embedding.update_person(db, person_id, data)
    if not person:
        raise HTTPException(status_code=404, detail="Hồ sơ không tồn tại!")
    return person