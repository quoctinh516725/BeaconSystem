import cv2
from fastapi import HTTPException
from huggingface_hub import User
from sqlalchemy.orm import Session
from app.services.ai import extract_face, get_embedding
from app.models.entities.person import Person
from app.models.entities.face_record import FaceRecord
    
# CREATE
def create_person(db: Session, data):
    image = cv2.imread(data.image_path)

    face_tensor = extract_face(image)

    if face_tensor is None:
        return None

    embedding = get_embedding(face_tensor)

    # Tạo bản ghi Person
    person = Person(name=data.name, age=data.age, gender=data.gender, date_of_birth=data.date_of_birth)
    db.add(person)
    db.flush()  # Đẩy person vào DB để có ID trước khi tạo FaceRecord

    # Tạo bản ghi FaceRecord liên kết với Person
    face_record = FaceRecord(embedding=embedding, person_id=person.id, image_path=data.image_path)
    db.add(face_record)

    db.commit()
    db.refresh(person)

    return {
        "id": person.id,
        "name": person.name,
        "embedding": embedding.tolist(),
        "message": "Tạo hồ sơ thành công!"
    }
  

# UPDATE
def update_person(db: Session, personId: int, data):
    person = db.query(Person).filter(Person.id == personId).first()
    if not person:
        return None

    if data.name is not None:
        person.name = data.name
    if data.age is not None:
        person.age = data.age
    if data.gender is not None:
        person.gender = data.gender
    if data.date_of_birth is not None:
        person.date_of_birth = data.date_of_birth
        
    db.commit()
    db.refresh(person)
    return person