// Dữ liệu giả lập cho giao diện mẫu (sau này thay bằng API FastAPI và WebSocket)

// Hàm phụ định dạng giờ HH:MM hoặc HH:MM:SS lùi theo số giây so với hiện tại
function taoMocGio(luiGiay, coGiay) {
  var d = new Date(Date.now() - luiGiay * 1000);
  var h = d.getHours();
  var m = d.getMinutes();
  var s = d.getSeconds();
  var kq = (h < 10 ? "0" + h : "" + h) + ":" + (m < 10 ? "0" + m : "" + m);
  if (coGiay) {
    kq += ":" + (s < 10 ? "0" + s : "" + s);
  }
  return kq;
}

// Thông tin sinh viên đang đăng nhập
var MOCK_STUDENT = {
  hoTen: "Nguyễn Minh Khoa",
  mssv: "20221234",
  lop: "ĐTVT-02",
  maThe: "04A1B2C3"
};

// Danh sách đúng 4 dụng cụ trong tủ (ngăn 1 và ngăn 2)
// Trạng thái hợp lệ: "san_co", "dang_muon", "cho_kiem_tra"
// Dung sai = min(10 g, 1/2 phụ kiện nhẹ nhất) giữ nguyên theo thiết kế phần cứng
var MOCK_TOOLS = [
  {
    id: 1,
    ma: "KTD-01",
    ten: "Kìm tuốt dây",
    ngan: "Ngăn 1",
    khoiLuongChuan: 145.0,
    dungSai: 10.0,
    trangThai: "dang_muon"
  },
  {
    id: 2,
    ma: "NH-01",
    ten: "Nhíp đầu nhọn",
    ngan: "Ngăn 1",
    khoiLuongChuan: 18.5,
    dungSai: 9.3,
    trangThai: "dang_muon"
  },
  {
    id: 3,
    ma: "TV-01",
    ten: "Bộ tua vít 6 cây",
    ngan: "Ngăn 2",
    khoiLuongChuan: 236.0,
    dungSai: 8.0,
    trangThai: "cho_kiem_tra"
  },
  {
    id: 4,
    ma: "KC-01",
    ten: "Kìm cắt chân linh kiện",
    ngan: "Ngăn 2",
    khoiLuongChuan: 112.0,
    dungSai: 10.0,
    trangThai: "san_co"
  }
];

// Vật tư tiêu hao đếm số lượng bằng cân: Pin 18650 có mạch bảo vệ (hộc pin / ngăn 3)
var MOCK_BATTERY = {
  ma: "PIN-18650",
  ten: "Pin 18650 (có mạch bảo vệ)",
  ngan: "Hộc pin",
  tonKho: 6,
  sucChua: 8,
  mUnit: 46.0,
  saiSoCell: 1.5,
  hanMuc: 4,
  nguongCanhBao: 2,
  sinhVienDangNo: 2,
  gioMuon: taoMocGio(1800, false),
  hanTra: taoMocGio(-5400, false),
  conLaiGiay: 5400
};

// Dụng cụ sinh viên hiện tại đang mượn
// conLaiGiay > 0 là còn hạn; conLaiGiay < 0 là đã quá hạn
var MOCK_BORROWING = [
  {
    toolId: 1,
    ma: "KTD-01",
    tenDungCu: "Kìm tuốt dây",
    ngan: "Ngăn 1",
    gioMuon: taoMocGio(2280, false),
    hanTra: taoMocGio(-4920, false),
    conLaiGiay: 4920
  },
  {
    toolId: 2,
    ma: "NH-01",
    tenDungCu: "Nhíp đầu nhọn",
    ngan: "Ngăn 1",
    gioMuon: taoMocGio(7920, false),
    hanTra: taoMocGio(720, false),
    conLaiGiay: -720
  }
];

// Lịch sử mượn trả gần đây của sinh viên
var MOCK_STUDENT_HISTORY = [
  {
    ma: "KC-01",
    dungCu: "Kìm cắt chân linh kiện",
    gioMuon: "Hôm qua, 14:10",
    gioTra: "Hôm qua, 15:55",
    ketQua: "ĐÚNG"
  },
  {
    ma: "TV-01",
    dungCu: "Bộ tua vít 6 cây",
    gioMuon: "21/11, 08:30",
    gioTra: "21/11, 10:15",
    ketQua: "ĐÚNG (BÁO HỎNG)"
  },
  {
    ma: "KTD-01",
    dungCu: "Kìm tuốt dây",
    gioMuon: "19/11, 13:20",
    gioTra: "19/11, 15:05",
    ketQua: "ĐÚNG"
  }
];

