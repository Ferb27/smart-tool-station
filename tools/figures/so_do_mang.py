# Sinh file SVG "so_do_mang.svg" rồi nhờ Inkscape xuất PNG/PDF.
# Chạy:  python so_do_mang.py   (cần Inkscape; sửa đường dẫn INKSCAPE bên dưới nếu khác)
# Quy ước hình: nét đen đơn sắc, 3 kiểu nét (không dây / có dây / 4G), 2 kiểu nền (xám / trắng),
# cỡ chữ tối thiểu 18 px trên khung 1200 px để khi thu về bề rộng trang A4 vẫn đọc được (khoảng 8 pt).
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
SVG = os.path.join(HERE, "so_do_mang.svg")
PNG = os.path.join(HERE, "..", "..", "docs", "images", "so_do_mang.png")
PDF = os.path.join(HERE, "..", "..", "docs", "images", "so_do_mang.pdf")
INKSCAPE = r"D:\tool\Inkscape\bin\inkscape.com"

W, H = 1200, 800
SERIF = "'Times New Roman', Times, serif"
MONO = "Consolas, 'Courier New', monospace"
INK = "#111111"
GREY = "#EDEDED"

out = []


def add(s):
    out.append(s)


def rect(x, y, w, h, fill="#FFFFFF", sw=1.6, dash=None, rx=2):
    d = ' stroke-dasharray="%s"' % dash if dash else ""
    add('<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s" stroke="%s" stroke-width="%s"%s/>'
        % (x, y, w, h, rx, fill, INK, sw, d))


def text(x, y, s, size=20, anchor="start", weight="normal", mono=False, style="normal"):
    fam = MONO if mono else SERIF
    add('<text x="%s" y="%s" font-family="%s" font-size="%s" font-weight="%s" font-style="%s" '
        'text-anchor="%s" fill="%s">%s</text>' % (x, y, fam, size, weight, style, anchor, INK, s))


def lines(x, y, items, step=25):
    """items: danh sách (chuỗi, cỡ chữ, đậm?, mono?), căn giữa quanh x"""
    for i, (s, size, bold, mono) in enumerate(items):
        text(x, y + i * step, s, size, "middle", "bold" if bold else "normal", mono)


def line(x1, y1, x2, y2, sw=1.8, dash=None, start=False, end=False):
    d = ' stroke-dasharray="%s"' % dash if dash else ""
    ms = ' marker-start="url(#ah_s)"' if start else ""
    me = ' marker-end="url(#ah_e)"' if end else ""
    add('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="%s"%s%s%s/>'
        % (x1, y1, x2, y2, INK, sw, d, ms, me))


def square(cx, cy, s=10):
    add('<rect x="%s" y="%s" width="%s" height="%s" fill="%s"/>' % (cx - s / 2, cy - s / 2, s, s, INK))


add('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">' % (W, H, W, H))
add('<defs>'
    '<marker id="ah_e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">'
    '<path d="M0,0 L10,5 L0,10 z" fill="%s"/></marker>'
    '<marker id="ah_s" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
    '<path d="M0,0 L10,5 L0,10 z" fill="%s"/></marker></defs>' % (INK, INK))
add('<rect width="%d" height="%d" fill="#FFFFFF"/>' % (W, H))

# ---------- hàng thiết bị đầu cuối nối qua WLAN ----------
clients = [
    (24, "ESP32 Node A", "Kiosk + khay trả", "192.168.4.11", "MQTT :1883 · OTA :8000"),
    (314, "ESP32 Node B", "Tủ 2 ngăn + hộc pin", "192.168.4.12", "MQTT :1883 · OTA :8000"),
    (604, "Điện thoại sinh viên", "Trình duyệt, quét mã QR", "DHCP 192.168.4.10–.50", "HTTP/WS :8000 · DNS :53"),
    (894, "Laptop quản lý", "Trình duyệt, SSH", "DHCP 192.168.4.10–.50", "HTTP/WS :8000 · SSH :22"),
]
BUS_Y = 196
for x, name, role, ip, proto in clients:
    rect(x, 26, 270, 128, fill=GREY)
    lines(x + 135, 58, [(name, 24, True, False), (role, 20, False, False), (ip, 19, False, True), (proto, 19, False, True)], step=28)
    line(x + 135, 154, x + 135, BUS_Y, dash="7 5")

line(159, BUS_Y, 1029, BUS_Y, sw=2.4, dash="7 5")
text(478, 226, "WLAN «TramDungCu» · IEEE 802.11n 2,4 GHz · WPA2-PSK · kênh 6 · 192.168.4.0/24", 20, "start", style="italic")

# ---------- Raspberry Pi ----------
PX, PY, PW, PH = 24, 262, 856, 400
rect(PX, PY, PW, PH, fill="#FFFFFF", sw=2.6, rx=3)
text(PX + PW / 2, PY + 33, "Raspberry Pi 4 Model B (4 GB) — gateway, điểm truy cập, máy chủ ứng dụng", 23, "middle", "bold")
line(PX, PY + 48, PX + PW, PY + 48, sw=1.2)

line(452, BUS_Y, 452, PY, dash="7 5", sw=2.2)
square(452, PY, 11)
text(440, 250, "wlan0 · 192.168.4.1", 19, "end", mono=True)

cols = [44, 324, 604]
CW_, CH_ = 244, 68
rows = [318, 410, 502]


