import cv2
from AI.app.config.faiss import get_faiss_manager
from AI.app.services.ai import extract_face, get_embedding
from AI.app.models.entities.person import Person
from AI.app.models.entities.face_record import FaceRecord
    
# Search
def search_embedding(data):
    image = cv2.imread(data.image_path)

    if image is None:
        raise ValueError("Không đọc được ảnh từ đường dẫn yêu cầu.")

    face_tensor = extract_face(image)

    embedding = get_embedding(face_tensor)
    faiss_manager = get_faiss_manager()

    return faiss_manager.search_vector(embedding, 5)