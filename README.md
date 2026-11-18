# Smart Tool Station – Trạm mượn trả dụng cụ thông minh ứng dụng Edge AI

Đồ án môn **Kiến trúc và giao thức IoT** (lý thuyết + thực tập).

Trạm cho phòng thực hành điện tử. Sinh viên quẹt thẻ để mượn dụng cụ (VOM, mỏ hàn, kìm, nhíp). Khi trả, hệ thống kiểm tra cùng lúc hai điều kiện:

- **đúng loại dụng cụ**: camera và mô hình AI chạy ngay trên Raspberry Pi 4;
- **đủ phụ kiện**: cân bằng load cell.

Đạt cả hai thì ngăn tủ tự mở để cất dụng cụ vào.

![Kiến trúc hệ thống](docs/images/kientruc2.png)

## Thành phần

| Khối | Phần cứng | Vai trò |
|---|---|---|
| Gateway / Edge AI | Raspberry Pi 4 (4 GB) + camera OV5647 | Mosquitto (MQTT broker), backend FastAPI + SQLite, suy luận TFLite INT8, web, Telegram/Email |
| Node A – kiosk + khay trả | ESP32 + RC522 + LCD 16×2 I2C + load cell/HX711 + còi + đèn khay | Định danh thẻ, cân dụng cụ trả, hiển thị |
| Node B – tủ 2 ngăn | ESP32 + 2 load cell/HX711 + 2 servo SG90 + LED đỏ/xanh | Cân từng ngăn, khóa/mở ngăn |

Node và gateway giao tiếp qua Wi-Fi bằng MQTT 3.1.1 (QoS 1, retained, Last Will). Đặc tả bản tin: [docs/mqtt_spec.md](docs/mqtt_spec.md).

## Cấu trúc thư mục

```
docs/            Báo cáo ý tưởng (docx/pdf), danh sách linh kiện, phân công, sơ đồ
firmware/node_a  Firmware ESP32 Node A (kiosk + khay trả)
firmware/node_b  Firmware ESP32 Node B (tủ 2 ngăn)
pi/backend       Mosquitto config, backend FastAPI, CSDL SQLite, web
pi/ai            Thu thập ảnh, huấn luyện, mô hình TFLite, dịch vụ suy luận
hardware/kicad   Sơ đồ nguyên lý và bố trí mạch (hàn trên PCB đục lỗ)
tools/           Script sinh lại báo cáo, sơ đồ khối, file Excel
```

## Tài liệu

- [Báo cáo ý tưởng (PDF)](docs/BaoCaoYTuong.pdf)
- [Danh sách linh kiện và chi phí](docs/DanhSachLinhKien.xlsx): nhập số lượng đã có, file tự tính tiền cần mua
- [Phân công nhiệm vụ](docs/PhanCongNhiemVu.xlsx): 46 việc cho 5 thành viên trong 6 tuần, có cột trạng thái

## Phân công

| Thành viên | Mảng |
|---|---|
| TV1 (nhóm trưởng) | Tích hợp hệ thống, đặc tả MQTT, kiểm thử, báo cáo |
| TV2 | Node A: KiCad, hàn mạch, firmware ESP32-A, OTA |
| TV3 | Node B: KiCad, hàn mạch, firmware ESP32-B, cơ khí |
| TV4 | Edge AI: camera, dữ liệu ảnh, mô hình, suy luận trên Pi |
| TV5 | Backend, CSDL, web, Telegram/Email |

## Sinh lại tài liệu

Báo cáo, sơ đồ và file Excel đều được sinh từ script trong `tools/`. Muốn sửa linh kiện thì sửa `tools/parts.json`, muốn sửa nội dung báo cáo thì sửa `tools/build_report.js`.

```bash
cd tools
npm install                  # thư viện docx cho Node.js
pip install matplotlib openpyxl pillow
python diagram2.py && python diagram3.py && python seq.py   # sơ đồ -> docs/images
python xlsx_parts.py         # docs/DanhSachLinhKien.xlsx
python tasks.py              # docs/PhanCongNhiemVu.xlsx (ghi đè trạng thái)
node build_report.js         # docs/BaoCaoYTuong.docx
```

File PDF được xuất bằng Word (File → Save As → PDF).

## Tiến độ

- [x] Báo cáo ý tưởng, danh sách linh kiện, phân công
- [ ] Tuần 1: đặc tả MQTT, cài Pi, sơ đồ nguyên lý KiCad, mua linh kiện
- [ ] Tuần 2: hàn mạch, firmware cơ bản, cơ khí
- [ ] Tuần 3: cân, servo, dữ liệu ảnh, huấn luyện, backend
- [ ] Tuần 4: MQTT trên node, dịch vụ AI, ghép đầu – cuối
- [ ] Tuần 5: kiểm thử và đo đạc
- [ ] Tuần 6: báo cáo cuối, video demo
