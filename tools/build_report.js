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
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 40 }, keepNext: true,
      children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(IMG, file)), transformation: { width: w, height: hgt },
        altText: { title: cap, description: cap, name: file } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 140 }, children: [run(cap, { italics: true, size: 22 })] }),
  ];
}

const line = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
const allB = { top: line, bottom: line, left: line, right: line };
const infoCell = (a, b) => new TableCell({ width: { size: CW, type: WidthType.DXA }, borders: allB, margins: { top: 40, bottom: 40, left: 100, right: 100 },
  children: [new Paragraph({ spacing: { after: 0 }, children: [B(a)] }), new Paragraph({ spacing: { after: 0 }, children: [B(b)] })] });
const infoTable = new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [
  new TableRow({ children: [infoCell("Sinh viên 1: [Họ và tên]", "MSSV: [..........]")] }),
  new TableRow({ children: [infoCell("Sinh viên 2: [Họ và tên]", "MSSV: [..........]")] }),
] });

const P = [];
P.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [run("BÁO CÁO ĐỀ TÀI MÔN THỰC TẬP KIẾN TRÚC VÀ GIAO THỨC IOT", { bold: true, size: 26 })] }),
  infoTable,
  new Paragraph({ spacing: { before: 120, after: 80 }, alignment: AlignmentType.JUSTIFIED,
    children: [B("Đề tài: "), run("Trạm mượn – trả dụng cụ thông minh cho phòng thực hành điện tử ứng dụng Edge AI")] }),
);

// ================= 1
P.push(h1("1. Khảo sát đối tượng và yêu cầu hệ thống"));
P.push(h2("1.1. Đối tượng và bài toán"));
P.push(p("Đối tượng phục vụ là phòng thực hành điện tử với các dụng cụ dùng chung (đồng hồ VOM, mỏ hàn, kìm, nhíp). Quy trình ghi sổ thủ công dẫn tới ba vấn đề kỹ thuật cần giải quyết: (1) không định danh được người đang giữ dụng cụ; (2) không xác minh được dụng cụ trả về có đúng loại và đủ phụ kiện; (3) không có dữ liệu tức thời về tình trạng kho. Người sử dụng hệ thống là sinh viên và người quản lý phòng lab."));

P.push(h2("1.2. Sản phẩm tương tự và giải pháp kỹ thuật tham khảo"));
P.push(tcap("Bảng 1. Các hệ thống quản lý dụng cụ đã có"));
P.push(table([2300, 2800, 2400, 1900],
  ["Sản phẩm", "Nguyên lý nhận biết", "Giải pháp đáng tham khảo", "Hạn chế"],
  [
    ["Snap-on Level 5 ATC (Mỹ)", "Camera chụp ngăn kéo khi đóng, so với ảnh chuẩn; dụng cụ đặt trong lót xốp cắt theo hình", "Nhận diện bằng ảnh, lưu nhật ký kèm ảnh, đăng nhập bằng thẻ", "Khoảng 21.000–26.000 USD (năm ra mắt)"],
    ["Henchman kabTRAK", "Cảm biến riêng tại từng vị trí dụng cụ", "Ghi nhận ngay khi nhấc/đặt, kết nối mạng", "Thiết bị chuyên dụng, chi phí cao"],
    ["Instant Systems, SupplyPro SmartBin", "Cảm biến khối lượng (weight cell)", "Xác định vật nào đã được lấy ra", "Không xác định được loại vật"],
    ["GAO RFID Checkout Cabinet", "Thẻ RFID gắn trên dụng cụ, khóa điện", "Tự ghi nhận, gửi email cảnh báo", "Phải dán thẻ lên từng dụng cụ"],
    ["Dự án Fab Academy (makerspace)", "RFID đăng nhập, công tắc dưới từng vị trí", "Chi phí thấp", "Không xác minh đúng món"],
  ]));
