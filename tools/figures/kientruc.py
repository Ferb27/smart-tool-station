# Hình 1: kiến trúc hệ thống ba tầng. Chạy: python kientruc.py
from svgkit import Fig, GREY, DASH_WIFI, DASH_4G

f = Fig("kientruc2", 1200, 790)

# ---- ba dải tầng (nền rất nhạt, nhãn xoay dọc bên trái) ----
bands = [(20, 182, "TẦNG ỨNG DỤNG"), (202, 244, "TẦNG BIÊN (EDGE)"), (446, 270, "TẦNG THIẾT BỊ")]
for y, h, label in bands:
    f.rect(70, y, 1110, h, fill="#FAFAFA", sw=1.0, rx=2)
    f.text(44, y + h / 2, label, 19, "middle", bold=True, rot=-90)

# ---- tầng ứng dụng ----
apps = [(100, "Web sinh viên", "Mượn, hạn trả, báo hỏng", "trên điện thoại"),
        (470, "Web quản lý", "Dashboard, tồn kho,", "cảnh báo, đăng ký thẻ"),
        (840, "Thông báo", "Telegram · Email", "(nhắc quá hạn, sự cố)")]
for x, t, a, b in apps:
    f.rect(x, 46, 320, 112, fill=GREY)
    f.lines(x + 160, 80, [(t, 23, True, False), (a, 20, False, False), (b, 20, False, False)], step=27)

# ---- tầng biên: Raspberry Pi ----
f.rect(100, 232, 1060, 192, fill="#FFFFFF", sw=2.4, rx=3)
f.text(630, 264, "Raspberry Pi 4 (4 GB) — gateway và Edge AI", 23, "middle", bold=True)
f.line(100, 276, 1160, 276, sw=1.2)
mods = [("Mosquitto", "Broker MQTT 3.1.1"), ("FastAPI + SQLite", "REST · WebSocket"),
        ("Luật nghiệp vụ", "mượn/trả · hạn mức"), ("Dịch vụ AI", "TFLite INT8 · 6 lớp")]
MX = [120, 382, 644, 906]
for x, (t, s) in zip(MX, mods):
    f.rect(x, 302, 232, 96)
    f.lines(x + 116, 337, [(t, 21, True, False), (s, 19, False, False)], step=28)
for x in MX[:3]:
    f.line(x + 232, 350, x + 262, 350, start=True, end=True)

# ---- tầng thiết bị ----
DY = 530
f.rect(100, DY, 320, 160, fill=GREY)
f.lines(260, DY + 34, [("ESP32 Node A", 22, True, False), ("Kiosk + khay trả", 20, False, False),
                       ("RC522 · LCD 16×2 · cân khay", 19, False, False), ("còi · đèn khay · nút báo hỏng", 19, False, False)], step=28)
f.rect(460, DY, 340, 160, fill=GREY)
f.lines(630, DY + 34, [("ESP32 Node B", 22, True, False), ("Tủ 2 ngăn + hộc pin", 20, False, False),
                       ("3 cân · 3 servo khóa", 19, False, False), ("LED trạng thái · DHT22", 19, False, False)], step=28)
f.rect(872, DY, 288, 160, fill=GREY)
f.lines(1016, DY + 34, [("Camera OV5647", 22, True, False), ("5 MP · MIPI CSI-2", 19, False, False),
                        ("đặt phía trên khay trả,", 19, False, False), ("đèn chiếu sáng cố định", 19, False, False)], step=28)

# ---- liên kết ----
# ứng dụng <-> Pi qua WLAN (nét đứt); thông báo ra Internet (nét chấm gạch)
for x in (260, 630):
    f.line(x, 160, x, 230, sw=2.0, dash=DASH_WIFI, start=True, end=True)
    f.text(x + 14, 188, "HTTP · WebSocket", 18, italic=True, halo="#FAFAFA")
f.line(1000, 230, 1000, 160, sw=2.0, dash=DASH_4G, end=True)
f.text(1014, 188, "HTTPS (qua 4G)", 18, italic=True, halo="#FAFAFA")
# Pi <-> thiết bị
f.line(260, 426, 260, DY - 2, sw=2.0, dash=DASH_WIFI, start=True, end=True)
f.text(274, 486, "Wi-Fi · MQTT", 18, italic=True, halo="#FAFAFA")
f.line(630, 426, 630, DY - 2, sw=2.0, dash=DASH_WIFI, start=True, end=True)
f.text(644, 486, "Wi-Fi · MQTT", 18, italic=True, halo="#FAFAFA")
f.line(1022, 426, 1022, DY - 2, sw=2.0, start=True)
f.text(1036, 486, "CSI-2", 18, mono=True, halo="#FAFAFA")

f.legend_h(100, 754, [("line", DASH_WIFI, 2.0, "Không dây (Wi-Fi 802.11n)"), ("line", None, 2.0, "Có dây / cục bộ"),
                      ("line", DASH_4G, 2.0, "Mạng di động 4G"), ("box", GREY, "Thiết bị ngoài")])
f.save()
