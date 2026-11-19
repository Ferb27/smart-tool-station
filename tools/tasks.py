from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule

import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "PhanCongNhiemVu.xlsx")

ROLES = [
    ("TV1", "Nhóm trưởng – tích hợp hệ thống, MQTT, báo cáo"),
    ("TV2", "Node A (kiosk + khay trả): mạch + firmware ESP32-A"),
    ("TV3", "Node B (tủ 2 ngăn): mạch + firmware ESP32-B + cơ khí"),
    ("TV4", "Edge AI: camera, dữ liệu ảnh, mô hình, suy luận trên Pi 4"),
    ("TV5", "Backend, CSDL, web, thông báo trên Pi 4"),
]

# (mã, tuần, người, việc, phụ thuộc, tiêu chí xong)
T = [
 # ---- Tuần 1: chuẩn bị
 ("T01", 1, "TV1", "Viết đặc tả MQTT: danh sách topic, chiều, QoS/retain, mẫu JSON (theo Bảng 9)", "", "File docs/mqtt_spec.md, cả nhóm đã đọc và đồng ý"),
 ("T02", 1, "TV1", "Tạo repo GitHub: firmware/nodeA, firmware/nodeB, pi/backend, pi/ai, hardware/kicad, docs; README khung", "", "Mọi thành viên push được"),
 ("T03", 1, "TV1", "Đặt mua linh kiện theo DanhSachLinhKien.xlsx NGAY NGÀY ĐẦU (giao 3–7 ngày); kiểm đếm khi nhận hàng", "", "Đủ hàng, ghi lại món thiếu/lỗi"),
 ("T04", 1, "TV5", "Cài Raspberry Pi OS 64-bit, SSH; cho Pi phát Wi-Fi riêng (hostapd + dnsmasq, IP 192.168.4.1), ra Internet qua điện thoại chia sẻ mạng USB; cài Mosquitto (user/password, systemd)", "", "Laptop vào Wi-Fi của Pi, mosquitto_pub/sub chạy được; Pi ping được Internet"),
 ("T05", 1, "TV5", "Thiết kế CSDL SQLite: users, tools, slots, transactions, processed_events", "T01", "File docs/db_schema.md + script tạo bảng"),
 ("T06", 1, "TV2", "Vẽ sơ đồ nguyên lý Node A trên KiCad (theo Bảng 5)", "", "File KiCad + PDF, TV1 duyệt"),
 ("T07", 1, "TV3", "Vẽ sơ đồ nguyên lý Node B trên KiCad (theo Bảng 6)", "", "File KiCad + PDF, TV1 duyệt"),
 ("T08", 1, "TV3", "Thiết kế cơ khí: quầy trả + tủ 2 ngăn ghép thành một khối (khay sát mặt trước tủ); 2 ngăn có nắp, vị trí load cell, chốt servo; tay đỡ bắt vào thân tủ mang Pi + camera + đèn, camera chĩa thẳng xuống khay", "", "Bản vẽ có kích thước, ghi độ cao camera so với khay"),
 ("T09", 1, "TV4", "Chuẩn bị 4 dụng cụ nguội (kìm cắt, kìm tuốt dây, bộ tua vít 6 cây trong hộp, nhíp); cân khối lượng chuẩn từng món và phụ kiện nhẹ nhất trên cân tiểu ly lab; tính dung sai từng món = min(10 g, ½ phụ kiện nhẹ nhất); xếp 2 món/ngăn chênh nhau ≥ 20 g", "", "Bảng khối lượng chuẩn + dung sai gửi TV5 nhập CSDL"),
 ("T10", 1, "TV4", "Cài tflite-runtime + Picamera2 trên Pi 4; chạy thử một mô hình mẫu, đo thời gian suy luận", "T04", "Ghi lại thời gian suy luận mẫu"),
 # ---- Tuần 2: phần cứng
 ("T11", 2, "TV2", "Bố trí mạch Node A trên lưới 2,54 mm (KiCad PCB editor), chạy DRC, in bản lật gương", "T06", "Bản in bố trí mạch"),
 ("T12", 2, "TV3", "Bố trí mạch Node B trên lưới 2,54 mm, chạy DRC, in bản lật gương", "T07", "Bản in bố trí mạch"),
 ("T13", 2, "TV1", "Thử thẻ sinh viên với RC522; nếu không đọc được báo nhóm đổi RDM6300", "T03", "Kết luận loại đầu đọc"),
 ("T14", 2, "TV2", "Hàn mạch Node A; đo thông mạch 5 V/3,3 V/GND trước khi cắm module", "T11, T03", "Không chập nguồn, ESP32 nạp code được"),
 ("T15", 2, "TV3", "Hàn mạch Node B; đo thông mạch trước khi cắm module", "T12, T03", "Không chập nguồn, ESP32 nạp code được"),
 ("T16", 2, "TV2", "Firmware A: đọc UID RC522 (SPI), chống lặp 2 s, in ra Serial", "T14", "Quẹt thẻ hiện UID ổn định"),
 ("T17", 2, "TV2", "Firmware A: LCD 1602 qua I2C (qua BSS138), còi, đèn khay qua MOSFET, nút báo hỏng GPIO 33 (ngắt + chống dội 50 ms)", "T14", "Hiện chữ, còi kêu, đèn bật/tắt theo lệnh Serial"),
 ("T18", 2, "TV3", "Gia công: khay trả, 2 ngăn có nắp, lắp load cell giữa 2 tấm đế (long đen đệm + ốc chặn quá tải cách 1 mm), chốt servo, tay đỡ camera + Pi, gắn nút báo hỏng trên quầy", "T08, T03", "Mô hình lắp ráp xong"),
 ("T19", 2, "TV4", "Gắn camera + đèn lên giá, cố định nền khay; viết script chụp ảnh hàng loạt để lấy dữ liệu", "T10, T18", "Script chụp lưu ảnh theo tên lớp"),
 ("T20", 2, "TV5", "Backend khung: FastAPI + paho-mqtt subscribe lab/#, ghi mọi bản tin vào bảng log", "T04, T05", "Gửi tin bằng mosquitto_pub thấy xuất hiện trong SQLite"),
 # ---- Tuần 3: firmware + AI + backend
 ("T21", 3, "TV2", "Firmware A: HX711 khay – hiệu chuẩn (lưu hệ số vào NVS), lọc trung vị 5 mẫu + trung bình trượt, phát hiện ổn định", "T14", "Sai số ≤ ±2 g với vật mẫu"),
 ("T22", 3, "TV3", "Firmware B: đọc 2 HX711, hiệu chuẩn, deadband 1 g; bù trôi điểm 0 theo tổng khối lượng chuẩn của đồ trong ngăn khi ngăn khóa và không có giao dịch", "T15, T18", "Sai số ≤ ±2 g mỗi ngăn"),
 ("T23", 3, "TV3", "Firmware B: servo LEDC 50 Hz mở/khóa từng ngăn (không mở 2 servo cùng lúc), LED đỏ/xanh", "T15, T18", "Mở/khóa đúng ngăn theo lệnh Serial"),
 ("T24", 3, "TV4", "Thu thập ảnh: ≥ 150 ảnh/lớp × 5 lớp (4 dụng cụ + “khay trống / vật lạ” gồm khay trống, điện thoại, ví, chìa khóa…), đổi vị trí/góc đặt; gán nhãn; chia train/val/test", "T19", "Bộ dữ liệu trên Drive/repo"),
 ("T25", 3, "TV4", "Huấn luyện mô hình (Colab), xuất TFLite FP32 và INT8, đo accuracy trên tập test", "T24", "Accuracy ≥ 90 % trên tập test"),
 ("T26", 3, "TV5", "Luật nghiệp vụ: quẹt thẻ → kiểm tra quyền; mượn (unlock → chờ khối lượng giảm, quá 30 s thì hủy); loại trùng eid/cid; báo hỏng → dụng cụ “chờ kiểm tra”, không cho mượn, Telegram cho quản lý", "T20", "Chạy đúng khi giả lập node bằng mosquitto_pub"),
 ("T27", 3, "TV5", "Web sinh viên + web quản lý (tồn kho, lịch sử), WebSocket đẩy trạng thái", "T20", "Trạng thái ngăn đổi trên web không cần F5"),
 # ---- Tuần 4: kết nối mạng + ghép
 ("T28", 4, "TV2", "Firmware A: Wi-Fi + esp-mqtt (QoS 1, LWT, keepalive 30 s, eid lưu NVS); publish card/tray; nhận cmd LCD/đèn/còi", "T01, T16, T17, T21", "Bản tin đúng đặc tả T01"),
 ("T29", 4, "TV3", "Firmware B: khởi động thì khóa 2 servo + LED đỏ trước khi vào Wi-Fi; Wi-Fi + MQTT; nhận cmd unlock/lock, gửi ack, publish lại slot state thật (retained) sau mỗi lần kết nối", "T01, T22, T23", "Bản tin đúng đặc tả T01"),
 ("T30", 4, "TV4", "Dịch vụ AI trên Pi: nhận yêu cầu từ backend, bật đèn, chụp, suy luận INT8, trả {lớp, độ tin cậy}, lưu JPEG kèm eid", "T25, T20", "Một lần trả ≤ 0,5 s suy luận"),
 ("T31", 4, "TV5", "Luồng trả: kết hợp khối lượng khay + kết quả AI (từ chối lớp vật lạ) + khối lượng chuẩn theo dung sai từng món → mở ngăn; đánh dấu thiếu phụ kiện", "T26, T30", "Trả đúng mở ngăn, trả sai bị từ chối"),
 ("T32", 4, "TV5", "Telegram bot nhắc quá hạn (quét 5 phút, tối đa 1 lần/ngày) + email báo cáo cuối buổi", "T26", "Nhận được tin nhắn/email thật"),
 ("T33", 4, "TV1", "Ghép đầu – cuối trên phần cứng thật: quẹt thẻ → mượn → trả; ghi lỗi và giao lại cho người phụ trách", "T28, T29, T31", "Chạy trọn 10 lượt mượn – trả liên tiếp"),
 ("T34", 4, "TV2", "OTA firmware cho 2 node (tải bản mới từ Pi qua HTTP)", "T28", "Cập nhật được không cần cắm cáp"),
 # ---- Tuần 5: kiểm thử (Bảng 11, 12)
 ("T35", 5, "TV2", "Kiểm thử cân khay: vật mẫu 10/50/100/500 g, mỗi mức 20 lần, tính sai số", "T21", "Bảng số liệu + sai số"),
 ("T36", 5, "TV3", "Kiểm thử cân 2 ngăn như T35", "T22", "Bảng số liệu + sai số"),
 ("T37", 5, "TV4", "Đánh giá AI: ma trận nhầm lẫn; đo 100 lần suy luận; so FP32 vs INT8 (kích thước, thời gian, accuracy, RAM)", "T30", "Bảng so sánh cho báo cáo"),
 ("T38", 5, "TV5", "Đo độ trễ đầu – cuối: gắn mốc thời gian từng bước theo Bảng 10", "T33", "Bảng độ trễ thực đo"),
 ("T39", 5, "TV1", "Kiểm thử lỗi: ngắt Wi-Fi node, khởi động lại Pi, ngắt nguồn ESP32-B khi ngăn đang mở, gửi lặp eid; trả nhầm món, bộ tua vít thiếu 1 cây, đặt vật lạ, báo hỏng", "T33", "Không mở sai, không ghi trùng"),
 ("T40", 5, "TV4", "Đo công suất từng khối bằng đồng hồ USB (Bảng 12)", "T33", "Bảng công suất thực đo"),
 ("T41", 5, "TV1", "Đo bộ nhớ ESP32: heap còn trống, kích thước firmware cả 2 node", "T28, T29", "Số liệu RAM/flash"),
 # ---- Tuần 6: hoàn thiện
 ("T42", 6, "TV1", "Viết báo cáo cuối: thay số mục tiêu bằng số đo thật, cập nhật sơ đồ", "T35–T41", "Báo cáo hoàn chỉnh"),
 ("T43", 6, "TV2", "Xuất PDF sơ đồ nguyên lý + ảnh bố trí mạch, chụp 2 mặt mạch hàn Node A (TV3 làm cho Node B)", "T14, T15", "Ảnh và PDF trong hardware/"),
 ("T44", 6, "TV4", "Quay và dựng video demo (quẹt thẻ, mượn, trả đúng, trả sai, web, Telegram)", "T33", "Video 3–5 phút"),
 ("T45", 6, "TV5", "Hoàn thiện README: sơ đồ kiến trúc, cách cài đặt và chạy, ảnh, link video", "T44", "Người ngoài đọc README chạy lại được"),
 ("T46", 6, "TV1", "Slide thuyết trình và tập dượt cả nhóm", "T42, T44", "Đã tập ít nhất 1 lần đủ giờ"),
]