P.push(gap());
P.push(p("Đề tài kết hợp hai nguyên lý nhận biết độc lập: ảnh (AI) xác định đúng loại dụng cụ, khối lượng (load cell) xác định đủ phụ kiện, có lót xốp cắt hình để cố định vị trí vật. Hệ thống chỉ dùng cân không phân biệt được hai vật cùng khối lượng, hệ thống chỉ dùng ảnh khó phát hiện thiếu phụ kiện bị che khuất; kết hợp hai nguồn khắc phục cả hai hạn chế với chi phí linh kiện khoảng 1,25 triệu đồng (chưa tính Pi 4)."));

P.push(h2("1.3. Yêu cầu hệ thống"));
P.push(...numList([
  "Định danh người dùng bằng thẻ 13,56 MHz; quyết định cấp quyền tập trung tại gateway.",
  "Xác minh khi trả bằng hai điều kiện đồng thời: đúng loại (AI) và đủ khối lượng (load cell).",
  "Truyền dữ liệu hai chiều giữa node và gateway, không mất và không trùng sự kiện khi mạng chập chờn.",
  "Xử lý ảnh tại biên (Pi 4), ảnh không rời khỏi mạng nội bộ.",
  "Cung cấp trạng thái tức thời cho ứng dụng web và gửi thông báo ra Internet.",
]));

// ================= 2
P.push(h1("2. Chức năng và yêu cầu kỹ thuật"));
P.push(h2("2.1. Chức năng hệ thống"));
P.push(tcap("Bảng 2. Chức năng và phần cứng/giao thức thực hiện"));
P.push(table([2100, 2700, 2400, 2200],
  ["Chức năng", "Phần cứng thực hiện", "Giao tiếp / giao thức", "Xử lý tại"],
  [
    ["F1. Định danh thẻ", "MFRC522 + anten 13,56 MHz", "ISO/IEC 14443A; SPI tới ESP32-A", "ESP32-A đọc UID; Pi 4 cấp quyền"],
    ["F2. Đo khối lượng khay và 2 ngăn", "3 × load cell 1 kg + HX711", "Nối tiếp 2 dây, 24 bit", "ESP32 lọc, phát hiện ổn định"],
    ["F3. Nhận diện dụng cụ", "Camera OV5647 5 MP + Pi 4 (Cortex-A72)", "MIPI CSI-2", "Pi 4 (TFLite INT8)"],
    ["F4. Khóa / mở ngăn", "2 × servo SG90", "PWM 50 Hz (LEDC)", "ESP32-B theo lệnh Pi"],
    ["F5. Báo hiệu tại chỗ", "LCD 16 × 2 HD44780 + PCF8574, còi active, LED đỏ/xanh", "I2C; GPIO", "ESP32-A/B"],
    ["F6. Truyền dữ liệu node – gateway", "Wi-Fi ESP32 / Pi 4", "802.11n 2,4 GHz, TCP, MQTT 3.1.1", "Mosquitto trên Pi 4"],
    ["F7. Lưu trữ, giao diện, thông báo", "Pi 4 + thẻ nhớ", "SQLite; HTTP/WebSocket; HTTPS", "Backend Python trên Pi 4"],
  ]));
P.push(gap());

