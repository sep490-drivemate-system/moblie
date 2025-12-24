import { AppColors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
} from "lucide-react-native";
import HeaderList from "@/components/Commons/HeaderList";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";
import { updateInstructorSchedule } from "@/features/schedule/scheduleThunk";

type BookingStatus =
  | "routePlanning"
  | "pending"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "rescheduled"
  | "cancelled";

interface BookingItem {
  id: string;
  date: string;
  status: BookingStatus;
}



const SAVED_AVAILABLE_DATES = ["2025-11-30"];

// Mock booking data - should be replaced with actual API call
const BOOKINGS_DATA: BookingItem[] = [];

const bookingStatusToText: Record<BookingStatus, string> = {
  routePlanning: "Đang lên lộ trình",
  pending: "Đang chờ xác nhận",
  upcoming: "Sắp diễn ra",
  ongoing: "Đang diễn ra",
  completed: "Đã hoàn thành",
  rescheduled: "Đã dời lịch",
  cancelled: "Đã hủy",
};

interface AvailabilityCalendarProps {
  currentDate: Date;
  selectedDates: Set<string>;
  onCurrentDateChange: (date: Date) => void;
  onDateRangeSelect: (startDate: string, endDate: string) => void;
  bookedDates: Set<string>;
  bookedDateStatusMap: Map<string, Set<BookingStatus>>;
  today: Date;
  savedAvailableDates: string[];
}

function AvailabilityCalendar({
  currentDate,
  selectedDates,
  onCurrentDateChange,
  onDateRangeSelect,
  bookedDates,
  bookedDateStatusMap,
  today,
  savedAvailableDates,
}: AvailabilityCalendarProps) {
  const [selectionStart, setSelectionStart] = useState<string | null>(null);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onCurrentDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onCurrentDateChange(newDate);
  };

  const isDateDisabled = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const checkDate = new Date(year, month - 1, day);
    if (checkDate <= today) return true;
    if (bookedDates.has(dateString)) return true;
    return false;
  };

  const handleDateClick = (dateString: string) => {
    if (isDateDisabled(dateString)) return;

    if (selectionStart === null) {
      setSelectionStart(dateString);
      return;
    }

    const [startYear, startMonth, startDay] = selectionStart
      .split("-")
      .map(Number);
    const [endYear, endMonth, endDay] = dateString.split("-").map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    if (start <= end) {
      onDateRangeSelect(selectionStart, dateString);
    } else {
      onDateRangeSelect(dateString, selectionStart);
    }
    setSelectionStart(null);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const dayNames = ["Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "CN"];
    const headerDays = dayNames.map((day) => (
      <View key={day} style={styles.calendarDayHeader}>
        <Text style={styles.calendarDayHeaderText}>{day}</Text>
      </View>
    ));

    const weeks = [];
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + week * 7 + day);

        const cellYear = cellDate.getFullYear();
        const cellMonth = String(cellDate.getMonth() + 1).padStart(2, "0");
        const cellDay = String(cellDate.getDate()).padStart(2, "0");
        const dateString = `${cellYear}-${cellMonth}-${cellDay}`;

        const isCurrentMonth = cellDate.getMonth() === month;
        const isSelected = selectedDates.has(dateString);
        const isDisabled = isDateDisabled(dateString);
        const isBooked = bookedDates.has(dateString);
        const isSaved = savedAvailableDates.includes(dateString);
        const bookedStatuses = bookedDateStatusMap.get(dateString);
        const bookedStatusLabel =
          bookedStatuses && bookedStatuses.size > 0
            ? Array.from(bookedStatuses)
              .map((status) => bookingStatusToText[status])
              .join(", ")
            : null;
        const isStartSelection = dateString === selectionStart;

        weekDays.push(
          <TouchableOpacity
            key={dateString}
            style={[
              styles.calendarDayButton,
              !isCurrentMonth && styles.calendarDayButtonMuted,
              isSelected && styles.calendarDayButtonSelected,
              isStartSelection && styles.calendarDayButtonStart,
              isDisabled && styles.calendarDayButtonDisabled,
            ]}
            activeOpacity={0.85}
            disabled={isDisabled}
            onPress={() => handleDateClick(dateString)}
          >
            <Text
              style={[
                styles.calendarDayNumber,
                !isCurrentMonth && styles.calendarDayNumberMuted,
                (isSelected || isStartSelection) &&
                styles.calendarDayNumberSelected,
                isDisabled && styles.calendarDayNumberDisabled,
              ]}
            >
              {cellDate.getDate()}
            </Text>
            <View style={styles.calendarIndicators}>
              {isBooked && (
                <View
                  style={[styles.calendarIndicatorDot, styles.indicatorBooked]}
                  accessibilityLabel={
                    bookedStatusLabel
                      ? `Ngày đã có khách (${bookedStatusLabel})`
                      : "Ngày đã có khách hàng đặt lịch"
                  }
                />
              )}
              {isSelected && (
                <View
                  style={[
                    styles.calendarIndicatorDot,
                    styles.indicatorSelected,
                  ]}
                />
              )}
              {isSaved && !isSelected && (
                <View
                  style={[styles.calendarIndicatorDot, styles.indicatorSaved]}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      }
      weeks.push(
        <View key={week} style={styles.calendarWeekRow}>
          {weekDays}
        </View>
      );
    }

    return { headerDays, weeks };
  };

  const { headerDays, weeks } = renderCalendar();

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.calendarHeaderButton}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color={AppColors.primary} />
        </TouchableOpacity>
        <Text style={styles.calendarHeaderTitle}>
          {currentDate.toLocaleDateString("vi-VN", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.calendarHeaderButton}
          activeOpacity={0.8}
        >
          <ChevronRight size={20} color={AppColors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarDayHeaders}>{headerDays}</View>
      <View>{weeks}</View>

      <View style={styles.calendarLegend}>
        <LegendItem color="#10B981" label="Ngày rảnh vừa chọn" />
        <LegendItem color="#3B82F6" label="Ngày rảnh đã lưu" />
        <LegendItem color="#EF4444" label="Ngày đã có khách" />
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Lưu ý</Text>
        <Text style={styles.noticeText}>
          • Chỉ có thể thêm lịch rảnh từ ngày mai trở đi.
        </Text>
        <Text style={styles.noticeText}>
          • Không thể xóa lịch rảnh cho những ngày đã có khách hàng đặt lịch.
        </Text>
        <Text style={styles.noticeText}>
          • Mọi cập nhật lịch rảnh trong tương lai, người hướng dẫn hoàn toàn
          chịu trách nhiệm.
        </Text>
      </View>
    </View>
  );
}

