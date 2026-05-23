# AI Requirement Specification - Face Recognition Research Module

## 1. Project Overview

Dự án tập trung nghiên cứu và xây dựng module AI nhận diện gương mặt cho bài toán tìm kiếm người thất lạc. Mục tiêu chính không phải là hoàn thiện một website đầy đủ tính năng, mà là làm rõ, triển khai và đánh giá pipeline AI gồm: xử lý ảnh đầu vào, phát hiện khuôn mặt, trích xuất embedding, so khớp độ tương đồng và tìm kiếm nhanh trong vector index.

Module AI cần chứng minh được các năng lực cốt lõi:

- Nhận ảnh từ người dùng hoặc hệ thống backend.
- Phát hiện khuôn mặt trong ảnh bằng MTCNN hoặc YOLO-based face detector.
- Chuẩn hóa khuôn mặt trước khi đưa vào model embedding.
- Trích xuất vector đặc trưng khuôn mặt bằng FaceNet/InceptionResnetV1 hoặc mô hình CNN/ResNet.
- So sánh khuôn mặt bằng Cosine Distance hoặc L2 Distance.
- Lưu và tìm kiếm embedding bằng FAISS, ưu tiên `IndexFlatL2` hoặc `IndexIDMap(IndexFlatL2)` trong giai đoạn nghiên cứu.
- Đưa ra kết quả top-k người có khuôn mặt tương đồng nhất.
- Đánh giá độ chính xác, tốc độ xử lý và giới hạn của mô hình.

## 2. Research Scope

### 2.1 In Scope

- Xây dựng AI service bằng Python/FastAPI.
- Sử dụng PyTorch để load và chạy model deep learning.
- Sử dụng OpenCV/CV2 để đọc ảnh, chuyển đổi màu, tiền xử lý ảnh.
- Phát hiện khuôn mặt bằng MTCNN.
- Nghiên cứu hoặc mở rộng thêm YOLO face detection để so sánh với MTCNN.
- Dùng FaceNet hoặc InceptionResnetV1 pretrained trên VGGFace2 để tạo embedding 512 chiều.
- Nghiên cứu kiến trúc CNN, ResNet50 và FaceNet để giải thích cơ sở mô hình.
- So sánh embedding bằng L2 Distance và Cosine Distance.
- Lưu embedding trong PostgreSQL/pgvector hoặc FAISS index.
- Tìm kiếm vector bằng FAISS `IndexFlatL2`, `IndexIDMap`, có mapping giữa `faiss_id` và `person_id`.
- Định nghĩa ngưỡng nhận diện: match mạnh, match nghi ngờ, không match.
- Đánh giá bằng các metric AI cơ bản: accuracy, precision, recall, FAR, FRR, threshold analysis, inference time.

### 2.2 Out of Scope

- Không yêu cầu hoàn thiện đầy đủ website production.
- Không bắt buộc xây dựng admin dashboard, moderation, notification, chat.
- Không yêu cầu xác minh danh tính pháp lý.
- Không yêu cầu training model từ đầu nếu dùng pretrained model.
- Không yêu cầu mobile app.
- Không yêu cầu scale hàng triệu khuôn mặt trong giai đoạn nghiên cứu ban đầu.

## 3. AI Objectives

- AO-01: Xây dựng pipeline nhận diện gương mặt hoạt động end-to-end từ ảnh đầu vào đến kết quả top-k tương đồng.
- AO-02: Chứng minh khả năng phát hiện khuôn mặt trong ảnh đơn và ảnh có nhiều khuôn mặt.
- AO-03: Trích xuất embedding ổn định cho cùng một người ở nhiều ảnh khác nhau.
- AO-04: So sánh hiệu quả giữa L2 Distance và Cosine Distance.
- AO-05: Sử dụng FAISS để tìm kiếm embedding nhanh hơn so với duyệt tuần tự.
- AO-06: Đề xuất ngưỡng nhận diện phù hợp với bài toán tìm người thất lạc.
- AO-07: Ghi nhận các giới hạn của AI: ảnh mờ, góc nghiêng, ánh sáng kém, tuổi tác thay đổi, che mặt, ảnh nhóm.