P.push(h2("2.2. Yêu cầu kỹ thuật"));
P.push(
  bl([B("Thu thập dữ liệu: "), run("HX711 chạy 10 SPS (chân RATE = 0) cho nhiễu thấp hơn chế độ 80 SPS; RFID hỏi thẻ chu kì 100 ms; camera chỉ chụp khi cân khay báo có vật.")]),
  bl([B("Truyền dữ liệu: "), run("MQTT QoS 1 cho mọi sự kiện và lệnh; mã sự kiện eid để loại trùng; retained message cho trạng thái ngăn và trạng thái node; Last Will và keepalive 30 s để phát hiện node mất kết nối.")]),
  bl([B("Lưu trữ thông tin: "), run("SQLite (chế độ WAL) cho người dùng, dụng cụ, giao dịch, sự kiện đã xử lý; ảnh JPEG khoảng 80 KB/lần trả, giữ 30 ngày; trên ESP32 lưu hệ số hiệu chuẩn cân và bộ đếm eid trong NVS (flash).")]),
  bl([B("Xử lý thông tin: "), run("ESP32 chỉ xử lý tín hiệu cấp thấp (lọc cân, đọc cảm biến, phát xung); mọi quyết định nghiệp vụ và suy luận AI tập trung tại Pi 4.")]),
  bl([B("Tối ưu tài nguyên: "), run("lượng tử hóa mô hình INT8; suy luận theo sự kiện; ESP32 dùng bộ đệm tĩnh, không cấp phát động khi chạy; chỉ publish khi khối lượng thay đổi vượt ngưỡng 1 g (deadband); servo mở tuần tự để giới hạn dòng đỉnh.")]),
  bl([B("Chống nhiễu: "), run("cân: dây ngắn xoắn đôi, lọc trung vị 5 mẫu + trung bình trượt, tự đặt lại điểm 0 khi ngăn trống; servo dùng đường 5 V có tụ 1000 µF, mass chung hình sao; I2C có điện trở kéo lên 4,7 kΩ và mạch chuyển mức 3,3 V ↔ 5 V; ảnh dùng đèn khay cố định và nền một màu.")]),
);

P.push(h2("2.3. Thông số kỹ thuật thiết kế (mục tiêu)"));
P.push(tcap("Bảng 3. Thông số thiết kế – sẽ đo lại khi đánh giá"));
P.push(table([3800, 3100, 2500],
  ["Thông số", "Giá trị mục tiêu", "Căn cứ"],
  [
    ["Số ngăn / số dụng cụ / số lớp nhận diện", "2 ngăn / 4 dụng cụ / 4 lớp", "Mỗi ngăn chứa 2 dụng cụ khác khối lượng"],
    ["Dải đo khối lượng (khay, mỗi ngăn)", "0 – 1000 g", "VOM khoảng 300–500 g; ngăn chứa VOM + kìm dưới 1 kg"],
    ["Độ phân giải / sai số cân", "≤ 1 g / ≤ ±2 g", "Phân biệt nhíp (khoảng 15–20 g)"],
    ["Thời gian cân ổn định", "≤ 1 s", "10 SPS, cửa sổ 10 mẫu"],
    ["Độ chính xác nhận diện", "≥ 90 %", "Tập kiểm thử riêng"],
    ["Thời gian suy luận trên Pi 4", "≤ 0,5 s", "Ảnh đầu vào 320 × 320"],
    ["Độ trễ quẹt thẻ → mở ngăn", "≤ 2 s", "Xem Bảng 10"],
    ["Độ trễ đặt đồ lên khay → mở ngăn", "≤ 3 s", "Xem Bảng 10"],
    ["Khoảng cách đọc thẻ", "≤ 5 cm", "Anten RC522"],
    ["Phát hiện node mất kết nối", "≤ 60 s", "Keepalive 30 s (broker ngắt sau 1,5 × keepalive)"],
    ["Nguồn / công suất trung bình", "5 V / dưới 10 W", "Xem Bảng 12"],
  ]));
P.push(gap());

