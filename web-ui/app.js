// Xử lý giao diện Trạm mượn – trả dụng cụ thông minh (HTML/JS thuần, dữ liệu giả lập)

// Định dạng số thập phân kiểu Việt Nam (dấu phẩy)
function dinhDangSo(so, soLe) {
  return Number(so).toLocaleString("vi-VN", {
    minimumFractionDigits: soLe,
    maximumFractionDigits: soLe
  });
}

// Định dạng số giây thành HH:MM:SS
function dinhDangGiay(tongGiay) {
  var soDuong = Math.abs(tongGiay);
  var gio = Math.floor(soDuong / 3600);
  var phut = Math.floor((soDuong % 3600) / 60);
  var giay = soDuong % 60;
  var sGio = gio < 10 ? "0" + gio : "" + gio;
  var sPhut = phut < 10 ? "0" + phut : "" + phut;
  var sGiay = giay < 10 ? "0" + giay : "" + giay;
  return sGio + ":" + sPhut + ":" + sGiay;
}

// Tạo nhãn giờ HH:MM:SS hoặc HH:MM
function layNhanThoiGian(dateObj) {
  var h = dateObj.getHours();
  var m = dateObj.getMinutes();
  var s = dateObj.getSeconds();
  return (h < 10 ? "0" + h : "" + h) + ":" + (m < 10 ? "0" + m : "" + m) + ":" + (s < 10 ? "0" + s : "" + s);
}

function layGioPhut(dateObj) {
  var h = dateObj.getHours();
  var m = dateObj.getMinutes();
  return (h < 10 ? "0" + h : "" + h) + ":" + (m < 10 ? "0" + m : "" + m);
}

// Ký hiệu trạng thái dụng cụ (không dùng icon màu hay pill nền nhạt)
function taoTrangThaiDungCuHtml(trangThai) {
  if (trangThai === "san_co") {
    return "<span class=\"mono\">● SẴN CÓ</span>";
  }
  if (trangThai === "dang_muon") {
    return "<span class=\"mono is-muted\">○ ĐANG MƯỢN</span>";
  }
  if (trangThai === "cho_kiem_tra") {
    return "<span class=\"mono is-warn\">▲ CHỜ KIỂM TRA</span>";
  }
  return "<span class=\"mono\">" + trangThai + "</span>";
}

// ================= TRANG SINH VIÊN =================

var HAN_MUON_CHUAN_GIAY = 7200; // 2 giờ mượn chuẩn

function khoiTaoTrangSinhVien() {
  document.getElementById("sv-name").textContent = MOCK_STUDENT.hoTen;
  document.getElementById("sv-mssv").textContent = MOCK_STUDENT.mssv;
  document.getElementById("sv-class").textContent = MOCK_STUDENT.lop;
  document.getElementById("sv-card").textContent = MOCK_STUDENT.maThe;

  capNhatTomTatMuonSinhVien();
  veDanhSachDangMuon();
  veDanhSach4DungCuSinhVien();
  veKhoiPinSinhVien();
  veLichSuSinhVien();
  khoiTaoNutSinhVien();
  khoiTaoPinSinhVien();

  // Đếm ngược mỗi 1 giây
  setInterval(function () {
    for (var i = 0; i < MOCK_BORROWING.length; i++) {
      MOCK_BORROWING[i].conLaiGiay = MOCK_BORROWING[i].conLaiGiay - 1;
    }
    if (MOCK_BATTERY.sinhVienDangNo > 0) {
      MOCK_BATTERY.conLaiGiay = MOCK_BATTERY.conLaiGiay - 1;
    }
    capNhatDongHoSinhVien();
    capNhatHanPinSinhVien();
  }, 1000);
}

function capNhatTomTatMuonSinhVien() {
  var elSum = document.getElementById("sv-borrow-summary");
  if (!elSum) {
    return;
  }
  var quaHan = 0;
  for (var i = 0; i < MOCK_BORROWING.length; i++) {
    if (MOCK_BORROWING[i].conLaiGiay < 0) {
      quaHan++;
    }
  }
  if (MOCK_BATTERY.sinhVienDangNo > 0 && MOCK_BATTERY.conLaiGiay < 0) {
    quaHan++;
  }
  var baseText = MOCK_BORROWING.length + " DỤNG CỤ";
  if (MOCK_BATTERY.sinhVienDangNo > 0) {
    baseText += " + " + MOCK_BATTERY.sinhVienDangNo + " PIN";
  }
  if (quaHan > 0) {
    elSum.innerHTML = baseText + " · <span class=\"is-warn\">▲ " + quaHan + " QUÁ HẠN</span>";
  } else {
    elSum.textContent = baseText;
  }
}

function tinhPhanTramMuon(conLaiGiay) {
  if (conLaiGiay < 0) {
    return 100;
  }
  var daTroi = HAN_MUON_CHUAN_GIAY - conLaiGiay;
  var phanTram = Math.round((daTroi / HAN_MUON_CHUAN_GIAY) * 100);
  if (phanTram < 4) { phanTram = 4; }
  if (phanTram > 100) { phanTram = 100; }
  return phanTram;
}

function veDanhSachDangMuon() {
  var box = document.getElementById("borrowing-list");
  if (!box) {
    return;
  }
  if (MOCK_BORROWING.length === 0) {
    box.innerHTML = "<div class=\"panel\" style=\"padding:14px 16px;\"><span class=\"is-muted\">Hiện không mượn dụng cụ nào.</span></div>";
    return;
  }

  var html = "";
  for (var i = 0; i < MOCK_BORROWING.length; i++) {
    var item = MOCK_BORROWING[i];
    var quaHan = item.conLaiGiay < 0;
    var lopKhung = quaHan ? "borrow-block is-overdue" : "borrow-block";
    var nhanTrangThai = quaHan
      ? "<span class=\"borrow-status-label mono is-warn\">▲ QUÁ HẠN TRẢ</span>"
      : "<span class=\"borrow-status-label mono\">● CÒN HẠN</span>";
    var lopThanh = quaHan ? "progress-fill is-overdue" : "progress-fill";
    var phanTram = tinhPhanTramMuon(item.conLaiGiay);
    var chuoiDongHo = (quaHan ? "+" : "") + dinhDangGiay(item.conLaiGiay);

    html +=
      "<div class=\"" + lopKhung + "\" id=\"borrow-block-" + i + "\">" +
      "  <div class=\"borrow-top\">" +
      "    <div>" +
      "      <div class=\"borrow-code mono\">" + item.ma + " · " + item.ngan + "</div>" +
      "      <div class=\"borrow-name\">" + item.tenDungCu + "</div>" +
      "      <div class=\"borrow-sub mono\">Mượn " + item.gioMuon + " → Hạn " + item.hanTra + "</div>" +
      "    </div>" +
      "    <div id=\"borrow-status-" + i + "\">" + nhanTrangThai + "</div>" +
      "  </div>" +
      "  <div class=\"borrow-clock mono\" id=\"borrow-timer-" + i + "\">" + chuoiDongHo + "</div>" +
      "  <div class=\"progress-track\">" +
      "    <div class=\"" + lopThanh + "\" id=\"borrow-bar-" + i + "\" style=\"width:" + phanTram + "%\"></div>" +
      "  </div>" +
      "  <div class=\"progress-foot mono\">" +
      "    <span>" + (quaHan ? "Thời gian trễ hạn" : "Thời gian còn lại") + "</span>" +
      "    <span id=\"borrow-pct-" + i + "\">" + phanTram + "%</span>" +
      "  </div>" +
      "</div>";
  }
  box.innerHTML = html;
}

function capNhatDongHoSinhVien() {
  for (var i = 0; i < MOCK_BORROWING.length; i++) {
    var item = MOCK_BORROWING[i];
    var quaHan = item.conLaiGiay < 0;
    var phanTram = tinhPhanTramMuon(item.conLaiGiay);

    var elTimer = document.getElementById("borrow-timer-" + i);
    var elBar = document.getElementById("borrow-bar-" + i);
    var elPct = document.getElementById("borrow-pct-" + i);
    var elBlock = document.getElementById("borrow-block-" + i);
    var elStatus = document.getElementById("borrow-status-" + i);

    if (elTimer) {
      elTimer.textContent = (quaHan ? "+" : "") + dinhDangGiay(item.conLaiGiay);
    }
    if (elPct) {
      elPct.textContent = phanTram + "%";
    }
    if (elBar) {
      elBar.style.width = phanTram + "%";
      elBar.className = quaHan ? "progress-fill is-overdue" : "progress-fill";
    }
    if (elBlock) {
      elBlock.className = quaHan ? "borrow-block is-overdue" : "borrow-block";
    }
    if (elStatus) {
      elStatus.innerHTML = quaHan
        ? "<span class=\"borrow-status-label mono is-warn\">▲ QUÁ HẠN TRẢ</span>"
        : "<span class=\"borrow-status-label mono\">● CÒN HẠN</span>";
    }
  }
  capNhatTomTatMuonSinhVien();
}