wb = Workbook()
ws = wb.active
ws.title = "Nhiệm vụ"
F = "Times New Roman"
thin = Side(style="thin", color="999999")
bd = Border(left=thin, right=thin, top=thin, bottom=thin)
week_fill = {1: "EAF1FB", 2: "EAF6EC", 3: "FFF4E0", 4: "F3EAF7", 5: "FDECEA", 6: "EEEEEE"}

ws["A1"] = "PHÂN CÔNG NHIỆM VỤ – TRẠM MƯỢN TRẢ DỤNG CỤ THÔNG MINH (nhóm 5 người, 6 tuần)"
ws["A1"].font = Font(name=F, bold=True, size=14)
ws["A2"] = "Điền tên thật vào sheet “Thành viên”. Cột Trạng thái chọn từ danh sách; việc “Xong” tự gạch. Lọc theo cột Người phụ trách để giao việc."
ws["A2"].font = Font(name=F, italic=True, size=10, color="555555")

hdr = ["Mã", "Tuần", "Người phụ trách", "Tên thành viên", "Công việc", "Phụ thuộc (làm sau)", "Tiêu chí xong", "Trạng thái", "Ghi chú"]
for c, h in enumerate(hdr, 1):
    x = ws.cell(4, c, h)
    x.font = Font(name=F, bold=True)
    x.fill = PatternFill("solid", fgColor="D9D9D9")
    x.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    x.border = bd