P.push(h2("2.4. Lựa chọn linh kiện theo thông số"));
P.push(tcap("Bảng 4. So sánh phương án và lựa chọn"));
P.push(table([1700, 3200, 4500],
  ["Khối", "Phương án", "Lựa chọn và lý do kỹ thuật"],
  [
    ["Cân", "Load cell 1 kg; 5 kg", "1 kg: cùng ADC 24 bit nhưng dải nhỏ cho độ phân giải theo gam tốt hơn 5 lần; HX711 tích hợp khuếch đại lập trình được (gain 128) và nguồn kích cầu"],
    ["Định danh", "RC522 (13,56 MHz); RDM6300 (125 kHz); PN532", "RC522: SPI tốc độ tới 10 Mbit/s, đọc thẻ MIFARE. Nếu thẻ sinh viên dùng 125 kHz thì đổi sang RDM6300 (UART)"],
    ["Camera", "Camera v2 IMX219 8 MP; OV5647 5 MP (CSI-2); webcam USB (UVC)", "OV5647: giá khoảng 1/3 IMX219, mô hình chỉ cần ảnh 320 × 320 px nên độ phân giải 5 MP là dư; CSI-2 không chiếm băng thông USB và CPU giải mã MJPEG như webcam"],
    ["Hiển thị", "OLED 0,96\" (SSD1306); LCD 16 × 2; LCD 20 × 4", "LCD 16 × 2 qua PCF8574: 2 dòng đủ hiện tên người dùng và một thông báo ngắn (dụng cụ, lý do từ chối), chỉ tốn 2 chân I2C, rẻ hơn LCD 20 × 4 khoảng 40 %; chi tiết (hạn trả, lịch sử) xem trên web"],
    ["Báo ngăn", "LED RGB WS2812; LED đơn đỏ/xanh", "LED đơn: mỗi ngăn 1 đỏ (khóa) + 1 xanh (mở) điều khiển trực tiếp bằng GPIO qua điện trở 330 Ω, không cần IC chuyển mức như WS2812; với 2 ngăn chỉ tốn 4 chân"],
    ["Cơ cấu khóa", "Servo SG90; solenoid 12 V", "SG90: điều khiển trực tiếp bằng PWM, dùng chung nguồn 5 V; bản thực tế dùng solenoid + MOSFET"],
    ["Xử lý trung tâm", "Pi 3B+ (1 GB); Pi 4 (4 GB)", "Pi 4: 4 nhân Cortex-A72, 4 GB RAM, đủ chạy đồng thời broker, backend, CSDL và mô hình AI"],
  ]));
P.push(gap());

// ================= 3
P.push(h1("3. Sơ đồ khối"));
P.push(p("Hệ thống tổ chức theo ba tầng kiến trúc IoT (Hình 1) và gồm 10 khối phần cứng (Hình 2): nguồn; xử lý trung tâm + truyền thông (Pi 4); thu ảnh; ứng dụng; hai khối điều khiển node (ESP32-A, ESP32-B); nhận dạng; cân khay; hiển thị & báo; đo khối lượng ngăn; chấp hành; báo ngăn."));
P.push(...img("kientruc2.png", 560, 357, "Hình 1. Kiến trúc hệ thống ba tầng"));
P.push(...img("khoi_phancung.png", 600, 362, "Hình 2. Sơ đồ khối phần cứng"));

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
    ["Đèn khay (6 LED trắng 5 mm, 5 V)", "GPIO 26", "MOSFET IRLZ44N, điện trở cổng 330 Ω, kéo xuống 10 kΩ; mỗi LED nối tiếp 100 Ω (≈ 19 mA)"],
  ]));
P.push(gap());
P.push(tcap("Bảng 6. Phân bố chân ESP32-B (tủ 2 ngăn)"));
P.push(table([2900, 2700, 3800],
  ["Linh kiện", "Chân ESP32", "Ghi chú"],
  [
    ["HX711 #1, #2 (DOUT)", "34, 35", "Chân chỉ vào; HX711 cấp 3,3 V"],
    ["HX711 #1, #2 (SCK)", "32, 33", "Ngõ ra số"],
    ["Servo SG90 #1, #2", "13, 16", "LEDC 50 Hz, 16 bit; nguồn 5 V riêng"],
    ["LED ngăn 1 (đỏ, xanh)", "GPIO 25, 26", "Điện trở 330 Ω, dòng khoảng 4 mA"],
    ["LED ngăn 2 (đỏ, xanh)", "GPIO 27, 4", "Điện trở 330 Ω"],
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
    ["ESP32-B", "FreeRTOS. Nhân 0: Wi-Fi + MQTT. Nhân 1: tác vụ đọc tuần tự 2 HX711; tác vụ chấp hành nhận lệnh qua hàng đợi, mở servo tuần tự, bật/tắt LED ngăn bằng GPIO."],
    ["Pi 4", "Mosquitto (broker MQTT, systemd); backend Python: paho-mqtt, FastAPI (HTTP + WebSocket), SQLite; dịch vụ AI: Picamera2 + tflite-runtime; bộ lập lịch gửi thông báo."],
  ]));
