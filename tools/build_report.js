const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, WidthType, BorderStyle, ShadingType, LevelFormat, VerticalAlign,
  Footer, PageNumber, CheckBox,
} = require("docx");

const path = require("path");
const SCR = __dirname;
const IMG = path.join(__dirname, "..", "docs", "images");
const OUT = path.join(__dirname, "..", "docs", "BaoCaoYTuong.docx");

const FONT = "Times New Roman";
const SZ = 24;
const CW = 9412;

const run = (text, o = {}) => new TextRun({ text, font: FONT, size: SZ, ...o });
const B = (t) => run(t, { bold: true });
const I = (t) => run(t, { italics: true });
const C = (t) => new TextRun({ text: t, font: "Consolas", size: 20 });
const kids = (c) => (Array.isArray(c) ? c : [run(c)]);

const numberingConfigs = [
  { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 640, hanging: 280 } } } }] },
];
let nref = 0;
const numList = (items) => {
  const ref = "n" + nref++;
  numberingConfigs.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 340 } } } }] });
  return items.map((c) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 50, line: 288 }, alignment: AlignmentType.JUSTIFIED, children: kids(c) }));
};
const p = (c, o = {}) => new Paragraph({ spacing: { after: 80, line: 288 }, alignment: AlignmentType.JUSTIFIED, ...o, children: kids(c) });
const h1 = (t) => new Paragraph({ spacing: { before: 240, after: 100 }, keepNext: true, children: [run(t, { bold: true, size: 26 })] });
const h2 = (t) => new Paragraph({ spacing: { before: 140, after: 80 }, keepNext: true, children: [run(t, { bold: true, italics: true })] });
const bl = (c) => new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 40, line: 288 }, alignment: AlignmentType.JUSTIFIED, children: kids(c) });
const gap = () => new Paragraph({ spacing: { after: 60 }, children: [] });
const tcap = (t) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, keepNext: true, children: [run(t, { italics: true, size: 22 })] });

const cellB = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const cb = { top: cellB, bottom: cellB, left: cellB, right: cellB };
function table(cols, header, rows, centerCols = [], monoCols = []) {
  const total = cols.reduce((a, b) => a + b, 0);
  const mk = (text, w, head, i) => new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: cb, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    shading: head ? { fill: "EDEDED", type: ShadingType.CLEAR, color: "auto" } : undefined,
    children: String(text).split("\n").map((t) => new Paragraph({
      spacing: { after: 0, line: 252 },
      alignment: head || centerCols.includes(i) ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [!head && monoCols.includes(i) ? new TextRun({ text: t, font: "Consolas", size: 17 }) : run(t, { bold: head, size: 21 })],
    })),
  });
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: cols, alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({ tableHeader: true, children: header.map((t, i) => mk(t, cols[i], true, i)) }),
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((t, i) => mk(t, cols[i], false, i)) })),
    ],
  });
}
function img(file, w, hgt, cap) {
  const png = fs.readFileSync(path.join(IMG, file));
  const svgPath = path.join(IMG, file.replace(/\.png$/, ".svg"));
  // 4 sơ đồ vẽ bằng Inkscape có bản SVG vector (chữ đã chuyển thành đường); ảnh chụp giao diện chỉ có PNG
  const pic = fs.existsSync(svgPath)
    ? new ImageRun({ type: "svg", data: fs.readFileSync(svgPath), fallback: { type: "png", data: png },
        transformation: { width: w, height: hgt }, altText: { title: cap, description: cap, name: file } })
    : new ImageRun({ type: "png", data: png, transformation: { width: w, height: hgt },
        altText: { title: cap, description: cap, name: file } });
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 40 }, keepNext: true, children: [pic] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 140 }, children: [run(cap, { italics: true, size: 22 })] }),
  ];
}

const line = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
const allB = { top: line, bottom: line, left: line, right: line };
const infoCell = (a, b) => new TableCell({ width: { size: CW, type: WidthType.DXA }, borders: allB, margins: { top: 40, bottom: 40, left: 100, right: 100 },
  children: [new Paragraph({ spacing: { after: 0 }, children: [B(a)] }), new Paragraph({ spacing: { after: 0 }, children: [B(b)] })] });
const svCell = (t, w) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: allB, margins: { top: 30, bottom: 30, left: 100, right: 100 },
  children: [new Paragraph({ spacing: { after: 0 }, children: [B(t)] })] });
const infoTable = new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [6400, CW - 6400],
  rows: [1, 2, 3, 4, 5].map((i) => new TableRow({ children: [svCell(`Sinh viên ${i}: [Họ và tên]`, 6400), svCell("MSSV: [..........]", CW - 6400)] })) });

const P = [];
P.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [run("BÁO CÁO ĐỀ TÀI MÔN THỰC TẬP KIẾN TRÚC VÀ GIAO THỨC IOT", { bold: true, size: 26 })] }),
  infoTable,
  new Paragraph({ spacing: { before: 120, after: 80 }, alignment: AlignmentType.JUSTIFIED,
    children: [B("Đề tài: "), run("Trạm mượn – trả dụng cụ thông minh cho phòng thực hành điện tử ứng dụng Edge AI")] }),
);

const partsData = JSON.parse(fs.readFileSync(SCR + "/parts.json", "utf8"));
const totalPartsCost = partsData.reduce((s, g) => s + g.items.reduce((gs, it) => gs + it[1] * it[2], 0), 0);
const pi4Price = partsData[0].items[0][2];
const costWithoutPiMil = ((totalPartsCost - pi4Price) / 1000000).toFixed(2).replace(".", ",");

// ================= 1
P.push(h1("1. Khảo sát đối tượng và yêu cầu hệ thống"));
P.push(h2("1.1. Đối tượng và bài toán"));
P.push(p("Đối tượng phục vụ là phòng thực hành điện tử với các dụng cụ cầm tay dùng chung không dùng điện (kìm cắt chân linh kiện, kìm tuốt dây, bộ tua vít, nhíp) và pin sạc Li-ion 18650 loại có mạch bảo vệ (mượn theo số lượng 1–4 cell/người, hộc chứa tối đa 8 cell). Pin 18650 là vật tư thiết yếu thường xuyên được sinh viên mượn để cấp nguồn mạch thực hành, đồng thời mỗi cell có khối lượng khoảng 46,0 g (±1,5 g), lớn hơn nhiều so với sai số cân (±2 g) nên có thể tận dụng chính load cell để đếm số lượng mà không cần thêm cảm biến riêng. Quy trình ghi sổ thủ công dẫn tới ba vấn đề kỹ thuật cần giải quyết: (1) không định danh được người đang giữ dụng cụ hoặc số lượng pin đang nợ; (2) không xác minh được đồ trả về có đúng loại, đủ phụ kiện hoặc đúng số cell pin; (3) không có dữ liệu tức thời về tình trạng kho. Người sử dụng hệ thống là sinh viên và người quản lý phòng lab."));
P.push(p([B("Phạm vi và an toàn: "), run("hệ thống chỉ quản lý dụng cụ nguội, không dùng điện và pin 18650 có mạch bảo vệ. Mỏ hàn bị loại vì ngay sau khi dùng đầu mỏ có nhiệt độ khoảng 300 °C, đặt lên khay sẽ làm chảy lót xốp và vỏ tủ. Thiết bị đo như đồng hồ VOM bị loại vì camera và cân không kiểm tra được chức năng điện bên trong. Với dụng cụ cầm tay, hư hỏng thường gặp là gãy hoặc mất chi tiết, phát hiện được bằng ảnh và khối lượng; các hư hỏng còn lại do người trả báo qua nút báo hỏng (chức năng F8). Riêng với pin 18650, để bảo đảm an toàn điện – cháy nổ: hộc pin làm bằng vật liệu không dẫn điện (tấm Formex), pin đựng trong khay nhựa có ngăn tách riêng từng cell, tuyệt đối không để lẫn vật kim loại gây chập cực, chỉ sử dụng pin có mạch bảo vệ, và người quản lý phải kiểm tra điện áp từng cell ≥ 3,0 V, không phồng rộp trước khi nạp vào hộc.")]));

P.push(h2("1.2. Sản phẩm tương tự và giải pháp kỹ thuật tham khảo"));
P.push(tcap("Bảng 1. Các hệ thống quản lý dụng cụ đã có"));
P.push(table([2300, 2800, 2400, 1900],
  ["Sản phẩm", "Nguyên lý nhận biết", "Giải pháp đáng tham khảo", "Hạn chế"],
  [
    ["Snap-on Level 5 ATC (Mỹ)", "Camera chụp ngăn kéo khi đóng, so với ảnh chuẩn; dụng cụ đặt trong lót xốp cắt theo hình", "Nhận diện bằng ảnh, lưu nhật ký kèm ảnh, đăng nhập bằng thẻ", "Khoảng 21.000–26.000 USD (năm ra mắt)"],
    ["Henchman kabTRAK", "Cảm biến riêng tại từng vị trí dụng cụ", "Ghi nhận ngay khi nhấc/đặt, kết nối mạng", "Thiết bị chuyên dụng, chi phí cao"],
    ["Instant Systems, SupplyPro SmartBin", "Cảm biến khối lượng (weight cell)", "Xác định vật nào / bao nhiêu vật đã được lấy ra bằng cân", "Không tự xác định được loại vật khi đặt nhầm loại"],
    ["GAO RFID Checkout Cabinet", "Thẻ RFID gắn trên dụng cụ, khóa điện", "Tự ghi nhận, gửi email cảnh báo", "Phải dán thẻ lên từng dụng cụ"],
    ["Trạm mượn thiết bị thư viện (Đại học Manitoba, UC Riverside)", "Quẹt thẻ sinh viên để lấy thiết bị tại quầy/kiosk", "Cho mượn đồ thiết yếu theo lượt ngắn hạn: cáp USB-C, củ sạc, máy tính cầm tay (Manitoba, UC Riverside)", "Không đếm số lượng cell bằng cân hay kiểm tra bằng AI"],
    ["Dự án Fab Academy (makerspace)", "RFID đăng nhập, công tắc dưới từng vị trí", "Chi phí thấp", "Không xác minh đúng món"],
  ]));
P.push(gap());
P.push(p(`Đề tài kết hợp hai nguyên lý nhận biết độc lập: ảnh (AI) xác định đúng loại dụng cụ hoặc pin, khối lượng (load cell) xác định đủ phụ kiện với dụng cụ và đếm số lượng cell với pin 18650 (tương tự nguyên lý SmartBin / Instant Systems), có lót xốp cắt hình để cố định vị trí dụng cụ và khay nhựa chia ngăn cho từng cell pin. Cách kết hợp này vừa tham khảo mô hình cho mượn phụ kiện thiết yếu tại các thư viện đại học như Manitoba (cáp sạc, củ sạc, máy tính cầm tay), UC Riverside (máy tính cầm tay), vừa khắc phục hạn chế của hệ thống chỉ dùng cân hoặc chỉ dùng ảnh, với chi phí linh kiện khoảng ${costWithoutPiMil} triệu đồng (chưa tính Pi 4).`));

