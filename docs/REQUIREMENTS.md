# Software Requirement Specification - Beacons AI Face Recognition Platform

> Note: Tài liệu này mô tả tổng quan sản phẩm Beacons. Nếu mục tiêu là nghiên cứu AI nhận diện gương mặt, tài liệu chính cần xem là [AI_REQUIREMENTS.md](./AI_REQUIREMENTS.md), tập trung vào PyTorch, OpenCV, MTCNN, YOLO, CNN, ResNet50, FaceNet, distance metric và FAISS index.

## 1. Project Overview

Beacons là nền tảng hỗ trợ cộng đồng đăng tải, tìm kiếm và đối chiếu thông tin người thất lạc bằng công nghệ nhận diện khuôn mặt AI. Người dùng có thể tạo hồ sơ tìm kiếm kèm ảnh, hệ thống tự động trích xuất đặc trưng khuôn mặt, so khớp với dữ liệu đã có và đề xuất các hồ sơ có khả năng trùng khớp.

Mục tiêu kinh doanh:

- Rút ngắn thời gian phát hiện các hồ sơ có khả năng liên quan đến cùng một người.
- Cung cấp kênh đăng tin tập trung, có cấu trúc và dễ chia sẻ cho cộng đồng.
- Hỗ trợ xác nhận thủ công khi AI phát hiện kết quả nghi ngờ, tránh tự động kết luận sai.
- Tạo nền tảng có thể mở rộng cho tổ chức xã hội, cơ quan hỗ trợ, đội tình nguyện và người thân.

Các thành phần hiện tại:

- Frontend: Next.js, React, Tailwind CSS, giao diện trang chủ, đăng nhập, danh sách bài đăng, tạo hồ sơ tìm kiếm.
- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, BullMQ, Redis, Cloudinary.
- AI Service: FastAPI, SQLAlchemy, pgvector, FAISS, OpenCV, model embedding khuôn mặt 512 chiều.

## 2. Scope

### 2.1 In Scope

- Đăng ký và đăng nhập tài khoản người dùng.
- Tạo bài đăng tìm kiếm người thất lạc với thông tin cá nhân, mô tả và ảnh khuôn mặt.
- Upload ảnh lên cloud storage thông qua background worker.
- Tự động gọi AI Service để tìm kiếm khuôn mặt tương đồng trong FAISS index.
- Tự động tạo hồ sơ định danh AI mới nếu không có kết quả tương đồng.
- Gợi ý danh sách hồ sơ tương đồng nếu kết quả nằm trong vùng nghi ngờ.
- Cho phép người đăng xác nhận hồ sơ trùng khớp hoặc tạo hồ sơ mới.
- Xem danh sách bài đăng công khai, có phân trang.
- Xem chi tiết bài đăng.
- Cập nhật và xóa bài đăng bởi chủ sở hữu.

### 2.2 Out of Scope ở MVP hiện tại

- Vai trò quản trị viên đầy đủ trên frontend.
- Duyệt bài bởi moderator trước khi công khai.
- Chat giữa người đăng và người có thông tin.
- Xác minh giấy tờ tùy thân.
- Tìm kiếm nâng cao theo bản đồ, khoảng cách địa lý hoặc thời gian thực.
- Notification qua email/SMS/push.
- Mobile app native.
- Dashboard thống kê vận hành.

### 2.3 Future Scope

- Module admin/moderation.
- Báo cáo bài viết sai phạm.
- Quy trình đánh dấu đã tìm thấy.
- Tích hợp bản đồ địa điểm thất lạc.
- OCR/Face quality assessment trước khi nhận ảnh.
- Multi-face detection và chọn khuôn mặt chính.
- Consent management, audit log và data retention policy.

## 3. Stakeholders

- Người thân/người đăng tin: tạo hồ sơ tìm kiếm, xác nhận kết quả AI.
- Khách truy cập: xem danh sách hồ sơ công khai.
- Tình nguyện viên/tổ chức hỗ trợ: tìm kiếm, chia sẻ, bổ sung thông tin.
- Quản trị viên: quản lý người dùng, bài đăng, xử lý báo cáo, giám sát hệ thống.
- Đội vận hành kỹ thuật: triển khai, backup, monitoring, bảo mật, quản lý model AI.