P.push(gap());

P.push(h2("5.2. Đặc tả bản tin MQTT"));
P.push(tcap("Bảng 9. Chủ đề, chiều truyền và nội dung bản tin (JSON)"));
P.push(table([2500, 1100, 1200, 4600],
  ["Topic", "Chiều", "QoS / Retain", "Ví dụ payload"],
  [
    ["lab/kioskA/card", "A → Pi", "1 / không", "{\"eid\":\"A-1024\",\"uid\":\"04A1B2C3\"}"],
    ["lab/kioskA/tray", "A → Pi", "1 / không", "{\"eid\":\"A-1025\",\"m\":352.4,\"stable\":true}"],
    ["lab/kioskA/cmd", "Pi → A", "1 / không", "{\"cid\":\"C-88\",\"lcd\":[\"Dat dung cu\",\"len khay\"],\"lamp\":1}"],
    ["lab/cabB/cmd", "Pi → B", "1 / không", "{\"cid\":\"C-89\",\"slot\":2,\"action\":\"unlock\"}"],
    ["lab/cabB/ack", "B → Pi", "1 / không", "{\"cid\":\"C-89\",\"ok\":true}"],
    ["lab/cabB/slot/{k}/state", "B → Pi", "1 / có", "{\"eid\":\"B-311\",\"g\":352.1,\"stable\":true,\"lock\":\"open\"}"],
    ["lab/{node}/status", "node → Pi", "1 / có", "\"online\" | \"offline\" (Last Will)"],
  ], [1, 2], [0, 3]));
P.push(gap());

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

P.push(h2("5.4. Luồng tín hiệu khi mượn"));
P.push(...numList([
  "Backend xác định ngăn k (1 hoặc 2) chứa dụng cụ được chọn, publish lab/cabB/cmd {slot: k, action: unlock} QoS 1.",
  "ESP32-B đưa lệnh vào hàng đợi; tác vụ chấp hành đổi độ rộng xung kênh LEDC k (50 Hz) từ khoảng 1 ms sang khoảng 2 ms để servo quay mở chốt; ghi mức GPIO để tắt LED đỏ, bật LED xanh của ngăn k; publish ack.",
  "Tác vụ cân chờ chân DOUT của HX711 xuống mức thấp (có mẫu mới, 10 SPS), phát 25 xung SCK để đọc 24 bit bù 2 kênh A, gain 128. Ngắt được tạm khóa trong lúc phát xung vì xung SCK ở mức cao quá 60 µs sẽ đưa HX711 vào chế độ nghỉ.",
  "Khối lượng m = (giá trị thô − offset) / hệ số hiệu chuẩn; lọc trung vị 5 mẫu và trung bình trượt; coi là ổn định khi dao động dưới 1 g trong 1 s.",
  "Khi m giảm xấp xỉ khối lượng chuẩn của dụng cụ (±10 %), ESP32-B publish (hai dụng cụ trong cùng ngăn có khối lượng khác nhau nên lượng giảm cho biết món nào được lấy) lab/cabB/slot/k/state (retained). Backend ghi giao dịch “đang mượn” vào SQLite, gửi lệnh lock (servo về 1 ms), đẩy cập nhật lên web qua WebSocket. Nếu sau 30 s không có thay đổi khối lượng, ngăn được khóa lại và lệnh mượn bị hủy.",
]));

