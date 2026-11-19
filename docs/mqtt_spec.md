# Đặc tả bản tin MQTT (bản nháp, task T01)

Broker: Mosquitto chạy trên Raspberry Pi 4, cổng 1883, có user/password. Dùng MQTT 3.1.1.

Mạng: Pi 4 tự phát Wi-Fi 2,4 GHz WPA2-PSK (hostapd + dnsmasq), Pi có IP cố định `192.168.4.1`. ESP32 kết nối broker theo IP này. Không dùng Wi-Fi của trường.

## Quy ước chung

- Mọi bản tin dùng **QoS 1**. Vì QoS 1 có thể giao một bản tin nhiều lần, bên nhận phải tự loại trùng.
- Sự kiện từ node có trường `eid` = tên node + bộ đếm lưu trong NVS, ví dụ `A-1024`. Backend lưu các `eid` đã xử lý để bỏ bản tin trùng.
- Lệnh từ backend có trường `cid`, ví dụ `C-88`. Node trả `ack` kèm đúng `cid` đó.
- Keepalive 30 s. Mỗi node khai báo Last Will `lab/{node}/status = "offline"` (retained) khi kết nối, và publish `"online"` (retained) ngay sau khi kết nối thành công.
- Khối lượng tính bằng gam, kiểu số thực, làm tròn 0,1 g.
- Dung sai khối lượng của từng dụng cụ = min(10 g, ½ khối lượng phụ kiện nhẹ nhất), lưu trong CSDL, không dùng phần trăm.
- Sau mỗi lần kết nối (kể cả sau khởi động lại), Node B publish lại trạng thái thật của từng ngăn để ghi đè bản tin retained cũ.

## Danh sách topic

| Topic | Chiều | Retain | Ví dụ payload |
|---|---|---|---|
| `lab/kioskA/card` | Node A → Pi | không | `{"eid":"A-1024","uid":"04A1B2C3"}` |
| `lab/kioskA/tray` | Node A → Pi | không | `{"eid":"A-1025","m":352.4,"stable":true}` |
| `lab/kioskA/button` | Node A → Pi | không | `{"eid":"A-1026","btn":"fault"}` (nút báo hỏng) |
| `lab/kioskA/cmd` | Pi → Node A | không | `{"cid":"C-88","lcd":["Dat dung cu","len khay"],"lamp":1,"beep":1}` |
| `lab/cabB/cmd` | Pi → Node B | không | `{"cid":"C-89","slot":2,"action":"unlock"}` |
| `lab/cabB/ack` | Node B → Pi | không | `{"cid":"C-89","ok":true}` |
| `lab/cabB/slot/{k}/state` | Node B → Pi | có | `{"eid":"B-311","g":352.1,"stable":true,"lock":"open"}` |
| `lab/{node}/status` | node → Pi | có | `"online"` hoặc `"offline"` |

`{node}` là `kioskA` hoặc `cabB`; `{k}` là `1` hoặc `2`.

## Cần thống nhất trước khi code (TV1 chốt)

- [ ] `lcd`: mỗi phần tử tối đa 16 ký tự, không dấu (LCD 1602 không hiển thị được tiếng Việt có dấu).
- [ ] `action`: chỉ có `unlock` và `lock`?
- [ ] Node A có cần topic `ack` riêng (`lab/kioskA/ack`) không?
- [ ] Ngưỡng `stable`: dao động dưới 1 g trong 1 s.
