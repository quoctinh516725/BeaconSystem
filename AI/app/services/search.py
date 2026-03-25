import cv2
from app.config.faiss import get_faiss_manager
from app.services.ai import extract_face, get_embedding
from app.utils.verifyImage import verify_image
    
# Search
def search_embedding(data):
    image = verify_image(data.image_path)

    if image is None:
        raise ValueError("Không đọc được ảnh từ đường dẫn yêu cầu.")

    face_tensor = extract_face(image)

    embedding = get_embedding(face_tensor)
    faiss_manager = get_faiss_manager()

    return faiss_manager.search_vector(embedding, 5)