function veDanhSach4DungCuSinhVien() {
  var box = document.getElementById("student-tools");
  if (!box) {
    return;
  }
  var html = "";
  for (var i = 0; i < MOCK_TOOLS.length; i++) {
    var t = MOCK_TOOLS[i];
    html +=
      "<div class=\"tool-row\">" +
      "  <span class=\"mono\">" + t.ma + "</span>" +
      "  <span>" + t.ten + "</span>" +
      "  <span class=\"tool-row-slot\">" + t.ngan + "</span>" +
      "  <span class=\"tool-row-status\">" + taoTrangThaiDungCuHtml(t.trangThai) + "</span>" +
      "</div>";
  }
  box.innerHTML = html;
}

function veKhoiPinSinhVien() {
  var elStock = document.getElementById("sv-pin-stock");
  var elDebt = document.getElementById("sv-pin-debt");
  if (elStock) {
    if (MOCK_BATTERY.tonKho <= MOCK_BATTERY.nguongCanhBao) {
      elStock.innerHTML = "<span class=\"is-warn\">▲ " + MOCK_BATTERY.tonKho + " / " + MOCK_BATTERY.sucChua + " cell</span>";
    } else {
      elStock.textContent = MOCK_BATTERY.tonKho + " / " + MOCK_BATTERY.sucChua + " cell";
    }
  }
  if (elDebt) {
    elDebt.textContent = MOCK_BATTERY.sinhVienDangNo + " / " + MOCK_BATTERY.hanMuc + " cell";
  }
  capNhatHanPinSinhVien();
}

function capNhatHanPinSinhVien() {
  var elDue = document.getElementById("sv-pin-due");
  if (!elDue) {
    return;
  }
  if (MOCK_BATTERY.sinhVienDangNo <= 0) {
    elDue.textContent = "Không nợ";
    elDue.classList.remove("is-warn");
    return;
  }
  var quaHan = MOCK_BATTERY.conLaiGiay < 0;
  var chuoiDem = (quaHan ? "trễ +" : "còn ") + dinhDangGiay(MOCK_BATTERY.conLaiGiay);
  elDue.textContent = MOCK_BATTERY.hanTra + " (" + chuoiDem + ")";
  if (quaHan) {
    elDue.classList.add("is-warn");
  } else {
    elDue.classList.remove("is-warn");
  }
}

function khoiTaoPinSinhVien() {
  var btnMinus = document.getElementById("pin-qty-minus");
  var btnPlus = document.getElementById("pin-qty-plus");
  var valEl = document.getElementById("pin-qty-val");
  var btnBorrow = document.getElementById("borrow-pin-btn");
  var feedbackEl = document.getElementById("sv-pin-feedback");
  var soLuongChon = 1;

  function capNhatSoChon() {
    if (valEl) {
      valEl.textContent = soLuongChon;
    }
  }

  if (btnMinus) {
    btnMinus.addEventListener("click", function () {
      if (soLuongChon > 1) {
        soLuongChon--;
        capNhatSoChon();
      }
    });
  }
  if (btnPlus) {
    btnPlus.addEventListener("click", function () {
      if (soLuongChon < MOCK_BATTERY.hanMuc) {
        soLuongChon++;
        capNhatSoChon();
      }
    });
  }
  if (btnBorrow) {
    btnBorrow.addEventListener("click", function () {
      if (MOCK_BATTERY.sinhVienDangNo + soLuongChon > MOCK_BATTERY.hanMuc) {
        if (feedbackEl) {
          feedbackEl.className = "report-feedback mono is-warn";
          feedbackEl.textContent = "▲ Vượt hạn mức " + MOCK_BATTERY.hanMuc + " cell/người (đang nợ " + MOCK_BATTERY.sinhVienDangNo + ").";
        }
        return;
      }
      if (soLuongChon > MOCK_BATTERY.tonKho) {
        if (feedbackEl) {
          feedbackEl.className = "report-feedback mono is-warn";
          feedbackEl.textContent = "▲ Hộc pin chỉ còn " + MOCK_BATTERY.tonKho + " cell.";
        }
        return;
      }

      var bayGio = new Date();
      if (MOCK_BATTERY.sinhVienDangNo === 0) {
        MOCK_BATTERY.gioMuon = layGioPhut(bayGio);
        MOCK_BATTERY.hanTra = layGioPhut(new Date(bayGio.getTime() + HAN_MUON_CHUAN_GIAY * 1000));
        MOCK_BATTERY.conLaiGiay = HAN_MUON_CHUAN_GIAY;
      }
      MOCK_BATTERY.tonKho -= soLuongChon;
      MOCK_BATTERY.sinhVienDangNo += soLuongChon;

      veKhoiPinSinhVien();
      capNhatTomTatMuonSinhVien();
      if (feedbackEl) {
        feedbackEl.className = "report-feedback mono";
        feedbackEl.textContent = "Đã mở hộc pin: mượn " + soLuongChon + " cell (" + layGioPhut(bayGio) + ").";
      }
    });
  }
}

function veLichSuSinhVien() {
  var box = document.getElementById("student-history-list");
  if (!box) {
    return;
  }
  var html = "";
  for (var i = 0; i < MOCK_STUDENT_HISTORY.length; i++) {
    var h = MOCK_STUDENT_HISTORY[i];
    var coSuCo = h.ketQua.indexOf("BÁO HỎNG") !== -1 || h.ketQua.indexOf("QUÁ HẠN") !== -1;
    var kqHtml = coSuCo
      ? "<span class=\"mono is-warn\">▲ " + h.ketQua + "</span>"
      : "<span class=\"mono\">" + h.ketQua + "</span>";

    html +=
      "<div class=\"history-row\">" +
      "  <div class=\"history-line1\">" +
      "    <span><span class=\"mono\">" + h.ma + "</span> · " + h.dungCu + "</span>" +
           kqHtml +
      "  </div>" +
      "  <div class=\"history-line2 mono\">" + h.gioMuon + " → " + h.gioTra + "</div>" +
      "</div>";
  }
  box.innerHTML = html;
}

function khoiTaoNutSinhVien() {
  var btnReport = document.getElementById("toggle-report-btn");
  var boxReport = document.getElementById("report-broken-box");
  var btnCloseReport = document.getElementById("close-report-btn");
  var btnGuide = document.getElementById("toggle-guide-btn");
  var boxGuide = document.getElementById("return-guide-box");
  var btnCloseGuide = document.getElementById("close-guide-btn");
  var selectTool = document.getElementById("report-tool-select");
  var formReport = document.getElementById("report-broken-form");

  if (selectTool) {
    var opts = "";
    for (var i = 0; i < MOCK_TOOLS.length; i++) {
      opts += "<option value=\"" + MOCK_TOOLS[i].id + "\">" + MOCK_TOOLS[i].ma + " — " + MOCK_TOOLS[i].ten + "</option>";
    }
    selectTool.innerHTML = opts;
  }

  if (btnReport && boxReport) {
    btnReport.addEventListener("click", function () {
      boxReport.hidden = !boxReport.hidden;
      if (boxGuide) { boxGuide.hidden = true; }
    });
  }
  if (btnCloseReport && boxReport) {
    btnCloseReport.addEventListener("click", function () {
      boxReport.hidden = true;
    });
  }
  if (btnGuide && boxGuide) {
    btnGuide.addEventListener("click", function () {
      boxGuide.hidden = !boxGuide.hidden;
      if (boxReport) { boxReport.hidden = true; }
    });
  }
  if (btnCloseGuide && boxGuide) {
    btnCloseGuide.addEventListener("click", function () {
      boxGuide.hidden = true;
    });
  }

  if (formReport) {
    formReport.addEventListener("submit", function (e) {
      e.preventDefault();
      var toolId = Number(selectTool.value);
      var noteEl = document.getElementById("report-note-input");
      var feedbackEl = document.getElementById("report-feedback");
      var chonTool = null;

      for (var i = 0; i < MOCK_TOOLS.length; i++) {
        if (MOCK_TOOLS[i].id === toolId) {
          MOCK_TOOLS[i].trangThai = "cho_kiem_tra";
          chonTool = MOCK_TOOLS[i];
        }
      }
      veDanhSach4DungCuSinhVien();
      if (feedbackEl && chonTool) {
        feedbackEl.textContent = "Đã gửi báo hỏng " + chonTool.ma + " (" + layGioPhut(new Date()) + ").";
      }
      if (noteEl) {
        noteEl.value = "";
      }
    });
  }
}

// ================= TRANG QUẢN LÝ =================

var weightChart = null;
var envChart = null;
var batteryChart = null;

var weightData = {
  labels: [],
  khay: [],
  ngan1: [],
  ngan2: []
};

var envData = {
  labels: [],
  temp: [],
  rh: [],
  nguong70: []
};

var batteryData = {
  labels: [],
  count: [],
  nguong2: [],
  weight: []
};

var soDiemWeight = 20;
var soDiemEnv = 20;
var soDiemBattery = 20;
var demTickBieuDo = 0;
var suKienConLai = 0;
var loaiSuKienHienTai = 0;
var soThuTuEidA = 1026;
var soThuTuEidB = 314;
var gioVuotDoAm = null;
var gioPinSapHet = null;
var buocMoPhongPin = 0;
var CHUOI_PIN_MO_PHONG = [2, 5, 3, 2, 6];

var DANH_SACH_TAB = ["tong-quan", "cam-bien", "giao-dich", "kho", "thiet-lap"];