## 4. Roles & Permissions

### 4.1 Guest

- Xem trang chủ.
- Xem danh sách bài đăng công khai.
- Xem chi tiết bài đăng công khai.
- Đăng ký/đăng nhập.
- Không được tạo, sửa, xóa hoặc xác nhận hồ sơ.

### 4.2 Registered User

- Tạo bài đăng tìm kiếm người thất lạc.
- Upload ảnh khuôn mặt.
- Xem kết quả AI gợi ý sau khi tạo bài.
- Xác nhận hồ sơ trùng khớp hoặc xác nhận không trùng khớp.
- Cập nhật bài đăng do mình tạo.
- Xóa bài đăng do mình tạo.
- Không được sửa/xóa bài đăng của người khác.

### 4.3 Moderator, đề xuất mở rộng

- Xem danh sách bài chờ duyệt.
- Ẩn/khóa bài đăng vi phạm.
- Đánh dấu bài đăng cần xác minh.
- Xử lý báo cáo từ cộng đồng.
- Không được truy cập password/hash/token.

### 4.4 Admin, đề xuất mở rộng

- Quản lý toàn bộ người dùng, bài đăng, trạng thái hệ thống.
- Quản lý role và trạng thái tài khoản.
- Xem audit log.
- Cấu hình ngưỡng AI, retention policy, thông báo hệ thống.

## 5. User Flow

### 5.1 Đăng ký/đăng nhập

1. Người dùng truy cập trang đăng nhập hoặc đăng ký.
2. Người dùng nhập email/username, mật khẩu và thông tin liên hệ.
3. Backend validate dữ liệu, hash mật khẩu và tạo tài khoản.
4. Khi đăng nhập thành công, hệ thống trả access token và set refresh token cookie.
5. Frontend lưu access token để gọi API yêu cầu xác thực.

### 5.2 Tạo hồ sơ tìm kiếm

1. Người dùng đăng nhập.
2. Người dùng mở trang tạo hồ sơ.
3. Người dùng nhập: tiêu đề, tên, tuổi, giới tính, nơi thất lạc/địa điểm hiện tại, mô tả, ngày sinh, năm thất lạc, quê quán.
4. Người dùng upload ảnh khuôn mặt rõ nét.
5. Frontend validate cơ bản, gửi `multipart/form-data` đến Backend.
6. Backend validate dữ liệu và ảnh.
7. Backend chuyển ảnh sang base64 và gọi AI Service `/search`.
8. AI Service trích xuất khuôn mặt, tạo embedding và tìm kiếm trong FAISS.
9. Backend xử lý kết quả:
   - Nếu match mạnh: tạo bài đăng trạng thái `CONFIRMED`, gắn `personId` đã có.
   - Nếu match nghi ngờ: tạo bài đăng trạng thái `PENDING`, trả danh sách hồ sơ tương tự cho frontend.
   - Nếu không match: gọi AI Service `/embedding` tạo person mới, tạo bài đăng `CONFIRMED`.
10. Backend thêm job upload ảnh vào Redis/BullMQ.
11. Worker upload ảnh lên Cloudinary và cập nhật `image_url`.

### 5.3 Xác nhận kết quả nghi ngờ

1. Frontend hiển thị modal các hồ sơ tương đồng.
2. Người dùng xem chi tiết từng hồ sơ gợi ý.
3. Nếu nhận ra trùng khớp, người dùng chọn "Đây là người thân tôi".
4. Backend cập nhật bài đăng với `personId` đã chọn và chuyển `status = CONFIRMED`.
5. Nếu không có ai trùng khớp, người dùng chọn tạo định danh mới.
6. Backend gọi AI Service tạo person/embedding mới và cập nhật bài đăng `CONFIRMED`.

