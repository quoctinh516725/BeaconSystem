import cv2
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.utils.verifyImage import verify_image
from app.config.faiss import get_faiss_manager
from app.services.ai import extract_face, get_embedding
from app.models.entities.person import Person
from app.models.entities.face_record import FaceRecord
    
# CREATE
def create_person(db: Session, data):
    image = verify_image(data.image_path)
    if image is None:
        raise HTTPException(status_code=400, detail="Không thể đọc ảnh từ đường dẫn đã cung cấp. Vui lòng kiểm tra lại đường dẫn và thử lại!")
    
    face_tensor = extract_face(image)

    embedding = get_embedding(face_tensor)
    try:
        # Tạo bản ghi Person
        person = Person(name=data.name, age=data.age, gender=data.gender, date_of_birth=data.date_of_birth)
        db.add(person)
        db.flush()  # Đẩy person vào DB để có ID trước khi tạo FaceRecord

        # Tạo bản ghi FaceRecord liên kết với Person
        face_record = FaceRecord(embedding=embedding, person_id=person.id, image_path=data.image_path)
        db.add(face_record)

        db.commit()
        db.refresh(person)

        # Thêm embedding vào Faiss
        faiss_manager = get_faiss_manager()
        faiss_manager.add_vector(embedding,person.id)

        return {
            "id": person.id,
            "name": person.name,
            "embedding": embedding.tolist(),
            "message": "Tạo hồ sơ thành công!"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Đã xảy ra lỗi khi tạo hồ sơ: {str(e)}")
   
  

# UPDATE
def update_person(db: Session, person_id, data):
    person = db.query(Person).filter(Person.id == person_id).first()
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