// Plugin vẽ nhãn "70 %RH ngưỡng" ở lề phải NGOÀI vùng vẽ để không đè lên đường dữ liệu
var pluginNhanNguong = {
  id: "nhanNguong70",
  afterDatasetsDraw: function (chart) {
    var ctx = chart.ctx;
    var yRh = chart.scales.yRh;
    if (!yRh) {
      return;
    }
    var y70 = yRh.getPixelForValue(70);
    if (y70 < yRh.top || y70 > yRh.bottom) {
      return;
    }
    ctx.save();
    ctx.font = "500 11px \"IBM Plex Mono\", monospace";
    ctx.fillStyle = "#C56A3D";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("70 %RH", yRh.right + 10, y70 - 7);
    ctx.fillText("ngưỡng", yRh.right + 10, y70 + 7);
    ctx.restore();
  }
};

var pluginNhanNguongPin = {
  id: "nhanNguongPin2",
  afterDatasetsDraw: function (chart) {
    var ctx = chart.ctx;
    var yPin = chart.scales.y;
    var area = chart.chartArea;
    if (!yPin || !area) {
      return;
    }
    var y2 = yPin.getPixelForValue(2);
    if (y2 < area.top || y2 > area.bottom) {
      return;
    }
    ctx.save();
    ctx.font = "500 11px \"IBM Plex Mono\", monospace";
    ctx.fillStyle = "#C56A3D";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("2 cell", area.right + 10, y2 - 7);
    ctx.fillText("sắp hết", area.right + 10, y2 + 7);
    ctx.restore();
  }
};

function khoiTaoTrangQuanLy() {
  capNhatDongHoTopbar();
  khoiTaoDuLieuBieuDo();
  capNhatChiSoNhanh();
  veBangThietBi();
  veDanhSachCanhBao();
  veNhatKySuKien();
  veBangGiaoDich();
  veBangKhoVaSoDo();
  veBieuDoLanDau();
  khoiTaoTabQuanLy();
  khoiTaoNutKhoangThoiGian();
  khoiTaoMoPhongNodeB();
  khoiTaoTabThietLap();

  // Cập nhật đồng hồ và bộ đếm "s trước" của Node A/B mỗi 1 giây
  setInterval(function () {
    capNhatDongHoTopbar();
    for (var i = 0; i < MOCK_DEVICES.length; i++) {
      if (MOCK_DEVICES[i].trangThai === "online") {
        MOCK_DEVICES[i].lastSeenSec++;
      }
    }
    veBangThietBi();
  }, 1000);

  // Mô phỏng gói tin cảm biến mới mỗi 1,5 giây
  setInterval(capNhatBieuDoMoi, 1500);
}

function capNhatDongHoTopbar() {
  var clockEl = document.getElementById("live-clock");
  if (clockEl) {
    clockEl.textContent = layNhanThoiGian(new Date());
  }
}

function capNhatMocCapNhatCuoi(dateObj) {
  var chuoi = layNhanThoiGian(dateObj);
  var ids = ["last-updated", "weight-updated", "env-updated", "battery-updated"];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) {
      el.textContent = chuoi;
    }
  }
}

function khoiTaoTabQuanLy() {
  var cacNut = document.querySelectorAll(".topbar-nav .nav-tab");
  for (var i = 0; i < cacNut.length; i++) {
    cacNut[i].addEventListener("click", function () {
      var tenTab = this.getAttribute("data-tab");
      window.location.hash = "#" + tenTab;
      chonTab(tenTab);
    });
  }

  window.addEventListener("hashchange", function () {
    chonTab(layTabTuHash());
  });

  chonTab(layTabTuHash());
}

function layTabTuHash() {
  var hash = window.location.hash.replace("#", "");
  for (var i = 0; i < DANH_SACH_TAB.length; i++) {
    if (DANH_SACH_TAB[i] === hash) {
      return hash;
    }
  }
  return "tong-quan";
}

function chonTab(tenTab) {
  var cacNut = document.querySelectorAll(".topbar-nav .nav-tab");
  for (var i = 0; i < cacNut.length; i++) {
    if (cacNut[i].getAttribute("data-tab") === tenTab) {
      cacNut[i].classList.add("active");
    } else {
      cacNut[i].classList.remove("active");
    }
  }

  for (var j = 0; j < DANH_SACH_TAB.length; j++) {
    var panel = document.getElementById("tab-" + DANH_SACH_TAB[j]);
    if (panel) {
      if (DANH_SACH_TAB[j] === tenTab) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    }
  }

  if (tenTab === "cam-bien") {
    if (weightChart !== null) { weightChart.resize(); }
    if (envChart !== null) { envChart.resize(); }
    if (batteryChart !== null) { batteryChart.resize(); }
  }
}

function khoiTaoNutKhoangThoiGian() {
  var cacNhom = document.querySelectorAll(".range-tabs");
  for (var i = 0; i < cacNhom.length; i++) {
    var cacNut = cacNhom[i].querySelectorAll(".range-btn");
    for (var j = 0; j < cacNut.length; j++) {
      cacNut[j].addEventListener("click", function () {
        var cha = this.parentElement;
        var nhomTen = cha.getAttribute("data-chart-group");
        var soDiem = Number(this.getAttribute("data-points"));

        var nutCungNhom = cha.querySelectorAll(".range-btn");
        for (var k = 0; k < nutCungNhom.length; k++) {
          nutCungNhom[k].classList.remove("active");
        }
        this.classList.add("active");

        if (nhomTen === "weight") {
          soDiemWeight = soDiem;
          dongBoDuLieuWeightChart();
        } else if (nhomTen === "env") {
          soDiemEnv = soDiem;
          dongBoDuLieuEnvChart();
        } else if (nhomTen === "battery") {
          soDiemBattery = soDiem;
          dongBoDuLieuBatteryChart();
        }
      });
    }
  }
}

function khoiTaoMoPhongNodeB() {
  var btn = document.getElementById("toggle-nodeb-btn");
  if (!btn) {
    return;
  }
  btn.addEventListener("click", function () {
    var nodeB = MOCK_DEVICES[1];
    var bayGio = new Date();
    if (nodeB.trangThai === "online") {
      nodeB.trangThai = "offline";
      nodeB.offlineSince = layGioPhut(bayGio);
      btn.textContent = "Khôi phục Node B online";
      themDongNhatKy("B-" + soThuTuEidB++, "lab/cabB/status  offline (Last Will)", true);
    } else {
      nodeB.trangThai = "online";
      nodeB.offlineSince = null;
      nodeB.lastSeenSec = 1;
      btn.textContent = "Mô phỏng Node B offline";
      themDongNhatKy("B-" + soThuTuEidB++, "lab/cabB/status  online (reconnect)", false);
    }
    veBangThietBi();
    veDanhSachCanhBao();
  });
}

// Cập nhật dải số liệu ngang trên tab Tổng quan (đảm bảo sẵn có + đang mượn + chờ kiểm tra = 4)
function capNhatChiSoNhanh() {
  var maSanCo = [];
  var maDangMuon = [];
  var maChoKiemTra = [];

  for (var i = 0; i < MOCK_TOOLS.length; i++) {
    var t = MOCK_TOOLS[i];
    if (t.trangThai === "san_co") {
      maSanCo.push(t.ma);
    } else if (t.trangThai === "dang_muon") {
      maDangMuon.push(t.ma);
    } else if (t.trangThai === "cho_kiem_tra") {
      maChoKiemTra.push(t.ma);
    }
  }

  var dsQuaHan = [];
  for (var j = 0; j < MOCK_BORROWING.length; j++) {
    if (MOCK_BORROWING[j].conLaiGiay < 0) {
      dsQuaHan.push(MOCK_BORROWING[j].ma + " · " + MOCK_STUDENT.mssv);
    }
  }

  document.getElementById("stat-available").textContent = maSanCo.length;
  document.getElementById("stat-available-sub").textContent = maSanCo.length > 0 ? maSanCo.join(", ") : "Không có";

  document.getElementById("stat-borrowed").textContent = maDangMuon.length;
  document.getElementById("stat-borrowed-sub").textContent = maDangMuon.length > 0 ? maDangMuon.join(", ") : "Không có";

  var elOverdue = document.getElementById("stat-overdue");
  elOverdue.textContent = dsQuaHan.length;
  if (dsQuaHan.length > 0) {
    elOverdue.classList.add("is-warn");
  } else {
    elOverdue.classList.remove("is-warn");
  }
  document.getElementById("stat-overdue-sub").textContent = dsQuaHan.length > 0 ? dsQuaHan.join(", ") : "Không có quá hạn";

  document.getElementById("stat-check").textContent = maChoKiemTra.length;
  document.getElementById("stat-check-sub").textContent = maChoKiemTra.length > 0 ? maChoKiemTra.join(", ") + " · báo hỏng" : "Không có";

  var elPin = document.getElementById("stat-battery");
  var elPinWrap = document.getElementById("stat-battery-wrap");
  var elPinWarn = document.getElementById("stat-battery-warn");
  var elPinSub = document.getElementById("stat-battery-sub");
  if (elPin) {
    elPin.textContent = MOCK_BATTERY.tonKho;
  }
  var pinThap = MOCK_BATTERY.tonKho <= MOCK_BATTERY.nguongCanhBao;
  if (elPinWrap) {
    if (pinThap) { elPinWrap.classList.add("is-warn"); } else { elPinWrap.classList.remove("is-warn"); }
  }
  if (elPinWarn) {
    elPinWarn.textContent = pinThap ? "▲" : "";
  }
  if (elPinSub) {
    elPinSub.textContent = pinThap ? "Sắp hết (≤ 2 cell) · 46,0 g/cell" : "46,0 g/cell · tối đa 4/người";
    if (pinThap) { elPinSub.classList.add("is-warn"); } else { elPinSub.classList.remove("is-warn"); }
  }
}

