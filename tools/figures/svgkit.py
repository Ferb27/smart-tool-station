# Bộ hàm vẽ SVG dùng chung cho các sơ đồ trong báo cáo, rồi xuất PNG/PDF bằng Inkscape.
# Quy ước: nét đen đơn sắc; nền xám (thiết bị ngoài) hoặc trắng (khối xử lý); chữ Times New Roman
# (cùng font báo cáo), Consolas cho địa chỉ/cổng/topic; cỡ chữ tối thiểu 18 px trên khung 1200 px.
import os
import subprocess

INKSCAPE = r"D:\tool\Inkscape\bin\inkscape.com"   # sửa nếu cài ở nơi khác
HERE = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.abspath(os.path.join(HERE, "..", "..", "docs", "images"))
SERIF = "'Times New Roman', Times, serif"
MONO = "Consolas, 'Courier New', monospace"
INK = "#111111"
GREY = "#EDEDED"
LIGHT = "#F6F6F6"
DASH_WIFI = "7 5"
DASH_4G = "14 4 3 4"


class Fig:
    def __init__(self, name, w, h):
        self.name, self.w, self.h = name, w, h
        self.o = []
        self.o.append('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">' % (w, h, w, h))
        self.o.append('<rect width="%d" height="%d" fill="#FFFFFF"/>' % (w, h))

    def rect(self, x, y, w, h, fill="#FFFFFF", sw=1.6, dash=None, rx=2):
        d = ' stroke-dasharray="%s"' % dash if dash else ""
        self.o.append('<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s" stroke="%s" stroke-width="%s"%s/>'
                      % (x, y, w, h, rx, fill, INK, sw, d))

    def text(self, x, y, s, size=20, anchor="start", bold=False, mono=False, italic=False, halo=False, rot=None):
        fam = MONO if mono else SERIF
        if halo:   # nền trắng đặt dưới chữ (không dùng viền chữ vì Word/EMF không hỗ trợ paint-order)
            w = len(s) * size * (0.60 if mono else 0.50) + 8
            x0 = x if anchor == "start" else (x - w if anchor == "end" else x - w / 2)
            self.o.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="%s"/>'
                          % (x0 - 3, y - size * 0.85, w, size * 1.15, halo if isinstance(halo, str) else "#FFFFFF"))
        tr = ' transform="rotate(%s %s %s)"' % (rot, x, y) if rot is not None else ""
        self.o.append('<text x="%s" y="%s" font-family="%s" font-size="%s" font-weight="%s" font-style="%s" '
                      'text-anchor="%s" fill="%s"%s>%s</text>'
                      % (x, y, fam, size, "bold" if bold else "normal", "italic" if italic else "normal",
                         anchor, INK, tr, s))

    def lines(self, x, y, items, step=25):
        """items: (chuỗi, cỡ chữ, đậm?, mono?), căn giữa quanh x"""
        for i, it in enumerate(items):
            s, size, bold, mono = it
            self.text(x, y + i * step, s, size, "middle", bold, mono)

    def _head(self, tx, ty, dx, dy, L=13, Wd=5.5):
        """đa giác mũi tên: mũi nhọn tại (tx, ty), hướng bay (dx, dy) đã chuẩn hóa"""
        bx, by = tx - dx * L, ty - dy * L
        px, py = -dy * Wd, dx * Wd
        self.o.append('<polygon points="%.2f,%.2f %.2f,%.2f %.2f,%.2f" fill="%s"/>'
                      % (tx, ty, bx + px, by + py, bx - px, by - py, INK))

    def line(self, x1, y1, x2, y2, sw=1.8, dash=None, start=False, end=False):
        import math
        d = ' stroke-dasharray="%s"' % dash if dash else ""
        L = math.hypot(x2 - x1, y2 - y1) or 1.0
        ux, uy = (x2 - x1) / L, (y2 - y1) / L
        hl = 13
        sx, sy, ex, ey = x1, y1, x2, y2
        if end:
            ex, ey = x2 - ux * (hl - 1), y2 - uy * (hl - 1)     # thân dừng ở đáy mũi tên
        if start:
            sx, sy = x1 + ux * (hl - 1), y1 + uy * (hl - 1)
        self.o.append('<line x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f" stroke="%s" stroke-width="%s"%s/>'
                      % (sx, sy, ex, ey, INK, sw, d))
        if end:
            self._head(x2, y2, ux, uy)
        if start:
            self._head(x1, y1, -ux, -uy)

    def poly(self, pts, sw=1.8, dash=None):
        d = ' stroke-dasharray="%s"' % dash if dash else ""
        p = " ".join("%s,%s" % pt for pt in pts)
        self.o.append('<polyline points="%s" fill="none" stroke="%s" stroke-width="%s"%s/>' % (p, INK, sw, d))

    def square(self, cx, cy, s=10):
        self.o.append('<rect x="%s" y="%s" width="%s" height="%s" fill="%s"/>' % (cx - s / 2, cy - s / 2, s, s, INK))

    def legend(self, x, y, w, rows):
        """rows: danh sách ('line', dash, sw, nhãn) hoặc ('box', fill, nhãn) hoặc ('sq', nhãn)"""
        h = 40 + 28 * len(rows)
        self.rect(x, y, w, h, sw=1.2)
        self.text(x + w / 2, y + 27, "Chú giải", 20, "middle", bold=True)
        for i, r in enumerate(rows):
            cy = y + 54 + 28 * i
            if r[0] == "line":
                self.line(x + 14, cy, x + 64, cy, sw=r[2], dash=r[1])
                self.text(x + 76, cy + 6, r[3], 18)
            elif r[0] == "box":
                self.rect(x + 14, cy - 8, 36, 16, fill=r[1], sw=1.2, rx=1)
                self.text(x + 62, cy + 6, r[2], 18)
            else:
                self.square(x + 32, cy, 10)
                self.text(x + 62, cy + 6, r[1], 18)
        return h


    def legend_h(self, x, y, items):
        """Chú giải nằm ngang. items: ('line', dash, sw, nhãn) | ('box', fill, nhãn) | ('sq', nhãn)"""
        self.text(x, y + 6, "Chú giải:", 19, bold=True)
        cx = x + 100
        for r in items:
            if r[0] == "line":
                self.line(cx, y, cx + 50, y, sw=r[2], dash=r[1])
                self.text(cx + 62, y + 6, r[3], 18)
                cx += 62 + int(len(r[3]) * 8.6) + 34
            elif r[0] == "box":
                self.rect(cx, y - 8, 34, 16, fill=r[1], sw=1.2, rx=1)
                self.text(cx + 46, y + 6, r[2], 18)
                cx += 46 + int(len(r[2]) * 8.6) + 34
            else:
                self.square(cx + 8, y, 10)
                self.text(cx + 26, y + 6, r[1], 18)
                cx += 26 + int(len(r[1]) * 8.6) + 34

    def save(self):
        self.o.append("</svg>")
        svg = os.path.join(HERE, self.name + ".svg")
        with open(svg, "w", encoding="utf-8") as f:
            f.write("\n".join(self.o))
        png = os.path.join(IMG_DIR, self.name + ".png")
        pdf = os.path.join(IMG_DIR, self.name + ".pdf")
        subprocess.run([INKSCAPE, svg, "--export-type=png", "--export-width=2400",
                        "--export-background=#FFFFFF", "--export-filename=" + png], check=True)
        subprocess.run([INKSCAPE, svg, "--export-type=pdf", "--export-text-to-path",
                        "--export-filename=" + pdf], check=True)
        svg_out = os.path.join(IMG_DIR, self.name + ".svg")
        subprocess.run([INKSCAPE, svg, "--export-type=svg", "--export-plain-svg", "--export-text-to-path",
                        "--export-filename=" + svg_out], check=True)
        print("đã xuất", png)