P.push(h2("5.5. Luồng tín hiệu khi trả và xử lý Edge AI"));
P.push(p("Hình 3 mô tả toàn bộ chuỗi bản tin giữa các thiết bị khi sinh viên trả dụng cụ."));
P.push(...img("seq_tra.png", 620, 344, "Hình 3. Sơ đồ tuần tự luồng trả dụng cụ"));
P.push(...numList([
  [B("Phát hiện vật trên khay: "), run("tác vụ cân khay trên ESP32-A đọc HX711 (25 xung SCK, 24 bit), lọc như mục 5.4; khi khối lượng > 5 g và dao động dưới 1 g trong 1 s thì publish lab/kioskA/tray {m, stable} QoS 1. Ngưỡng 5 g loại các rung động khi chạm tay vào khay.")],
  [B("Thu ảnh: "), run("backend gửi lệnh bật đèn khay (ESP32-A → GPIO 26 → MOSFET), dùng Picamera2 (libcamera) chụp một khung 640 × 480 qua MIPI CSI-2.")],
  [B("Suy luận: "), run("cắt vùng khay, đổi kích thước về 320 × 320, chuẩn hóa; tflite-runtime (bộ tăng tốc XNNPACK, 4 nhân Cortex-A72) chạy mô hình INT8, xuất vectơ xác suất 4 lớp (VOM, mỏ hàn, kìm, nhíp); lấy lớp có xác suất lớn nhất và độ tin cậy. Ảnh được lưu JPEG kèm eid.")],
  [B("Quyết định: "), run("chỉ mở ngăn khi đồng thời: lớp nhận diện trùng dụng cụ người đó đang mượn, độ tin cậy ≥ 0,8, m khớp khối lượng chuẩn ±10 %. Không đạt: gửi lệnh LCD nêu lý do và bật còi.")],
  [B("Cất vào ngăn: "), run("thực hiện như bước mở ngăn ở mục 5.4; khi HX711 ngăn k báo khối lượng tăng đúng khối lượng chuẩn thì backend đóng giao dịch, khóa ngăn, cập nhật web. Nếu khối lượng thiếu (ví dụ VOM thiếu que đo), giao dịch được đánh dấu “thiếu phụ kiện” và báo người quản lý.")],
]));

P.push(h2("5.6. Luồng thông báo và giao diện"));
P.push(
  bl("Web: FastAPI phục vụ HTTP trong mạng nội bộ; trình duyệt mở kết nối WebSocket, backend đẩy JSON mỗi khi trạng thái ngăn hoặc giao dịch thay đổi (không cần trình duyệt hỏi định kì)."),
  bl("Telegram: bộ lập lịch quét giao dịch quá hạn mỗi 5 phút, gửi HTTPS POST tới api.telegram.org (phương thức sendMessage) qua TLS trên TCP 443, đi qua router ra Internet; mỗi giao dịch nhắc tối đa 1 lần/ngày."),
  bl("Email: SMTP qua STARTTLS cổng 587, dùng cho báo cáo cuối buổi gửi người quản lý."),
);

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
);

// ================= 6
P.push(h1("6. Kế hoạch đánh giá và tối ưu"));
P.push(tcap("Bảng 11. Kiểm thử đối chiếu với thông số thiết kế"));
P.push(table([3200, 3800, 2400],
  ["Kiểm thử", "Cách thực hiện", "Tiêu chí đạt"],
  [
    ["Độ chính xác cân", "Vật mẫu khoảng 10/50/100/500 g đã cân trên cân tiểu ly của lab, lặp 20 lần", "Sai số ≤ ±2 g"],
    ["Độ chính xác AI", "Tập kiểm thử riêng", "≥ 90 %"],
    ["Thời gian suy luận", "Đo 100 lần trên Pi 4", "Trung bình ≤ 0,5 s"],
    ["Độ trễ đầu – cuối", "Ghi mốc thời gian ở từng bước của Bảng 10", "≤ 2 s / ≤ 3 s"],
    ["Phân biệt vật cùng khối lượng", "Hai dụng cụ chênh nhau < 10 g, đổi chỗ khi trả", "AI nhận đúng loại"],
    ["Trả sai / thiếu phụ kiện", "Trả nhầm món, VOM thiếu que đo", "100 % bị từ chối"],
    ["Mất kết nối, bản tin trùng", "Ngắt Wi-Fi node, khởi động lại Pi, gửi lặp eid", "Không mở sai, không ghi trùng"],
  ]));