### 5.4 Xem danh sách bài đăng

1. Guest hoặc user truy cập trang danh sách.
2. Frontend gọi `GET /api/posts?page=1&limit=20`.
3. Backend trả danh sách bài đăng và thông tin phân trang.
4. Frontend hiển thị card gồm ảnh, tên, tuổi, địa điểm, ngày đăng, trạng thái.

## 6. Functional Requirements

### 6.1 Authentication

- FR-AUTH-01: Hệ thống phải cho phép đăng ký bằng email, username, phone và password.
- FR-AUTH-02: Email và username phải là duy nhất.
- FR-AUTH-03: Password phải được hash trước khi lưu.
- FR-AUTH-04: Hệ thống phải cho phép đăng nhập bằng email hoặc username.
- FR-AUTH-05: Hệ thống phải trả access token sau khi đăng nhập thành công.
- FR-AUTH-06: Refresh token phải được lưu bằng HTTP-only cookie.
- FR-AUTH-07: Các API tạo/sửa/xóa/xác nhận bài đăng phải yêu cầu JWT hợp lệ.

### 6.2 Post Management

- FR-POST-01: User đã đăng nhập có thể tạo bài đăng mới.
- FR-POST-02: Khi tạo bài đăng, ảnh là bắt buộc.
- FR-POST-03: Các trường bắt buộc gồm `title`, `name`, `age`, `gender`, `location`, `description`.
- FR-POST-04: Các trường tùy chọn gồm `date_of_birth`, `lost_year`, `hometown`.
- FR-POST-05: Tuổi phải lớn hơn 0.
- FR-POST-06: Giới tính chỉ chấp nhận `male` hoặc `female` trong MVP.
- FR-POST-07: Năm thất lạc phải từ 1900 đến năm hiện tại.
- FR-POST-08: User chỉ được sửa/xóa bài đăng do chính mình tạo.
- FR-POST-09: Danh sách bài đăng phải hỗ trợ phân trang.
- FR-POST-10: Bài đăng phải có trạng thái tối thiểu: `PENDING`, `CONFIRMED`, có thể mở rộng `FOUND`, `REJECTED`, `HIDDEN`.

### 6.3 AI Face Recognition

- FR-AI-01: AI Service phải nhận ảnh qua `image_base64` hoặc `image_path`.
- FR-AI-02: AI Service phải kiểm tra ảnh có đọc được hay không.
- FR-AI-03: AI Service phải phát hiện khuôn mặt trong ảnh.
- FR-AI-04: Nếu không phát hiện khuôn mặt, hệ thống phải trả lỗi rõ ràng để người dùng upload ảnh khác.
- FR-AI-05: AI Service phải sinh embedding 512 chiều cho khuôn mặt.
- FR-AI-06: AI Service phải tìm kiếm top K khuôn mặt gần nhất trong FAISS index.
- FR-AI-07: Hệ thống phải lưu mapping giữa `personId` và `faiss_id`.
- FR-AI-08: Khi tạo person mới, hệ thống phải lưu `Person`, `FaceRecord`, embedding và cập nhật FAISS index.
- FR-AI-09: Việc tạo face record có thể chạy background để không block response quá lâu.

### 6.4 Similarity Decision

- FR-MATCH-01: Nếu distance score `< 0.6`, hệ thống xem là trùng khớp mạnh và tự gắn `personId`.
- FR-MATCH-02: Nếu distance score từ `0.6` đến `< 0.8`, hệ thống xem là nghi ngờ và yêu cầu người dùng xác nhận.
- FR-MATCH-03: Nếu không có kết quả phù hợp, hệ thống tạo person mới.
- FR-MATCH-04: Hệ thống không được hiển thị AI match như kết luận pháp lý; chỉ hiển thị là gợi ý kỹ thuật.
- FR-MATCH-05: Người dùng phải có quyền từ chối toàn bộ gợi ý và tạo hồ sơ mới.

### 6.5 Image Upload