P.push(h2("1.3. Yêu cầu hệ thống"));
P.push(...numList([
  "Định danh người dùng bằng thẻ 13,56 MHz; quyết định cấp quyền và kiểm soát hạn mức tập trung tại gateway.",
  "Xác minh khi trả bằng hai điều kiện đồng thời: đúng loại (AI 6 lớp) và đủ khối lượng (load cell); với pin 18650, đếm số lượng cell bằng cân và từ chối nếu để lẫn pin với dụng cụ.",
  "Quản lý mượn – trả pin 18650 theo số lượng (tối đa 4 cell/người, hộc tối đa 8 cell), theo dõi nợ pin và cảnh báo sắp hết khi còn ≤ 2 cell.",
  "Truyền dữ liệu hai chiều giữa node và gateway, không mất và không trùng sự kiện khi mạng chập chờn.",
  "Xử lý ảnh tại biên (Pi 4), ảnh không rời khỏi mạng nội bộ.",
  "Cung cấp trạng thái tức thời cho ứng dụng web và gửi thông báo ra Internet.",
  "Ghi nhận tình trạng dụng cụ: người trả báo hỏng tại quầy, dụng cụ bị khóa chờ người quản lý kiểm tra.",
  "Hoạt động độc lập với hạ tầng mạng của trường: node và gateway dùng mạng Wi-Fi riêng do Pi 4 phát.",
]));

// ================= 2
P.push(h1("2. Chức năng và yêu cầu kỹ thuật"));
P.push(h2("2.1. Chức năng hệ thống"));
P.push(tcap("Bảng 2. Chức năng và phần cứng/giao thức thực hiện"));
P.push(table([2100, 2700, 2400, 2200],
  ["Chức năng", "Phần cứng thực hiện", "Giao tiếp / giao thức", "Xử lý tại"],
  [
    ["F1. Định danh thẻ", "MFRC522 + anten 13,56 MHz", "ISO/IEC 14443A; SPI tới ESP32-A", "ESP32-A đọc UID; Pi 4 cấp quyền"],
    ["F2. Đo khối lượng khay, 2 ngăn và hộc pin", "4 × load cell 1 kg + HX711", "Nối tiếp 2 dây, 24 bit", "ESP32 lọc, phát hiện ổn định"],
    ["F3. Nhận diện dụng cụ và pin", "Camera OV5647 5 MP + Pi 4 (Cortex-A72)", "MIPI CSI-2", "Pi 4 (TFLite INT8, 6 lớp)"],
    ["F4. Khóa / mở ngăn và hộc pin", "3 × servo SG90", "PWM 50 Hz (LEDC)", "ESP32-B theo lệnh Pi"],
    ["F5. Báo hiệu tại chỗ", "LCD 16 × 2 HD44780 + PCF8574, còi active, LED đỏ/xanh 3 ngăn/hộc", "I2C; GPIO", "ESP32-A/B"],
    ["F6. Truyền dữ liệu node – gateway", "Wi-Fi ESP32; Pi 4 phát Wi-Fi (AP)", "802.11n 2,4 GHz, TCP, MQTT 3.1.1", "Mosquitto trên Pi 4"],
    ["F7. Lưu trữ, giao diện, thông báo", "Pi 4 + thẻ nhớ", "SQLite; HTTP/WebSocket; HTTPS", "Backend Python trên Pi 4"],
    ["F8. Báo hỏng dụng cụ", "Nút nhấn tại quầy; web quản lý", "GPIO ngắt cạnh xuống; MQTT", "Pi 4 khóa dụng cụ, báo Telegram"],
    ["F9. Giám sát môi trường tủ", "Cảm biến DHT22", "Giao thức 1 dây (1-Wire); GPIO 17", "ESP32-B đọc mỗi 2 s; Pi 4 cảnh báo"],
    ["F10. Mượn trả vật tư đếm số lượng (pin 18650)", "Load cell hộc pin + khay trả, servo #3, LED hộc pin", "MQTT QoS 1 (slot 3 kèm n); AI lớp thứ 6", "ESP32-B cân hộc; Pi 4 đếm cell, kiểm hạn mức/nợ"],
  ]));
P.push(gap());

P.push(h2("2.2. Yêu cầu kỹ thuật"));
P.push(
  bl([B("Thu thập dữ liệu: "), run("HX711 chạy 10 SPS (chân RATE = 0) cho nhiễu thấp hơn chế độ 80 SPS; RFID hỏi thẻ chu kì 100 ms; camera chỉ chụp khi cân khay báo có vật.")]),
  bl([B("Truyền dữ liệu: "), run("MQTT QoS 1 cho mọi sự kiện và lệnh; mã sự kiện eid để loại trùng; retained message cho trạng thái từng ngăn/hộc pin và trạng thái node; Last Will và keepalive 30 s để phát hiện node mất kết nối. Mạng: Pi 4 tự phát Wi-Fi 2,4 GHz WPA2-PSK (hostapd, dnsmasq cấp IP, Pi có IP cố định 192.168.4.1) vì Wi-Fi của trường thường yêu cầu đăng nhập qua trang web hoặc dùng WPA2-Enterprise, ESP32 khó kết nối; Internet cho Telegram/Email lấy qua điện thoại chia sẻ mạng qua USB.")]),
  bl([B("Lưu trữ thông tin: "), run("SQLite (chế độ WAL) cho người dùng, dụng cụ, tồn kho/nợ pin, giao dịch, sự kiện đã xử lý; ảnh JPEG khoảng 80 KB/lần trả, chỉ lưu vùng khay đã cắt (không lưu toàn khung hình để tránh ghi lại mặt người dùng), giữ 30 ngày; trên ESP32 lưu hệ số hiệu chuẩn cân và bộ đếm eid trong NVS (flash).")]),
  bl([B("Xử lý thông tin: "), run("ESP32 chỉ xử lý tín hiệu cấp thấp (lọc cân, đọc cảm biến, phát xung, ước lượng n cho slot 3); mọi quyết định nghiệp vụ, quy tắc đếm/dung sai pin và suy luận AI 6 lớp tập trung tại Pi 4.")]),
  bl([B("Tối ưu tài nguyên: "), run("lượng tử hóa mô hình INT8; suy luận theo sự kiện; ESP32 dùng bộ đệm tĩnh, không cấp phát động khi chạy; chỉ publish khi khối lượng thay đổi vượt ngưỡng 1 g (deadband); 3 servo mở tuần tự để giới hạn dòng đỉnh.")]),
  bl([B("Chống nhiễu và quy tắc đếm pin: "), run("cân: dây ngắn xoắn đôi, lọc trung vị 5 mẫu + trung bình trượt; bù trôi điểm 0: khi ngăn hoặc hộc pin đang khóa, không có giao dịch và khối lượng ổn định, so giá trị đo với tổng khối lượng chuẩn của các dụng cụ hoặc n·m_unit cell pin đang lưu để hiệu chỉnh offset (ngăn/hộc ít khi trống hoàn toàn nên không thể chỉ đặt lại điểm 0 khi trống); chống quá tải: ốc chặn dưới tấm đế cách 1 mm giới hạn độ võng thanh cân khi vật bị làm rơi; servo dùng đường 5 V có tụ 1000 µF, mass chung hình sao; I2C có điện trở kéo lên 4,7 kΩ và mạch chuyển mức 3,3 V ↔ 5 V; ảnh dùng đèn khay cố định và nền một màu. Với pin 18650 (m_unit ≈ 46,0 g hiệu chuẩn từ trung bình 10 cell mẫu), số pin tính bằng n = làm tròn(|Δm| / m_unit) và chỉ chấp nhận khi |Δm − n·m_unit| ≤ 2 g + 1,5 g × n; ngoài khoảng này báo lỗi “khối lượng pin bất thường” cho quản lý và không ghi nhận.")]),
);

P.push(h2("2.3. Thông số kỹ thuật thiết kế (mục tiêu)"));
P.push(tcap("Bảng 3. Thông số thiết kế – sẽ đo lại khi đánh giá"));
P.push(table([3800, 3100, 2500],
  ["Thông số", "Giá trị mục tiêu", "Căn cứ"],
  [
    ["Số ngăn / đối tượng / số lớp nhận diện", "2 ngăn dụng cụ + 1 hộc pin / 4 dụng cụ + pin 18650 / 6 lớp", "Mỗi ngăn 2 dụng cụ khác khối lượng; hộc pin tối đa 8 cell; lớp 5 là “pin 18650”, lớp 6 là “khay trống / vật lạ”"],
    ["Dải đo khối lượng (khay, từng ngăn/hộc)", "0 – 1000 g", "Bộ tua vít khoảng 200–250 g; 8 cell pin ≈ 368 g; mỗi ngăn/hộc dưới 500 g"],
    ["Độ phân giải / sai số cân", "≤ 1 g / ≤ ±2 g", "Phân biệt nhíp (≈ 15–20 g) và đếm cell pin 18650 (≈ 46,0 g)"],
    ["Dung sai khối lượng khi trả dụng cụ", "± min(10 g; ½ phụ kiện nhẹ nhất)", "Bộ tua vít thiếu 1 cây (≈ 20 g) → dung sai ±8 g, gấp 4 lần sai số cân"],
    ["Đếm pin 18650", "Đúng 100 % với 1–4 cell; dung sai 2 g + 1,5 g × n; hạn mức 4 cell/người; tối đa 8 cell trong hộc", "m_unit ≈ 46,0 g (±1,5 g/cell) ≫ sai số cân ±2 g; cảnh báo sắp hết khi còn ≤ 2 cell"],
    ["Thời gian cân ổn định", "≤ 1 s", "10 SPS, cửa sổ 10 mẫu"],
    ["Độ chính xác nhận diện", "≥ 90 %", "Tập kiểm thử riêng (6 lớp)"],
    ["Thời gian suy luận trên Pi 4", "≤ 0,5 s", "Ảnh đầu vào 320 × 320"],
    ["Độ trễ quẹt thẻ → mở ngăn/hộc", "≤ 2 s", "Xem Bảng 10"],
    ["Độ trễ đặt đồ lên khay → mở ngăn/hộc", "≤ 3 s", "Xem Bảng 10"],
    ["Khoảng cách đọc thẻ", "≤ 5 cm", "Anten RC522"],
    ["Phát hiện node mất kết nối", "≤ 60 s", "Keepalive 30 s (broker ngắt sau 1,5 × keepalive)"],
    ["Nguồn / công suất trung bình", "5 V / dưới 10 W", "Xem Bảng 15"],
  ]));
P.push(gap());