## 4. AI Pipeline

```text
Input Image
  |
  v
Image Validation
  |
  v
OpenCV Preprocessing
  |
  v
Face Detection: MTCNN / YOLO Face
  |
  v
Face Crop + Alignment + Resize
  |
  v
Embedding Model: FaceNet / InceptionResnetV1 / ResNet50-based CNN
  |
  v
512-D Face Embedding
  |
  v
Distance Calculation: L2 / Cosine
  |
  v
FAISS Vector Search
  |
  v
Top-K Similar Faces + Confidence/Distance Score
```

## 5. Technology Requirements

### 5.1 Python

- Python dùng làm ngôn ngữ chính cho AI Service.
- Code cần tách rõ các layer:
  - Router/API.
  - Image validation.
  - Face detection.
  - Embedding extraction.
  - Vector search.
  - Database/index mapping.

### 5.2 PyTorch

- Dùng PyTorch để load và inference model deep learning.
- Hệ thống phải tự chọn `cuda` nếu có GPU, nếu không thì dùng CPU.
- Inference phải chạy trong `torch.no_grad()` để giảm memory usage.
- Model phải được set `.eval()` khi inference.

### 5.3 OpenCV/CV2

- Dùng OpenCV để:
  - Đọc ảnh từ file path hoặc bytes/base64.
  - Decode ảnh upload.
  - Chuyển đổi BGR sang RGB trước khi đưa vào MTCNN/FaceNet.
  - Kiểm tra ảnh lỗi, ảnh rỗng hoặc ảnh không đọc được.
  - Có thể resize hoặc normalize ảnh nếu cần.

### 5.4 MTCNN

- Dùng MTCNN để detect khuôn mặt trong ảnh.
- MTCNN phải trả bounding box và confidence score.
- Chỉ chấp nhận khuôn mặt có confidence vượt ngưỡng, đề xuất `> 0.90`.
- Nếu không phát hiện khuôn mặt, API phải trả lỗi rõ ràng.
- Nếu ảnh có nhiều khuôn mặt tương đương nhau, hệ thống phải từ chối hoặc yêu cầu chọn khuôn mặt chính.
- Nếu có một khuôn mặt lớn vượt trội, có thể chọn khuôn mặt lớn nhất làm khuôn mặt chính.

### 5.5 YOLO Face Detection, Research/Optional

- YOLO không bắt buộc trong MVP hiện tại nhưng là phần nghiên cứu cần làm rõ.
- Có thể dùng YOLOv5/YOLOv8 face detector hoặc model YOLO đã fine-tune cho face detection.
- Mục tiêu so sánh YOLO với MTCNN:
  - Tốc độ detect.
  - Khả năng detect ảnh đông người.
  - Khả năng detect khuôn mặt nhỏ.
  - Độ ổn định trong ánh sáng kém/góc nghiêng.
- Nếu dùng YOLO, output bounding box cần được crop và chuẩn hóa trước khi đưa vào embedding model.

### 5.6 CNN, ResNet50, FaceNet

- CNN là nền tảng kiến trúc cho việc học đặc trưng ảnh.
- ResNet50 cần được trình bày như một kiến trúc CNN sâu có residual connection, có thể dùng làm backbone nhận diện ảnh/khuôn mặt.
- FaceNet cần được trình bày như phương pháp học embedding khuôn mặt, tối ưu khoảng cách giữa ảnh cùng người và khác người.
- Trong implementation hiện tại, model chính là `InceptionResnetV1(pretrained='vggface2')` từ `facenet-pytorch`.
- Embedding output là vector 512 chiều.
- Các embedding của cùng một người phải có khoảng cách nhỏ hơn embedding của người khác.

### 5.7 Distance Metrics

#### L2 Distance

- Dùng để đo khoảng cách Euclidean giữa hai embedding.
- FAISS `IndexFlatL2` sử dụng L2 Distance.
- Distance càng nhỏ thì khuôn mặt càng giống nhau.

#### Cosine Distance