- FR-UPLOAD-01: Frontend giới hạn kích thước ảnh tối đa 5MB trong MVP.
- FR-UPLOAD-02: Backend nhận ảnh qua `multipart/form-data`.
- FR-UPLOAD-03: Upload ảnh lên Cloudinary phải chạy qua queue để giảm thời gian response.
- FR-UPLOAD-04: Khi upload thành công, Backend phải cập nhật `image_url` của bài đăng.
- FR-UPLOAD-05: Nếu upload thất bại, bài đăng vẫn được tạo nhưng cần cơ chế retry và trạng thái lỗi ảnh trong phiên bản production.

### 6.6 Public Listing

- FR-LIST-01: Người dùng không đăng nhập vẫn xem được danh sách bài đăng công khai.
- FR-LIST-02: Danh sách phải trả dữ liệu mới nhất trước.
- FR-LIST-03: Mỗi item phải có ảnh đại diện hoặc ảnh fallback.
- FR-LIST-04: Frontend phải xử lý trạng thái loading, empty và error.

## 7. Business Rules

- BR-01: Một người thất lạc có thể có nhiều bài đăng liên quan, nhưng nên cùng trỏ về một `personId` nếu AI hoặc người dùng xác nhận là cùng người.
- BR-02: Một bài đăng chỉ có một `authorId`.
- BR-03: Chỉ chủ bài đăng mới được xác nhận kết quả nghi ngờ cho bài của mình.
- BR-04: AI chỉ đưa ra đề xuất; quyết định cuối cùng trong luồng nghi ngờ thuộc về người dùng hoặc moderator.
- BR-05: Ảnh phải chứa khuôn mặt rõ ràng; ảnh không có khuôn mặt phải bị từ chối.
- BR-06: Không công khai thông tin nhạy cảm ngoài phạm vi cần thiết cho việc tìm kiếm.
- BR-07: Bài đăng `PENDING` cần được hiển thị khác biệt để người xem biết hồ sơ chưa được xác nhận hoàn toàn.
- BR-08: Khi người dùng từ chối tất cả hồ sơ tương tự, hệ thống phải tạo person mới để tránh mất dữ liệu tìm kiếm.
- BR-09: Hệ thống phải lưu snapshot thông tin người thất lạc trong `Post` để hiển thị nhanh, ngay cả khi entity `Person` ở AI Service thay đổi.
- BR-10: Không cho phép user sửa bài của user khác dù biết `postId`.

## 8. Database Design

### 8.1 Backend Database - PostgreSQL/Prisma

#### users

| Field | Type | Constraint | Description |
| --- | --- | --- | --- |
| id | UUID/String | PK | ID người dùng |
| email | String | Unique, required | Email |
| username | String | Unique, required | Tên đăng nhập |
| phone | String | Required | Số điện thoại |
| password | String | Nullable | Password hash |
| status | String | Default ACTIVE | Trạng thái tài khoản |
| created_at | DateTime | Default now | Ngày tạo |
| updated_at | DateTime | Auto update | Ngày cập nhật |

#### posts

| Field | Type | Constraint | Description |
| --- | --- | --- | --- |
| id | UUID/String | PK | ID bài đăng |
| authorId | String | FK users.id, index | Chủ bài đăng |
| personId | String | Nullable, index | ID định danh bên AI Service |
| title | String | Required | Tiêu đề |
| name | String | Required | Tên người thất lạc |
| age | Int | Required | Tuổi |
| gender | String | Required | Giới tính |
| image_url | String | Nullable | URL ảnh sau upload |
| date_of_birth | DateTime | Nullable | Ngày sinh |
| lost_year | Int | Nullable | Năm thất lạc |
| hometown | String | Nullable | Quê quán |
| location | String | Required | Địa điểm liên quan |
| description | String | Required | Mô tả nhận dạng |
| status | String | Default PENDING | Trạng thái bài đăng |
| created_at | DateTime | Default now | Ngày tạo |
| updated_at | DateTime | Auto update | Ngày cập nhật |

### 8.2 AI Database - PostgreSQL/SQLAlchemy