r = 4
for code, wk, who, task, dep, done in T:
    r += 1
    vals = [code, wk, who, f"=IF(VLOOKUP(C{r},'Thành viên'!$A$3:$C$7,3,FALSE)=\"\",\"\",VLOOKUP(C{r},'Thành viên'!$A$3:$C$7,3,FALSE))", task, dep, done, "Chưa làm", ""]
    for c, v in enumerate(vals, 1):
        x = ws.cell(r, c, v)
        x.font = Font(name=F, size=11)
        x.border = bd
        x.fill = PatternFill("solid", fgColor=week_fill[wk])
        x.alignment = Alignment(vertical="center", wrap_text=c in (4, 5, 6, 7, 9),
                                horizontal="center" if c in (1, 2, 3, 8) else None)
last = r
dv = DataValidation(type="list", formula1='"Chưa làm,Đang làm,Xong,Bị chặn"', allow_blank=False)
ws.add_data_validation(dv)
dv.add(f"H5:H{last}")
ws.conditional_formatting.add(f"A5:I{last}", FormulaRule(formula=['$H5="Xong"'], font=Font(color="808080", strike=True)))
ws.conditional_formatting.add(f"H5:H{last}", FormulaRule(formula=['$H5="Bị chặn"'], fill=PatternFill("solid", fgColor="F4B6B6")))
ws.conditional_formatting.add(f"H5:H{last}", FormulaRule(formula=['$H5="Đang làm"'], fill=PatternFill("solid", fgColor="FFE699")))
for col, w in zip("ABCDEFGHI", [6, 6, 10, 16, 62, 16, 36, 11, 20]):
    ws.column_dimensions[col].width = w
