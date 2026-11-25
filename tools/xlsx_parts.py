import json
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule

import os
SCR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(SCR, "..", "docs", "DanhSachLinhKien.xlsx")
parts = json.load(open(SCR + r"\parts.json", encoding="utf-8"))

wb = Workbook()
ws = wb.active
ws.title = "Linh kiện"
F = "Times New Roman"
thin = Side(style="thin", color="999999")
bd = Border(left=thin, right=thin, top=thin, bottom=thin)
money = '#,##0'

ws["A1"] = "DANH SÁCH LINH KIỆN – TRẠM MƯỢN TRẢ DỤNG CỤ THÔNG MINH"
ws["A1"].font = Font(name=F, bold=True, size=14)
ws["A2"] = "Nhập số lượng đã có ở cột F (ô màu vàng); cột G và H tự tính. Giá tham khảo 11/2026, cần kiểm tra khi đặt mua."
ws["A2"].font = Font(name=F, italic=True, size=10, color="555555")

hdr = ["STT", "Linh kiện", "SL cần", "Đơn giá (VNĐ)", "Thành tiền", "SL đã có", "Cần mua", "Tiền cần mua", "Ghi chú / phương án rẻ hơn"]
r = 4
for c, h in enumerate(hdr, 1):
    x = ws.cell(r, c, h)
    x.font = Font(name=F, bold=True, size=11)
    x.fill = PatternFill("solid", fgColor="DDDDDD")
    x.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    x.border = bd
first = r + 1
n = 0
yellow = PatternFill("solid", fgColor="FFF2CC")
item_rows = []
for g in parts:
    r += 1
    ws.cell(r, 1, g["group"]).font = Font(name=F, bold=True, size=11)
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=9)
    ws.cell(r, 1).fill = PatternFill("solid", fgColor="F2F2F2")
    for item in g["items"]:
        name, q, price, note, have = item[:5]
        r += 1
        n += 1
        item_rows.append(r)
        vals = [n, name, q, price, f"=C{r}*D{r}", have, f"=MAX(C{r}-F{r},0)", f"=G{r}*D{r}", note]
        for c, v in enumerate(vals, 1):
            x = ws.cell(r, c, v)
            x.font = Font(name=F, size=11)
            x.border = bd
            x.alignment = Alignment(vertical="center", wrap_text=(c in (2, 9)),
                                    horizontal="center" if c in (1, 3, 6, 7) else None)
            if c in (4, 5, 8):
                x.number_format = money
        ws.cell(r, 6).fill = yellow
last = r
r += 2
ws.cell(r, 7, "Tổng toàn bộ").font = Font(name=F, bold=True)
ws.cell(r, 8, f"=SUM(E{first}:E{last})")
r += 1
ws.cell(r, 7, "Cần mua thêm").font = Font(name=F, bold=True, color="C00000")
ws.cell(r, 8, f"=SUM(H{first}:H{last})")
for rr in (r - 1, r):
    ws.cell(rr, 8).number_format = money
    ws.cell(rr, 8).font = Font(name=F, bold=True, size=12)

dv = DataValidation(type="whole", operator="greaterThanOrEqual", formula1="0", allow_blank=True)
ws.add_data_validation(dv)
for rr in item_rows:
    dv.add(f"F{rr}")
# gray out rows fully owned
ws.conditional_formatting.add(f"A{first}:I{last}",
    FormulaRule(formula=[f"AND(ISNUMBER($C{first}),$F{first}>=$C{first})"],
                font=Font(color="999999", strike=True)))

for col, w in zip("ABCDEFGHI", [5, 44, 7, 13, 13, 9, 9, 14, 52]):
    ws.column_dimensions[col].width = w
ws.freeze_panes = "A5"
ws.page_setup.orientation = "landscape"
ws.page_setup.fitToWidth = 1
ws.sheet_properties.pageSetUpPr.fitToPage = True
ws.page_setup.fitToHeight = 0
wb.save(OUT)
print("saved", n, "items")
