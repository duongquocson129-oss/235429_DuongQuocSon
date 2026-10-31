# Quản lý thiết bị phòng học

Ứng dụng CRUD quản lý thiết bị phòng học, gồm React frontend, Express API và MongoDB Atlas.

## Công nghệ

- Frontend: React, Vite, lucide-react
- Backend: Node.js, Express, Mongoose
- Cơ sở dữ liệu: MongoDB Atlas
- Đóng gói: Docker; triển khai: Render

## Cấu trúc

```text
.
├── backend/       # Express API, model, kiểm tra dữ liệu, seed và Dockerfile
├── frontend/      # React/Vite UI và Dockerfile
├── render.yaml    # Blueprint triển khai Render
└── README.md
```

## Chạy cục bộ

Yêu cầu Node.js 20 trở lên và MongoDB Atlas (hoặc MongoDB tương thích).

1. Tạo `backend/.env` từ `backend/.env.example`, điền URI Atlas và giữ file này riêng tư.
2. Cài đặt và khởi chạy API:

	 ```sh
	 cd backend
	 npm install
	 npm run seed       # thêm ba thiết bị mẫu; chạy khi cần
	 npm run dev
	 ```

	 API mặc định ở `http://localhost:5000`; health check: `/health`.
3. Trong terminal khác, tạo `frontend/.env` từ `frontend/.env.example`, sau đó:

	 ```sh
	 cd frontend
	 npm install
	 npm run dev
	 ```

	 Mở URL Vite hiển thị trong terminal. Frontend mặc định gọi `http://localhost:5000/api`.

## API

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/devices` | Danh sách; hỗ trợ `?search=...` |
| GET | `/api/devices/:id` | Chi tiết theo MongoDB id |
| POST | `/api/devices` | Tạo thiết bị |
| PUT | `/api/devices/:id` | Cập nhật thiết bị |
| DELETE | `/api/devices/:id` | Xóa thiết bị |
| GET | `/health` | Trạng thái API và kết nối database |

Các trạng thái: `Đang sử dụng`, `Hư hỏng`, `Đang sửa chữa`, `Ngừng sử dụng`.

## Frontend React

Giao diện cung cấp danh sách và tìm kiếm thiết bị, xem chi tiết, thêm, cập nhật và xóa thiết bị. Form hiển thị kiểm tra dữ liệu, trạng thái đang tải, lỗi và thông báo kết quả. Địa chỉ API có thể cấu hình qua `VITE_API_BASE_URL`.

## Docker

Backend (không nhúng thông tin xác thực vào image):

```sh
docker build -t duongquocson/backend:latest ./backend
docker push duongquocson/backend:latest
docker run --rm -p 5000:5000 \
	-e MONGODB_URI='mongodb+srv://<user>:<password>@<cluster>/' \
	-e MONGODB_DB='235429_DuongQuocSon' \
	-e FRONTEND_ORIGIN='http://localhost:8080' \
	duongquocson/backend:latest
```

Frontend được cấu hình địa chỉ API tại thời điểm build:

```sh
docker build --build-arg VITE_API_BASE_URL='https://api-235429.onrender.com/api' \
	-t duongquocson/frontend:latest ./frontend
docker push duongquocson/frontend:latest
docker run --rm -p 8080:80 duongquocson/frontend:latest
```

Hai image đã được publish công khai: `duongquocson/backend:latest` và `duongquocson/frontend:latest`. Đăng nhập Docker Hub bằng CLI trước khi push; không đưa token vào lệnh, file hay repository.

## MongoDB Atlas

Database Atlas `235429_DuongQuocSon` và collection `devices` đã được xác minh hoạt động. Hiện có 6 thiết bị mẫu: 3 bản ghi đã có sẵn và 3 bản ghi do `npm run seed` thêm (máy chiếu, máy tính, thiết bị âm thanh). Seed dùng upsert theo `deviceId` nên có thể chạy lại an toàn. Tạo database user riêng, giới hạn Network Access phù hợp, rồi đặt URI trong `backend/.env`; không commit `.env`.

## Render

`render.yaml` khai báo hai dịch vụ `api-235429` và `web-235429`. Tạo Blueprint từ repository, nhập `MONGODB_URI` dưới dạng secret khi Render yêu cầu. Sau khi triển khai, kiểm tra `/health` và CRUD trên URL được Render cấp.

- Frontend: URL Render sau khi triển khai, ví dụ `https://web-235429.onrender.com`
- Backend API: URL Render sau khi triển khai, ví dụ `https://api-235429.onrender.com`
- GitHub: `https://github.com/<github_username>/235429_DuongQuocSon`
- Docker Hub backend: `https://hub.docker.com/r/duongquocson/backend`
- Docker Hub frontend: `https://hub.docker.com/r/duongquocson/frontend`

Các URL ví dụ chỉ là dự kiến; thay bằng URL thực tế trên tài khoản của bạn trước khi nộp.

## Kiểm tra

```sh
cd backend && npm test
cd ../frontend && npm run build
```

## Thông tin nộp bài

| Hạng mục | Giá trị |
|---|---|
| MSSV & họ tên | `235429_DuongQuocSon` |
| GitHub repository | `235429_DuongQuocSon` |
| MongoDB database / collection | `235429_DuongQuocSon` / `devices` |
| Docker Hub backend image | `duongquocson/backend:latest` |
| Docker Hub frontend image | `duongquocson/frontend:latest` |
| Render services | `api-235429`, `web-235429` |
| URL frontend / backend | Điền URL thực tế sau triển khai |

## Lịch sử commit theo câu

Khi hoàn tất từng câu, dùng đúng nội dung sau làm commit message rồi push:

1. `Câu 1. Tạo repository và quản lý mã nguồn bằng GitHub`
2. `Câu 2. Tạo cơ sở dữ liệu MongoDB Atlas`
3. `Câu 3. Xây dựng backend API`
4. `Câu 4. Xây dựng frontend bằng React`
5. `Câu 5. Đóng gói backend bằng Docker và đẩy lên Docker Hub`
6. `Câu 6. Đóng gói frontend bằng Docker và đẩy lên Docker Hub`
7. `Câu 7. Triển khai frontend trên Render`
8. `Câu 8. Triển khai backend API trên Render`
9. `Câu 9. Kiểm tra tổng thể và hoàn thiện bài nộp`

Không commit mật khẩu, token, `.env` hoặc URI có credential.