ws.freeze_panes = "A5"
ws.auto_filter.ref = f"A4:I{last}"
ws.page_setup.orientation = "landscape"
ws.sheet_properties.pageSetUpPr.fitToPage = True
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 0

m = wb.create_sheet("Thành viên")
m["A1"] = "Vai trò và tiến độ"
m["A1"].font = Font(name=F, bold=True, size=13)
for c, h in enumerate(["Mã", "Mảng phụ trách", "Tên thành viên (điền)", "Số việc", "Đã xong", "Tiến độ"], 1):
    x = m.cell(2, c, h)
    x.font = Font(name=F, bold=True)
    x.fill = PatternFill("solid", fgColor="D9D9D9")
    x.border = bd
for i, (code, role) in enumerate(ROLES):
    rr = 3 + i
    vals = [code, role, "", f"=COUNTIF('Nhiệm vụ'!$C$5:$C${last},A{rr})",
            f"=COUNTIFS('Nhiệm vụ'!$C$5:$C${last},A{rr},'Nhiệm vụ'!$H$5:$H${last},\"Xong\")",
            f"=IF(D{rr}=0,0,E{rr}/D{rr})"]
    for c, v in enumerate(vals, 1):
        x = m.cell(rr, c, v)
        x.font = Font(name=F, size=11)
        x.border = bd
    m.cell(rr, 3).fill = PatternFill("solid", fgColor="FFF2CC")
    m.cell(rr, 6).number_format = "0%"
for col, w in zip("ABCDEF", [6, 58, 24, 9, 9, 9]):
    m.column_dimensions[col].width = w
wb.save(OUT)

from collections import Counter
print("tasks", len(T), Counter(t[2] for t in T))