function veBangThietBi() {
  var tbody = document.getElementById("devices-body");
  if (!tbody) {
    return;
  }

  var html = "";
  if (typeof MOCK_PI_GATEWAY !== "undefined") {
    html +=
      "<tr>" +
      "  <td><strong>" + MOCK_PI_GATEWAY.ten + "</strong> <span class=\"cell-sub\">· " + MOCK_PI_GATEWAY.viTri + "</span></td>" +
      "  <td><span class=\"mono\">● ONLINE</span></td>" +
      "  <td><span class=\"mono\">chạy " + MOCK_PI_GATEWAY.uptime + "</span></td>" +
      "  <td class=\"mono\">" + MOCK_PI_GATEWAY.firmware + "</td>" +
      "  <td class=\"cell-sub\">" + MOCK_PI_GATEWAY.camBien + " · CPU " + MOCK_PI_GATEWAY.cpuTemp + "</td>" +
      "  <td class=\"mono col-right\">AP (wlan0)</td>" +
      "</tr>";
  }
  for (var i = 0; i < MOCK_DEVICES.length; i++) {
    var d = MOCK_DEVICES[i];
    var isOnline = d.trangThai === "online";
    var statusHtml = isOnline
      ? "<span class=\"mono\">● ONLINE</span>"
      : "<span class=\"mono is-warn\">▲ OFFLINE</span>";
    var lastSeenHtml = isOnline
      ? "<span class=\"mono\">" + d.lastSeenSec + " s trước</span>"
      : "<span class=\"mono is-warn\">mất kết nối từ " + d.offlineSince + " (sau Last Will)</span>";
    var rssiHtml = isOnline ? d.rssi + " dBm" : "—";

    html +=
      "<tr>" +
      "  <td><strong>" + d.ten + "</strong> <span class=\"cell-sub\">· " + d.viTri + "</span></td>" +
      "  <td>" + statusHtml + "</td>" +
      "  <td>" + lastSeenHtml + "</td>" +
      "  <td class=\"mono\">" + d.firmware + "</td>" +
      "  <td class=\"cell-sub\">" + d.camBien + "</td>" +
      "  <td class=\"mono col-right\">" + rssiHtml + "</td>" +
      "</tr>";
  }
  tbody.innerHTML = html;
}

// Đồng bộ danh sách cảnh báo với dữ liệu mô phỏng (độ ẩm > 70 %RH, Node B offline)
function veDanhSachCanhBao() {
  var tbody = document.getElementById("alerts-body");
  var countEl = document.getElementById("alerts-count-text");
  if (!tbody) {
    return;
  }

  var danhSachHienThi = [];
  var cuoiRh = envData.rh.length > 0 ? envData.rh[envData.rh.length - 1] : 0;

  if (cuoiRh > 70) {
    if (gioVuotDoAm === null) {
      gioVuotDoAm = layGioPhut(new Date());
    }
    danhSachHienThi.push({
      id: "auto-rh",
      gio: gioVuotDoAm,
      muc: "CAO",
      nguon: "Node B / DHT22",
      noiDung: "Độ ẩm ngăn tủ đạt " + dinhDangSo(cuoiRh, 1) + " %RH (vượt ngưỡng 70,0 %RH) – cần kiểm tra hút ẩm.",
      toolId: null
    });
  } else {
    gioVuotDoAm = null;
  }

  var nodeB = MOCK_DEVICES[1];
  if (nodeB && nodeB.trangThai === "offline") {
    danhSachHienThi.push({
      id: "auto-nodeb",
      gio: nodeB.offlineSince,
      muc: "CAO",
      nguon: "Node B",
      noiDung: "Mất kết nối từ " + nodeB.offlineSince + " (sau Last Will).",
      toolId: null
    });
  }

  if (MOCK_BATTERY.tonKho <= MOCK_BATTERY.nguongCanhBao) {
    if (gioPinSapHet === null) {
      gioPinSapHet = layGioPhut(new Date());
    }
    danhSachHienThi.push({
      id: "auto-pin",
      gio: gioPinSapHet,
      muc: "CAO",
      nguon: "PIN-18650 / Hộc pin",
      noiDung: "Pin 18650 sắp hết (còn " + MOCK_BATTERY.tonKho + "/" + MOCK_BATTERY.sucChua + ").",
      toolId: null
    });
  } else {
    gioPinSapHet = null;
  }

  for (var i = 0; i < MOCK_ALERTS.length; i++) {
    danhSachHienThi.push(MOCK_ALERTS[i]);
  }

  if (countEl) {
    countEl.textContent = danhSachHienThi.length + " MỤC";
  }

  if (danhSachHienThi.length === 0) {
    tbody.innerHTML = "<tr><td colspan=\"5\" class=\"is-muted\">Không có cảnh báo cần xử lý.</td></tr>";
    return;
  }

  var html = "";
  for (var j = 0; j < danhSachHienThi.length; j++) {
    var a = danhSachHienThi[j];
    var mucHtml = a.muc === "CAO"
      ? "<span class=\"mono is-warn\">▲ CAO</span>"
      : "<span class=\"mono\">TRUNG BÌNH</span>";

    var hanhDongHtml = "<span class=\"mono is-muted\">—</span>";
    if (a.toolId !== null) {
      hanhDongHtml =
        "<button type=\"button\" class=\"btn-action\" onclick=\"xacNhanDaKiemTra(" +
        a.id + ", " + a.toolId + ")\">Đã kiểm tra</button>";
    }

    html +=
      "<tr>" +
      "  <td class=\"mono\">" + a.gio + "</td>" +
      "  <td>" + mucHtml + "</td>" +
      "  <td class=\"mono\">" + a.nguon + "</td>" +
      "  <td>" + a.noiDung + "</td>" +
      "  <td class=\"col-right\">" + hanhDongHtml + "</td>" +
      "</tr>";
  }
  tbody.innerHTML = html;
}

// Khi người quản lý bấm nút "Đã kiểm tra"
function xacNhanDaKiemTra(alertId, toolId) {
  var maDaSua = "";
  for (var i = 0; i < MOCK_TOOLS.length; i++) {
    if (MOCK_TOOLS[i].id === toolId) {
      MOCK_TOOLS[i].trangThai = "san_co";
      maDaSua = MOCK_TOOLS[i].ma;
    }
  }

  var danhSachMoi = [];
  for (var j = 0; j < MOCK_ALERTS.length; j++) {
    if (MOCK_ALERTS[j].id !== alertId) {
      danhSachMoi.push(MOCK_ALERTS[j]);
    }
  }
  MOCK_ALERTS = danhSachMoi;

  if (maDaSua !== "") {
    themDongNhatKy("A-" + soThuTuEidA++, maDaSua + " → đã kiểm tra OK, sẵn sàng cấp phát", false);
  }

  capNhatChiSoNhanh();
  veDanhSachCanhBao();
  veBangKhoVaSoDo();
}

function themDongNhatKy(eid, chiTiet, laCanhBao) {
  MOCK_EVENT_LOGS.unshift({
    gio: layNhanThoiGian(new Date()),
    eid: eid,
    chiTiet: chiTiet,
    canhBao: !!laCanhBao
  });
  if (MOCK_EVENT_LOGS.length > 12) {
    MOCK_EVENT_LOGS.pop();
  }
  veNhatKySuKien();
}

function veNhatKySuKien() {
  var box = document.getElementById("event-log-list");
  if (!box) {
    return;
  }
  var html = "";
  var toiDa = Math.min(MOCK_EVENT_LOGS.length, 12);
  for (var i = 0; i < toiDa; i++) {
    var log = MOCK_EVENT_LOGS[i];
    var lop = log.canhBao ? "log-line is-warn" : "log-line";
    html +=
      "<div class=\"" + lop + "\">" +
      "<span class=\"log-line-time\">" + log.gio + "</span>  " +
      "<span class=\"log-line-eid\">eid " + log.eid + "</span>  " +
      log.chiTiet +
      "</div>";
  }
  box.innerHTML = html;
}

