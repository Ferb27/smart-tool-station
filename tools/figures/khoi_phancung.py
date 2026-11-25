# Hình 2: sơ đồ khối phần cứng (nguồn, Pi, hai node và ngoại vi). Chạy: python khoi_phancung.py
from svgkit import Fig, GREY, DASH_WIFI, INK

f = Fig("khoi_phancung", 1200, 600)
PW = 4.4   # độ dày nét đường cấp nguồn


def block(x, y, w, h, title, sub=None, fill="#FFFFFF", sw=1.6, size=21):
    f.rect(x, y, w, h, fill=fill, sw=sw)
    if sub:
        f.lines(x + w / 2, y + h / 2 - 6, [(title, size, True, False), (sub, 18, False, False)], step=25)
    else:
        f.text(x + w / 2, y + h / 2 + 7, title, size, "middle", bold=True)


def periph(x, y, title, sub):
    f.rect(x, y, 180, 62, fill=GREY, sw=1.4)
    f.text(x + 90, y + 26, title, 19, "middle", bold=True)
    f.text(x + 90, y + 50, sub, 17, "middle", mono=True)


# ---- hàng nguồn ----
block(120, 22, 200, 70, "Adapter 5 V – 3 A", "Node A, Node B, servo", fill=GREY, size=19)
block(480, 22, 240, 70, "Adapter USB-C", "5,1 V – 3 A cho Pi 4", fill=GREY, size=19)
# thanh nguồn 5 V tới hai node; nhảy cung qua đường nguồn riêng của Pi (không nối nhau)
f.line(220, 92, 220, 124, sw=PW)
f.o.append('<path d="M220,124 L592,124 A8,8 0 0 1 608,124 L980,124" fill="none" stroke="%s" stroke-width="%s"/>' % (INK, PW))
f.line(220, 124, 220, 168, sw=PW, end=True)
f.line(980, 124, 980, 168, sw=PW, end=True)
f.text(234, 114, "5 V", 18, mono=True)
f.line(600, 92, 600, 168, sw=PW, end=True)
f.text(614, 150, "5,1 V", 18, mono=True, halo=True)

# ---- Node A / Pi / Node B ----
block(20, 168, 400, 92, "ESP32 Node A", "Kiosk + khay trả", sw=2.2)
block(480, 168, 240, 92, "Raspberry Pi 4", "gateway · AI · CSDL", sw=2.6)
block(780, 168, 400, 92, "ESP32 Node B", "Tủ 2 ngăn + hộc pin", sw=2.2)
for x1, x2 in ((420, 480), (720, 780)):
    f.line(x1, 214, x2, 214, sw=2.0, dash=DASH_WIFI, start=True, end=True)
    f.text((x1 + x2) / 2, 202, "Wi-Fi", 18, "middle", italic=True, halo=True)
    f.text((x1 + x2) / 2, 242, "MQTT", 17, "middle", mono=True)

# ---- ngoại vi Node A (2 cột, thân giữa x=220) ----
perA = [("RFID RC522", "SPI"), ("LCD 16×2", "I²C · PCF8574"),
        ("HX711 + load cell", "khay · DOUT/SCK"), ("Còi active", "GPIO · S8050"),
        ("Đèn khay", "GPIO · MOSFET"), ("Nút báo hỏng", "GPIO · ngắt")]
f.line(220, 260, 220, 506, sw=2.0)
for i, (t, s) in enumerate(perA):
    col, row = i % 2, i // 2
    x, y = (20 if col == 0 else 240), 300 + row * 72
    periph(x, y, t, s)
    if col == 0:
        f.line(200, y + 31, 220, y + 31, sw=1.8)
    else:
        f.line(220, y + 31, 240, y + 31, sw=1.8)

# ---- ngoại vi Node B ----
perB = [("3 × load cell", "+ HX711 · DOUT/SCK"), ("3 × servo SG90", "PWM 50 Hz (LEDC)"),
        ("6 × LED đỏ/xanh", "GPIO · 330 Ω"), ("DHT22", "1-wire · GPIO 17")]
f.line(980, 260, 980, 434, sw=2.0)
for i, (t, s) in enumerate(perB):
    col, row = i % 2, i // 2
    x, y = (780 if col == 0 else 1000), 300 + row * 72
    periph(x, y, t, s)
    if col == 0:
        f.line(960, y + 31, 980, y + 31, sw=1.8)
    else:
        f.line(980, y + 31, 1000, y + 31, sw=1.8)

# ---- ngoại vi Pi ----
block(480, 316, 190, 62, "Camera OV5647", "MIPI CSI-2", fill=GREY)
f.line(565, 260, 565, 316, sw=2.0, start=True)
f.text(579, 294, "CSI-2", 18, mono=True, halo=True)
block(480, 438, 240, 62, "USB flash", "sao lưu mỗi ngày", fill=GREY)
f.line(700, 260, 700, 438, sw=2.0, end=True)
f.text(688, 418, "sqlite3 .backup", 17, "end", mono=True, halo=True)

f.legend_h(20, 556, [("line", DASH_WIFI, 2.0, "Không dây (Wi-Fi 802.11n)"), ("line", None, 2.0, "Tín hiệu"),
                     ("line", None, PW, "Cấp nguồn"), ("box", GREY, "Thiết bị ngoài")])
f.save()