P.push(h2("2.4. Lựa chọn linh kiện theo thông số"));
P.push(tcap("Bảng 4. So sánh phương án và lựa chọn"));
P.push(table([1700, 3200, 4500],
  ["Khối", "Phương án", "Lựa chọn và lý do kỹ thuật"],
  [
    ["Cân", "Load cell 1 kg; 5 kg", "1 kg: cùng ADC 24 bit nhưng dải nhỏ cho độ phân giải theo gam tốt hơn 5 lần; HX711 tích hợp khuếch đại lập trình được (gain 128) và nguồn kích cầu"],
    ["Cân đếm vật tư", "Đếm bằng load cell: pin 18650 (≈ 46,0 g) so với linh kiện nhỏ như ốc vít M3 (≈ 0,5 g)", "Pin 18650 có mạch bảo vệ nặng ~46,0 g (±1,5 g), lớn gấp ~23 lần sai số cân (±2 g). Với 1–4 cell, khoảng hợp lệ n·46 ± (2 + 1,5·n) g hoàn toàn tách rời (1 cell: 42,5–49,5 g; 2 cell: 87,0–97,0 g; khoảng trống ≥ 37 g), đếm chính xác từng viên. Ngược lại, ốc vít M3 (~0,5 g) nhỏ hơn sai số cân (±2 g) nên không phân biệt được từng con và sai số tích lũy làm chồng lấn khoảng đếm"],
    ["Định danh", "RC522 (13,56 MHz); RDM6300 (125 kHz); PN532", "RC522: SPI tốc độ tới 10 Mbit/s, đọc thẻ MIFARE. Nếu thẻ sinh viên dùng 125 kHz thì đổi sang RDM6300 (UART)"],
    ["Camera", "Camera v2 IMX219 8 MP; OV5647 5 MP (CSI-2); webcam USB (UVC)", "OV5647: giá khoảng 1/3 IMX219, mô hình chỉ cần ảnh 320 × 320 px nên độ phân giải 5 MP là dư; CSI-2 không chiếm băng thông USB và CPU giải mã MJPEG như webcam"],
    ["Hiển thị", "OLED 0,96\" (SSD1306); LCD 16 × 2; LCD 20 × 4", "LCD 16 × 2 qua PCF8574: 2 dòng đủ hiện tên người dùng và một thông báo ngắn (dụng cụ/pin, lý do từ chối), chỉ tốn 2 chân I2C, rẻ hơn LCD 20 × 4 khoảng 40 %; chi tiết (hạn trả, lịch sử, chọn số pin) xem trên web"],
    ["Báo ngăn", "LED RGB WS2812; LED đơn đỏ/xanh", "LED đơn: mỗi ngăn dụng cụ và hộc pin 1 đỏ (khóa) + 1 xanh (mở) điều khiển trực tiếp bằng GPIO qua điện trở 330 Ω, không cần IC chuyển mức như WS2812; với 2 ngăn + 1 hộc pin tốn 6 chân"],
    ["Cơ cấu khóa", "Servo SG90; solenoid 12 V", "SG90: điều khiển trực tiếp bằng PWM, dùng chung nguồn 5 V; bản thực tế dùng solenoid + MOSFET"],
    ["Mạng", "Wi-Fi của trường; router riêng; Pi 4 phát Wi-Fi (AP)", "Pi 4 làm AP: không phụ thuộc mạng trường, không tốn tiền router, IP broker cố định; Pi 4 ra Internet qua điện thoại chia sẻ mạng USB (usb0); mặc định không bật NAT (xem mục 6.1)"],
    ["Nhận diện vật phẩm & vật lạ", "4 lớp dụng cụ; mở rộng thành 6 lớp (thêm “pin 18650” và “khay trống / vật lạ”)", "Bộ phân lớp softmax luôn chọn một trong các lớp đã học, nên vật lạ (điện thoại, ví) có thể bị gán nhầm. Mô hình 6 lớp tách riêng 4 dụng cụ, lớp “pin 18650” (để xác nhận khi trả pin và từ chối nếu lẫn dụng cụ) và lớp “khay trống / vật lạ”"],
    ["Xử lý trung tâm", "Pi 3B+ (1 GB); Pi 4 (4 GB)", "Pi 4: 4 nhân Cortex-A72, 4 GB RAM, đủ chạy đồng thời broker, backend, CSDL và mô hình AI"],
  ]));
P.push(gap());

// ================= 3
P.push(h1("3. Sơ đồ khối"));
P.push(p("Hệ thống tổ chức theo ba tầng kiến trúc IoT (Hình 1) và gồm 12 khối chức năng (Hình 2): nguồn; xử lý trung tâm + truyền thông (Pi 4); thu ảnh; ứng dụng; hai khối điều khiển node (ESP32-A, ESP32-B); nhận dạng; cân khay; hiển thị & báo; đo khối lượng ngăn/hộc; chấp hành; báo ngăn & môi trường."));
P.push(...img("kientruc2.png", 600, 395, "Hình 1. Kiến trúc hệ thống ba tầng"));
P.push(...img("khoi_phancung.png", 620, 310, "Hình 2. Sơ đồ khối phần cứng"));
P.push(p([B("Bố trí vật lý và vị trí camera. "), run("Quầy trả (Node A) và tủ gồm 2 ngăn dụng cụ + 1 hộc pin (Node B) được ghép thành một khối: khay trả đặt sát mặt trước tủ; hộc pin là ngăn 3 có cửa riêng, làm bằng vật liệu không dẫn điện (Formex) và lót khay nhựa chia từng cell. Raspberry Pi 4, camera và đèn khay gắn trên một tay đỡ bắt vào thân tủ, camera hướng thẳng xuống khay ở độ cao cố định. Toàn hệ thống chỉ dùng một camera, nối vào cổng CSI duy nhất của Pi 4; do Pi đặt ngay cạnh camera nên dùng được cáp CSI ngắn đi kèm. Việc chụp ảnh không cần người dùng bấm nút: load cell dưới khay là tín hiệu kích hoạt, khi khối lượng trên khay vượt 5 g và ổn định thì Pi 4 tự bật đèn, chụp và suy luận.")]));
P.push(p("Camera đặt tại khay trả thay vì bên trong từng ngăn vì ba lý do:"));
P.push(
  bl([B("Kiểm tra trước khi cất: "), run("dụng cụ và pin được xác minh khi còn trên khay, trả sai hoặc để lẫn pin với dụng cụ thì ngăn/hộc không mở. Camera trong ngăn chỉ phát hiện được sau khi vật đã vào tủ.")]),
  bl([B("Một camera cho mọi ngăn: "), run("Pi 4 chỉ có một cổng CSI; đặt camera trong từng ngăn cần thêm camera USB và tăng chi phí theo số ngăn.")]),
  bl([B("Điều kiện chụp ổn định: "), run("trên khay có đèn cố định, nền xốp một màu, dụng cụ và cell pin nằm phẳng không bị che; trong ngăn kín ánh sáng thay đổi khi đóng mở nắp và các vật dễ che khuất nhau.")]),
);
P.push(p([B("Dùng hai ESP32 dù quầy và tủ ghép chung một khối. "), run("Về số chân, Node A dùng 12 chân (Bảng 5) và Node B dùng 16 chân (Bảng 6), tổng 28 chân – vượt quá số GPIO sử dụng an toàn của một board ESP32 DevKit 30 chân nếu không dùng thêm IC mở rộng cổng. Tách làm hai node còn vì tủ là module mở rộng: thêm tủ chỉ cần thêm một Node B với firmware giống hệt (chỉ đổi tên node trong topic), không phải sửa Node A hay backend. Đây cũng là lý do dùng MQTT theo mô hình publish/subscribe thay vì nối trực tiếp.")]));

// ================= 4
P.push(h1("4. Sơ đồ nguyên lý (sơ bộ)"));
P.push(p("Các bảng sau là cơ sở để vẽ sơ đồ nguyên lý chi tiết bằng KiCad. Mỗi node được lắp trên một tấm PCB đục lỗ phủ đồng 9 × 15 cm: bố trí linh kiện theo lưới 2,54 mm trong trình soạn PCB của KiCad (vẽ đường nối như vết đồng để kiểm tra bằng DRC), sau đó hàn dây theo bản bố trí; các module (ESP32, HX711, RC522) cắm qua hàng rào cái để thay thế được. Không dùng chân nối flash (GPIO 6–11), hạn chế chân strapping (GPIO 0, 2, 5, 12, 15; GPIO 5 chỉ dùng làm SS của RC522 vì SS ở mức cao khi khởi động, đúng mức strapping yêu cầu); DOUT của HX711 dùng các chân chỉ vào (34–39) vì đó là ngõ ra đẩy-kéo của HX711. Module HX711 được cấp 3,3 V (không cấp 5 V) để mức logic DOUT không vượt quá 3,3 V của ESP32."));
P.push(tcap("Bảng 5. Phân bố chân ESP32-A (kiosk và khay trả)"));
P.push(table([2900, 2700, 3800],
  ["Linh kiện", "Chân ESP32", "Ghi chú"],
  [
    ["MFRC522 (VSPI)", "SCK 18, MISO 19, MOSI 23, SS 5, RST 27", "3,3 V; SPI mode 0, 4 MHz"],
    ["LCD 16 × 2 + PCF8574 (I2C)", "SDA 21, SCL 22", "5 V, qua mạch chuyển mức BSS138"],
    ["HX711 khay", "DOUT 34, SCK 32", "Cấp 3,3 V; load cell 1 kg dưới khay"],
    ["Còi active 5 V", "GPIO 25", "Transistor S8050, điện trở nền 1 kΩ; chỉ bật/tắt (còi có mạch dao động sẵn)"],
    ["Nút báo hỏng", "GPIO 33", "Kéo lên nội; ngắt cạnh xuống, chống dội 50 ms bằng phần mềm"],
    ["Đèn khay (6 LED trắng 5 mm, 5 V)", "GPIO 26", "MOSFET IRLZ44N, điện trở cổng 330 Ω, kéo xuống 10 kΩ; mỗi LED nối tiếp 100 Ω (≈ 19 mA)"],
  ]));
P.push(gap());
P.push(tcap("Bảng 6. Phân bố chân ESP32-B (tủ 2 ngăn + hộc pin)"));
P.push(table([2900, 2700, 3800],
  ["Linh kiện", "Chân ESP32", "Ghi chú"],
  [
    ["HX711 #1, #2, #3 (DOUT)", "34, 35, 36", "Chân chỉ vào (GPIO 36 cho hộc pin); HX711 cấp 3,3 V"],
    ["HX711 #1, #2, #3 (SCK)", "32, 33, 21", "Ngõ ra số (GPIO 21 cho hộc pin; Node B không dùng I2C)"],
    ["Servo SG90 #1, #2, #3", "13, 16, 18", "LEDC 50 Hz, 16 bit (GPIO 18 cho hộc pin); nguồn 5 V riêng"],
    ["LED ngăn 1 (đỏ, xanh)", "GPIO 25, 26", "Điện trở 330 Ω, dòng khoảng 4 mA"],
    ["LED ngăn 2 (đỏ, xanh)", "GPIO 27, 4", "Điện trở 330 Ω"],
    ["LED hộc pin (đỏ, xanh)", "GPIO 19, 23", "Điện trở 330 Ω (đỏ GPIO 19, xanh GPIO 23)"],
    ["Cảm biến DHT22", "GPIO 17", "Giao thức 1 dây, điện trở kéo lên 10 kΩ, cấp 3,3 V"],
  ]));
