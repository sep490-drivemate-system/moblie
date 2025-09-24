# Calendar Components

Bộ components lịch cho ứng dụng thuê xe với các chế độ chọn khác nhau.

## Các Components

### 1. Calendar
Component lịch chính với khả năng hiển thị và chọn ngày.

**Props:**
- `events`: Array các sự kiện lịch
- `onDateSelect`: Callback khi chọn ngày
- `onWeekSelect`: Callback khi chọn tuần
- `onMultipleDateSelect`: Callback khi chọn nhiều ngày
- `mode`: Chế độ chọn ('session', 'day', 'week', 'cycle')
- `selectedDates`: Array các ngày đã chọn
- `selectedWeek`: Object chứa tuần đã chọn

### 2. ModeSelector
Component chọn chế độ đặt lịch.

**Props:**
- `selectedMode`: Chế độ hiện tại
- `onModeChange`: Callback khi thay đổi chế độ

### 3. ScheduleDisplay
Component hiển thị lịch đã chọn.

**Props:**
- `events`: Array các sự kiện
- `selectedDates`: Array các ngày đã chọn
- `selectedMode`: Chế độ hiện tại
- `onEventPress`: Callback khi nhấn vào sự kiện
- `onRemoveEvent`: Callback khi xóa sự kiện

## Các Chế Độ Chọn

### 1. Theo Buổi (Session)
- Chọn ngày trước
- Sau đó chọn buổi (sáng/chiều)
- Phù hợp cho việc đặt lịch theo ca làm việc

### 2. Theo Ngày (Day)
- Chỉ chọn ngày
- Phù hợp cho việc đặt lịch đơn giản

### 3. Theo Tuần (Week)
- Chọn tuần trước
- Sau đó chọn các ngày trong tuần
- Phù hợp cho việc đặt lịch theo tuần

### 4. Theo Chu Kỳ (Cycle)
- Chọn nhiều ngày trong tháng
- Phù hợp cho việc đặt lịch định kỳ

## Cách Sử Dụng

```tsx
import { Calendar, ModeSelector, ScheduleDisplay, CalendarEvent, CalendarMode } from './components/Calendar';

const [selectedMode, setSelectedMode] = useState<CalendarMode>('day');
const [selectedDates, setSelectedDates] = useState<string[]>([]);
const [events, setEvents] = useState<CalendarEvent[]>([]);

<ModeSelector
  selectedMode={selectedMode}
  onModeChange={setSelectedMode}
/>

<Calendar
  events={events}
  onDateSelect={handleDateSelect}
  onWeekSelect={handleWeekSelect}
  onMultipleDateSelect={handleMultipleDateSelect}
  mode={selectedMode}
  selectedDates={selectedDates}
  selectedWeek={selectedWeek}
/>

<ScheduleDisplay
  events={events}
  selectedDates={selectedDates}
  selectedMode={selectedMode}
  onEventPress={handleEventPress}
  onRemoveEvent={handleRemoveEvent}
/>
```

## Tính Năng

- ✅ Hiển thị lịch với các ngày bận/rảnh
- ✅ Chọn nhiều chế độ khác nhau
- ✅ **Chọn năm và tháng** với picker trực quan
- ✅ **Hiển thị thời gian rảnh/bận trực tiếp trên lịch** (S: 7:00-11:00, C: 13:00-17:00)
- ✅ **Thông tin chi tiết** cho mỗi sự kiện (tiêu đề, mô tả, thời gian)
- ✅ Giao diện thân thiện với người dùng
- ✅ Hỗ trợ tiếng Việt
- ✅ Responsive design
- ✅ Custom calendar không phụ thuộc thư viện bên ngoài
- ✅ **Dữ liệu thời gian thực** với startTime và endTime