// Đúng 2 thiết bị theo kiến trúc: Node A (quầy + khay trả) và Node B (tủ 2 ngăn + hộc pin)
var MOCK_DEVICES = [
  {
    id: "nodeA",
    ten: "Node A",
    viTri: "Quầy + khay trả",
    trangThai: "online",
    lastSeenSec: 2,
    offlineSince: null,
    firmware: "0.3.1",
    camBien: "RC522, HX711 khay, LCD",
    rssi: -58
  },
  {
    id: "nodeB",
    ten: "Node B",
    viTri: "Tủ 2 ngăn + hộc pin",
    trangThai: "online",
    lastSeenSec: 1,
    offlineSince: null,
    firmware: "0.3.2",
    camBien: "HX711 ×3, DHT22, servo ×3",
    rssi: -63
  }
];

// Trạng thái khóa 2 ngăn dụng cụ + hộc pin
var MOCK_COMPARTMENT_LOCKS = {
  "Ngăn 1": "KHÓA",
  "Ngăn 2": "KHÓA",
  "Hộc pin": "KHÓA"
};

// Danh sách giao dịch gần đây hiển thị ở trang quản lý
var MOCK_TRANSACTIONS = [
  {
    ma: "GD-0413",
    sinhVien: "Nguyễn Minh Khoa",
    mssv: "20221234",
    maDungCu: "PIN-18650",
    dungCu: "Pin 18650 · mượn 2 pin",
    gioMuon: taoMocGio(1800, false),
    gioTra: "—",
    ketQua: "ĐANG MƯỢN"
  },
  {
    ma: "GD-0412",
    sinhVien: "Nguyễn Minh Khoa",
    mssv: "20221234",
    maDungCu: "KTD-01",
    dungCu: "Kìm tuốt dây",
    gioMuon: taoMocGio(2280, false),
    gioTra: "—",
    ketQua: "ĐANG MƯỢN"
  },
  {
    ma: "GD-0411",
    sinhVien: "Nguyễn Minh Khoa",
    mssv: "20221234",
    maDungCu: "NH-01",
    dungCu: "Nhíp đầu nhọn",
    gioMuon: taoMocGio(7920, false),
    gioTra: "—",
    ketQua: "QUÁ HẠN"
  },
  {
    ma: "GD-0410",
    sinhVien: "Trần Thị Lan",
    mssv: "20221508",
    maDungCu: "KC-01",
    dungCu: "Kìm cắt chân linh kiện",
    gioMuon: taoMocGio(10500, false),
    gioTra: taoMocGio(4800, false),
    ketQua: "ĐÚNG"
  },
  {
    ma: "GD-0409",
    sinhVien: "Lê Hoàng Nam",
    mssv: "20221190",
    maDungCu: "TV-01",
    dungCu: "Bộ tua vít 6 cây",
    gioMuon: taoMocGio(13200, false),
    gioTra: taoMocGio(8700, false),
    ketQua: "THIẾU PHỤ KIỆN"
  },
  {
    ma: "GD-0408",
    sinhVien: "Phạm Quốc Anh",
    mssv: "20221844",
    maDungCu: "KC-01",
    dungCu: "Kìm cắt chân linh kiện",
    gioMuon: taoMocGio(15300, false),
    gioTra: taoMocGio(13800, false),
    ketQua: "SAI MÓN"
  },
  {
    ma: "GD-0407",
    sinhVien: "Nguyễn Minh Khoa",
    mssv: "20221234",
    maDungCu: "NH-01",
    dungCu: "Nhíp đầu nhọn",
    gioMuon: taoMocGio(18600, false),
    gioTra: taoMocGio(18120, false),
    ketQua: "VẬT LẠ"
  },
  {
    ma: "GD-0406",
    sinhVien: "Trần Thị Lan",
    mssv: "20221508",
    maDungCu: "PIN-18650",
    dungCu: "Pin 18650 · trả 3 pin (đúng)",
    gioMuon: taoMocGio(21600, false),
    gioTra: taoMocGio(19800, false),
    ketQua: "ĐÚNG"
  },
  {
    ma: "GD-0405",
    sinhVien: "Lê Hoàng Nam",
    mssv: "20221190",
    maDungCu: "PIN-18650",
    dungCu: "Pin 18650",
    gioMuon: taoMocGio(25200, false),
    gioTra: taoMocGio(22500, false),
    ketQua: "TRẢ THIẾU: MƯỢN 4, TRẢ 3, CÒN NỢ 1"
  }
];