P.push(gap());
P.push(tcap("Bảng 7. Thông số các giao tiếp"));
P.push(table([2600, 2300, 1700, 2800],
  ["Liên kết", "Giao tiếp vật lý", "Tốc độ", "Đơn vị dữ liệu"],
  [
    ["ESP32-A ↔ MFRC522", "SPI 4 dây, 3,3 V", "4 MHz", "Lệnh/thanh ghi, FIFO 64 byte"],
    ["MFRC522 ↔ thẻ", "Cảm ứng 13,56 MHz", "106 kbit/s", "Khung ISO/IEC 14443A"],
    ["ESP32-A ↔ LCD (PCF8574)", "I2C 2 dây, kéo lên 4,7 kΩ", "100 kHz", "Byte + ACK, địa chỉ 0x27"],
    ["ESP32 ↔ HX711", "DOUT + SCK", "10 mẫu/s", "24 bit bù 2"],
    ["ESP32-B → servo", "PWM", "50 Hz", "Độ rộng xung 1 – 2 ms"],
    ["Camera → Pi 4", "MIPI CSI-2, 2 làn", "—", "Khung ảnh 640 × 480"],
    ["ESP32 ↔ Pi 4", "Wi-Fi 802.11n 2,4 GHz, WPA2", "—", "Gói MQTT trên TCP"],
  ]));
P.push(gap());
P.push(p([B("Nguồn và bảo vệ: "), run("Pi 4 dùng adapter USB-C 5,1 V – 3 A riêng. ESP32-A và ESP32-B dùng adapter 5 V – 3 A, lấy 3,3 V qua LDO trên board. Đường 5 V của servo có tụ 1000 µF đặt gần tải, polyfuse đầu vào, mass nối chung một điểm với ESP32.")]));

// ================= 5
P.push(h1("5. Nguyên lý hoạt động"));
P.push(h2("5.1. Phân chia xử lý trên từng chip"));
P.push(tcap("Bảng 8. Phần mềm chạy trên từng thiết bị"));
P.push(table([1700, 7700],
  ["Thiết bị", "Thành phần phần mềm"],
  [
    ["ESP32-A", "FreeRTOS. Nhân 0: ngăn xếp Wi-Fi + client esp-mqtt. Nhân 1: tác vụ RFID (chu kì 100 ms), tác vụ cân khay (10 SPS), tác vụ hiển thị (nhận lệnh qua hàng đợi). NVS lưu bộ đếm eid và hệ số cân. Watchdog tác vụ bật."],
    ["ESP32-B", "FreeRTOS. Nhân 0: Wi-Fi + MQTT. Nhân 1: tác vụ đọc tuần tự 3 HX711 (2 ngăn dụng cụ + hộc pin) và DHT22; tác vụ chấp hành nhận lệnh qua hàng đợi, mở tuần tự 3 servo, bật/tắt LED 3 ngăn/hộc bằng GPIO."],
    ["Pi 4", "Raspberry Pi OS 64-bit; hostapd (Wi-Fi AP), dnsmasq (DHCP/DNS), chrony + fake-hwclock (giờ), ufw (tường lửa); Mosquitto (broker MQTT + ACL, systemd); backend Python: paho-mqtt, FastAPI/uvicorn (HTTP + WebSocket, systemd), SQLite (WAL); dịch vụ AI: Picamera2 + tflite-runtime (6 lớp); bộ lập lịch gửi thông báo, sao lưu USB (02:00) và dọn ảnh 30 ngày."],
  ]));
P.push(gap());

P.push(h2("5.2. Đặc tả bản tin MQTT"));
P.push(tcap("Bảng 9. Chủ đề, chiều truyền và nội dung bản tin (JSON)"));
P.push(table([2500, 1100, 1200, 4600],
  ["Topic", "Chiều", "QoS / Retain", "Ví dụ payload"],
  [
    ["lab/kioskA/card", "A → Pi", "1 / không", "{\"eid\":\"A-1024\",\"uid\":\"04A1B2C3\"}"],
    ["lab/kioskA/tray", "A → Pi", "1 / không", "{\"eid\":\"A-1025\",\"m\":352.4,\"stable\":true}"],
    ["lab/kioskA/button", "A → Pi", "1 / không", "{\"eid\":\"A-1026\",\"btn\":\"fault\"}"],
    ["lab/kioskA/cmd", "Pi → A", "1 / không", "{\"cid\":\"C-88\",\"lcd\":[\"Dat dung cu\",\"len khay\"],\"lamp\":1}\n(chế độ đăng ký thẻ thêm \"mode\":\"enroll\")"],
    ["lab/cabB/cmd", "Pi → B", "1 / không", "{\"cid\":\"C-89\",\"slot\":2,\"action\":\"unlock\"}\n(slot ∈ {1, 2, 3}; slot 3 là hộc pin)"],
    ["lab/cabB/ack", "B → Pi", "1 / không", "{\"cid\":\"C-89\",\"ok\":true}"],
    ["lab/cabB/slot/{k}/state", "B → Pi", "1 / có", "{\"eid\":\"B-311\",\"g\":352.1,\"stable\":true,\"lock\":\"open\"}\n{\"eid\":\"B-312\",\"g\":276.0,\"stable\":true,\"lock\":\"locked\",\"n\":6}"],
    ["lab/cabB/env", "B → Pi", "1 / không", "{\"eid\":\"B-400\",\"t\":29.4,\"rh\":72.5}"],
    ["lab/{node}/status", "node → Pi", "1 / có", "\"online\" | \"offline\" (Last Will)"],
    ["lab/{node}/ota", "Pi → node", "1 / không", "{\"version\":\"0.3.2\",\"url\":\"…\",\"sha256\":\"…\"}"],
  ], [1, 2], [0, 3]));
P.push(p([I("Ghi chú: "), run("trong chủ đề lab/cabB/slot/{k}/state, k ∈ {1, 2, 3} (1, 2 là ngăn dụng cụ; 3 là hộc pin). Riêng slot 3 có thêm trường n biểu thị số cell pin 18650 ước lượng trong hộc.")], { spacing: { before: 40, after: 80 } }));

P.push(h2("5.3. Luồng tín hiệu khi quẹt thẻ"));
P.push(...numList([
  "Tác vụ RFID trên ESP32-A, mỗi 100 ms, ghi lệnh vào thanh ghi MFRC522 qua SPI (VSPI, mode 0, 4 MHz) để phát lệnh REQA. MFRC522 điều chế sóng mang 13,56 MHz qua anten; thẻ trong vùng khoảng 5 cm được cấp năng lượng cảm ứng và trả về ATQA.",
  "MFRC522 thực hiện chống va chạm (anticollision) và SELECT theo ISO/IEC 14443A, nhận UID (4 hoặc 7 byte) và SAK vào FIFO; ESP32-A đọc FIFO qua SPI.",
  "Firmware bỏ qua UID trùng trong 2 s, tạo bản tin JSON gồm eid (tên node + bộ đếm trong NVS) và UID.",
  "Client esp-mqtt đóng gói PUBLISH QoS 1 (có packet identifier), gửi qua TCP (lwIP) → Wi-Fi 802.11n → điểm truy cập → Pi 4, cổng 1883.",
  "Mosquitto trả PUBACK cho ESP32-A (nếu không nhận được PUBACK, ESP32-A gửi lại với cờ DUP) rồi chuyển bản tin tới backend đã subscribe lab/+/card.",
  "Backend kiểm tra eid trong bảng sự kiện đã xử lý (loại trùng), tra bảng người dùng theo UID trong SQLite, quyết định quyền và publish lệnh lab/kioskA/cmd.",
  "ESP32-A nhận lệnh: ghi LCD qua I2C 100 kHz tới PCF8574 (0x27), PCF8574 điều khiển HD44780 ở chế độ 4 bit; GPIO 25 lên mức cao 100 ms để S8050 dẫn, còi active kêu.",
]));

P.push(h2("5.4. Luồng tín hiệu khi mượn dụng cụ"));
P.push(...numList([
  "Backend xác định ngăn k (1 hoặc 2) chứa dụng cụ được chọn, publish lab/cabB/cmd {slot: k, action: unlock} QoS 1.",
  "ESP32-B đưa lệnh vào hàng đợi; tác vụ chấp hành đổi độ rộng xung kênh LEDC k (50 Hz) từ khoảng 1 ms sang khoảng 2 ms để servo quay mở chốt; ghi mức GPIO để tắt LED đỏ, bật LED xanh của ngăn k; publish ack.",
  "Tác vụ cân chờ chân DOUT của HX711 xuống mức thấp (có mẫu mới, 10 SPS), phát 25 xung SCK để đọc 24 bit bù 2 kênh A, gain 128. Ngắt được tạm khóa trong lúc phát xung vì xung SCK ở mức cao quá 60 µs sẽ đưa HX711 vào chế độ nghỉ.",
  "Khối lượng m = (giá trị thô − offset) / hệ số hiệu chuẩn; lọc trung vị 5 mẫu và trung bình trượt; coi là ổn định khi dao động dưới 1 g trong 1 s.",
  "Khi m giảm đúng khối lượng chuẩn của dụng cụ (trong dung sai ở Bảng 3), ESP32-B publish (hai dụng cụ trong cùng ngăn có khối lượng khác nhau nên lượng giảm cho biết món nào được lấy) lab/cabB/slot/k/state (retained). Backend ghi giao dịch “đang mượn” vào SQLite, gửi lệnh lock (servo về 1 ms), đẩy cập nhật lên web qua WebSocket. Nếu sau 30 s không có thay đổi khối lượng, ngăn được khóa lại và lệnh mượn bị hủy.",
]));

P.push(h2("5.4b. Luồng tín hiệu khi mượn pin 18650 (theo số lượng)"));
P.push(...numList([
  "Sinh viên quẹt thẻ RFID tại quầy và chọn “Pin 18650” cùng số lượng dự kiến (1–4 cell) trên trang web sinh viên (hoặc màn hình kiosk).",
  "Backend kiểm tra hạn mức đang giữ (tối đa 4 cell/người) và tồn kho trong hộc (tối đa 8 cell); hợp lệ thì publish lab/cabB/cmd {slot: 3, action: unlock} QoS 1.",
  "ESP32-B mở chốt servo #3 (GPIO 18), chuyển LED hộc pin sang xanh (GPIO 23, tắt đỏ GPIO 19) và đọc HX711 #3 (DOUT GPIO 36, SCK GPIO 21) chờ khối lượng hộc ổn định.",
  "Khi khối lượng giảm |Δm|, hệ thống tính n = làm tròn(|Δm| / m_unit) và kiểm tra |Δm − n·m_unit| ≤ 2 g + 1,5 g × n. Nếu ngoài khoảng dung sai này, hệ thống báo lỗi “khối lượng pin bất thường” cho người quản lý và không ghi nhận tự động.",
  "Nếu n hợp lệ và n ≤ hạn mức còn lại: backend ghi giao dịch “mượn n pin”, gửi lệnh lock (khóa servo #3, bật LED đỏ GPIO 19), cập nhật tồn kho (cảnh báo “sắp hết” nếu còn ≤ 2 cell). Nếu n lớn hơn hạn mức cho phép: hệ thống ghi nhận đúng số pin thực tế đã lấy và gửi cảnh báo cho quản lý. Quá 30 s không đổi khối lượng thì khóa hộc lại và hủy lệnh.",
]));