function veBangGiaoDich() {
  var tbody = document.getElementById("transactions-body");
  var countEl = document.getElementById("transactions-count-text");
  if (countEl) {
    countEl.textContent = MOCK_TRANSACTIONS.length + " GIAO DỊCH";
  }
  if (!tbody) {
    return;
  }

  var html = "";
  for (var i = 0; i < MOCK_TRANSACTIONS.length; i++) {
    var g = MOCK_TRANSACTIONS[i];
    var kqHtml = "";
    if (g.ketQua === "ĐÚNG" || g.ketQua.indexOf("ĐÚNG") === 0) {
      kqHtml = "<span class=\"mono\">" + g.ketQua + "</span>";
    } else if (g.ketQua.indexOf("ĐANG MƯỢN") === 0) {
      kqHtml = "<span class=\"mono is-muted\">○ " + g.ketQua + "</span>";
    } else {
      kqHtml = "<span class=\"mono is-warn\">▲ " + g.ketQua + "</span>";
    }

    html +=
      "<tr>" +
      "  <td class=\"mono\">" + g.ma + "</td>" +
      "  <td>" + g.sinhVien + " <span class=\"mono cell-sub\">" + g.mssv + "</span></td>" +
      "  <td><span class=\"mono\">" + g.maDungCu + "</span> " + g.dungCu + "</td>" +
      "  <td class=\"mono\">" + g.gioMuon + "</td>" +
      "  <td class=\"mono\">" + g.gioTra + "</td>" +
      "  <td>" + kqHtml + "</td>" +
      "</tr>";
  }
  tbody.innerHTML = html;
}

function veBangKhoVaSoDo() {
  // 1. Bảng 4 dụng cụ + Pin 18650
  var tbody = document.getElementById("inventory-body");
  var pinThap = MOCK_BATTERY.tonKho <= MOCK_BATTERY.nguongCanhBao;
  var pinTrangThaiHtml = pinThap
    ? "<span class=\"mono is-warn\">▲ SẮP HẾT: " + MOCK_BATTERY.tonKho + "/" + MOCK_BATTERY.sucChua + " CELL</span>"
    : "<span class=\"mono\">● CÒN " + MOCK_BATTERY.tonKho + "/" + MOCK_BATTERY.sucChua + " CELL</span>";

  if (tbody) {
    var html = "";
    for (var i = 0; i < MOCK_TOOLS.length; i++) {
      var t = MOCK_TOOLS[i];
      html +=
        "<tr>" +
        "  <td class=\"mono\">" + t.ma + "</td>" +
        "  <td>" + t.ten + "</td>" +
        "  <td>" + t.ngan + "</td>" +
        "  <td class=\"mono col-right\">" + dinhDangSo(t.khoiLuongChuan, 1) + " g</td>" +
        "  <td class=\"mono col-right\">± " + dinhDangSo(t.dungSai, 1) + " g</td>" +
        "  <td>" + taoTrangThaiDungCuHtml(t.trangThai) + "</td>" +
        "</tr>";
    }
    html +=
      "<tr>" +
      "  <td class=\"mono\">" + MOCK_BATTERY.ma + "</td>" +
      "  <td>" + MOCK_BATTERY.ten + "</td>" +
      "  <td>Hộc pin (ngăn 3)</td>" +
      "  <td class=\"mono col-right\">" + dinhDangSo(MOCK_BATTERY.mUnit, 1) + " g / cell</td>" +
      "  <td class=\"mono col-right\">± (2 + 1,5×n) g</td>" +
      "  <td>" + pinTrangThaiHtml + "</td>" +
      "</tr>";
    tbody.innerHTML = html;
  }

  // 2. Sơ đồ 2 ngăn dụng cụ + hộc pin (ngăn 3)
  var schBox = document.getElementById("compartment-schematic");
  if (!schBox) {
    return;
  }
  var cuoi = weightData.labels.length - 1;
  var canNgan1 = cuoi >= 0 ? weightData.ngan1[cuoi] : 0;
  var canNgan2 = cuoi >= 0 ? weightData.ngan2[cuoi] : 348.0;
  var cuoiPin = batteryData.weight.length - 1;
  var canHocPin = cuoiPin >= 0 ? batteryData.weight[cuoiPin] : MOCK_BATTERY.tonKho * MOCK_BATTERY.mUnit;

  var danhSachNgan = [
    { ten: "Ngăn 1", canHienTai: canNgan1 },
    { ten: "Ngăn 2", canHienTai: canNgan2 }
  ];

  var schHtml = "";
  for (var n = 0; n < danhSachNgan.length; n++) {
    var nganInfo = danhSachNgan[n];
    var tongChuan = 0;
    var coChoKiemTra = false;
    var rowsHtml = "";

    for (var j = 0; j < MOCK_TOOLS.length; j++) {
      var tool = MOCK_TOOLS[j];
      if (tool.ngan === nganInfo.ten) {
        tongChuan += tool.khoiLuongChuan;
        if (tool.trangThai === "cho_kiem_tra") {
          coChoKiemTra = true;
        }
        rowsHtml +=
          "<div class=\"schematic-tool-row\">" +
          "  <span><span class=\"mono\">" + tool.ma + "</span> · " + tool.ten + "</span>" +
          "  <span>" + taoTrangThaiDungCuHtml(tool.trangThai) + "</span>" +
          "</div>";
      }
    }

    var lopBox = coChoKiemTra ? "schematic-box is-warn-border" : "schematic-box";
    var khoaText = MOCK_COMPARTMENT_LOCKS[nganInfo.ten] || "KHÓA";

    schHtml +=
      "<div class=\"" + lopBox + "\">" +
      "  <div class=\"schematic-head\">" +
      "    <span class=\"schematic-title\">" + nganInfo.ten.toUpperCase() + "</span>" +
      "    <span class=\"schematic-lock\">" + khoaText + "</span>" +
      "  </div>" +
      "  <div class=\"schematic-weight\">" +
      "    <span class=\"section-label\">CÂN HIỆN TẠI / CHUẨN</span>" +
      "    <span class=\"schematic-weight-val\">" + dinhDangSo(nganInfo.canHienTai, 1) + " / " + dinhDangSo(tongChuan, 1) + " g</span>" +
      "  </div>" +
      "  <div class=\"schematic-tools\">" + rowsHtml + "</div>" +
      "</div>";
  }

  // Hộc pin (ngăn 3)
  var lopPinBox = pinThap ? "schematic-box is-warn-border" : "schematic-box";
  var khoaPin = MOCK_COMPARTMENT_LOCKS["Hộc pin"] || "KHÓA";
  var maxPinG = MOCK_BATTERY.sucChua * MOCK_BATTERY.mUnit;
  schHtml +=
    "<div class=\"" + lopPinBox + "\">" +
    "  <div class=\"schematic-head\">" +
    "    <span class=\"schematic-title\">HỘC PIN (NGĂN 3)</span>" +
    "    <span class=\"schematic-lock\">" + khoaPin + "</span>" +
    "  </div>" +
    "  <div class=\"schematic-weight\">" +
    "    <span class=\"section-label\">CÂN HIỆN TẠI / TỐI ĐA</span>" +
    "    <span class=\"schematic-weight-val\">" + dinhDangSo(canHocPin, 1) + " / " + dinhDangSo(maxPinG, 1) + " g</span>" +
    "  </div>" +
    "  <div class=\"schematic-tools\">" +
    "    <div class=\"schematic-tool-row\">" +
    "      <span><span class=\"mono\">" + MOCK_BATTERY.ma + "</span> · Pin 18650</span>" +
    "      <span>" + pinTrangThaiHtml + "</span>" +
    "    </div>" +
    "    <div class=\"schematic-tool-row\">" +
    "      <span class=\"cell-sub\">m_unit = 46,0 g · hạn mức 4/người</span>" +
    "      <span class=\"mono cell-sub\">n = " + MOCK_BATTERY.tonKho + " cell</span>" +
    "    </div>" +
    "  </div>" +
    "</div>";

  schBox.innerHTML = schHtml;
}

// Tạo sẵn 60 điểm lịch sử cảm biến kèm sự kiện đặt/lấy dụng cụ
function khoiTaoDuLieuBieuDo() {
  var now = Date.now();
  var tempVal = 29.1;
  var rhVal = 71.8;

  for (var i = 59; i >= 0; i--) {
    var t = new Date(now - i * 1500);
    var label = layNhanThoiGian(t);
    var idx = 59 - i;

    var mKhay = Number((0.2 + (Math.random() - 0.5) * 0.3).toFixed(1));
    if (mKhay < 0) { mKhay = 0; }
    var mNgan1 = Number((0.3 + (Math.random() - 0.5) * 0.4).toFixed(1));
    if (mNgan1 < 0) { mNgan1 = 0; }
    var mNgan2 = Number((348.0 + (Math.random() - 0.5) * 0.6).toFixed(1));

    if ((idx >= 18 && idx <= 20) || (idx >= 47 && idx <= 49)) {
      mKhay = Number((112.0 + (Math.random() - 0.5) * 0.4).toFixed(1));
      mNgan2 = Number((236.0 + (Math.random() - 0.5) * 0.6).toFixed(1));
    } else if ((idx >= 21 && idx <= 23) || (idx >= 52 && idx <= 55)) {
      mNgan1 = Number((145.0 + (Math.random() - 0.5) * 0.5).toFixed(1));
    }

    tempVal = Number((tempVal + (Math.random() - 0.5) * 0.25).toFixed(1));
    if (tempVal < 28.4) { tempVal = 28.5; }
    if (tempVal > 30.2) { tempVal = 30.1; }

    rhVal = Number((rhVal + (Math.random() - 0.5) * 0.7).toFixed(1));
    if (rhVal < 67.5) { rhVal = 67.8; }
    if (rhVal > 74.2) { rhVal = 74.0; }

    weightData.labels.push(label);
    weightData.khay.push(mKhay);
    weightData.ngan1.push(mNgan1);
    weightData.ngan2.push(mNgan2);

    envData.labels.push(label);
    envData.temp.push(tempVal);
    envData.rh.push(rhVal);
    envData.nguong70.push(70);

    var nPin = 6;
    if (idx < 20) {
      nPin = 5;
    } else if (idx < 46) {
      nPin = 4;
    } else if (idx < 52) {
      nPin = 2;
    } else {
      nPin = 6;
    }
    var mPin = Number((nPin * MOCK_BATTERY.mUnit + (Math.random() - 0.5) * 0.6).toFixed(1));
    batteryData.labels.push(label);
    batteryData.count.push(nPin);
    batteryData.nguong2.push(2);
    batteryData.weight.push(mPin);
  }

  MOCK_BATTERY.tonKho = batteryData.count[batteryData.count.length - 1];
  capNhatSoLieuBieuDo();
  capNhatMocCapNhatCuoi(new Date(now));
}