def mod(c, r, title, sub):
    x, y = cols[c], rows[r]
    rect(x, y, CW_, CH_)
    lines(x + CW_ / 2, y + 27, [(title, 21, True, False), (sub, 19, False, False)], step=26)


mod(0, 0, "hostapd", "AP 802.11n trên wlan0")
mod(1, 0, "dnsmasq", "DHCP :67 · DNS :53")
mod(2, 0, "chrony", "Đồng bộ giờ NTP")
mod(0, 1, "Mosquitto", "Broker MQTT :1883")
mod(1, 1, "FastAPI + uvicorn", "REST · WS · OTA :8000")
mod(2, 1, "Dịch vụ AI", "Picamera2 + TFLite")
mod(0, 2, "Tác vụ nền", "Thông báo · sao lưu")
mod(1, 2, "SQLite (WAL)", "tram.db")
mod(2, 2, "Ảnh JPEG", "giữ 30 ngày")

# mũi tên dữ liệu giữa các mô-đun
line(cols[0] + CW_, rows[1] + 34, cols[1], rows[1] + 34, start=True, end=True)
line(cols[1] + CW_, rows[1] + 34, cols[2], rows[1] + 34, start=True, end=True)
line(cols[1] + CW_ / 2, rows[1] + CH_, cols[1] + CW_ / 2, rows[2], start=True, end=True)
line(cols[2] + CW_ / 2, rows[1] + CH_, cols[2] + CW_ / 2, rows[2], end=True)
line(cols[0] + CW_, rows[2] + 34, cols[1], rows[2] + 34, end=True)

# lớp hệ điều hành
rect(44, 586, 804, 62, fill=GREY)
text(446, 612, "Raspberry Pi OS 64-bit · systemd (Restart=always) · ufw (22, 53, 67, 1883, 8000)", 19, "middle")
text(446, 638, "SSH khóa công khai · bí mật đặt trong /etc/tram/env (chmod 600)", 19, "middle")

# ---------- cột bên phải ----------
rect(930, 296, 246, 98, fill=GREY)
lines(1053, 326, [("Điện thoại chia sẻ mạng", 20, True, False), ("USB tethering (usb0)", 19, False, False),
                  ("hoặc cáp mạng eth0", 19, False, False)], step=25)
line(PX + PW, 340, 930, 340, sw=2.2)
square(PX + PW, 340, 11)
text(905, 328, "usb0", 18, "middle", mono=True)

line(1053, 394, 1053, 462, sw=2.0, dash="14 4 3 4", start=True, end=True)
text(1068, 434, "4G / LTE", 19, "start", style="italic")

rect(930, 462, 246, 124, fill="#FFFFFF", dash="9 6")
lines(1053, 492, [("Internet", 22, True, False)], step=25)
lines(1053, 520, [("Telegram · HTTPS :443", 19, False, False), ("Email · SMTP :587", 19, False, False),
                  ("NTP · UDP :123", 19, False, False)], step=25)

# ---------- hàng dưới: camera và USB flash ----------
rect(110, 706, 300, 80, fill=GREY)
lines(260, 736, [("Camera OV5647 (5 MP)", 21, True, False), ("MIPI CSI-2", 19, False, False)], step=26)
line(260, 706, 260, PY + PH, sw=2.2)
square(260, PY + PH, 11)
text(274, 690, "CSI-2", 18, "start", mono=True)

rect(500, 706, 330, 80, fill=GREY)
lines(665, 736, [("USB flash (sao lưu)", 21, True, False), ("02:00 hằng ngày · giữ 7 bản", 19, False, False)], step=26)
line(665, PY + PH, 665, 706, end=True, sw=2.2)
square(665, PY + PH, 11)
text(679, 690, "USB-A · sqlite3 .backup", 18, "start", mono=True)

# ---------- chú giải ----------
rect(930, 618, 246, 170, fill="#FFFFFF", sw=1.2)
text(1053, 644, "Chú giải", 20, "middle", "bold")
line(944, 668, 994, 668, dash="7 5")
text(1004, 674, "Không dây 802.11n", 18)
line(944, 696, 994, 696)
text(1004, 702, "Có dây / cục bộ", 18)
line(944, 724, 994, 724, dash="14 4 3 4")
text(1004, 730, "Mạng di động 4G", 18)
rect(944, 744, 24, 15, fill=GREY, sw=1.2, rx=1)
text(976, 757, "Thiết bị ngoài", 18)
rect(944, 766, 24, 15, fill="#FFFFFF", sw=1.2, rx=1)
text(976, 779, "Dịch vụ trên Pi", 18)
square(1100, 752, 10)
text(1112, 757, "cổng", 18, "start")

add("</svg>")

with open(SVG, "w", encoding="utf-8") as f:
    f.write("\n".join(out))
print("đã ghi", SVG)

# xuất PNG (2400 px rộng, nền trắng) và PDF vector (chữ chuyển thành đường) bằng Inkscape
subprocess.run([INKSCAPE, SVG, "--export-type=png", "--export-width=2400",
                "--export-background=#FFFFFF", "--export-filename=" + os.path.abspath(PNG)], check=True)
subprocess.run([INKSCAPE, SVG, "--export-type=pdf", "--export-text-to-path",
                "--export-filename=" + os.path.abspath(PDF)], check=True)
print("đã xuất", os.path.abspath(PNG))
