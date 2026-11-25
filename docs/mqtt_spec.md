# Đặc tả bản tin MQTT (bản nháp, task T01)

Broker: Mosquitto chạy trên Raspberry Pi 4 tại địa chỉ `192.168.4.1:1883`, xác thực user/password + ACL. Dùng MQTT 3.1.1 (không dùng TLS trong mạng Wi-Fi kín).

Mạng: Pi 4 tự phát Wi-Fi 2,4 GHz WPA2-PSK (`TramDungCu`, kênh 6, `hostapd` + `dnsmasq`), Pi có IP cố định `192.168.4.1`. ESP32-A (`192.168.4.11`) và ESP32-B (`192.168.4.12`) được giữ chỗ IP theo MAC và kết nối broker theo `192.168.4.1:1883`. Không dùng Wi-Fi của trường.

## Phân quyền người dùng MQTT (ACL)

| User | Quyền ghi (publish) | Quyền đọc (subscribe) |
|---|---|---|
| `kioska` | `lab/kioskA/#` | `lab/kioskA/cmd`, `lab/kioskA/ota` |
| `cabb` | `lab/cabB/#` | `lab/cabB/cmd`, `lab/cabB/ota` |
| `backend` | `lab/#` | `lab/#` |

## Quy ước chung

- Mọi bản tin dùng **QoS 1**. Vì QoS 1 có thể giao một bản tin nhiều lần, bên nhận phải tự loại trùng.
- Sự kiện từ node có trường `eid` = tên node + bộ đếm lưu trong NVS, ví dụ `A-1024`. Backend lưu các `eid` đã xử lý để bỏ bản tin trùng.
- Lệnh từ backend có trường `cid`, ví dụ `C-88`. Node trả `ack` kèm đúng `cid` đó.
- Keepalive 30 s. Mỗi node khai báo Last Will `lab/{node}/status = "offline"` (retained) khi kết nối, và publish `"online"` (retained) ngay sau khi kết nối thành công.
- Khối lượng tính bằng gam, kiểu số thực, làm tròn 0,1 g.
- Dung sai khối lượng của từng dụng cụ = min(10 g, ½ khối lượng phụ kiện nhẹ nhất), lưu trong CSDL, không dùng phần trăm.
- Đối với pin 18650 (hộc pin, `slot/3`): `n = round(|Δm| / m_unit)` (`m_unit ≈ 46,0 g`); chỉ chấp nhận khi `|Δm − n·m_unit| ≤ 2 g + 1,5 g × n`.
- Sau mỗi lần kết nối (kể cả sau khởi động lại), Node B publish lại trạng thái thật của từng ngăn và hộc pin để ghi đè bản tin retained cũ.

## Danh sách topic

| Topic | Chiều | Retain | Ví dụ payload |
|---|---|---|---|
| `lab/kioskA/card` | Node A → Pi | không | `{"eid":"A-1024","uid":"04A1B2C3"}` |
| `lab/kioskA/tray` | Node A → Pi | không | `{"eid":"A-1025","m":352.4,"stable":true}` |
| `lab/kioskA/button` | Node A → Pi | không | `{"eid":"A-1026","btn":"fault"}` (nút báo hỏng) |
| `lab/kioskA/cmd` | Pi → Node A | không | `{"cid":"C-88","lcd":["Dat dung cu","len khay"],"lamp":1,"beep":1}`<br>Chế độ đăng ký thẻ: `{"cid":"C-90","mode":"enroll","lcd":["Quet the moi","tai quay A"]}` |
| `lab/cabB/cmd` | Pi → Node B | không | `{"cid":"C-89","slot":2,"action":"unlock"}` (`slot` ∈ `{1, 2, 3}`) |
| `lab/cabB/ack` | Node B → Pi | không | `{"cid":"C-89","ok":true}` |
| `lab/cabB/slot/{k}/state` | Node B → Pi | có | Ngăn 1–2: `{"eid":"B-311","g":352.1,"stable":true,"lock":"open"}`<br>Hộc pin (`slot/3`, thêm trường `n`): `{"eid":"B-312","g":276.0,"stable":true,"lock":"locked","n":6}` |
| `lab/cabB/env` | Node B → Pi | không | `{"eid":"B-400","t":29.4,"rh":72.5}` (DHT22 mỗi 2 s; `rh` > 70 % cảnh báo thay gói hút ẩm) |
| `lab/{node}/status` | node → Pi | có | `"online"` hoặc `"offline"` |
| `lab/{node}/ota` | Pi → node | không | `{"version":"0.3.2","url":"http://192.168.4.1:8000/ota/nodeA.bin","sha256":"..."}` |

`{node}` là `kioskA` hoặc `cabB`; `{k}` ∈ `{1, 2, 3}` (`1`, `2` là ngăn dụng cụ; `3` là hộc pin 18650). Trong bản tin `lab/cabB/slot/3/state`, trường `n` là số cell pin ước lượng hiện có trong hộc (0–8).

## Cần thống nhất trước khi code (TV1 chốt)

- [ ] `lcd`: mỗi phần tử tối đa 16 ký tự, không dấu (LCD 1602 không hiển thị được tiếng Việt có dấu).
- [ ] `action`: chỉ có `unlock` và `lock`?
- [ ] Node A có cần topic `ack` riêng (`lab/kioskA/ack`) không?
- [ ] Ngưỡng `stable`: dao động dưới 1 g trong 1 s.