function capNhatSoLieuBieuDo() {
  var cuoi = weightData.labels.length - 1;
  var khay = weightData.khay[cuoi];
  var ngan1 = weightData.ngan1[cuoi];
  var ngan2 = weightData.ngan2[cuoi];
  var temp = envData.temp[cuoi];
  var rh = envData.rh[cuoi];
  var pinN = batteryData.count[cuoi];
  var pinG = batteryData.weight[cuoi];

  var elKhay = document.getElementById("live-khay");
  var elNgan1 = document.getElementById("live-ngan1");
  var elNgan2 = document.getElementById("live-ngan2");
  var elTemp = document.getElementById("live-temp");
  var elRh = document.getElementById("live-rh");
  var elRhWrap = document.getElementById("live-rh-wrap");
  var elRhNote = document.getElementById("live-rh-note");
  var elOverviewEnv = document.getElementById("overview-env-summary");
  var elPinCount = document.getElementById("live-pin-count");
  var elPinWrap = document.getElementById("live-pin-wrap");
  var elPinWarn = document.getElementById("live-pin-warn");
  var elPinNote = document.getElementById("live-pin-note");
  var elPinWeight = document.getElementById("live-pin-weight");

  if (elKhay) { elKhay.textContent = dinhDangSo(khay, 1); }
  if (elNgan1) { elNgan1.textContent = dinhDangSo(ngan1, 1); }
  if (elNgan2) { elNgan2.textContent = dinhDangSo(ngan2, 1); }
  if (elTemp) { elTemp.textContent = dinhDangSo(temp, 1); }
  if (elRh) { elRh.textContent = dinhDangSo(rh, 1); }
  if (elPinCount) { elPinCount.textContent = pinN; }
  if (elPinWeight) { elPinWeight.textContent = dinhDangSo(pinG, 1); }

  if (elPinWrap) {
    if (pinN <= MOCK_BATTERY.nguongCanhBao) {
      elPinWrap.classList.add("is-warn");
      if (elPinWarn) { elPinWarn.textContent = "▲"; }
      if (elPinNote) {
        elPinNote.textContent = "▲ Sắp hết (≤ 2 cell) · cần nạp pin";
        elPinNote.classList.add("is-warn");
      }
    } else {
      elPinWrap.classList.remove("is-warn");
      if (elPinWarn) { elPinWarn.textContent = ""; }
      if (elPinNote) {
        elPinNote.textContent = "m_unit 46,0 g · cảnh báo ≤ 2 cell";
        elPinNote.classList.remove("is-warn");
      }
    }
  }

  if (elRhWrap) {
    if (rh > 70) {
      elRhWrap.classList.add("is-warn");
      if (elRhNote) {
        elRhNote.textContent = "▲ Vượt ngưỡng 70,0 %RH";
        elRhNote.classList.add("is-warn");
      }
    } else {
      elRhWrap.classList.remove("is-warn");
      if (elRhNote) {
        elRhNote.textContent = "Trong ngưỡng an toàn";
        elRhNote.classList.remove("is-warn");
      }
    }
  }

  if (elOverviewEnv) {
    var rhStr = dinhDangSo(rh, 1) + " %RH" + (rh > 70 ? " ▲" : "");
    elOverviewEnv.textContent = "DHT22: " + dinhDangSo(temp, 1) + " °C · " + rhStr;
    if (rh > 70) {
      elOverviewEnv.classList.add("is-warn");
    } else {
      elOverviewEnv.classList.remove("is-warn");
    }
  }
}

function catMang(mang, soDiem) {
  return mang.slice(-soDiem);
}

function dongBoDuLieuWeightChart() {
  if (!weightChart) {
    return;
  }
  weightChart.data.labels = catMang(weightData.labels, soDiemWeight);
  weightChart.data.datasets[0].data = catMang(weightData.khay, soDiemWeight);
  weightChart.data.datasets[1].data = catMang(weightData.ngan1, soDiemWeight);
  weightChart.data.datasets[2].data = catMang(weightData.ngan2, soDiemWeight);
  weightChart.update("none");
}

function dongBoDuLieuEnvChart() {
  if (!envChart) {
    return;
  }
  envChart.data.labels = catMang(envData.labels, soDiemEnv);
  envChart.data.datasets[0].data = catMang(envData.rh, soDiemEnv);
  envChart.data.datasets[1].data = catMang(envData.temp, soDiemEnv);
  envChart.data.datasets[2].data = catMang(envData.nguong70, soDiemEnv);
  envChart.update("none");
}

function dongBoDuLieuBatteryChart() {
  if (!batteryChart) {
    return;
  }
  batteryChart.data.labels = catMang(batteryData.labels, soDiemBattery);
  batteryChart.data.datasets[0].data = catMang(batteryData.count, soDiemBattery);
  batteryChart.data.datasets[1].data = catMang(batteryData.nguong2, soDiemBattery);
  batteryChart.update("none");
}

