# Cấu hình hạ tầng mẫu trên Raspberry Pi 4

> **Lưu ý:** Toàn bộ các file `.example` trong thư mục này là cấu hình **mẫu, chưa chạy thử trên Pi thật**.

## Thứ tự cài đặt và khởi động

1. **Cấp IP tĩnh cho `wlan0` (`192.168.4.1/24`)** qua NetworkManager hoặc `/etc/dhcpcd.conf`.
2. **Wi-Fi AP (`hostapd`)**: sao chép `hostapd.conf.example` sang `/etc/hostapd/hostapd.conf`, đặt mật khẩu WPA2-PSK đủ dài.
3. **DHCP & DNS (`dnsmasq`)**: sao chép `dnsmasq.conf.example` sang `/etc/dnsmasq.conf`, điền đúng địa chỉ MAC của ESP32-A (`192.168.4.11`) và ESP32-B (`192.168.4.12`).
4. **MQTT Broker (`mosquitto`)**:
   - Tạo user/password bằng `mosquitto_passwd -c /etc/mosquitto/passwd kioska` (và thêm `cabb`, `backend`).
   - Sao chép `mosquitto.acl.example` sang `/etc/mosquitto/acl` và `mosquitto.conf.example` sang `/etc/mosquitto/conf.d/tram.conf`.
5. **Biến môi trường & bí mật (`/etc/tram/env`)**:
   - Sao chép `env.example` sang `/etc/tram/env`, điền token Telegram, mật khẩu email, mật khẩu MQTT và secret phiên.
   - Đặt quyền `chmod 600 /etc/tram/env`.
6. **Đồng bộ thời gian (`chrony` + `fake-hwclock`)**: đặt múi giờ `Asia/Ho_Chi_Minh`.
7. **Tường lửa (`ufw`)**: chỉ mở các cổng `22`, `53`, `67`, `1883`, `8000` trên giao diện `wlan0`.
8. **Dịch vụ `systemd`**: cài đặt `tram-backend.service` và `tram-ai.service` (đã bật `Restart=always`).
9. **Sao lưu & dọn ảnh**: gắn USB flash tại `/mnt/usb`, phân quyền thực thi cho `backup.sh` và cấu hình cron 02:00 hằng ngày; kiểm tra khôi phục ít nhất một lần.
