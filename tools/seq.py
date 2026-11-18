import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "images", "seq_tra.png")

lanes = [
    "Cảm biến A\n(RFID,\ncân khay)",
    "ESP32-A",
    "Mosquitto\n(Pi 4)",
    "Backend\n(Pi 4)",
    "Camera +\nTFLite (Pi 4)",
    "ESP32-B",
    "HX711 ngăn\n+ Servo",
    "Web\n(trình duyệt)",
]
X = [0.8 + i * 1.6 for i in range(len(lanes))]
L = {n.split("\n")[0]: x for n, x in zip(lanes, X)}

msgs = [
    ("Cảm biến A", "ESP32-A", "(1) UID thẻ (SPI, ISO 14443A)", "m"),
    ("ESP32-A", "Mosquitto", "(2) PUBLISH kioskA/card, QoS 1", "m"),
    ("Mosquitto", "Backend", "(3) chuyển tin → tra SQLite", "m"),
    ("Backend", "ESP32-A", "(4) PUBLISH kioskA/cmd (LCD)", "r"),
    ("Cảm biến A", "ESP32-A", "(5) HX711 khay: khối lượng ổn định", "m"),
    ("ESP32-A", "Backend", "(6) PUBLISH kioskA/tray {m}", "m"),
    ("Backend", "Camera +", "(7) chụp CSI-2 → suy luận INT8", "m"),
    ("Camera +", "Backend", "(8) {lớp, độ tin cậy}", "r"),
    ("Backend", "ESP32-B", "(9) đủ 3 điều kiện → cmd unlock k", "m"),
    ("ESP32-B", "HX711 ngăn", "(10) PWM mở servo; GPIO bật LED xanh", "m"),
    ("ESP32-B", "Backend", "(11) PUBLISH ack", "r"),
    ("HX711 ngăn", "ESP32-B", "(12) khối lượng tăng, ổn định", "r"),
    ("ESP32-B", "Backend", "(13) PUBLISH slot/k/state (retained)", "m"),
    ("Backend", "ESP32-B", "(14) đóng giao dịch → cmd lock k", "r"),
    ("Backend", "Web", "(15) WebSocket: cập nhật trạng thái", "m"),
]

top = 0.0
step = 0.72
H = 0.8 + step * len(msgs)
fig, ax = plt.subplots(figsize=(13.5, H * 0.62 + 0.4), dpi=170)
ax.set_xlim(0, X[-1] + 0.8)
ax.set_ylim(-H, 1.2)
ax.axis("off")

for n, x in zip(lanes, X):
    ax.add_patch(FancyBboxPatch((x - 0.7, 0.05), 1.4, 1.05, boxstyle="round,pad=0.02,rounding_size=0.05",
                                fc="#fff4e0" if "Pi 4" in n else ("#eef3fb" if "Web" in n else "#e9f6ec"),
                                ec="#222222", lw=1.1))
    ax.text(x, 0.575, n, ha="center", va="center", fontsize=11, fontweight="bold", linespacing=1.2)
    ax.plot([x, x], [0.05, -H + 0.3], color="#999999", lw=1, ls="--")

y = -0.6
for f, t, lab, kind in msgs:
    x1, x2 = L[f], L[t]
    ax.annotate("", xy=(x2, y), xytext=(x1, y),
                arrowprops=dict(arrowstyle="->", lw=1.3, color="#222222",
                                linestyle="--" if kind == "r" else "-"))
    cx = (x1 + x2) / 2
    ax.text(cx, y + 0.13, lab, ha="center", va="bottom", fontsize=11,
            bbox=dict(fc="white", ec="none", pad=0.6))
    y -= step

plt.savefig(OUT, bbox_inches="tight", facecolor="white")
from PIL import Image
print(Image.open(OUT).size)