P.push(h2("5.5. Luồng tín hiệu khi trả và xử lý Edge AI"));
P.push(p("Hình 3 mô tả toàn bộ chuỗi bản tin giữa các thiết bị khi sinh viên trả dụng cụ (luồng trả pin cũng đi qua khay trả A và camera, sau đó mở hộc pin ở slot 3)."));
P.push(...img("seq_tra.png", 600, 414, "Hình 3. Sơ đồ tuần tự luồng trả dụng cụ"));
P.push(...numList([
  [B("Phát hiện vật trên khay: "), run("tác vụ cân khay trên ESP32-A đọc HX711 (25 xung SCK, 24 bit), lọc như mục 5.4; khi khối lượng > 5 g và dao động dưới 1 g trong 1 s thì publish lab/kioskA/tray {m, stable} QoS 1. Ngưỡng 5 g loại các rung động khi chạm tay vào khay.")],
  [B("Thu ảnh: "), run("backend gửi lệnh bật đèn khay (ESP32-A → GPIO 26 → MOSFET), dùng Picamera2 (libcamera) chụp một khung 640 × 480 qua MIPI CSI-2.")],
  [B("Suy luận (6 lớp): "), run("cắt vùng khay, đổi kích thước về 320 × 320, chuẩn hóa; tflite-runtime (bộ tăng tốc XNNPACK, 4 nhân Cortex-A72) chạy mô hình INT8, xuất vectơ xác suất 6 lớp (kìm cắt, kìm tuốt dây, bộ tua vít, nhíp, pin 18650, khay trống / vật lạ); lấy lớp có xác suất lớn nhất và độ tin cậy. Ảnh được lưu JPEG kèm eid.")],
  [B("Quyết định với dụng cụ: "), run("mỗi lần trả chỉ đặt một loại vật phẩm lên khay; nếu AI hoặc kiểm tra ảnh phát hiện cả pin lẫn dụng cụ thì từ chối ngay. Với dụng cụ, chỉ mở ngăn 1 hoặc 2 khi đồng thời: lớp nhận diện trùng dụng cụ người đó đang mượn, độ tin cậy ≥ 0,8, m khớp khối lượng chuẩn trong dung sai riêng của dụng cụ (Bảng 3). Lớp “khay trống / vật lạ” hoặc không đạt bất kỳ điều kiện nào: gửi lệnh LCD nêu lý do và bật còi, ngăn không mở.")],
  [B("Quyết định và cất khi trả pin 18650: "), run("khi AI xác nhận lớp “pin 18650” (độ tin cậy ≥ 0,8), hệ thống tính số cell đặt trên khay n = làm tròn(m / m_unit) và kiểm tra |m − n·m_unit| ≤ 2 g + 1,5 g × n (ngoài khoảng thì báo lỗi “khối lượng pin bất thường” cho quản lý). Backend đối chiếu n với số pin sinh viên đang nợ; hợp lệ thì mở hộc pin (slot 3), chờ cân HX711 #3 của hộc tăng ≈ n·m_unit rồi đóng giao dịch, khóa hộc và cập nhật tồn kho. Nếu trả thiếu so với số đang nợ thì ghi “còn nợ k pin” và gửi cảnh báo cho quản lý.")],
  [B("Cất dụng cụ vào ngăn: "), run("thực hiện như bước mở ngăn ở mục 5.4; khi HX711 ngăn k (1 hoặc 2) báo khối lượng tăng đúng khối lượng chuẩn thì backend đóng giao dịch, khóa ngăn, cập nhật web. Nếu khối lượng thiếu (ví dụ bộ tua vít thiếu 1 cây), giao dịch được đánh dấu “thiếu phụ kiện” và báo người quản lý.")],
  [B("Báo hỏng: "), run("trong lúc dụng cụ còn trên khay, nếu sinh viên nhấn nút báo hỏng, ngắt cạnh xuống trên GPIO 33 được chống dội 50 ms rồi ESP32-A publish lab/kioskA/button {btn: fault}. Backend vẫn nhận trả và cất dụng cụ vào ngăn nhưng đặt trạng thái “chờ kiểm tra”: dụng cụ không xuất hiện trong danh sách cho mượn và người quản lý nhận tin Telegram (chỉ gửi văn bản, ảnh xem trên web quản lý để ảnh không rời mạng nội bộ). Sau khi kiểm tra, người quản lý đổi lại trạng thái trên web.")],
]));

P.push(h2("5.6. Luồng thông báo và giao diện"));
P.push(
  bl("Web: FastAPI phục vụ HTTP trong mạng nội bộ; trình duyệt mở kết nối WebSocket, backend đẩy JSON mỗi khi trạng thái ngăn, số pin trong hộc hoặc giao dịch thay đổi (không cần trình duyệt hỏi định kì)."),
  bl("Dashboard quản lý: hiển thị trạng thái online/offline của node, số lượng dụng cụ, ô tồn kho Pin 18650 (đổi cam kèm ▲ và phát cảnh báo khi ≤ 2/8), biểu đồ khối lượng (khay và 2 ngăn), biểu đồ nhiệt độ – độ ẩm (cảnh báo khi vượt 70 %RH chống gỉ dụng cụ thép) và biểu đồ bậc thang số pin trong hộc theo thời gian thực."),
  bl("Telegram: bộ lập lịch quét giao dịch quá hạn mỗi 5 phút, gửi HTTPS POST tới api.telegram.org (phương thức sendMessage) qua TLS trên TCP 443, gửi qua đường Internet của điện thoại chia sẻ mạng USB (usb0), không qua Wi-Fi của Pi; mỗi giao dịch nhắc tối đa 1 lần/ngày; đồng thời gửi cảnh báo pin sắp hết (≤ 2 cell), trả thiếu pin hoặc khối lượng bất thường."),
  bl("Email: SMTP qua STARTTLS cổng 587, dùng cho báo cáo cuối buổi gửi người quản lý."),
);
P.push(p("Hình 4 đến Hình 8 minh họa bản giao diện mẫu (dữ liệu giả lập) cho sinh viên và người quản lý, đã bổ sung tính năng mượn – theo dõi pin 18650."));
P.push(...img("ui_student.png", 460, 434, "Hình 4. Giao diện web mẫu dành cho sinh viên (kèm khối mượn Pin 18650)"));
P.push(...img("ui_manager.png", 560, 350, "Hình 5. Bảng điều khiển người quản lý – tab Tổng quan"));
P.push(...img("ui_manager_sensors.png", 490, 460, "Hình 6. Bảng điều khiển người quản lý – tab Cảm biến (khối lượng, DHT22, số pin)"));
P.push(...img("ui_manager_transactions.png", 560, 350, "Hình 7. Bảng điều khiển người quản lý – tab Giao dịch (dụng cụ và pin 18650)"));
P.push(...img("ui_manager_inventory.png", 560, 350, "Hình 8. Bảng điều khiển người quản lý – tab Kho (2 ngăn dụng cụ + hộc pin)"));

P.push(h2("5.7. Ngân sách thời gian"));
P.push(tcap("Bảng 10. Ước tính độ trễ luồng trả (từ lúc đặt dụng cụ lên khay)"));
P.push(table([5200, 2200, 2000],
  ["Bước", "Thiết bị", "Thời gian ước tính"],
  [
    ["Cân khay ổn định (10 mẫu ở 10 SPS)", "ESP32-A + HX711", "≈ 1 000 ms"],
    ["Publish MQTT trong mạng nội bộ", "ESP32-A → Pi 4", "≈ 10 – 30 ms"],
    ["Bật đèn khay + chụp ảnh", "Pi 4 + camera", "≈ 150 – 250 ms"],
    ["Tiền xử lý + suy luận INT8", "Pi 4", "≤ 500 ms"],
    ["Truy vấn SQLite + publish lệnh unlock", "Pi 4 → ESP32-B", "≈ 20 – 50 ms"],
    ["Servo quay mở chốt", "ESP32-B + SG90", "≈ 200 – 300 ms"],
    ["Tổng", "", "≈ 1,9 – 2,2 s (mục tiêu ≤ 3 s)"],
  ], [2]));
P.push(gap());

P.push(h2("5.8. Xử lý lỗi truyền thông"));
P.push(
  bl("Mỗi ESP32 khai báo Last Will lab/{node}/status = \"offline\" (retained) khi kết nối và publish \"online\" sau khi kết nối thành công. Với keepalive 30 s, broker phát hiện mất kết nối sau tối đa 1,5 × 30 = 45 s."),
  bl("QoS 1 có thể giao một bản tin nhiều lần; backend lưu eid/cid đã xử lý để không ghi trùng giao dịch hay mở ngăn hai lần."),
  bl("Khi node ở trạng thái offline, backend không phát lệnh mở ngăn và hiển thị “Mất kết nối” trên web; ESP32 tự kết nối lại Wi-Fi/MQTT với thời gian chờ tăng dần."),
  bl("Backend khởi động lại (systemd) sẽ đọc lại trạng thái từ SQLite và các bản tin retained, nên không mất trạng thái ngăn."),
  bl("ESP32-B khởi động lại: ngay đầu chương trình, trước khi kết nối Wi-Fi, firmware cấu hình LEDC và đưa cả 3 servo về vị trí khóa, bật cả 3 LED đỏ (giảm giật servo khi vừa cấp nguồn). Sau khi kết nối MQTT, node publish lại trạng thái thật của từng ngăn và hộc pin (slot 1–3) để ghi đè bản tin retained cũ có thể vẫn ghi “open” từ trước khi lỗi."),
  bl("Mất Internet: chỉ Telegram và Email bị ảnh hưởng (bản tin xếp hàng gửi lại sau); mượn – trả vẫn hoạt động vì toàn bộ xử lý nằm trong mạng do Pi 4 phát."),
);

// ================= 6
P.push(h1("6. Hạ tầng mạng, lưu trữ và triển khai"));

