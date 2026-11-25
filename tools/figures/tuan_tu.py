# Hình 3: sơ đồ tuần tự luồng trả dụng cụ. Chạy: python tuan_tu.py
from svgkit import Fig, GREY, LIGHT

lanes = [("RC522 +", "HX711 khay"), ("ESP32-A", ""), ("Mosquitto", "(Pi 4)"), ("Backend", "(Pi 4)"),
         ("Dịch vụ AI", "(Pi 4)"), ("ESP32-B", ""), ("HX711 ngăn", "+ servo"), ("Web", "(trình duyệt)")]
# (từ, đến, nhãn, phản hồi?)
msgs = [(0, 1, "(1) UID thẻ — SPI, ISO/IEC 14443A", False),
        (1, 2, "(2) PUBLISH kioskA/card · QoS 1", False),
        (2, 3, "(3) chuyển tin; tra SQLite", False),
        (3, 1, "(4) PUBLISH kioskA/cmd — hiện LCD", True),
        (0, 1, "(5) khay: khối lượng ổn định", False),
        (1, 3, "(6) PUBLISH kioskA/tray {m}", False),
        (3, 4, "(7) chụp ảnh CSI-2; suy luận INT8", False),
        (4, 3, "(8) {lớp, độ tin cậy}", True),
        (3, 5, "(9) đạt điều kiện → cmd unlock k", False),
        (5, 6, "(10) PWM mở servo; GPIO bật LED xanh", False),
        (5, 3, "(11) PUBLISH ack", True),
        (6, 5, "(12) khối lượng ngăn tăng, ổn định", True),
        (5, 3, "(13) PUBLISH slot/k/state (retained)", False),
        (3, 5, "(14) đóng giao dịch → cmd lock k", True),
        (3, 7, "(15) WebSocket: cập nhật trạng thái", False)]

W = 1200
STEP = 44
TOP = 98
H = TOP + STEP * len(msgs) + 70
f = Fig("seq_tra", W, H)
X0, DX = 90, 145
LX = [X0 + i * DX for i in range(len(lanes))]
BOX_W = 124

for x, (a, b) in zip(LX, lanes):
    f.rect(x - BOX_W / 2, 18, BOX_W, 62, fill=GREY if x in (LX[0], LX[1], LX[5], LX[6]) else "#FFFFFF", sw=1.8)
    if b:
        f.text(x, 44, a, 19, "middle", bold=True)
        f.text(x, 68, b, 17, "middle")
    else:
        f.text(x, 56, a, 20, "middle", bold=True)
    f.line(x, 80, x, H - 40, sw=1.1, dash="5 5")

for i, (a, b, label, resp) in enumerate(msgs):
    y = TOP + 28 + i * STEP
    x1, x2 = LX[a], LX[b]
    f.line(x1, y, x2, y, sw=2.0, dash="9 5" if resp else None, end=True)
    est = len(label) * 8.8
    if est > abs(x2 - x1) - 24:   # nhãn dài hơn khoảng giữa hai đường sống: đặt sát đầu mũi tên gần nhất bên trái
        f.text(min(x1, x2) + 12, y - 9, label, 18, "start", halo=True)
    else:
        f.text((x1 + x2) / 2, y - 9, label, 18, "middle", halo=True)

f.legend_h(40, H - 20, [("line", None, 2.0, "Yêu cầu / dữ liệu"), ("line", "9 5", 2.0, "Phản hồi"),
                        ("box", GREY, "Thiết bị ESP32 và cảm biến"), ("box", "#FFFFFF", "Dịch vụ trên Pi / trình duyệt")])
f.save()