- Dùng để đo góc giữa hai vector embedding.
- Cosine Similarity càng cao thì hai khuôn mặt càng giống nhau.
- Cosine Distance = `1 - cosine_similarity`.
- Cần nghiên cứu so sánh Cosine Distance với L2 Distance trên cùng tập test.

### 5.8 FAISS Index

- Dùng FAISS để tìm kiếm vector embedding nhanh.
- Giai đoạn nghiên cứu dùng:
  - `IndexFlatL2(dim=512)` để tìm kiếm chính xác bằng L2.
  - `IndexIDMap(IndexFlatL2)` để gắn vector với ID người dùng/person.
- Lưu ý: thuật ngữ đúng trong FAISS là `IndexFlatL2`, không phải `IndexFaceL2`.
- Hệ thống phải lưu mapping:
  - `faiss_id`: ID số dạng int64 dùng trong FAISS.
  - `person_id`: UUID/string của người trong database.
- FAISS index phải được lưu xuống file, ví dụ `storage/face_index.faiss`.
- Khi service restart, index phải được load lại từ file.

## 6. Functional AI Requirements

### 6.1 Image Input

- AI-FR-01: AI Service phải nhận ảnh thông qua `image_base64` hoặc `image_path`.
- AI-FR-02: Hệ thống phải kiểm tra ảnh có đọc được hay không.
- AI-FR-03: Hệ thống phải từ chối ảnh sai định dạng, ảnh rỗng hoặc ảnh bị lỗi.
- AI-FR-04: Hệ thống nên giới hạn kích thước ảnh để tránh quá tải memory.

### 6.2 Face Detection

- AI-FR-05: Hệ thống phải detect khuôn mặt trước khi tạo embedding.
- AI-FR-06: Nếu không có khuôn mặt, hệ thống trả lỗi `No face detected`.
- AI-FR-07: Nếu nhiều khuôn mặt có kích thước tương đương, hệ thống trả lỗi yêu cầu ảnh chỉ có một khuôn mặt rõ ràng.
- AI-FR-08: Hệ thống phải crop, align và resize khuôn mặt về input size phù hợp model, ví dụ `160x160`.

### 6.3 Embedding Extraction

- AI-FR-09: Hệ thống phải tạo embedding bằng PyTorch model.
- AI-FR-10: Embedding phải có dimension cố định, hiện tại là 512.
- AI-FR-11: Model inference phải dùng `.eval()` và `torch.no_grad()`.
- AI-FR-12: Embedding phải được convert sang `float32` trước khi đưa vào FAISS.

### 6.4 Person and Face Record

- AI-FR-13: Khi tạo người mới, hệ thống phải tạo `Person`.
- AI-FR-14: Mỗi `Person` có thể có nhiều `FaceRecord`.
- AI-FR-15: Mỗi `FaceRecord` lưu embedding và metadata ảnh.
- AI-FR-16: Mỗi embedding thêm vào FAISS phải có mapping tới `person_id`.

### 6.5 Search

- AI-FR-17: API search phải trả top-k kết quả giống nhất, mặc định `k=5`.
- AI-FR-18: Kết quả phải gồm `person_id` và distance score.
- AI-FR-19: Hệ thống phải sắp xếp kết quả theo distance tăng dần với L2.
- AI-FR-20: Nếu index rỗng hoặc không có kết quả hợp lệ, trả danh sách rỗng.

### 6.6 Threshold Decision

- AI-FR-21: Hệ thống phải định nghĩa ngưỡng match dựa trên thực nghiệm.
- AI-FR-22: Ngưỡng ban đầu có thể dùng:
  - `distance < 0.6`: match mạnh.
  - `0.6 <= distance < 0.8`: nghi ngờ, cần xác nhận thủ công.
  - `distance >= 0.8`: không match.
- AI-FR-23: Các ngưỡng này không được xem là cố định; cần đánh giá lại bằng dataset thực nghiệm.

## 7. Dataset Requirements

- Dataset phải gồm nhiều người khác nhau, mỗi người nên có nhiều ảnh.
- Ảnh nên có đa dạng điều kiện:
  - Chính diện.
  - Nghiêng mặt.
  - Ánh sáng tốt/xấu.
  - Biểu cảm khác nhau.
  - Tuổi tác khác nhau nếu có.
  - Ảnh mờ hoặc chất lượng thấp để kiểm thử robustness.