P.push(gap());
P.push(tcap("Bảng 12. Công suất ước tính – sẽ đo bằng đồng hồ USB khi lắp ráp"));
P.push(table([3400, 1900, 1900, 2200],
  ["Khối", "Trung bình", "Đỉnh", "Ghi chú"],
  [
    ["Raspberry Pi 4 + camera", "3 – 4 W", "≈ 7 W", "Đỉnh khi suy luận"],
    ["ESP32-A + RC522, LCD, HX711", "≈ 1 W", "≈ 2 W", "Đỉnh khi Wi-Fi phát"],
    ["Đèn khay (6 LED trắng)", "≈ 0,05 W", "≈ 0,6 W", "Chỉ bật khi chụp"],
    ["ESP32-B + 2 HX711", "≈ 0,6 W", "≈ 1,1 W", ""],
    ["Servo (mở tuần tự)", "≈ 0", "2 – 3,5 W", "1 servo tại 1 thời điểm"],
    ["LED ngăn (2 LED sáng cùng lúc)", "≈ 0,03 W", "≈ 0,05 W", ""],
    ["Tổng", "≈ 6 W", "≈ 15 W", "≈ 0,15 kWh/ngày"],
  ]));
P.push(gap());
P.push(p([B("Tối ưu bộ nhớ: "), run("ESP32 theo dõi heap còn trống và kích thước firmware, mục tiêu RAM sử dụng dưới 60 %; Pi 4 so sánh mô hình FP32 và INT8 về kích thước, thời gian suy luận, độ chính xác, theo dõi RAM và nhiệt độ CPU; ảnh khoảng 8 MB/ngày (100 lượt × 80 KB), xóa sau 30 ngày.")]));

// ================= 7
P.push(h1("7. Danh sách linh kiện và chi phí dự kiến"));
P.push(p("Linh kiện được chọn theo tiêu chí đủ thông số ở Bảng 3 với giá thấp nhất. Giá là giá tham khảo ở các cửa hàng linh kiện trong nước và Shopee, tháng 11/2026, cần kiểm tra lại khi đặt mua. Cột “Đã có” là ô tích để đánh dấu linh kiện nhóm đã sở hữu."));
P.push(tcap("Bảng 13. Danh sách linh kiện chi tiết"));
{
  const parts = JSON.parse(fs.readFileSync(SCR + "/parts.json", "utf8"));
  const fmt = (n) => n.toLocaleString("de-DE");
  const W = [480, 3150, 520, 1050, 1150, 650, 2400];
  const H = ["STT", "Linh kiện", "SL", "Đơn giá", "Thành tiền", "Đã có", "Ghi chú"];
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
    rows.push(new TableRow({ cantSplit: true, children: [cell(t(g.group, { bold: true }), W.reduce((a, b) => a + b, 0), { span: 7, fill: "F6F6F6" })] }));
    for (const [name, q, price, note, have] of g.items) {
      n++; total += q * price; need += Math.max(q - have, 0) * price;
      rows.push(new TableRow({ cantSplit: true, children: [
        cell(t(n), W[0], { align: AlignmentType.CENTER }),
        cell(t(name), W[1]),
        cell(t(q), W[2], { align: AlignmentType.CENTER }),
        cell(t(fmt(price)), W[3], { align: AlignmentType.RIGHT }),
        cell(t(fmt(q * price)), W[4], { align: AlignmentType.RIGHT }),
        cell([new CheckBox({ checked: have >= q, checkedState: { value: "2612" }, uncheckedState: { value: "2610" } })], W[5], { align: AlignmentType.CENTER }),
        cell(t(note, { size: 19 }), W[6]),
      ] }));
    }
  }
  const sumRow = (label, v) => new TableRow({ cantSplit: true, children: [
    cell(t(label, { bold: true }), W[0] + W[1] + W[2] + W[3], { span: 4, align: AlignmentType.RIGHT }),
    cell(t(fmt(v), { bold: true }), W[4], { align: AlignmentType.RIGHT }),
    cell(t(""), W[5] + W[6], { span: 2 }),
  ] });
  rows.push(sumRow("Tổng toàn bộ (VNĐ)", total));
  rows.push(sumRow("Cần mua thêm, trừ phần đã có (VNĐ)", need));
  P.push(new Table({ width: { size: W.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: W, alignment: AlignmentType.CENTER, rows }));
  console.log("total", total, "need", need, "items", n);
}
P.push(p([I("Dụng cụ dùng để thử (VOM, mỏ hàn, kìm, nhíp) lấy từ phòng lab, không tính vào chi phí. File Excel đi kèm (DanhSachLinhKien.xlsx) tự tính lại số tiền cần mua khi nhập số lượng đã có.")], { spacing: { before: 60, after: 80 } }));

