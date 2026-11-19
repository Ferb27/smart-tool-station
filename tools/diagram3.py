import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "images", "khoi_phancung.png")

fig, ax = plt.subplots(figsize=(12, 7.2), dpi=180)
ax.set_xlim(0, 12)
ax.set_ylim(0, 7.2)
ax.axis("off")

def box(x, y, w, h, title, body="", fc="#ffffff"):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.06",
                                fc=fc, ec="#222222", lw=1.2))
    if body:
        ax.text(x + w / 2, y + h - 0.2, title, ha="center", va="top", fontsize=10, fontweight="bold")
        ax.text(x + w / 2, y + (h - 0.45) / 2, body, ha="center", va="center", fontsize=9, linespacing=1.3)
    else:
        ax.text(x + w / 2, y + h / 2, title, ha="center", va="center", fontsize=10, fontweight="bold",
                linespacing=1.3)

def arrow(x1, y1, x2, y2, label=None, both=False, dashed=False, color="#222222", fs=9, lx=0, ly=0):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="<->" if both else "->", lw=1.3, color=color,
                                linestyle="--" if dashed else "-"))
    if label:
        ax.text((x1 + x2) / 2 + lx, (y1 + y2) / 2 + ly, label, fontsize=fs, ha="center", va="center",
                color=color, bbox=dict(fc="white", ec="none", pad=1.0))

PWR = "#c0392b"

# Top row
box(0.3, 5.9, 3.3, 1.0, "KHỐI THU ẢNH", "Camera 5 MP + đèn khay", fc="#e9f6ec")
box(4.35, 5.9, 3.3, 1.0, "KHỐI ỨNG DỤNG", "Web sinh viên · Web quản lý\nTelegram / Email", fc="#eef3fb")
box(8.4, 5.9, 3.3, 1.0, "KHỐI NGUỒN", "Adapter 5V-3A (Pi 4)\nAdapter 5V-3A (Node A, B)", fc="#fdecea")

# Center
box(3.6, 3.75, 4.8, 1.4, "KHỐI XỬ LÝ TRUNG TÂM + TRUYỀN THÔNG",
    "Raspberry Pi 4 (4 GB): AI nhận diện, CSDL,\nMQTT broker, web server · Wi-Fi 2.4 GHz", fc="#fff4e0")

arrow(1.95, 5.9, 3.6, 4.6, "CSI / USB", lx=-0.35, ly=0.15)
arrow(6.0, 5.15, 6.0, 5.9, "HTTP / WS", both=True)
arrow(9.4, 5.9, 8.4, 4.75, "5V", dashed=True, color=PWR, lx=0.35, ly=0.1)

# Power bus to nodes
ax.plot([10.6, 10.6], [5.9, 3.3], ls="--", color=PWR, lw=1.3)
ax.plot([1.9, 10.6], [3.3, 3.3], ls="--", color=PWR, lw=1.3)
arrow(1.9, 3.3, 1.9, 2.95, dashed=True, color=PWR)
arrow(10.1, 3.3, 10.1, 2.95, dashed=True, color=PWR)
ax.text(10.75, 4.6, "5V", color=PWR, fontsize=9, va="center")

# Nodes
box(0.3, 1.95, 3.6, 1.0, "KHỐI ĐIỀU KHIỂN NODE A", "ESP32 – Kiosk & khay trả", fc="#e9f6ec")
box(8.1, 1.95, 3.6, 1.0, "KHỐI ĐIỀU KHIỂN NODE B", "ESP32 – Tủ 2 ngăn", fc="#e9f6ec")
arrow(3.9, 2.6, 4.6, 3.75, "Wi-Fi/MQTT", both=True, lx=-0.1, ly=-0.05)
arrow(8.1, 2.6, 7.4, 3.75, "Wi-Fi/MQTT", both=True, lx=0.1, ly=-0.05)

# Peripherals Node A
box(0.05, 0.1, 1.85, 1.3, "NHẬN DẠNG", "RFID RC522\n13,56 MHz\n(SPI)")
box(2.0, 0.1, 1.85, 1.3, "CÂN KHAY", "Load cell 1 kg\n+ HX711\n(DOUT/SCK)")
box(3.95, 0.1, 1.85, 1.3, "HIỂN THỊ & BÁO", "LCD 16x2 (I2C)\nCòi, đèn khay,\nnút báo hỏng (GPIO)")
arrow(0.97, 1.4, 1.2, 1.95)
arrow(2.92, 1.4, 2.7, 1.95)
arrow(3.6, 1.95, 4.4, 1.4)

# Peripherals Node B
box(6.2, 0.1, 1.85, 1.3, "ĐO KHỐI LƯỢNG", "2 × load cell\n1 kg + HX711")
box(8.15, 0.1, 1.85, 1.3, "CHẤP HÀNH", "2 × servo SG90\nkhóa ngăn (PWM)")
box(10.1, 0.1, 1.85, 1.3, "BÁO NGĂN", "2 × LED đỏ/xanh\n(GPIO)")
arrow(7.6, 1.4, 8.5, 1.95)
arrow(9.3, 1.95, 9.1, 1.4)
arrow(10.9, 1.95, 11.0, 1.4)

ax.text(6.0, 2.25, "→ chiều dữ liệu / điều khiển\n- - → đường cấp nguồn", fontsize=8.5,
        ha="center", va="center", color="#444444",
        bbox=dict(fc="white", ec="#999999", pad=3))

plt.savefig(OUT, bbox_inches="tight", facecolor="white")
from PIL import Image
print(Image.open(OUT).size)