- Dataset cần tách thành:
  - Gallery/index set: ảnh được lưu vào database/index.
  - Query set: ảnh dùng để tìm kiếm.
- Không được dùng ảnh cá nhân nhạy cảm nếu chưa có sự đồng ý.
- Nếu dùng dataset public, cần ghi rõ nguồn và điều kiện sử dụng.

## 8. Evaluation Requirements

### 8.1 Metrics

- Accuracy: tỷ lệ nhận diện đúng trên tập test.
- Precision: trong các kết quả hệ thống báo match, tỷ lệ match đúng.
- Recall: trong các cặp thật sự cùng người, tỷ lệ hệ thống tìm ra.
- FAR - False Acceptance Rate: tỷ lệ nhận nhầm người khác là cùng người.
- FRR - False Rejection Rate: tỷ lệ từ chối nhầm người cùng danh tính.
- Top-1 Accuracy: query đúng người ở kết quả đầu tiên.
- Top-5 Accuracy: query đúng người nằm trong 5 kết quả đầu.
- Inference Time: thời gian detect + embedding + search.

### 8.2 Experiment Cases

- So sánh MTCNN vs YOLO face detector.
- So sánh L2 Distance vs Cosine Distance.
- So sánh inference CPU vs GPU.
- Đánh giá ảnh một mặt vs ảnh nhiều mặt.
- Đánh giá ảnh rõ vs ảnh mờ.
- Đánh giá top-k search khi số lượng embedding tăng.
- Đánh giá threshold `0.5`, `0.6`, `0.7`, `0.8`, `0.9`.

### 8.3 Expected Output

Mỗi thí nghiệm cần có:

- Tên thí nghiệm.
- Dataset sử dụng.
- Model/detector sử dụng.
- Metric đo.
- Bảng kết quả.
- Nhận xét.
- Kết luận chọn công nghệ/ngưỡng.

## 9. API Requirements for AI Module

### 9.1 POST `/search/`

Mục đích: tìm kiếm khuôn mặt tương đồng trong FAISS index.

Request:

```json
{
  "image_base64": "base64-image",
  "image_path": null
}
```

Response:

```json
{
  "data": [
    ["person-id-1", 0.52],
    ["person-id-2", 0.74]
  ],
  "message": "Search successfully"
}
```

Yêu cầu:

- Decode ảnh.
- Detect face.
- Extract embedding.
- Search FAISS top-k.
- Return list `(person_id, distance)`.

### 9.2 POST `/embedding/`

Mục đích: tạo person mới và thêm embedding vào index.

Request:

```json
{
  "name": "Nguyen Van A",
  "age": 65,
  "gender": "male",
  "date_of_birth": "1961-08-20",
  "image_base64": "base64-image"
}
```

Response:

```json
{
  "id": "person-uuid",
  "name": "Nguyen Van A",
  "message": "Created person and queued embedding"
}
```

Yêu cầu:

- Tạo person.
- Detect face.
- Extract embedding.
- Lưu face record.
- Thêm vector vào FAISS.
- Lưu mapping `person_id` và `faiss_id`.

## 10. Database Requirements for AI

### 10.1 persons

Lưu thông tin định danh cơ bản của người.

- `id`: UUID, primary key.
- `name`: tên.
- `age`: tuổi.
- `gender`: giới tính.
- `date_of_birth`: ngày sinh nếu có.
- `created_at`: thời điểm tạo.

### 10.2 face_records

Lưu embedding khuôn mặt.

- `id`: UUID.
- `person_id`: FK tới persons.
- `image_path`: đường dẫn ảnh hoặc metadata.
- `embedding`: vector 512 chiều.
- `created_at`: thời điểm tạo.

### 10.3 id_mapping

Mapping giữa database person và FAISS vector ID.

- `id`: internal ID.
- `person_id`: UUID/string.
- `faiss_id`: int64.

## 11. Non-Functional AI Requirements