// ================= 8
P.push(h1("8. Kế hoạch thực hiện (6 tuần)"));
P.push(table([1300, 8100],
  ["Tuần", "Nội dung"],
  [
    ["1", "Chốt yêu cầu và thông số; vẽ sơ đồ nguyên lý và bố trí mạch trên KiCad; đặt mua linh kiện."],
    ["2", "Hàn mạch Node A, Node B trên PCB đục lỗ; lập trình ESP32-A, ESP32-B (đọc cảm biến, PWM, GPIO); cài Mosquitto trên Pi 4."],
    ["3", "Thu thập ảnh, huấn luyện, lượng tử hóa và chạy mô hình trên Pi 4; backend và CSDL."],
    ["4", "Ghép luồng mượn – trả theo Bảng 9; web và WebSocket; thông báo Telegram."],
    ["5", "Kiểm thử theo Bảng 11, đo độ trễ, công suất, bộ nhớ; tối ưu."],
    ["6", "Hoàn thiện mô hình tủ, báo cáo, video demo."],
  ], [0]));
P.push(gap());
P.push(tcap("Bảng 14. Phân công theo mảng (chi tiết từng việc trong file PhanCongNhiemVu.xlsx)"));
P.push(table([1500, 2700, 5200],
  ["Thành viên", "Mảng phụ trách", "Phạm vi"],
  [
    ["TV1 (nhóm trưởng)", "Tích hợp hệ thống, MQTT, báo cáo", "Đặc tả bản tin MQTT, repo GitHub, mua linh kiện, thử thẻ sinh viên với RC522, ghép và kiểm thử đầu – cuối, kiểm thử lỗi truyền thông, đo bộ nhớ ESP32, báo cáo, slide"],
    ["TV2", "Node A (kiosk + khay trả)", "Sơ đồ nguyên lý và bố trí mạch KiCad, hàn mạch, firmware ESP32-A (RFID, LCD, cân khay, còi, đèn, MQTT), OTA"],
    ["TV3", "Node B (tủ 2 ngăn) + cơ khí", "Sơ đồ nguyên lý và bố trí mạch KiCad, hàn mạch, firmware ESP32-B (2 cân, servo, LED, MQTT), gia công khay, ngăn, giá camera"],
    ["TV4", "Edge AI", "Camera và chiếu sáng, thu thập và gán nhãn ảnh, huấn luyện, lượng tử hóa INT8, dịch vụ suy luận trên Pi 4, đánh giá mô hình, đo công suất, video demo"],
    ["TV5", "Backend, CSDL, web", "Mosquitto, FastAPI, SQLite, luật nghiệp vụ mượn – trả, web sinh viên và quản lý, WebSocket, Telegram/Email, README"],
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
  "Fab Academy 2026 – Smart Tool Cabinet: fabacademy.org/2026/labs/kochi/students/nadec-biju/docs/final-project/",
  "NXP, MFRC522 Datasheet: nxp.com/docs/en/data-sheet/MFRC522.pdf",
  "Avia Semiconductor, HX711 Datasheet.",
  "OASIS, MQTT Version 3.1.1 Specification.",
  "Raspberry Pi 15W USB-C Power Supply: raspberrypi.com/products/type-c-power-supply/",
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