function veBieuDoLanDau() {
  if (typeof Chart === "undefined") {
    return;
  }

  Chart.defaults.font.family = "\"IBM Plex Mono\", monospace";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = "#6A7378";

  var tuyChonLuoiNgang = {
    color: "#E6E4DA",
    drawBorder: false
  };

  var tuyChonTooltip = {
    mode: "index",
    intersect: false,
    backgroundColor: "#242C32",
    titleColor: "#FFFFFF",
    bodyColor: "#F2F1EA",
    padding: 8,
    cornerRadius: 0,
    callbacks: {
      label: function (ctx) {
        return ctx.dataset.label + ": " + dinhDangSo(ctx.parsed.y, 1);
      }
    }
  };

  // 1. Biểu đồ khối lượng Load cell (nét 1.5px, không tô vùng, không điểm)
  var ctxWeight = document.getElementById("weight-chart").getContext("2d");
  weightChart = new Chart(ctxWeight, {
    type: "line",
    data: {
      labels: catMang(weightData.labels, soDiemWeight),
      datasets: [
        {
          label: "Khay trả (g)",
          data: catMang(weightData.khay, soDiemWeight),
          borderColor: "#2C6E7F",
          borderWidth: 1.5,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0
        },
        {
          label: "Ngăn 1 (g)",
          data: catMang(weightData.ngan1, soDiemWeight),
          borderColor: "#242C32",
          borderWidth: 1.5,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0
        },
        {
          label: "Ngăn 2 (g)",
          data: catMang(weightData.ngan2, soDiemWeight),
          borderColor: "#8A9398",
          borderWidth: 1.5,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 400,
          grid: tuyChonLuoiNgang,
          border: { color: "#CFCDC2" },
          ticks: {
            callback: function (val) {
              return Number(val).toLocaleString("vi-VN");
            }
          }
        },
        x: {
          grid: { display: false },
          border: { color: "#242C32" },
          ticks: { maxTicksLimit: 6 }
        }
      },
      plugins: {
        tooltip: tuyChonTooltip,
        legend: {
          position: "bottom",
          align: "start",
          labels: {
            usePointStyle: true,
            pointStyle: "line",
            boxWidth: 18,
            padding: 14,
            color: "#6A7378"
          }
        }
      }
    }
  });

  // 2. Biểu đồ Nhiệt độ (trục trái) & Độ ẩm (trục phải) + đường ngưỡng 70 %RH
  var ctxEnv = document.getElementById("env-chart").getContext("2d");
  envChart = new Chart(ctxEnv, {
    type: "line",
    plugins: [pluginNhanNguong],
    data: {
      labels: catMang(envData.labels, soDiemEnv),
      datasets: [
        {
          label: "Độ ẩm (%RH)",
          data: catMang(envData.rh, soDiemEnv),
          yAxisID: "yRh",
          borderColor: "#2C6E7F",
          borderWidth: 1.5,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0
        },
        {
          label: "Nhiệt độ (°C)",
          data: catMang(envData.temp, soDiemEnv),
          yAxisID: "yTemp",
          borderColor: "#6A7378",
          borderWidth: 1.5,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0
        },
        {
          label: "Ngưỡng 70 %RH",
          data: catMang(envData.nguong70, soDiemEnv),
          yAxisID: "yRh",
          borderColor: "#C56A3D",
          borderWidth: 1.5,
          borderDash: [5, 4],
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      layout: {
        padding: {
          right: 68
        }
      },
      interaction: { mode: "index", intersect: false },
      scales: {
        yTemp: {
          type: "linear",
          position: "left",
          min: 25,
          max: 38,
          grid: { display: false },
          border: { color: "#CFCDC2" },
          ticks: {
            maxTicksLimit: 6,
            callback: function (val) {
              return Number(val).toLocaleString("vi-VN") + " °C";
            }
          }
        },
        yRh: {
          type: "linear",
          position: "right",
          min: 52,
          max: 84,
          grid: tuyChonLuoiNgang,
          border: { color: "#CFCDC2" },
          ticks: {
            maxTicksLimit: 7,
            callback: function (val) {
              return Number(val).toLocaleString("vi-VN") + " %";
            }
          }
        },
        x: {
          grid: { display: false },
          border: { color: "#242C32" },
          ticks: { maxTicksLimit: 6 }
        }
      },
      plugins: {
        tooltip: tuyChonTooltip,
        legend: {
          position: "bottom",
          align: "start",
          labels: {
            usePointStyle: true,
            pointStyle: "line",
            boxWidth: 18,
            padding: 14,
            color: "#6A7378"
          }
        }
      }
    }
  });

  // 3. Biểu đồ số pin trong hộc 18650 (đường bậc thang 0–8)
  var ctxBatteryEl = document.getElementById("battery-chart");
  if (ctxBatteryEl) {
    var ctxBattery = ctxBatteryEl.getContext("2d");
    batteryChart = new Chart(ctxBattery, {
      type: "line",
      plugins: [pluginNhanNguongPin],
      data: {
        labels: catMang(batteryData.labels, soDiemBattery),
        datasets: [
          {
            label: "Số pin trong hộc (cell)",
            data: catMang(batteryData.count, soDiemBattery),
            borderColor: "#2C6E7F",
            borderWidth: 1.5,
            stepped: true,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 3
          },
          {
            label: "Ngưỡng sắp hết (2 cell)",
            data: catMang(batteryData.nguong2, soDiemBattery),
            borderColor: "#C56A3D",
            borderWidth: 1.5,
            borderDash: [5, 4],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        layout: {
          padding: {
            right: 68
          }
        },
        interaction: { mode: "index", intersect: false },
        scales: {
          y: {
            min: 0,
            max: 8,
            grid: tuyChonLuoiNgang,
            border: { color: "#CFCDC2" },
            ticks: {
              stepSize: 1,
              callback: function (val) {
                return val + " cell";
              }
            }
          },
          x: {
            grid: { display: false },
            border: { color: "#242C32" },
            ticks: { maxTicksLimit: 6 }
          }
        },
        plugins: {
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "#242C32",
            titleColor: "#FFFFFF",
            bodyColor: "#F2F1EA",
            padding: 8,
            cornerRadius: 0,
            callbacks: {
              label: function (ctx) {
                return ctx.dataset.label + ": " + ctx.parsed.y + " cell";
              }
            }
          },
          legend: {
            position: "bottom",
            align: "start",
            labels: {
              usePointStyle: true,
              pointStyle: "line",
              boxWidth: 18,
              padding: 14,
              color: "#6A7378"
            }
          }
        }
      }
    });
  }
}

function capNhatBieuDoMoi() {
  var bayGio = new Date();
  var label = layNhanThoiGian(bayGio);
  demTickBieuDo++;

  // Node A và Node B (nếu online) cập nhật gói tin mới
  MOCK_DEVICES[0].lastSeenSec = 0;
  if (MOCK_DEVICES[1].trangThai === "online") {
    MOCK_DEVICES[1].lastSeenSec = 0;
  }

  // Mỗi 11 nhịp (~16,5 giây) mô phỏng đặt/lấy dụng cụ lên khay trả
  if (demTickBieuDo % 11 === 0 && suKienConLai === 0) {
    suKienConLai = 4;
    loaiSuKienHienTai = (loaiSuKienHienTai + 1) % 2;

    if (loaiSuKienHienTai === 1) {
      themDongNhatKy("A-" + soThuTuEidA++, "lab/kioskA/tray      {m: 112.1, stable: true}", false);
      themDongNhatKy("A-" + soThuTuEidA++, "KC-01 → trả OK (AI: kìm cắt 0,94; m=112,1 g)", false);
    } else {
      themDongNhatKy("A-" + soThuTuEidA++, "lab/kioskA/tray      {m: 145.0, stable: true}", false);
      themDongNhatKy("A-" + soThuTuEidA++, "KTD-01 → kiểm cân OK (AI: kìm tuốt 0,92; m=145,0 g)", false);
    }
  }

  var mKhay = Number((0.2 + (Math.random() - 0.5) * 0.3).toFixed(1));
  if (mKhay < 0) { mKhay = 0; }
  var mNgan1 = Number((0.3 + (Math.random() - 0.5) * 0.4).toFixed(1));
  if (mNgan1 < 0) { mNgan1 = 0; }
  var mNgan2 = Number((348.0 + (Math.random() - 0.5) * 0.6).toFixed(1));

  if (suKienConLai > 0) {
    if (suKienConLai > 1) {
      if (loaiSuKienHienTai === 1) {
        mKhay = Number((112.0 + (Math.random() - 0.5) * 0.4).toFixed(1));
        mNgan2 = Number((236.0 + (Math.random() - 0.5) * 0.6).toFixed(1));
      } else {
        mKhay = Number((145.0 + (Math.random() - 0.5) * 0.4).toFixed(1));
      }
    } else {
      if (loaiSuKienHienTai === 0) {
        mNgan1 = Number((145.0 + (Math.random() - 0.5) * 0.4).toFixed(1));
      }
    }
    suKienConLai--;
  }

  var cuoiTemp = envData.temp[envData.temp.length - 1];
  var cuoiRh = envData.rh[envData.rh.length - 1];
  var nhietDo = Number((cuoiTemp + (Math.random() - 0.5) * 0.3).toFixed(1));
  if (nhietDo < 28.4) { nhietDo = 28.5; }
  if (nhietDo > 30.5) { nhietDo = 30.4; }

  // Cho phép độ ẩm dao động qua lại quanh ngưỡng 70 %RH để kiểm chứng đồng bộ cảnh báo
  var doAm = Number((cuoiRh + (Math.random() - 0.5) * 1.1).toFixed(1));
  if (doAm < 67.5) { doAm = 68.0; }
  if (doAm > 74.2) { doAm = 73.8; }

  weightData.labels.push(label);
  weightData.khay.push(mKhay);
  weightData.ngan1.push(mNgan1);
  weightData.ngan2.push(mNgan2);

  // Mỗi 17 nhịp (~25,5 giây) mô phỏng mượn/trả pin 18650 trong hộc
  if (demTickBieuDo % 17 === 0 && MOCK_DEVICES[1].trangThai === "online") {
    var pinTruoc = MOCK_BATTERY.tonKho;
    var pinMoi = CHUOI_PIN_MO_PHONG[buocMoPhongPin % CHUOI_PIN_MO_PHONG.length];
    buocMoPhongPin++;
    MOCK_BATTERY.tonKho = pinMoi;
    var pinGram = (pinMoi * MOCK_BATTERY.mUnit).toFixed(1);
    var eidPin = "B-" + soThuTuEidB++;
    themDongNhatKy(
      eidPin,
      "lab/cabB/slot/3/state {eid: \"" + eidPin + "\", g: " + pinGram + ", stable: true, lock: \"locked\", n: " + pinMoi + "}",
      pinMoi <= MOCK_BATTERY.nguongCanhBao
    );
    if (pinMoi < pinTruoc) {
      themDongNhatKy("A-" + soThuTuEidA++, "PIN-18650 → mượn " + (pinTruoc - pinMoi) + " pin (còn " + pinMoi + "/8)", pinMoi <= MOCK_BATTERY.nguongCanhBao);
    } else if (pinMoi > pinTruoc) {
      themDongNhatKy("A-" + soThuTuEidA++, "PIN-18650 → trả " + (pinMoi - pinTruoc) + " pin (AI: pin 18650; còn " + pinMoi + "/8)", false);
    }
  }

  var mPinHienTai = Number((MOCK_BATTERY.tonKho * MOCK_BATTERY.mUnit + (Math.random() - 0.5) * 0.6).toFixed(1));
  if (mPinHienTai < 0) { mPinHienTai = 0; }

  envData.labels.push(label);
  envData.temp.push(nhietDo);
  envData.rh.push(doAm);
  envData.nguong70.push(70);

  batteryData.labels.push(label);
  batteryData.count.push(MOCK_BATTERY.tonKho);
  batteryData.nguong2.push(2);
  batteryData.weight.push(mPinHienTai);

  if (weightData.labels.length > 60) {
    weightData.labels.shift();
    weightData.khay.shift();
    weightData.ngan1.shift();
    weightData.ngan2.shift();
  }
  if (envData.labels.length > 60) {
    envData.labels.shift();
    envData.temp.shift();
    envData.rh.shift();
    envData.nguong70.shift();
  }
  if (batteryData.labels.length > 60) {
    batteryData.labels.shift();
    batteryData.count.shift();
    batteryData.nguong2.shift();
    batteryData.weight.shift();
  }

  // Mỗi 4 nhịp ghi 1 log môi trường nếu Node B đang online
  if (demTickBieuDo % 4 === 0 && MOCK_DEVICES[1].trangThai === "online") {
    themDongNhatKy(
      "B-" + soThuTuEidB++,
      "lab/cabB/env     {t: " + nhietDo.toFixed(1) + ", rh: " + doAm.toFixed(1) + "}",
      doAm > 70
    );
  }

  capNhatMocCapNhatCuoi(bayGio);
  capNhatSoLieuBieuDo();
  capNhatChiSoNhanh();
  veDanhSachCanhBao();
  veBangKhoVaSoDo();
  dongBoDuLieuWeightChart();
  dongBoDuLieuEnvChart();
  dongBoDuLieuBatteryChart();
}

function khoiTaoTabThietLap() {
  var sysTimeEl = document.getElementById("setup-sys-time");
  if (sysTimeEl) {
    sysTimeEl.textContent = layNhanThoiGian(new Date());
    setInterval(function () {
      sysTimeEl.textContent = layNhanThoiGian(new Date());
    }, 1000);
  }

  var btnSyncTime = document.getElementById("sync-browser-time-btn");
  var timeFb = document.getElementById("setup-time-feedback");
  if (btnSyncTime) {
    btnSyncTime.addEventListener("click", function () {
      var now = layNhanThoiGian(new Date());
      if (sysTimeEl) { sysTimeEl.textContent = now; }
      if (timeFb) {
        timeFb.className = "report-feedback mono";
        timeFb.textContent = "Đã đồng bộ giờ Pi theo trình duyệt (" + now + ").";
      }
    });
  }

  var btnUsb0 = document.getElementById("toggle-usb0-btn");
  var usb0El = document.getElementById("setup-internet-status");
  if (btnUsb0 && usb0El && typeof MOCK_PI_GATEWAY !== "undefined") {
    btnUsb0.addEventListener("click", function () {
      MOCK_PI_GATEWAY.usb0Internet = !MOCK_PI_GATEWAY.usb0Internet;
      if (MOCK_PI_GATEWAY.usb0Internet) {
        usb0El.className = "mono";
        usb0El.textContent = "● CÓ";
      } else {
        usb0El.className = "mono is-warn";
        usb0El.textContent = "▲ KHÔNG (chỉ mạng nội bộ)";
      }
    });
  }

  var btnStartEnroll = document.getElementById("enroll-start-btn");
  var btnDupEnroll = document.getElementById("enroll-dup-btn");
  var enrollStatus = document.getElementById("enroll-status-box");
  var enrollForm = document.getElementById("enroll-form");
  var enrollUidVal = document.getElementById("enroll-uid-val");
  var enrollFeedback = document.getElementById("enroll-feedback");
  var enrollTimer = null;

  function batDauQuetThe(uidGia) {
    if (!enrollStatus || !enrollForm) { return; }
    if (enrollTimer) { clearTimeout(enrollTimer); }
    enrollForm.hidden = true;
    if (enrollFeedback) { enrollFeedback.textContent = ""; }
    enrollStatus.className = "enroll-status mono";
    enrollStatus.textContent = "Đang chờ quẹt thẻ ở Node A… (LCD: \"Quet the moi\")";
    enrollTimer = setTimeout(function () {
      if (typeof MOCK_REGISTERED_CARDS !== "undefined" && MOCK_REGISTERED_CARDS[uidGia]) {
        var daCo = MOCK_REGISTERED_CARDS[uidGia];
        enrollStatus.className = "enroll-status mono is-warn";
        enrollStatus.textContent = "▲ UID " + uidGia + " đã tồn tại (" + daCo.mssv + " · " + daCo.hoTen + ").";
        enrollForm.hidden = true;
        return;
      }
      enrollStatus.className = "enroll-status mono";
      enrollStatus.textContent = "Đã nhận UID từ lab/kioskA/card: " + uidGia + ". Nhập thông tin sinh viên bên dưới.";
      if (enrollUidVal) { enrollUidVal.textContent = uidGia; }
      enrollForm.hidden = false;
    }, 1200);
  }

  if (btnStartEnroll) {
    btnStartEnroll.addEventListener("click", function () {
      batDauQuetThe("04E9F1A2");
    });
  }
  if (btnDupEnroll) {
    btnDupEnroll.addEventListener("click", function () {
      batDauQuetThe("04A1B2C3");
    });
  }
  if (enrollForm) {
    enrollForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var uid = enrollUidVal ? enrollUidVal.textContent : "";
      var mssv = (document.getElementById("enroll-mssv").value || "").trim();
      var hoTen = (document.getElementById("enroll-name").value || "").trim();
      var pin = (document.getElementById("enroll-pin").value || "").trim();
      if (!mssv || !hoTen || !/^\d{6}$/.test(pin)) {
        if (enrollFeedback) {
          enrollFeedback.className = "report-feedback mono is-warn";
          enrollFeedback.textContent = "▲ Nhập đủ MSSV, họ tên và PIN đúng 6 chữ số.";
        }
        return;
      }
      if (typeof MOCK_REGISTERED_CARDS !== "undefined") {
        MOCK_REGISTERED_CARDS[uid] = { mssv: mssv, hoTen: hoTen };
      }
      if (enrollFeedback) {
        enrollFeedback.className = "report-feedback mono";
        enrollFeedback.textContent = "Đã lưu thẻ " + uid + " cho " + mssv + " (PIN đã băm pbkdf2_hmac).";
      }
    });
  }

  var btnBackup = document.getElementById("backup-now-btn");
  var backupLastEl = document.getElementById("backup-last-time");
  var backupFb = document.getElementById("backup-feedback");
  if (btnBackup) {
    btnBackup.addEventListener("click", function () {
      var now = layGioPhut(new Date());
      if (backupLastEl) { backupLastEl.textContent = now + " hôm nay (thủ công)"; }
      if (backupFb) {
        backupFb.className = "report-feedback mono";
        backupFb.textContent = "Đã chạy sqlite3 .backup ra USB (giữ 7 bản).";
      }
    });
  }

  var btnShutdown = document.getElementById("shutdown-btn");
  var shutdownBox = document.getElementById("shutdown-confirm-box");
  var btnShutdownYes = document.getElementById("shutdown-confirm-yes");
  var btnShutdownNo = document.getElementById("shutdown-confirm-no");
  var shutdownFb = document.getElementById("shutdown-feedback");
  if (btnShutdown && shutdownBox) {
    btnShutdown.addEventListener("click", function () {
      shutdownBox.hidden = false;
    });
  }
  if (btnShutdownNo && shutdownBox) {
    btnShutdownNo.addEventListener("click", function () {
      shutdownBox.hidden = true;
    });
  }
  if (btnShutdownYes && shutdownBox) {
    btnShutdownYes.addEventListener("click", function () {
      shutdownBox.hidden = true;
      if (shutdownFb) {
        shutdownFb.className = "report-feedback mono is-warn";
        shutdownFb.textContent = "▲ Đã gửi lệnh tắt Pi 4 an toàn (sync + poweroff).";
      }
    });
  }
}

function khoiTaoTrangDangNhap() {
  var btns = document.querySelectorAll(".login-mode-btn");
  var formSv = document.getElementById("login-form-student");
  var formQl = document.getElementById("login-form-manager");

  function chonCheDo(role) {
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute("data-role") === role) {
        btns[i].classList.add("active");
      } else {
        btns[i].classList.remove("active");
      }
    }
    if (formSv && formQl) {
      formSv.hidden = role !== "student";
      formQl.hidden = role !== "manager";
    }
  }

  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
      chonCheDo(this.getAttribute("data-role"));
    });
  }

  if (window.location.search.indexOf("role=manager") !== -1) {
    chonCheDo("manager");
  }

  if (formSv) {
    formSv.addEventListener("submit", function (e) {
      e.preventDefault();
      var mssv = (document.getElementById("login-mssv").value || "").trim();
      var pin = (document.getElementById("login-pin").value || "").trim();
      var fb = document.getElementById("login-student-feedback");
      if (!mssv || !/^\d{6}$/.test(pin)) {
        if (fb) {
          fb.className = "report-feedback mono is-warn";
          fb.textContent = "▲ Nhập MSSV và PIN đúng 6 chữ số.";
        }
        return;
      }
      window.location.href = "student.html";
    });
  }

  if (formQl) {
    formQl.addEventListener("submit", function (e) {
      e.preventDefault();
      var pass = (document.getElementById("login-manager-pass").value || "").trim();
      var fb = document.getElementById("login-manager-feedback");
      if (!pass) {
        if (fb) {
          fb.className = "report-feedback mono is-warn";
          fb.textContent = "▲ Nhập mật khẩu quản lý.";
        }
        return;
      }
      window.location.href = "manager.html";
    });
  }
}

window.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("login-page")) {
    khoiTaoTrangDangNhap();
  } else if (document.getElementById("student-page")) {
    khoiTaoTrangSinhVien();
  } else if (document.getElementById("manager-page")) {
    khoiTaoTrangQuanLy();
  }
});