P.push(h2("6.1. Sơ đồ mạng và địa chỉ"));
P.push(p("Raspberry Pi 4 chỉ có một bộ thu phát Wi-Fi tích hợp và đóng vai trò điểm truy cập (Access Point – AP) trên giao diện wlan0 bằng dịch vụ hostapd: băng tần 2,4 GHz, kênh 6, SSID TramDungCu, bảo mật WPA2-PSK, dải địa chỉ 192.168.4.0/24 và IP cố định của Pi là 192.168.4.1. Dịch vụ dnsmasq cấp phát DHCP cho các thiết bị khách trong dải 192.168.4.10–192.168.4.50, đồng thời giữ chỗ IP tĩnh theo địa chỉ MAC cho hai node: Node A (192.168.4.11) và Node B (192.168.4.12). Thông số mạng Wi-Fi trên ESP32 được lưu trong phân vùng NVS (nạp qua cổng serial hoặc chế độ cấu hình), tuyệt đối không ghi cứng trong mã nguồn đưa lên GitHub."));
P.push(p("Do wlan0 đã dùng làm AP, đường kết nối Internet (phục vụ Telegram Bot, Email SMTP và đồng bộ giờ NTP) được cấp qua điện thoại bật chia sẻ mạng bằng cáp USB (giao diện usb0) hoặc qua cổng mạng dây eth0. Mặc định hệ thống không bật NAT: điện thoại sinh viên khi nối vào Wi-Fi TramDungCu chỉ truy cập được mạng nội bộ và không có Internet. Đây là điểm hạn chế cần lưu ý vì trên một số máy Android, hệ điều hành có thể báo “không có Internet” và tự động chuyển dữ liệu về 4G, buộc người dùng phải chọn giữ kết nối Wi-Fi bằng tay. Hệ thống có tùy chọn bật NAT (iptables masquerade wlan0 → usb0) nhưng sẽ làm tiêu tốn dung lượng 4G của điện thoại chia sẻ mạng. Lưu ý: hành vi chuyển mạng trên điện thoại thật hiện chưa được kiểm chứng thực tế."));
P.push(...img("so_do_mang.png", 620, 413, "Hình 9. Sơ đồ mạng và kết nối dịch vụ của hệ thống"));
P.push(tcap("Bảng 11. Địa chỉ mạng và dịch vụ của từng thiết bị"));
P.push(table([2100, 2100, 2200, 3000],
  ["Thiết bị", "Giao diện / IP", "Cách cấp địa chỉ", "Dịch vụ / vai trò mạng"],
  [
    ["Raspberry Pi 4", "wlan0: 192.168.4.1/24\nusb0 / eth0: DHCP", "IP tĩnh (wlan0)\nDHCP từ ĐT (usb0)", "AP hostapd, dnsmasq, Mosquitto, FastAPI, AI, chrony, sshd"],
    ["ESP32 Node A", "Wi-Fi 2,4 GHz\n192.168.4.11", "DHCP giữ chỗ theo MAC", "Client MQTT (kioska), tải OTA qua HTTP"],
    ["ESP32 Node B", "Wi-Fi 2,4 GHz\n192.168.4.12", "DHCP giữ chỗ theo MAC", "Client MQTT (cabb), tải OTA qua HTTP"],
    ["Điện thoại sinh viên / Laptop quản lý", "Wi-Fi 2,4 GHz\n192.168.4.10–.50", "DHCP động (dnsmasq)", "Truy cập web (:8000); laptop quản lý thêm SSH (:22); mặc định không có Internet"],
    ["Điện thoại chia sẻ mạng", "USB Tethering (usb0)", "Cổng USB nối Pi 4", "Cung cấp đường ra Internet cho Telegram (:443), Email (:587), NTP (:123)"],
  ], [1]));
P.push(gap());

P.push(h2("6.2. Cổng và dịch vụ trên Pi"));
P.push(p("Backend trên Pi 4 sử dụng FastAPI chạy bằng máy chủ ASGI uvicorn (quản lý qua systemd), đảm nhiệm đồng thời việc phục vụ tệp tĩnh của giao diện web (thư mục web-ui/), cung cấp API REST và kênh WebSocket trên cổng 8000. Bảng 12 liệt kê toàn bộ các cổng và dịch vụ mạng chạy trên Pi 4."));
P.push(tcap("Bảng 12. Cổng mạng và dịch vụ trên Raspberry Pi 4"));
P.push(table([1100, 1300, 2100, 1700, 3200],
  ["Cổng", "Giao thức", "Dịch vụ", "Giao diện", "Mục đích"],
  [
    ["22", "TCP", "sshd", "wlan0", "Quản trị từ xa bằng SSH (chỉ khóa công khai)"],
    ["53", "UDP/TCP", "dnsmasq", "wlan0", "Phân giải tên miền nội bộ tram.local → 192.168.4.1"],
    ["67", "UDP", "dnsmasq", "wlan0", "Cấp phát IP động (DHCP) và giữ chỗ IP theo MAC"],
    ["1883", "TCP", "Mosquitto", "wlan0", "Broker MQTT 3.1.1 cho Node A, Node B và backend"],
    ["8000", "TCP", "FastAPI (uvicorn)", "wlan0", "Phục vụ web tĩnh, REST API, WebSocket và file .bin OTA"],
    ["Đi ra", "TCP/UDP", "Telegram / Email / NTP", "usb0 / eth0", "HTTPS (:443), SMTP STARTTLS (:587), NTP (:123) – không mở cổng chiều vào"],
  ], [0, 1]));
P.push(gap());

P.push(h2("6.3. Cách người dùng truy cập web"));
P.push(p("Sinh viên và người quản lý truy cập giao diện web tại địa chỉ http://tram.local:8000 hoặc http://192.168.4.1:8000; mã QR chứa địa chỉ này được in dán trực tiếp lên mặt tủ để quét nhanh bằng điện thoại. Tên miền tram.local được phân giải trực tiếp bởi dnsmasq thông qua cấu hình address=/tram.local/192.168.4.1 thay vì dùng mDNS/Avahi, nhằm tránh tình trạng nhiều thiết bị Android không phân giải được tên miền .local."));
P.push(p("Trong mạng Wi-Fi kín này, hệ thống chỉ sử dụng HTTP mà không triển khai HTTPS vì ba lý do: (1) chứng chỉ tự ký (self-signed) khiến trình duyệt trên điện thoại hiện cảnh báo bảo mật gây khó khăn cho sinh viên; (2) đây là mạng nội bộ cô lập, không tiếp xúc trực tiếp với Internet công cộng; (3) dữ liệu trao đổi không chứa mật khẩu ngân hàng hay thông tin tài chính nhạy cảm. Giới hạn của lựa chọn này là lưu lượng HTTP/WebSocket không được mã hóa ở tầng ứng dụng (chỉ dựa vào mã hóa WPA2-PSK ở tầng Wi-Fi)."));

P.push(h2("6.4. Xác thực, phân quyền và đăng ký thẻ"));
P.push(p("Hệ thống web áp dụng xác thực theo phiên bằng cookie ngẫu nhiên lưu trạng thái ở backend với thời hạn 8 giờ, phân thành hai vai trò: sinh_vien (chỉ xem và thao tác với dụng cụ, pin của chính mình) và quan_ly (toàn quyền giám sát kho, đăng ký thẻ mới, xác nhận dụng cụ hỏng và tắt hệ thống). Sinh viên đăng nhập bằng MSSV kết hợp mã PIN 6 chữ số (được đặt khi quản lý đăng ký thẻ và lưu trong SQLite dưới dạng băm có muối bằng hàm hashlib.pbkdf2_hmac); người quản lý đăng nhập bằng mật khẩu riêng (Hình 10)."));
P.push(...img("ui_login.png", 540, 338, "Hình 10. Giao diện đăng nhập hệ thống (hai chế độ sinh viên và quản lý)"));
P.push(p("Ở tầng MQTT, Mosquitto tắt chế độ ẩn danh và áp dụng danh sách kiểm soát truy cập (ACL) riêng cho từng tài khoản: tài khoản kioska chỉ được publish vào lab/kioskA/# và subscribe lab/kioskA/cmd, lab/kioskA/ota; tài khoản cabb tương tự với nhánh lab/cabB/#; tài khoản backend có quyền đọc/ghi toàn bộ nhánh lab/#."));
P.push(p([B("Luồng đăng ký thẻ mới: "), run("người quản lý mở trang web quản lý, chọn mục Thiết lập → Đăng ký thẻ mới (Hình 11) và bấm “Bắt đầu”. Backend gửi lệnh kèm trường \"mode\":\"enroll\" qua topic lab/kioskA/cmd để đưa Node A vào chế độ đăng ký (màn hình LCD hiển thị “Quet the moi”). Khi sinh viên quẹt thẻ, UID vẫn đi qua topic lab/kioskA/card như bình thường nhưng backend nhận biết đang ở chế độ đăng ký nên chuyển UID lên giao diện web thay vì cấp quyền mở tủ. Quản lý nhập MSSV, họ tên, đặt PIN 6 số rồi lưu; nếu UID đã tồn tại trong CSDL, hệ thống báo trùng và không ghi đè.")]));
P.push(...img("ui_manager_setup.png", 540, 356, "Hình 11. Bảng điều khiển người quản lý – tab Thiết lập (mạng, đăng ký thẻ, sao lưu, tắt hệ thống)"));

P.push(h2("6.5. Lưu trữ và sao lưu"));
P.push(p("Toàn bộ dữ liệu nghiệp vụ được lưu trong một tệp SQLite duy nhất tại /var/lib/tram/tram.db trên thẻ nhớ microSD của Pi 4, bật chế độ WAL (Write-Ahead Logging), synchronous=FULL và busy_timeout để bảo đảm an toàn ghi khi có truy cập đồng thời từ luồng MQTT và web. Ảnh chụp khi trả dụng cụ (chỉ cắt vùng khay, định dạng JPEG) lưu tại /var/lib/tram/img/, giữ trong 30 ngày và tự động xóa bởi tác vụ định kỳ. Hệ thống không sử dụng cơ sở dữ liệu đám mây."));
P.push(p("Mỗi ngày lúc 02:00, tác vụ cron thực thi lệnh sqlite3 .backup để sao lưu nóng cơ sở dữ liệu ra USB flash gắn trên Pi 4, giữ lại 7 bản gần nhất (phải thực hiện kiểm thử khôi phục từ bản sao lưu ít nhất một lần). Do thẻ nhớ microSD có nguy cơ hỏng hệ thống tệp khi mất điện đột ngột, thiết kế áp dụng ba biện pháp giảm thiểu: (1) trang quản lý có nút “Tắt hệ thống an toàn” để tắt Pi đúng quy trình; (2) hạn chế ghi log dư thừa xuống thẻ nhớ; (3) cân nhắc chuyển hệ điều hành và dữ liệu sang ổ SSD/USB nếu điều kiện phần cứng cho phép."));

P.push(h2("6.6. Thời gian"));
P.push(p("Raspberry Pi 4 không có mạch đồng hồ thời gian thực (RTC) gắn ngoài. Hệ thống dùng dịch vụ chrony để đồng bộ giờ qua NTP khi có kết nối Internet từ điện thoại chia sẻ mạng; trong trường hợp không có Internet, fake-hwclock giữ mốc thời gian gần nhất và trang quản lý cung cấp nút “Lấy giờ từ trình duyệt” để người quản lý đồng bộ giờ cho Pi từ máy tính hoặc điện thoại. Múi giờ hệ thống cố định là Asia/Ho_Chi_Minh. Các node ESP32 không cần đồng hồ thời gian thực: mỗi bản tin gửi đi mang bộ đếm sự kiện eid tăng dần, còn mốc thời gian chính thức do Pi gán tại thời điểm nhận bản tin (sai lệch vài chục mili-giây do trễ mạng nội bộ là chấp nhận được)."));