#### persons

| Field | Type | Constraint | Description |
| --- | --- | --- | --- |
| id | UUID | PK | ID định danh người |
| name | String | Required | Tên |
| age | String/Int | Optional | Tuổi |
| date_of_birth | String | Optional | Ngày sinh |
| gender | String | Optional | Giới tính |
| hometown | String | Optional | Quê quán |
| lost_year | Integer | Optional | Năm thất lạc |
| created_at | DateTime | Default now | Ngày tạo |

#### face_records

| Field | Type | Constraint | Description |
| --- | --- | --- | --- |
| id | UUID | PK | ID face record |
| person_id | UUID | FK persons.id, index | Person sở hữu khuôn mặt |
| image_path | String | Nullable | Đường dẫn ảnh |
| embedding | Vector(512) | Required | Vector đặc trưng khuôn mặt |
| created_at | DateTime | Default now | Ngày tạo |

#### id_mapping

| Field | Type | Constraint | Description |
| --- | --- | --- | --- |
| id | Integer | PK | Internal ID |
| person_id | String | Unique | UUID person |
| faiss_id | BigInteger | Unique, index | ID số dùng trong FAISS |

## 9. API Design

### 9.1 Authentication API

#### POST `/api/auth/register`

Request:

```json
{
  "email": "user@example.com",
  "username": "nguyenvana",
  "password": "StrongPassword123",
  "phone": "0900000000"
}
```

Response:

```json
{
  "success": true,
  "message": "Đăng ký thành công!",
  "data": {
    "user": {},
    "accessToken": "jwt-token"
  }
}
```

#### POST `/api/auth/login`

Request:

```json
{
  "emailOrUsername": "user@example.com",
  "password": "StrongPassword123"
}
```

### 9.2 Post API

#### GET `/api/posts?page=1&limit=20`

Public. Trả danh sách bài đăng phân trang.

#### GET `/api/posts/:id`

Public. Trả chi tiết bài đăng.

#### POST `/api/posts`

Protected. Content-Type: `multipart/form-data`.

Fields:

- `title`
- `name`
- `age`
- `gender`
- `location`
- `description`
- `image`
- `date_of_birth`, optional
- `lost_year`, optional
- `hometown`, optional

Response có thể bao gồm `similarPersons` nếu AI phát hiện hồ sơ nghi ngờ.

#### PATCH `/api/posts/:id/confirm`

Protected. Xác nhận kết quả AI.

Request khi chọn người trùng:

```json
{
  "personId": "uuid-person-id"
}
```

Request khi không ai trùng:

```json
{
  "personId": null,
  "image_base64": "base64-image"
}
```

#### PUT `/api/posts/:id`

Protected. Chủ bài đăng cập nhật nội dung.

#### DELETE `/api/posts/:id`

Protected. Chủ bài đăng xóa bài.

### 9.3 AI API

