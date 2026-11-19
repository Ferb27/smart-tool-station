import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "images", "kientruc2.png")

fig, ax = plt.subplots(figsize=(10, 6.2), dpi=200)
ax.set_xlim(-0.6, 10)
ax.set_ylim(0, 6.2)
ax.axis("off")

def box(x, y, w, h, text, fc="#ffffff", fs=10, bold=False):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.06",
                                fc=fc, ec="#222222", lw=1.2))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=fs,
            fontweight="bold" if bold else "normal", linespacing=1.3)

def arrow(x1, y1, x2, y2, label=None, both=False, fs=9):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="<->" if both else "->", lw=1.2, color="#222222"))
    if label:
        ax.text((x1 + x2) / 2, (y1 + y2) / 2, label, fontsize=fs, ha="center", va="center",
                bbox=dict(fc="white", ec="none", pad=1.2))

def layer(y, text):
    ax.text(-0.3, y, text, fontsize=9, color="#555555", fontweight="bold",
            rotation=90, ha="center", va="center")

layer(5.55, "TẦNG ỨNG DỤNG")
layer(3.85, "TẦNG EDGE")
layer(1.45, "TẦNG THIẾT BỊ")

# Application
box(0.6, 5.15, 2.7, 0.8, "WEB SINH VIÊN\n(điện thoại: mượn, hạn trả)", fc="#eef3fb", fs=9.5)
box(3.65, 5.15, 2.7, 0.8, "WEB QUẢN LÝ LAB\n(tồn kho, lịch sử, thống kê)", fc="#eef3fb", fs=9.5)
box(6.7, 5.15, 2.7, 0.8, "THÔNG BÁO\nTelegram / Email", fc="#eef3fb", fs=9.5)

# Edge
box(0.6, 3.35, 8.8, 1.0,
    "RASPBERRY PI 4 (4 GB)  —  GATEWAY / EDGE AI\n"
    "MQTT Broker · Backend REST/WebSocket · SQLite\n"
    "Mô hình nhận diện dụng cụ (TFLite/ONNX) · Luật nghiệp vụ",
    fc="#fff4e0", bold=True, fs=9.5)

arrow(1.95, 4.35, 1.95, 5.15, "HTTP / WebSocket", both=True)
arrow(5.0, 4.35, 5.0, 5.15, "HTTP / WebSocket", both=True)
arrow(8.05, 4.35, 8.05, 5.15, "HTTPS")

# Devices
box(0.6, 1.95, 2.2, 0.85, "CAMERA\n(CSI / USB)", fc="#e9f6ec", bold=True)
box(3.15, 1.95, 2.9, 0.85, "ESP32 NODE A\nKiosk & khay trả", fc="#e9f6ec", bold=True)
box(6.4, 1.95, 3.0, 0.85, "ESP32 NODE B\nTủ 2 ngăn", fc="#e9f6ec", bold=True)

arrow(1.7, 2.8, 1.7, 3.35, "ảnh")
arrow(4.6, 2.8, 4.6, 3.35, "Wi-Fi / MQTT", both=True)
arrow(7.9, 2.8, 7.9, 3.35, "Wi-Fi / MQTT", both=True)

# Peripherals
box(3.15, 0.1, 2.9, 1.4,
    "RFID RC522 (SPI)\nLCD 16x2 (I2C)\nLoad cell khay + HX711\nCòi · Đèn khay · Nút báo hỏng (GPIO)", fs=8.6)
box(6.4, 0.1, 3.0, 1.4,
    "2 × Load cell + HX711\n2 × Servo khóa ngăn (PWM)\nLED đỏ/xanh báo ngăn\n(GPIO)", fs=8.8)
arrow(4.6, 1.5, 4.6, 1.95, both=True)
arrow(7.9, 1.5, 7.9, 1.95, both=True)

ax.text(1.7, 0.8, "Camera đặt phía trên\nkhay trả, chiếu sáng\ncố định", ha="center",
        va="center", fontsize=8.8, style="italic", color="#444444")

plt.savefig(OUT, bbox_inches="tight", facecolor="white")
from PIL import Image
print(Image.open(OUT).size)