interface AvailabilityListProps {
  dates: Set<string>;
  onRemoveDate: (date: string) => void;
  savedDates: string[];
  bookedDates: Set<string>;
  bookedDateStatusMap: Map<string, Set<BookingStatus>>;
  onRemoveSavedDate: (date: string) => void;
  isSaving: boolean;
}

function AvailabilityList({
  dates,
  onRemoveDate,
  savedDates,
  bookedDates,
  bookedDateStatusMap,
  onRemoveSavedDate,
  isSaving,
}: AvailabilityListProps) {
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      weekday: "long",
    });
  };

  const selectedList = Array.from(dates).sort();
  const savedList = [...savedDates].sort();

  return (
    <View style={styles.availabilityColumn}>
      <View style={styles.availabilityCard}>
        <Text style={styles.availabilityTitle}>
          Ngày rảnh mới ({selectedList.length})
        </Text>
        {selectedList.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={36} color="#94A3B8" />
            <Text style={styles.emptyStateText}>Chưa chọn ngày rảnh nào</Text>
          </View>
        ) : (
          selectedList.map((date) => (
            <View key={date} style={styles.dateRow}>
              <View style={styles.dateRowContent}>
                <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => onRemoveDate(date)}
                style={styles.iconButton}
                activeOpacity={0.7}
                disabled={isSaving}
              >
                <Trash2 size={18} color="#047857" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {savedList.length > 0 && (
        <View style={styles.availabilityCard}>
          <Text style={styles.availabilityTitle}>
            Ngày rảnh đã lưu ({savedList.length})
          </Text>
          {savedList.map((date) => {
            const isBooked = bookedDates.has(date);
            const bookedStatusLabel = (() => {
              const statuses = bookedDateStatusMap.get(date);
              if (!statuses) return null;
              return Array.from(statuses)
                .map((status) => bookingStatusToText[status])
                .join(", ");
            })();
            return (
              <View key={date} style={styles.savedDateCard}>
                <View style={styles.savedDateHeader}>
                  <View style={styles.dateRowContent}>
                    <View
                      style={[styles.dot, { backgroundColor: "#3B82F6" }]}
                    />
                    <Text style={styles.dateText}>{formatDate(date)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onRemoveSavedDate(date)}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                    disabled={isSaving || isBooked}
                  >
                    <Trash2 size={18} color="#475569" />
                  </TouchableOpacity>
                </View>
                {isBooked && (
                  <View style={styles.warningRow}>
                    <X size={14} color="#DC2626" />
                    <Text style={styles.warningText}>
                      Ngày này đã có khách
                      {bookedStatusLabel ? ` (${bookedStatusLabel})` : ""},
                      không thể xóa.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

export default function ScheduleDetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [savedAvailableDates, setSavedAvailableDates] = useState<string[]>(
    SAVED_AVAILABLE_DATES
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [today] = useState(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  });

  const bookedDateStatusMap = useMemo(() => {
    return BOOKINGS_DATA.reduce<Map<string, Set<BookingStatus>>>(
      (acc: Map<string, Set<BookingStatus>>, booking: BookingItem) => {
        if (!acc.has(booking.date)) {
          acc.set(booking.date, new Set<BookingStatus>());
        }
        acc.get(booking.date)!.add(booking.status);
        return acc;
      },
      new Map<string, Set<BookingStatus>>()
    );
  }, []);

  const bookedDates = useMemo(
    () => new Set<string>(Array.from(bookedDateStatusMap.keys())),
    [bookedDateStatusMap]
  );

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    const newDates = new Set(selectedDates);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      newDates.add(`${year}-${month}-${day}`);
    }
    setSelectedDates(newDates);
  };

  const handleRemoveDate = (date: string) => {
    const newDates = new Set(selectedDates);
    newDates.delete(date);
    setSelectedDates(newDates);
  };

  const handleRemoveSavedDate = (date: string) => {
    if (bookedDates.has(date)) return;
    setSavedAvailableDates((prev) => prev.filter((d) => d !== date));
  };

  const handleCancel = () => {
    setSelectedDates(new Set());
  };

  const handleUpdate = async () => {
    if (selectedDates.size === 0) return;
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        Alert.alert("Lỗi", "Không thể lấy thông tin người dùng. Vui lòng thử lại.");
        return;
      }

      // Tính from/to từ tập selectedDates (min và max)
      const sortedDates = Array.from(selectedDates).sort();
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];

      const payload = {
        instructorId: userId,
        startTime: startDate,
        endTime: endDate,
      };

      const res = await dispatch(updateInstructorSchedule(payload)).unwrap();

      if (res.isSuccess) {
        // Gộp các ngày rảnh mới với các ngày đã lưu để cập nhật UI
        setSavedAvailableDates((prev) => {
          const combined = new Set([...prev, ...selectedDates]);
          return Array.from(combined);
        });
        setSelectedDates(new Set());
        setSuccessMessage("Đã cập nhật lịch rảnh thành công.");
        // Tự động quay lại sau 1.5 giây
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật lịch rảnh. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Failed to update instructor schedule:", error);
      Alert.alert("Lỗi", "Không thể cập nhật lịch rảnh. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const headerDescription =
    "Chọn những ngày bạn sẵn sàng huấn luyện cho người lái mới";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <StatusBar barStyle="light-content" />
      <HeaderList
        title="Thiết Lập Lịch Rảnh Huấn Luyện"
        description={headerDescription}
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <View style={styles.contentWrapper}>
        {successMessage && (
          <View style={styles.successMessage}>
            <Check size={20} color={AppColors.success} />
            <Text style={styles.successMessageText}>{successMessage}</Text>
          </View>
        )}

        <AvailabilityCalendar
          currentDate={currentDate}
          selectedDates={selectedDates}
          onCurrentDateChange={setCurrentDate}
          onDateRangeSelect={handleDateRangeSelect}
          bookedDates={bookedDates}
          bookedDateStatusMap={bookedDateStatusMap}
          today={today}
          savedAvailableDates={savedAvailableDates}
        />

        <AvailabilityList
          dates={selectedDates}
          onRemoveDate={handleRemoveDate}
          savedDates={savedAvailableDates}
          bookedDates={bookedDates}
          bookedDateStatusMap={bookedDateStatusMap}
          onRemoveSavedDate={handleRemoveSavedDate}
          isSaving={isSaving}
        />

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonOutline]}
            activeOpacity={0.8}
            onPress={handleCancel}
            disabled={isSaving || selectedDates.size === 0}
          >
            <X
              size={18}
              color={
                isSaving || selectedDates.size === 0 ? "#94A3B8" : "#374151"
              }
            />
            <Text
              style={[
                styles.actionButtonTextAlt,
                (isSaving || selectedDates.size === 0) &&
                styles.actionButtonDisabledText,
              ]}
            >
              Hủy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.actionButtonPrimary,
              (isSaving || selectedDates.size === 0) &&
              styles.actionButtonPrimaryDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleUpdate}
            disabled={isSaving || selectedDates.size === 0}
          >
            {isSaving ? (
              <View style={styles.loader} />
            ) : (
              <Check size={18} color="#FFFFFF" />
            )}
            <Text style={styles.actionButtonText}>
              {isSaving ? "Đang cập nhật..." : "Cập nhật"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    backgroundColor: "#ffffff",
  },
  contentWrapper: {
    paddingHorizontal: 16,
    gap: 16,
    backgroundColor: "#FFFFFF",
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  successMessageText: {
    color: "#065F46",
    fontWeight: "600",
    flex: 1,
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
  },
  calendarHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  calendarDayHeaders: {
    flexDirection: "row",
    marginBottom: 8,
  },
  calendarDayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  calendarDayHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
  },
  calendarWeekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  calendarDayButton: {
    flex: 1,
    margin: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  calendarDayButtonMuted: {
    borderColor: "transparent",
    backgroundColor: "#F8FAFC",
    opacity: 0.7,
  },
  calendarDayButtonSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  calendarDayButtonStart: {
    backgroundColor: "#BBF7D0",
    borderColor: "#34D399",
  },
  calendarDayButtonDisabled: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    opacity: 0.4,
  },
  calendarDayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  calendarDayNumberMuted: {
    color: "#94A3B8",
  },
  calendarDayNumberSelected: {
    color: "#FFFFFF",
  },
  calendarDayNumberDisabled: {
    color: "#94A3B8",
  },
  calendarIndicators: {
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
  calendarIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicatorBooked: {
    backgroundColor: "#EF4444",
  },
  indicatorSelected: {
    backgroundColor: "#10B981",
  },
  indicatorSaved: {
    backgroundColor: "#3B82F6",
  },
  calendarLegend: {
    flexDirection: "column",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#475569",
  },
  noticeCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 4,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B45309",
  },
  noticeText: {
    fontSize: 12,
    color: "#92400E",
  },
  availabilityColumn: {
    gap: 16,
  },
  availabilityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  availabilityTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 6,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  dateRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
    flexShrink: 1,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
  },
  savedDateCard: {
    gap: 8,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  savedDateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  warningText: {
    fontSize: 12,
    color: "#B91C1C",
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionButtonOutline: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    backgroundColor: "#FFFFFF",
  },
  actionButtonPrimary: {
    backgroundColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 2,
  },
  actionButtonPrimaryDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  actionButtonTextAlt: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  actionButtonDisabledText: {
    color: "#94A3B8",
  },
  loader: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRightColor: "rgba(255,255,255,0.2)",
  },
});
