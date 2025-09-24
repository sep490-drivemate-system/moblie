# 🔧 Khắc phục lỗi "Google Play services are updating"

## Nguyên nhân
Lỗi này xảy ra khi:
- Google Play Services trên thiết bị/emulator chưa được cập nhật
- API key chưa được cấu hình đúng
- Thiết bị không hỗ trợ Google Play Services

## Giải pháp

### 1. Trên thiết bị thật (Android)
```bash
# Cập nhật Google Play Services
1. Mở Google Play Store
2. Tìm "Google Play services"
3. Nhấn "Update" nếu có
4. Khởi động lại thiết bị
```

### 2. Trên Android Emulator
```bash
# Tạo emulator mới với Google APIs
1. Mở Android Studio
2. AVD Manager > Create Virtual Device
3. Chọn device có "Google APIs" hoặc "Google Play"
4. Download system image có Google Play Store
5. Tạo và chạy emulator mới
```

### 3. Kiểm tra API Key
```json
// Trong app.json, đảm bảo API key đúng
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_VALID_API_KEY_HERE"
        }
      }
    }
  }
}
```

### 4. Fallback solution (Đã implement)
App đã được cập nhật với:
- ✅ Timeout detection (10 giây)
- ✅ Error message thân thiện
- ✅ Nút "Thử lại"
- ✅ Fallback cho iOS (sử dụng Apple Maps)

### 5. Alternative: Sử dụng Web Maps
Nếu vẫn gặp lỗi, có thể chuyển sang sử dụng web-based maps:

```typescript
// Thay đổi provider trong MapView
provider={Platform.OS === 'android' ? undefined : undefined} // Sử dụng default provider
```

### 6. Debug commands
```bash
# Clear cache và rebuild
npx expo start --clear

# Check Google Play Services trên emulator
adb shell pm list packages | grep google

# Restart emulator
adb reboot
```

## Lưu ý
- Emulator cần có Google Play Store để hoạt động tốt nhất
- API key cần được enable cho Maps SDK for Android
- Billing phải được bật trên Google Cloud Console
