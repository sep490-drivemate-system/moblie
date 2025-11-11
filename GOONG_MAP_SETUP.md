# 🗺️ Goong Map Integration Guide

## Tại sao chuyển sang Goong Map?

✅ **Dữ liệu Việt Nam tốt hơn**: Địa chỉ, tên đường, POI chính xác cho thị trường Việt Nam  
✅ **Giá cả phải chăng**: Rẻ hơn Google Maps **5-10 lần**  
✅ **Hỗ trợ xe máy**: Vehicle type "bike" cho motorcycle routing  
✅ **API tiếng Việt**: Response có dấu tiếng Việt chuẩn  
✅ **Support tốt**: Team Việt Nam, dễ liên hệ  

## 📋 Setup Instructions

### 1. Đăng ký tài khoản Goong

1. Truy cập: https://account.goong.io/
2. Đăng ký tài khoản mới (miễn phí)
3. Xác thực email

### 2. Lấy API Keys

1. Đăng nhập vào Goong Console
2. Vào mục **"API Keys"**
3. Tạo 2 keys (hoặc dùng chung 1 key):
   - **Goong API Key**: Cho Geocoding & Directions API
   - **Goong Map Tiles Key**: Cho hiển thị bản đồ

### 3. Cấu hình Project

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Điền API keys vào file `.env`:
   ```env
   EXPO_PUBLIC_GOONG_API_KEY=your_actual_goong_api_key
   EXPO_PUBLIC_GOONG_MAPTILES_KEY=your_actual_maptiles_key
   ```

3. Restart development server:
   ```bash
   npm start
   ```

## 🔧 APIs được sử dụng

### 1. **Geocoding API** (Reverse Geocoding)
Chuyển đổi tọa độ GPS thành địa chỉ:
```typescript
const response = await fetch(
  `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`
);
const data = await response.json();
const address = data.results?.[0]?.formatted_address;
```

### 2. **Directions API**
Tính toán lộ trình giữa các điểm:
```typescript
const response = await fetch(
  `https://rsapi.goong.io/Direction?origin=${originLat},${originLng}&destination=${destLat},${destLng}&vehicle=car&api_key=${GOONG_API_KEY}`
);
const data = await response.json();
const route = data.routes?.[0];
const polyline = decodePolyline(route.overview_polyline.points);
```

### 3. **Map Tiles**
Hiển thị bản đồ Goong:
```tsx
<UrlTile
  urlTemplate={`https://tiles.goong.io/assets/navigation_day/{z}/{x}/{y}.png?api_key=${GOONG_MAPTILES_KEY}`}
  maximumZ={19}
  flipY={false}
/>
```

## 📱 Screens đã tích hợp

- ✅ **route-planning.tsx**: Route planning với Goong Directions API
- 🔄 **instructors.tsx**: (Có thể tích hợp thêm)
- 🔄 **schedule.tsx**: (Có thể tích hợp thêm)

## 💰 Pricing (Tham khảo)

### Free Tier
- **5,000 requests/tháng** miễn phí
- Đủ cho development và testing

### Paid Plans
- Từ **500,000 VND/tháng**
- Rẻ hơn Google Maps đáng kể

## 🆚 So sánh với Google Maps

| Feature | Google Maps | Goong Map |
|---------|-------------|-----------|
| **Dữ liệu VN** | Tốt | **Rất tốt** |
| **Giá** | Đắt | **Rẻ (5-10x)** |
| **Xe máy routing** | ❌ | ✅ |
| **Tiếng Việt** | Tốt | **Xuất sắc** |
| **Support** | Global | **Local VN** |
| **Free tier** | $200 credit | **5K requests** |

## 🔗 Tài liệu tham khảo

- **Goong Docs**: https://docs.goong.io/
- **API Reference**: https://docs.goong.io/rest/
- **Console**: https://account.goong.io/
- **Support**: support@goong.io

## ⚠️ Lưu ý

1. **Không commit API keys** vào Git
2. File `.env` đã được thêm vào `.gitignore`
3. Chỉ share API keys qua kênh bảo mật
4. Monitor usage để tránh vượt quota

## 🐛 Troubleshooting

### Map không hiển thị?
- ✅ Kiểm tra `GOONG_MAPTILES_KEY` trong `.env`
- ✅ Restart development server
- ✅ Clear cache: `npm start -- --clear`

### Directions API lỗi?
- ✅ Kiểm tra `GOONG_API_KEY` trong `.env`
- ✅ Verify API key còn quota
- ✅ Check console logs

### Địa chỉ không chính xác?
- ✅ Goong data tốt nhất cho Việt Nam
- ✅ Nếu vẫn sai, báo cho Goong support

## 🎉 Kết quả

Sau khi setup xong, bạn sẽ có:
- ✅ Bản đồ Việt Nam chính xác
- ✅ Routing thông minh
- ✅ Geocoding tiếng Việt chuẩn
- ✅ Chi phí thấp hơn nhiều
- ✅ Performance tốt

---

**Happy Mapping! 🗺️🇻🇳**