P.push(h2("6.7. Bảo mật"));
P.push(p("Mật khẩu Wi-Fi AP được đặt đủ dài theo chuẩn WPA2-PSK. Kết nối MQTT sử dụng user/password kết hợp ACL, không bật TLS trong mạng Wi-Fi kín để tránh gánh nặng cấp phát và quản lý chứng chỉ số trên ESP32; giới hạn là thông tin xác thực MQTT truyền dưới dạng bản rõ bên trong lớp mã hóa WPA2 của mạng Wi-Fi riêng. Các bí mật hệ thống gồm token Telegram, mật khẩu email, mật khẩu MQTT và khóa phiên được lưu trong tệp /etc/tram/env với quyền truy cập 600, không đưa lên GitHub (đã loại trừ trong .gitignore). Kết nối SSH chỉ cho phép xác thực bằng khóa công khai, và tường lửa ufw chỉ mở các cổng 22, 53, 67, 1883, 8000 trên giao diện wlan0. Các tệp cấu hình mẫu đặt tại pi/backend/config/ hiện ở dạng mẫu, chưa chạy thử trên Pi thật."));

P.push(h2("6.8. Khởi động và phục hồi sự cố"));
P.push(p("Thứ tự khởi động các dịch vụ systemd trên Pi 4 là: hostapd → dnsmasq → mosquitto → tram-backend → tram-ai. Ở phía node, ESP32 tự động kết nối lại Wi-Fi và MQTT theo thuật toán chờ tăng dần (1 s … tối đa 30 s) để chịu được khoảng thời gian Pi khởi động chậm (thời gian khởi động Pi ước tính 40–60 s, cần đo thực tế). Riêng ESP32-B thực hiện khóa cả 3 servo ngay đầu chương trình trước khi khởi tạo Wi-Fi. Bảng 13 tổng hợp các kịch bản sự cố và biện pháp xử lý."));
P.push(tcap("Bảng 13. Sự cố hạ tầng, hiện tượng và biện pháp xử lý / giảm thiểu"));
P.push(table([2100, 3100, 4200],
  ["Sự cố", "Hiện tượng", "Xử lý / giảm thiểu"],
  [
    ["Pi mất điện đột ngột", "Mất Wi-Fi AP, hai node chuyển offline; nguy cơ lỗi tệp trên microSD", "Tắt Pi bằng nút “Tắt hệ thống an toàn”; SQLite bật WAL + synchronous=FULL; sau khi có điện systemd tự khởi động lại dịch vụ và đọc trạng thái retained"],
    ["Thẻ nhớ microSD hỏng", "Pi không khởi động được hoặc lỗi đọc/ghi /var/lib/tram/tram.db", "Khôi phục từ bản sao lưu sqlite3 .backup hằng ngày (02:00) trên USB flash; cân nhắc chạy trên SSD/USB"],
    ["Mất Internet (rút usb0)", "Telegram bot, Email báo cáo và đồng bộ NTP tạm dừng", "Mượn – trả tại tủ và web nội bộ vẫn chạy bình thường; fake-hwclock và nút “Lấy giờ từ trình duyệt” giữ giờ đúng; tin nhắn xếp hàng gửi sau"],
    ["Một node mất Wi-Fi", "Broker phát hiện sau ≤ 45 s (keepalive 30 s), Last Will báo offline", "Backend khóa thao tác mở ngăn của node đó; ESP32 tự nối lại theo chu kì tăng dần 1–30 s và publish lại trạng thái thật"],
    ["Mosquitto hoặc backend dừng", "Web không cập nhật hoặc lệnh MQTT không đi qua", "Cấu hình systemd Restart=always (RestartSec=3) tự khởi động lại; backend đọc lại trạng thái từ SQLite và bản tin retained"],
    ["Điện thoại không vào được web", "Android tự chuyển 4G do Wi-Fi không có Internet hoặc lỗi mDNS", "Dùng dnsmasq phân giải tram.local → 192.168.4.1 và dán mã QR IP; nhắc người dùng giữ Wi-Fi khi Android hỏi (hoặc bật NAT nếu chấp nhận tốn 4G)"],
    ["Nhiều người dùng cùng lúc", "Web hoặc WebSocket phản hồi chậm khi đầu/cuối buổi thực hành", "Ước lượng vài chục kết nối đồng thời là đủ cho quy mô một phòng lab (chưa đo thực tế); SQLite bật busy_timeout tránh khóa ghi"],
  ]));
P.push(gap());

P.push(h2("6.9. Môi trường phát triển"));
P.push(p("Do nhóm gồm 5 thành viên và không phải ai cũng có sẵn Raspberry Pi 4 khi lập trình song song, mỗi thành viên chạy Mosquitto và backend FastAPI trực tiếp trên máy tính cá nhân, còn ESP32 kết nối vào Wi-Fi nhà hoặc điểm phát sóng di động. Firmware đọc các tham số BROKER_HOST và WIFI_SSID từ NVS thay vì viết cứng trong mã nguồn; nhóm sử dụng thêm script giả lập bản tin node bằng mosquitto_pub để kiểm thử backend khi chưa có phần cứng. Khi triển khai lên Pi chung của nhóm, mã nguồn được cập nhật bằng git pull kết hợp systemctl restart; các thành viên truy cập SSH vào Pi thông qua chính mạng Wi-Fi TramDungCu."));

P.push(h2("6.10. Cập nhật firmware OTA"));
P.push(p("Quá trình cập nhật phần mềm từ xa (OTA) cho hai node thực hiện qua mạng nội bộ: Pi 4 phục vụ tệp nhị phân tại http://192.168.4.1:8000/ota/nodeA.bin và nodeB.bin, đồng thời publish thông báo lên topic lab/{node}/ota với nội dung {\"version\":\"0.3.2\",\"url\":\"…\",\"sha256\":\"…\"}. Node nhận bản tin, so sánh phiên bản, tải tệp qua HTTP, kiểm tra mã băm SHA-256 trước khi ghi vào phân vùng OTA dự phòng và khởi động lại. Nếu bản firmware mới khởi động lỗi, cơ chế rollback của ESP-IDF tự động quay về phân vùng cũ. Hệ thống chỉ cho phép kích hoạt OTA khi không có giao dịch mượn – trả nào đang mở."));

// ================= 7
P.push(h1("7. Kế hoạch đánh giá và tối ưu"));
P.push(tcap("Bảng 14. Kiểm thử đối chiếu với thông số thiết kế"));
P.push(table([3200, 3800, 2400],
  ["Kiểm thử", "Cách thực hiện", "Tiêu chí đạt"],
  [
    ["Độ chính xác cân", "Vật mẫu khoảng 10/50/100/500 g đã cân trên cân tiểu ly của lab, lặp 20 lần", "Sai số ≤ ±2 g"],
    ["Đếm pin 18650 (1–4 cell)", "Đặt/lấy 1, 2, 3, 4 cell pin trên khay trả và hộc pin, lặp 20 lần mỗi mức", "Đếm đúng 100 % số cell; tất cả đạt dung sai ±(2 g + 1,5 g × n)"],
    ["Độ chính xác AI (6 lớp)", "Tập kiểm thử riêng gồm 4 dụng cụ, pin 18650 và khay trống/vật lạ", "≥ 90 %"],
    ["Thời gian suy luận", "Đo 100 lần trên Pi 4", "Trung bình ≤ 0,5 s"],
    ["Độ trễ đầu – cuối", "Ghi mốc thời gian ở từng bước của Bảng 10", "≤ 2 s / ≤ 3 s"],
    ["Phân biệt vật cùng khối lượng", "Hai dụng cụ chênh nhau < 10 g, đổi chỗ khi trả", "AI nhận đúng loại"],
    ["Trả sai / thiếu phụ kiện", "Trả nhầm món; bộ tua vít thiếu 1 cây", "100 % bị từ chối"],
    ["Đặt lẫn pin và dụng cụ", "Đặt đồng thời pin 18650 và một dụng cụ lên khay trả", "100 % bị từ chối, không mở ngăn hay hộc"],
    ["Trả thiếu pin", "Sinh viên nợ 4 pin nhưng chỉ trả 3 pin lên khay", "Ghi “còn nợ 1 pin” và gửi cảnh báo quản lý"],
    ["Khối lượng pin ngoài dung sai", "Đặt vật/cell lệch khối lượng vượt ±(2 g + 1,5 g × n)", "Báo lỗi “khối lượng pin bất thường”, không ghi nhận"],
    ["Vật lạ trên khay", "Đặt điện thoại, ví, chìa khóa", "100 % bị từ chối"],
    ["Báo hỏng", "Nhấn nút khi trả", "Dụng cụ chuyển “chờ kiểm tra”, không cho mượn, quản lý nhận Telegram"],
    ["Khởi động lại node", "Ngắt nguồn ESP32-B khi ngăn hoặc hộc pin đang mở", "Ngăn và hộc pin tự khóa; trạng thái trên web đúng sau khi node kết nối lại"],
    ["Mất kết nối, bản tin trùng", "Ngắt Wi-Fi node, khởi động lại Pi, gửi lặp eid", "Không mở sai, không ghi trùng"],
  ]));
P.push(gap());
P.push(tcap("Bảng 15. Công suất ước tính – sẽ đo bằng đồng hồ USB khi lắp ráp"));
P.push(table([3400, 1900, 1900, 2200],
  ["Khối", "Trung bình", "Đỉnh", "Ghi chú"],
  [
    ["Raspberry Pi 4 + camera", "3 – 4 W", "≈ 7 W", "Đỉnh khi suy luận"],
    ["ESP32-A + RC522, LCD, HX711", "≈ 1 W", "≈ 2 W", "Đỉnh khi Wi-Fi phát"],
    ["Đèn khay (6 LED trắng)", "≈ 0,05 W", "≈ 0,6 W", "Chỉ bật khi chụp"],
    ["ESP32-B + 3 HX711 + DHT22", "≈ 0,7 W", "≈ 1,2 W", "2 ngăn + 1 hộc pin"],
    ["Servo (3 servo mở tuần tự)", "≈ 0", "2 – 3,5 W", "1 servo tại 1 thời điểm"],
    ["LED ngăn/hộc (3 LED sáng cùng lúc)", "≈ 0,04 W", "≈ 0,07 W", "2 ngăn + 1 hộc pin"],
    ["Tổng", "≈ 6,1 W", "≈ 15 W", "≈ 0,15 kWh/ngày"],
  ]));
P.push(gap());
P.push(p([B("Tối ưu bộ nhớ: "), run("ESP32 theo dõi heap còn trống và kích thước firmware, mục tiêu RAM sử dụng dưới 60 %; Pi 4 so sánh mô hình FP32 và INT8 về kích thước, thời gian suy luận, độ chính xác, theo dõi RAM và nhiệt độ CPU; ảnh khoảng 8 MB/ngày (100 lượt × 80 KB), xóa sau 30 ngày.")]));