#### POST `/search/`

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
    ["person-id-2", 0.73]
  ],
  "message": "Tìm kiếm thành công!"
}
```

#### POST `/embedding/`

Request:

```json
{
  "name": "Trần Văn A",
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
  "name": "Trần Văn A",
  "message": "Tạo hồ sơ thành công, embedding sẽ xử lý background."
}
```

#### PATCH `/embedding/{person_id}`

Cập nhật thông tin person trong AI database.

## 10. Frontend Requirements

- FE-01: Giao diện phải responsive trên desktop, tablet và mobile.
- FE-02: Trang chủ phải giới thiệu mục tiêu Beacons, bài đăng gần đây, cách hoạt động và tổ chức hỗ trợ.
- FE-03: Trang đăng nhập phải validate input rỗng và hiển thị lỗi từ API.
- FE-04: Trang tạo hồ sơ phải có preview ảnh trước khi submit.
- FE-05: Trang tạo hồ sơ phải chặn ảnh lớn hơn 5MB.
- FE-06: Form tạo hồ sơ phải hiển thị loading khi đang gửi.
- FE-07: Nếu API trả `similarPersons`, frontend phải mở modal xác nhận.
- FE-08: Modal gợi ý phải cho xem chi tiết người tương đồng trước khi xác nhận.
- FE-09: Người dùng phải có lựa chọn "không có ai trùng khớp".
- FE-10: Trang danh sách phải có loading, empty state, error state và retry.
- FE-11: Frontend không được hardcode API URL trong production; cần dùng environment variable.
- FE-12: Token không nên lưu ở localStorage trong production nếu có thể chuyển sang HTTP-only cookie flow.

## 11. Security Requirements

- SEC-01: Password phải được hash bằng bcrypt hoặc thuật toán tương đương.
- SEC-02: API protected phải xác thực JWT.
- SEC-03: Refresh token phải dùng HTTP-only, Secure, SameSite cookie trong production.
- SEC-04: Backend phải bật Helmet và cấu hình CORS theo domain frontend.
- SEC-05: Phải giới hạn kích thước file upload và loại MIME hợp lệ.
- SEC-06: Không log access token, refresh token, password hoặc ảnh base64 trong production.
- SEC-07: Cần rate limit cho login, register, create post và AI search.
- SEC-08: Dữ liệu sinh trắc học như face embedding phải được xem là dữ liệu nhạy cảm.
- SEC-09: Chỉ service nội bộ được gọi trực tiếp AI Service; không expose AI Service công khai nếu không cần.
- SEC-10: Cần cơ chế xóa dữ liệu theo yêu cầu người dùng.
- SEC-11: Cần audit log cho các hành động sửa/xóa/xác nhận/ẩn bài trong bản production.
- SEC-12: Cần chống upload file độc hại bằng MIME validation, extension validation và image decoding.

## 12. Privacy & Compliance

- Người dùng phải được thông báo rằng ảnh khuôn mặt sẽ được xử lý để tạo embedding.
- Hệ thống phải giải thích AI chỉ hỗ trợ gợi ý, không phải xác minh danh tính tuyệt đối.
- Cần chính sách lưu trữ ảnh, embedding và thông tin cá nhân.
- Cần cơ chế yêu cầu xóa bài/ảnh/embedding.
- Với người chưa thành niên hoặc dữ liệu nhạy cảm, cần quy trình đồng ý và kiểm duyệt chặt hơn.
- Không nên công khai số điện thoại/email của người đăng nếu chưa có cơ chế bảo vệ liên hệ.

## 13. Performance Requirements

- API danh sách bài đăng: thời gian phản hồi mục tiêu dưới 500ms với dữ liệu đã index tốt.
- API tạo bài đăng: thời gian phản hồi mục tiêu dưới 3-5 giây, không tính upload background.
- AI search: mục tiêu dưới 2 giây cho index nhỏ/trung bình, cần benchmark khi dữ liệu tăng.
- Upload ảnh phải chạy background để tránh block request.
- FAISS index phải được load sẵn khi AI Service khởi động.
- Cần index DB cho `authorId`, `personId`, `createdAt`, `status`.
- Ảnh hiển thị frontend cần dùng kích thước tối ưu và CDN.

## 14. Deployment Requirements

- Hệ thống triển khai bằng Docker Compose trong MVP.
- Các service chính:
  - `frontend`: Next.js app.
  - `backend`: Express API.
  - `ai`: FastAPI AI Service.
  - `redis`: queue cho BullMQ.
  - `postgres`: production cần khai báo rõ trong compose hoặc dùng managed database.
  - `cloudinary`: external image storage.
- Biến môi trường phải tách riêng theo môi trường dev/staging/production.
- Không commit `.env`, secret key hoặc credential.
- Backend port hiện tại: `3001`.
- AI Service port hiện tại: `8000`.
- Redis port hiện tại: `6379`.
- Production cần reverse proxy như Nginx/Caddy và HTTPS.

## 15. Architecture

### 15.1 High-Level Architecture

```text
Browser
  |
  | HTTPS
  v
Next.js Frontend
  |
  | REST API
  v
