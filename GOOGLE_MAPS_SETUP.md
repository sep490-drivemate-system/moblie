# 🗺️ Hướng dẫn thiết lập Google Maps API

## 1. Tạo Google Maps API Key

### Bước 1: Truy cập Google Cloud Console
1. Đi tới [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật các API sau:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Places API** (tùy chọn)
   - **Geocoding API** (tùy chọn)

### Bước 2: Tạo API Key
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy API key được tạo

### Bước 3: Hạn chế API Key (Khuyến nghị)
1. Click vào API key vừa tạo
2. Trong **Application restrictions**:
   - Chọn **Android apps** và thêm package name: `com.anonymous.moblie`
   - Chọn **iOS apps** và thêm bundle ID của app
3. Trong **API restrictions**:
   - Chọn **Restrict key** và chọn các API đã bật ở trên

## 2. Cấu hình trong ứng dụng

### Cập nhật app.json
Thay thế các placeholder trong file `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_ACTUAL_API_KEY_HERE"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
        }
      }
    }
  }
}
```

### Thay thế API Key
1. Mở file `app.json`
2. Thay thế `YOUR_IOS_GOOGLE_MAPS_API_KEY_HERE` bằng API key thực
3. Thay thế `YOUR_ANDROID_GOOGLE_MAPS_API_KEY_HERE` bằng API key thực

## 3. Cài đặt dependencies (nếu chưa có)

```bash
npx expo install react-native-maps expo-location
```

## 4. Rebuild ứng dụng

Sau khi cập nhật API key, bạn cần rebuild app:

```bash
# Clear cache và rebuild
npx expo start --clear

# Hoặc build development build
npx expo run:android
npx expo run:ios
```

## 5. Kiểm tra tính năng

Ứng dụng sẽ có các tính năng sau:

✅ **Hiển thị bản đồ Google Maps**
✅ **Hiển thị vị trí hiện tại của người dùng**
✅ **Hiển thị các xe cho thuê trên bản đồ**
✅ **Phân biệt xe có sẵn và đã thuê bằng màu sắc**
✅ **Click vào marker để xem thông tin xe**
✅ **Nút "Vị trí của tôi" để quay về vị trí hiện tại**
✅ **Legend giải thích màu sắc**

## 6. Troubleshooting

### Lỗi thường gặp:

**"Map failed to load"**
- Kiểm tra API key đã đúng chưa
- Kiểm tra đã bật Maps SDK chưa
- Kiểm tra package name/bundle ID

**"Location permission denied"**
- App sẽ tự động xin quyền location
- Người dùng có thể từ chối và vẫn xem được map

**Map hiển thị màu xám**
- API key chưa đúng hoặc chưa có quyền
- Chưa bật billing cho Google Cloud project

## 7. Tính năng nâng cao (có thể thêm sau)

- 🔍 Tìm kiếm địa điểm
- 🧭 Chỉ đường đến xe
- 📍 Thêm/xóa marker động
- 🚗 Theo dõi xe real-time
- 💰 Hiển thị giá theo khu vực

---

💡 **Lưu ý**: Hãy giữ API key bảo mật và không commit vào git public repository!