// ================= 8
P.push(h1("8. Danh sách linh kiện và chi phí dự kiến"));
P.push(p("Linh kiện được chọn theo tiêu chí đủ thông số ở Bảng 3 với giá thấp nhất. Giá là giá tham khảo ở các cửa hàng linh kiện trong nước và Shopee, tháng 11/2026, cần kiểm tra lại khi đặt mua. Cột “Đã có” là ô tích để đánh dấu linh kiện nhóm đã sở hữu."));
P.push(tcap("Bảng 16. Danh sách linh kiện chi tiết"));
{
  const parts = JSON.parse(fs.readFileSync(SCR + "/parts.json", "utf8"));
  const fmt = (n) => n.toLocaleString("de-DE");
  const W = [430, 2550, 1250, 430, 950, 1030, 590, 2182];
  const H = ["STT", "Linh kiện", "Ảnh", "SL", "Đơn giá", "Thành tiền", "Đã có", "Ghi chú"];
  const imgDim = (buf) => {
    if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    let i = 2;
    while (i + 8 < buf.length) {
      if (buf[i] !== 0xFF) break;
      while (buf[i] === 0xFF) i++;
      const m = buf[i++];
      if (m === 0xD9 || m === 0xDA) break;
      if (m === 0xC0 || m === 0xC1 || m === 0xC2) return { h: buf.readUInt16BE(i + 3), w: buf.readUInt16BE(i + 5) };
      i += buf.readUInt16BE(i);
    }
    return { w: 480, h: 360 };
  };
  const cell = (child, w, o = {}) => new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: cb, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 30, bottom: 30, left: 70, right: 70 }, columnSpan: o.span,
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    children: [new Paragraph({ spacing: { after: 0, line: 240 }, alignment: o.align || AlignmentType.LEFT, children: child })],
  });
  const t = (s, o = {}) => [run(String(s), { size: 20, ...o })];
  const rows = [new TableRow({ tableHeader: true, children: H.map((h, i) => cell(t(h, { bold: true }), W[i], { fill: "EDEDED", align: AlignmentType.CENTER })) })];
  let n = 0, total = 0, need = 0;
  for (const g of parts) {
    rows.push(new TableRow({ cantSplit: true, children: [cell(t(g.group, { bold: true }), W.reduce((a, b) => a + b, 0), { span: 8, fill: "F6F6F6" })] }));
    for (const [name, q, price, note, have, imgFile = ""] of g.items) {
      n++; total += q * price; need += Math.max(q - have, 0) * price;
      let imgChildren = t("");
      if (imgFile) {
        const imgPath = path.join(IMG, "parts", imgFile);
        if (fs.existsSync(imgPath)) {
          const buf = fs.readFileSync(imgPath);
          const { w: iw, h: ih } = imgDim(buf);
          const scale = Math.min(76 / iw, 57 / ih);
          imgChildren = [new ImageRun({
            type: imgFile.toLowerCase().endsWith(".png") ? "png" : "jpg",
            data: buf,
            transformation: { width: Math.round(iw * scale), height: Math.round(ih * scale) },
            altText: { title: name, description: name, name: imgFile },
          })];
        }
      }
      rows.push(new TableRow({ cantSplit: true, children: [
        cell(t(n), W[0], { align: AlignmentType.CENTER }),
        cell(t(name), W[1]),
        cell(imgChildren, W[2], { align: AlignmentType.CENTER }),
        cell(t(q), W[3], { align: AlignmentType.CENTER }),
        cell(t(fmt(price)), W[4], { align: AlignmentType.RIGHT }),
        cell(t(fmt(q * price)), W[5], { align: AlignmentType.RIGHT }),
        cell([new CheckBox({ checked: have >= q, checkedState: { value: "2612" }, uncheckedState: { value: "2610" } })], W[6], { align: AlignmentType.CENTER }),
        cell(t(note, { size: 19 }), W[7]),
      ] }));
    }
  }
  const sumRow = (label, v) => new TableRow({ cantSplit: true, children: [
    cell(t(label, { bold: true }), W[0] + W[1] + W[2] + W[3] + W[4], { span: 5, align: AlignmentType.RIGHT }),
    cell(t(fmt(v), { bold: true }), W[5], { align: AlignmentType.RIGHT }),
    cell(t(""), W[6] + W[7], { span: 2 }),
  ] });
  rows.push(sumRow("Tổng toàn bộ (VNĐ)", total));
  rows.push(sumRow("Cần mua thêm, trừ phần đã có (VNĐ)", need));
  P.push(new Table({ width: { size: W.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: W, alignment: AlignmentType.CENTER, rows }));
  console.log("total", total, "need", need, "items", n);
}
P.push(p([I("Dụng cụ dùng để thử (kìm cắt, kìm tuốt dây, bộ tua vít, nhíp) lấy từ phòng lab, không tính vào chi phí; riêng 6 cell pin 18650 và khay nhựa chia ngăn tính trong Bảng 16. File Excel đi kèm (DanhSachLinhKien.xlsx) tự tính lại số tiền cần mua khi nhập số lượng đã có.")], { spacing: { before: 60, after: 80 } }));

// ================= 9
P.push(h1("9. Kế hoạch thực hiện (6 tuần)"));
P.push(table([1300, 8100],
  ["Tuần", "Nội dung"],
  [
    ["1", "Đặt mua linh kiện ngay ngày đầu (giao hàng 3–7 ngày); chốt đặc tả MQTT; cài Pi 4 và mạng Wi-Fi riêng; vẽ sơ đồ nguyên lý và bố trí mạch trên KiCad; trong lúc chờ hàng, chụp thử ảnh dụng cụ trên nền và đèn giống khay."],
    ["2", "Hàn mạch Node A, Node B trên PCB đục lỗ; lập trình ESP32-A, ESP32-B (đọc cảm biến, PWM, GPIO); cài Mosquitto trên Pi 4."],
    ["3", "Thu thập ảnh, huấn luyện, lượng tử hóa và chạy mô hình trên Pi 4; backend và CSDL."],
    ["4", "Ghép luồng mượn – trả theo Bảng 9; web và WebSocket; thông báo Telegram."],
    ["5", "Kiểm thử theo Bảng 14, đo độ trễ, công suất, bộ nhớ; tối ưu."],
    ["6", "Hoàn thiện mô hình tủ, báo cáo, video demo."],
  ], [0]));
P.push(gap());
P.push(tcap("Bảng 17. Phân công theo mảng (chi tiết từng việc trong file PhanCongNhiemVu.xlsx)"));
P.push(table([1500, 2700, 5200],
  ["Thành viên", "Mảng phụ trách", "Phạm vi"],
  [
    ["TV1 (nhóm trưởng)", "Tích hợp hệ thống, MQTT, báo cáo", "Đặc tả bản tin MQTT, repo GitHub, mua linh kiện, thử thẻ sinh viên với RC522, ghép và kiểm thử đầu – cuối, kiểm thử lỗi truyền thông, đo bộ nhớ ESP32, báo cáo, slide"],
    ["TV2", "Node A (kiosk + khay trả)", "Sơ đồ nguyên lý và bố trí mạch KiCad, hàn mạch, firmware ESP32-A (RFID, LCD, cân khay, còi, đèn, nút báo hỏng, MQTT), OTA"],
    ["TV3", "Node B (tủ 2 ngăn + hộc pin) + cơ khí", "Sơ đồ nguyên lý và bố trí mạch KiCad, hàn mạch, firmware ESP32-B (3 cân, 3 servo, LED 3 ngăn/hộc, DHT22, MQTT slot 1–3 kèm n), gia công khay, 2 ngăn dụng cụ và hộc pin cách điện có khay chia cell, giá camera"],
    ["TV4", "Edge AI", "Camera và chiếu sáng, thu thập và gán nhãn ảnh 6 lớp (thêm lớp pin 18650), cân 10 cell mẫu hiệu chuẩn m_unit, huấn luyện, lượng tử hóa INT8, dịch vụ suy luận trên Pi 4, đánh giá mô hình, đo công suất, video demo"],
    ["TV5", "Backend, CSDL, web", "Mạng Wi-Fi do Pi 4 phát, Mosquitto, FastAPI, SQLite, luật nghiệp vụ mượn – trả dụng cụ và đếm/hạn mức/nợ pin 18650 (từ chối trả lẫn, cảnh báo sắp hết), web sinh viên và quản lý (chọn số pin, biểu đồ số pin), WebSocket, Telegram/Email, README"],
  ]));

// ================= refs
P.push(h1("Tài liệu tham khảo"));
P.push(...numList([
  "Snap-on Level 5 ATC – ENR: enr.com/articles/9339-snap-on-employs-imaging-technology-to-help-high-risk-asset-managers-track-their-tools",
  "Snap-on Level 5 ATC – Helicopter Maintenance Magazine: helicoptermaintenancemagazine.com/article/advanced-tool-control-system",
  "Henchman kabTRAK: henchmantrak.squarespace.com/kabtrak",
  "Instant Systems – Smart Cabinets: instantsystems.se/resources/smart-cabinets-vs-traditional-storage",
  "SupplyPro SmartBin: supplypro.com/products/smartbin",
  "GAO RFID Smart Checkout Cabinet: gaorfid.com/?p=12582",
  "University of Manitoba Libraries – Tech Lending & Equipment Kiosks: umanitoba.ca/libraries",
  "UC Riverside Library – Equipment Lending: library.ucr.edu",
  "Fab Academy 2026 – Smart Tool Cabinet: fabacademy.org/2026/labs/kochi/students/nadec-biju/docs/final-project/",
  "NXP, MFRC522 Datasheet: nxp.com/docs/en/data-sheet/MFRC522.pdf",
  "Avia Semiconductor, HX711 Datasheet.",
  "OASIS, MQTT Version 3.1.1 Specification.",
  "Raspberry Pi 15W USB-C Power Supply: raspberrypi.com/products/type-c-power-supply/",
  "Simon Kelley, Dnsmasq Man Page (DHCP & DNS): thekelleys.org.uk/dnsmasq/docs/dnsmasq-man.html",
  "Eclipse Mosquitto, mosquitto.conf(5) Manual (Authentication & ACL): mosquitto.org/man/mosquitto-conf-5.html",
  "SQLite, Write-Ahead Logging (WAL): sqlite.org/wal.html",
  "Espressif Systems, ESP-IDF Over The Air Updates (OTA): docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/ota.html",
]));

const doc = new Document({
  creator: "Nhóm sinh viên",
  title: "Báo cáo đề tài - Trạm mượn trả dụng cụ thông minh ứng dụng Edge AI",
  styles: { default: { document: { run: { font: FONT, size: SZ } } } },
  numbering: { config: numberingConfigs },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, bottom: 1000, left: 1247, right: 1247 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 })] })] }) },
    children: P,
  }],
});
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log("written", buf.length); });
