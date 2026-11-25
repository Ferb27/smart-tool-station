# Giao diện web mẫu (Smart Tool Station)

Thư mục này chứa bản giao diện web tĩnh (HTML + CSS + JavaScript thuần), dùng dữ liệu giả lập để minh họa giao diện cho sinh viên và người quản lý.

## Cách mở

- Không cần cài đặt npm hay chạy server build.
- Mở trực tiếp file `index.html` bằng trình duyệt web (Chrome, Edge, Firefox).
- Lưu ý: trang `manager.html` tải thư viện Chart.js (`4.4.1`) qua CDN nên cần có kết nối Internet để hiển thị biểu đồ.

## Cấu trúc file

- `index.html`: trang chọn vai trò (Sinh viên / Quản lý).
- `student.html`: giao diện sinh viên (thẻ thông tin, dụng cụ đang mượn có đếm ngược/cảnh báo quá hạn, danh sách 4 dụng cụ, khối mượn Pin 18650 theo số lượng 1–4, lịch sử mượn trả).
- `manager.html`: bảng điều khiển quản lý chia thành 4 tab trên URL hash (`Tổng quan`, `Cảm biến`, `Giao dịch`, `Kho`): chỉ số nhanh (4 dụng cụ + tồn kho Pin 18650), cảnh báo kèm nút "Đã kiểm tra" và cảnh báo pin sắp hết, biểu đồ khối lượng, nhiệt độ – độ ẩm DHT22 (ngưỡng 70 %RH) và số pin trong hộc (stepped), giao dịch gần đây và sơ đồ tủ 2 ngăn + hộc pin.
- `style.css`: bộ định dạng chung theo phong cách "Giấy kỹ thuật / Bàn đo" (IBM Plex Sans + IBM Plex Mono, viền 1px, không bóng đổ).
- `data.js`: dữ liệu mẫu (sinh viên, 4 dụng cụ, Pin 18650, giao dịch, cảnh báo).
- `app.js`: mã xử lý hiển thị, bộ đếm ngược, nút xác nhận kiểm tra và giả lập cập nhật biểu đồ bằng `setInterval`.

## Ghi chú tích hợp sau này

Đây là bản giao diện mẫu chạy bằng dữ liệu giả trong `data.js`. Khi triển khai trên Raspberry Pi 4, phần dữ liệu và cập nhật thời gian thực sẽ được nối với API HTTP và WebSocket của backend FastAPI (`pi/backend`).