- AI-NFR-01: Search với FAISS index nhỏ/trung bình nên phản hồi dưới 2 giây trên CPU.
- AI-NFR-02: Model phải chạy được trên CPU; GPU là tối ưu thêm.
- AI-NFR-03: Code phải tách module rõ để dễ thay MTCNN bằng YOLO hoặc thay FaceNet bằng ResNet50.
- AI-NFR-04: FAISS index phải có cơ chế save/load.
- AI-NFR-05: Lỗi AI phải rõ ràng, ví dụ ảnh lỗi, không có mặt, nhiều mặt, model lỗi.
- AI-NFR-06: Không log ảnh base64 hoặc dữ liệu embedding nhạy cảm ở production.

## 12. Architecture Focus

```text
FastAPI AI Service
  |
  |-- routers
  |     |-- search.py
  |     |-- embedding.py
  |
  |-- services
  |     |-- ai.py: MTCNN + FaceNet/InceptionResnetV1
  |     |-- search.py: query embedding + FAISS search
  |     |-- embedding.py: create person + face record
  |     |-- faiss.py: IndexIDMap(IndexFlatL2)
  |
  |-- models
  |     |-- Person
  |     |-- FaceRecord
  |     |-- IdMapping
  |
  |-- utils
        |-- verifyImage.py
        |-- convert.py
```

## 13. Acceptance Criteria

- AC-01: AI Service nhận được ảnh base64 và đọc ảnh thành công bằng OpenCV.
- AC-02: MTCNN phát hiện được khuôn mặt trong ảnh hợp lệ.
- AC-03: Hệ thống trả lỗi khi ảnh không có khuôn mặt.
- AC-04: Hệ thống tạo được embedding 512 chiều bằng PyTorch model.
- AC-05: Embedding được lưu vào database và FAISS index.
- AC-06: Search API trả về top-k kết quả gồm `person_id` và distance.
- AC-07: FAISS index được lưu ra file và load lại sau khi restart service.
- AC-08: Có tài liệu giải thích vai trò của PyTorch, CV2, MTCNN, YOLO, CNN, ResNet50, FaceNet, Cosine Distance và IndexFlatL2.
- AC-09: Có bảng thực nghiệm so sánh ít nhất 2 metric hoặc 2 công nghệ, ví dụ L2 vs Cosine hoặc MTCNN vs YOLO.
- AC-10: Có đề xuất threshold dựa trên kết quả test, không chỉ hardcode theo cảm tính.

## 14. Research Deliverables

- Source code AI Service.
- Báo cáo kiến trúc AI pipeline.
- Báo cáo công nghệ:
  - PyTorch.
  - OpenCV/CV2.
  - MTCNN.
  - YOLO.
  - CNN.
  - ResNet50.
  - FaceNet/InceptionResnetV1.
  - Cosine Distance.
  - L2 Distance.
  - FAISS IndexFlatL2.
- Bộ ảnh test hoặc mô tả dataset.
- Bảng kết quả thực nghiệm.
- Kết luận chọn detector, embedding model, distance metric và threshold.

## 15. Notes for Current Implementation

Implementation hiện tại đã có:

- `facenet-pytorch`.
- `MTCNN(image_size=160, margin=10, keep_all=False)`.
- `InceptionResnetV1(pretrained='vggface2')`.
- `torch.device('cuda' if torch.cuda.is_available() else 'cpu')`.
- OpenCV chuyển ảnh BGR sang RGB.
- Embedding 512 chiều.
- FAISS `IndexIDMap(IndexFlatL2(512))`.
- Search top-k mặc định `k=5`.
- Mapping `faiss_id` với `person_id`.

Các phần nên bổ sung để đúng hướng nghiên cứu:

- Thêm tài liệu hoặc notebook giải thích CNN, ResNet50, FaceNet.
- Thêm thử nghiệm Cosine Distance song song với L2.
- Thêm thử nghiệm YOLO face detector để so sánh với MTCNN.
- Thêm script benchmark threshold và top-k accuracy.
- Thêm bảng kết quả thực nghiệm thay vì chỉ mô tả lý thuyết.