// Danh sách cảnh báo cố định (cảnh báo độ ẩm và mất kết nối Node B được đồng bộ tự động theo trạng thái thực)
var MOCK_ALERTS = [
  {
    id: 1,
    gio: taoMocGio(720, false),
    muc: "CAO",
    nguon: "NH-01",
    noiDung: "Nhíp đầu nhọn quá hạn trả (Nguyễn Minh Khoa · 20221234, trễ 12 phút).",
    toolId: null
  },
  {
    id: 2,
    gio: taoMocGio(4500, false),
    muc: "TRUNG BÌNH",
    nguon: "TV-01",
    noiDung: "Bộ tua vít 6 cây báo hỏng tại quầy, đang chờ quản lý kiểm tra.",
    toolId: 3
  }
];

// Nhật ký sự kiện dạng log kỹ thuật (dòng mới chèn lên đầu, tối đa 12 dòng)
var MOCK_EVENT_LOGS = [
  {
    gio: taoMocGio(2, true),
    eid: "B-313",
    chiTiet: "lab/cabB/env     {t: 29.1, rh: 71.8}"
  },
  {
    gio: taoMocGio(5, true),
    eid: "B-312",
    chiTiet: "lab/cabB/slot/3/state {eid: \"B-312\", g: 276.0, stable: true, lock: \"locked\", n: 6}"
  },
  {
    gio: taoMocGio(8, true),
    eid: "A-1025",
    chiTiet: "lab/kioskA/tray      {m: 0.2, stable: true}"
  },
  {
    gio: taoMocGio(19, true),
    eid: "B-310",
    chiTiet: "lab/cabB/slot/2/state {eid: \"B-310\", g: 348.0, stable: true}"
  },
  {
    gio: taoMocGio(34, true),
    eid: "A-1024",
    chiTiet: "KC-01 → trả OK (AI: kìm cắt 0,94; m=112,4 g)"
  },
  {
    gio: taoMocGio(36, true),
    eid: "A-1023",
    chiTiet: "lab/kioskA/tray      {m: 112.4, stable: true}"
  },
  {
    gio: taoMocGio(45, true),
    eid: "A-1022",
    chiTiet: "lab/kioskA/card      {eid: \"A-1022\", uid: \"04A1B2C3\"}"
  },
  {
    gio: taoMocGio(60, true),
    eid: "B-309",
    chiTiet: "lab/cabB/cmd         {slot: 2, action: \"lock\"}"
  },
  {
    gio: taoMocGio(74, true),
    eid: "A-1021",
    chiTiet: "lab/kioskA/tray      {m: 0.1, stable: true}"
  },
  {
    gio: taoMocGio(92, true),
    eid: "B-308",
    chiTiet: "lab/cabB/env     {t: 29.0, rh: 71.2}"
  },
  {
    gio: taoMocGio(110, true),
    eid: "A-1020",
    chiTiet: "KTD-01 → mượn OK (MSSV 20221234; Ngăn 1 mở)"
  }
];

// Thông tin Pi 4 (gateway) và danh sách thẻ đã đăng ký (mô phỏng)
var MOCK_PI_GATEWAY = {
  ten: "Pi 4 (gateway)",
  viTri: "192.168.4.1 · AP TramDungCu",
  trangThai: "online",
  uptime: "3 ngày 04:12:08",
  cpuTemp: "52,4 °C",
  firmware: "FastAPI + Mosquitto",
  camBien: "OV5647, SQLite WAL",
  usb0Internet: true
};

var MOCK_REGISTERED_CARDS = {
  "04A1B2C3": { mssv: "20221234", hoTen: "Nguyễn Minh Khoa" },
  "04D5E6F7": { mssv: "20221508", hoTen: "Trần Thị Lan" }
};
