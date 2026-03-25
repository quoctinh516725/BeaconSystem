import cv2
from fastapi import HTTPException
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
from scipy.spatial.distance import cosine

# Kiểm tra nếu có GPU thì dùng, không thì dùng CPU
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Detect mặt từ ảnh sử dụng MTCNN
mtcnn = MTCNN(image_size=160, margin=10, keep_all=False, device=device)

# Lấy bộ dữ liệu VGGFace2 đã được huấn luyện sẵn cho model InceptionResnetV1
resnet = InceptionResnetV1(pretrained='vggface2').to(device).eval()

def extract_face(frame):
    if frame is None:
        raise HTTPException(status_code=400, detail="Không đọc được ảnh từ đường dẫn yêu cầu.")

    # InceptionResnetV1 yêu cầu định dạng màu là RGB, trong khi OpenCV đọc ảnh ở định dạng BGR
    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Chuyển đổi sang PIL Image vì MTCNN hoạt động tốt với PIL
    img_pil = Image.fromarray(img_rgb)

    # Nếu phát hiện 2 mặt trở lên bao lỗi
    boxes, _ = mtcnn.detect(img_pil)

    if boxes is not None and len(boxes) > 1:
        raise HTTPException(status_code=400, detail=f"Phát hiện {len(boxes)} gương mặt. Vui lòng cung cấp ảnh chỉ có một gương mặt.")

    face_tensor = mtcnn(img_pil)

    if face_tensor is not None:
        return face_tensor.unsqueeze(0).to(device)  # Thêm batch dimension và chuyển sang device
    raise HTTPException(status_code=400, detail="Không phát hiện khuôn mặt trong ảnh.")

def get_embedding(face_tensor):
    with torch.no_grad():
        emb = resnet(face_tensor)
    return emb[0].cpu().numpy()  # trả về embedding dưới dạng numpy array