Express Backend ---- Redis/BullMQ ---- Image Upload Worker ---- Cloudinary
  |
  | Internal HTTP
  v
FastAPI AI Service ---- PostgreSQL + pgvector
  |
  v
FAISS index
```

### 15.2 Backend Responsibilities

- Xác thực và phân quyền.
- Validate request.
- Quản lý bài đăng và user.
- Điều phối AI search/embedding.
- Quản lý queue upload ảnh.
- Chuẩn hóa response và error.

### 15.3 AI Service Responsibilities

- Decode/validate ảnh.
- Detect face.
- Generate face embedding.
- Search FAISS.
- Lưu person, face record và mapping FAISS.
- Cập nhật FAISS index khi có embedding mới.

### 15.4 Frontend Responsibilities

- Hiển thị trải nghiệm người dùng.
- Validate form cơ bản.
- Upload ảnh.
- Hiển thị kết quả AI gợi ý.
- Gọi API và xử lý trạng thái loading/error/success.

## 16. Error Handling

- Lỗi validation phải trả status 400 với message rõ ràng.
- Lỗi authentication phải trả 401.
- Lỗi không đủ quyền phải trả 403.
- Không tìm thấy resource phải trả 404.
- Lỗi AI Service không khả dụng phải trả 502 hoặc 500 kèm message thân thiện.
- Frontend phải hiển thị lỗi có thể hành động được, ví dụ "Vui lòng thử ảnh rõ mặt hơn".

## 17. Monitoring & Logging

- Log request ID cho mỗi request.
- Log thời gian xử lý AI search.
- Log trạng thái queue upload ảnh.
- Theo dõi tỷ lệ lỗi detect face, lỗi upload, lỗi AI timeout.
- Theo dõi số lượng bài `PENDING` chưa xác nhận.
- Production cần metrics: CPU, RAM, GPU nếu có, Redis queue length, DB connection count.

## 18. Testing Requirements

- Unit test validation DTO.
- Unit test auth service: register/login/hash/password mismatch.
- Unit test post service: create/update/delete/confirm permission.
- Integration test API `/api/posts`.
- Integration test AI `/search` với ảnh hợp lệ và ảnh không có khuôn mặt.
- E2E test flow: login -> create post -> similar modal -> confirm.
- Load test AI search khi số lượng embedding tăng.
- Security test upload file sai MIME, file quá lớn, token thiếu/sai hạn.

## 19. Acceptance Criteria

- User có thể đăng nhập và tạo bài đăng có ảnh thành công.
- Bài đăng mới được lưu vào database backend.
- Ảnh được upload lên Cloudinary và cập nhật `image_url`.
- AI Service có thể tìm kiếm khuôn mặt tương đồng và trả danh sách `personId + score`.
- Nếu AI trả kết quả nghi ngờ, frontend hiển thị modal xác nhận.
- User xác nhận xong thì bài đăng chuyển sang `CONFIRMED`.
- Guest xem được danh sách bài đăng mà không cần login.
- User không thể sửa/xóa bài của người khác.
- Hệ thống trả lỗi rõ khi ảnh không hợp lệ hoặc không có khuôn mặt.

## 20. Open Issues & Recommendations

- Cần bổ sung route frontend đăng ký nếu sản phẩm yêu cầu self-service onboarding.
- Cần chuẩn hóa encoding tiếng Việt trong code/comment hiện có để tránh lỗi hiển thị.
- Cần đưa API URL sang `.env` thay vì hardcode `localhost`.
- Cần thêm PostgreSQL service vào Docker Compose hoặc tài liệu rõ DB external.
- Cần cơ chế rebuild/load lại FAISS index khi service restart hoặc dữ liệu lệch.
- Cần đảm bảo background task tạo embedding hoàn tất trước khi search phụ thuộc dữ liệu mới.
- Cần bổ sung admin/moderator nếu triển khai thật.
- Cần chính sách privacy rõ vì hệ thống xử lý dữ liệu sinh trắc học.
