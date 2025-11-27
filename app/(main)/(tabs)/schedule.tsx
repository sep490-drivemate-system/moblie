import { AppColors } from "@/constants/Colors";
import { ROUTES } from "@/constants/routes";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Route,
  SquarePen,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

type ScheduleBookingStatus =
  | "routePlanning"
  | "pending"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "rescheduled"
  | "cancelled";

interface BookingItem {
  id: string;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  status: ScheduleBookingStatus;
  route: string;
  vehicle: string;
}

const BOOKINGS_DATA: BookingItem[] = [
  {
    id: "BKG001",
    studentName: "Nguyễn Văn B",
    date: "2025-11-14",
    startTime: "07:00",
    endTime: "09:00",
    totalHours: 2,
    status: "routePlanning",
    route: "Quận 9 - Quận 1",
    vehicle: "KIA Carnival 2024",
  },
  {
    id: "BKG002",
    studentName: "Trần Thị C",
    date: "2025-11-14",
    startTime: "10:00",
    endTime: "12:30",
    totalHours: 2.5,
    status: "pending",
    route: "Quận 2 - Quận 7",
    vehicle: "Xe khách hàng",
  },
  {
    id: "BKG003",
    studentName: "Lê Văn D",
    date: "2025-10-15",
    startTime: "08:00",
    endTime: "11:00",
    totalHours: 3,
    status: "upcoming",
    route: "Tân Hòa, Quận 9 - Cống Quỳnh, Quận 1",
    vehicle: "KIA Carnival 2024",
  },
  {
    id: "BKG004",
    studentName: "Phạm Thị E",
    date: "2025-10-15",
    startTime: "13:30",
    endTime: "16:00",
    totalHours: 2.5,
    status: "ongoing",
    route: "Quận 7 - Quận 1",
    vehicle: "Toyota Vios",
  },
  {
    id: "BKG005",
    studentName: "Võ Văn F",
    date: "2025-11-16",
    startTime: "17:00",
    endTime: "20:00",
    totalHours: 3,
    status: "completed",
    route: "Quận 2 - Quận 3",
    vehicle: "Honda City",
  },
  {
    id: "BKG006",
    studentName: "Nguyễn Thị G",
    date: "2025-12-01",
    startTime: "08:30",
    endTime: "11:30",
    totalHours: 3,
    status: "rescheduled",
    route: "Quận 4 - Quận 5",
    vehicle: "Mazda 3",
  },
  {
    id: "BKG007",
    studentName: "Hồ Văn H",
    date: "2025-10-16",
    startTime: "14:00",
    endTime: "17:30",
    totalHours: 3.5,
    status: "ongoing",
    route: "Quận 1 - Quận 3",
    vehicle: "Hyundai Accent",
  },
  {
    id: "BKG008",
    studentName: "Đặng Thị I",
    date: "2025-11-17",
    startTime: "09:00",
    endTime: "12:00",
    totalHours: 3,
    status: "upcoming",
    route: "Quận 4 - Quận 7",
    vehicle: "Xe khách hàng",
  },
  {
    id: "BKG009",
    studentName: "Lê Văn K",
    date: "2025-11-17",
    startTime: "13:00",
    endTime: "15:30",
    totalHours: 2.5,
    status: "cancelled",
    route: "Quận 5 - Quận 8",
    vehicle: "Toyota Camry",
  },
  {
    id: "BKG010",
    studentName: "Phạm Thị L",
    date: "2025-11-18",
    startTime: "08:30",
    endTime: "11:30",
    totalHours: 3,
    status: "upcoming",
    route: "Quận 10 - Quận 11",
    vehicle: "Honda Civic",
  },
  {
    id: "BKG011",
    studentName: "Võ Văn O",
    date: "2025-10-18",
    startTime: "13:30",
    endTime: "16:30",
    totalHours: 3,
    status: "ongoing",
    route: "Quận 6 - Quận 9",
    vehicle: "Nissan Altima",
  },
  {
    id: "BKG012",
    studentName: "Bùi Thị P",
    date: "2025-12-18",
    startTime: "18:00",
    endTime: "20:00",
    totalHours: 2,
    status: "completed",
    route: "Quận 12 - Thủ Đức",
    vehicle: "KIA Sorento",
  },
];

const STATUS_STYLES: Record<
  ScheduleBookingStatus,
  {
    cardBorder: string;
    badgeBackground: string;
    badgeColor: string;
    dotColor: string;
  }
> = {
  routePlanning: {
    cardBorder: "#C4B5FD",
    badgeBackground: "#EDE9FE",
    badgeColor: "#5B21B6",
    dotColor: "#8B5CF6",
  },
  pending: {
    cardBorder: "#FCD34D",
    badgeBackground: "#FEF3C7",
    badgeColor: "#B45309",
    dotColor: "#F59E0B",
  },
  upcoming: {
    cardBorder: "#CBD5F5",
    badgeBackground: "#F1F5F9",
    badgeColor: "#475569",
    dotColor: "#64748B",
  },
  ongoing: {
    cardBorder: "#86EFAC",
    badgeBackground: "#DCFCE7",
    badgeColor: "#15803D",
    dotColor: "#22C55E",
  },
  completed: {
    cardBorder: "#BFDBFE",
    badgeBackground: "#DBEAFE",
    badgeColor: "#1D4ED8",
    dotColor: "#3B82F6",
  },
  rescheduled: {
    cardBorder: "#FED7AA",
    badgeBackground: "#FFEDD5",
    badgeColor: "#C2410C",
    dotColor: "#FB923C",
  },
  cancelled: {
    cardBorder: "#FECACA",
    badgeBackground: "#FEE2E2",
    badgeColor: "#B91C1C",
    dotColor: "#EF4444",
  },
};

const bookingStatusToText: Record<ScheduleBookingStatus, string> = {
  routePlanning: "Đang lên lộ trình",
  pending: "Đang chờ xác nhận",
  upcoming: "Sắp diễn ra",
  ongoing: "Đang diễn ra",
  completed: "Đã hoàn thành",
  rescheduled: "Đã dời lịch",
  cancelled: "Đã hủy",
};

const formatTimeRange = (booking: BookingItem) =>
  `${booking.startTime} - ${booking.endTime}`;

const formatTotalHours = (hours: number) =>
  Number.isInteger(hours) ? `${hours} giờ` : `${hours.toFixed(1)} giờ`;

const formatDisplayDate = (dateString: string) => {
  if (!dateString) return "Chọn ngày";
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "long",
  });
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

interface BookingCardProps {
  booking: BookingItem;
  onPress: (booking: BookingItem) => void;
}

function BookingCard({ booking, onPress }: BookingCardProps) {
  const colors = STATUS_STYLES[booking.status];

  return (
    <TouchableOpacity
      key={booking.id}
      onPress={() => onPress(booking)}
      style={[
        styles.bookingCard,
        {
          borderLeftColor: colors.cardBorder,
          borderRightColor: colors.cardBorder,
        },
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.bookingCardHeader}>
        <View style={styles.bookingCardTitleContainer}>
          <Text style={styles.bookingCardTitle}>{booking.studentName}</Text>
          <View style={styles.bookingCardMeta}>
            <View style={styles.metaRow}>
              <Clock size={16} color="#4B5563" />
              <Text style={styles.metaText}>{formatTimeRange(booking)}</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: colors.badgeBackground,
            },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: colors.badgeColor }]}>
            {bookingStatusToText[booking.status]}
          </Text>
        </View>
      </View>

      <View style={styles.bookingCardBody}>
        <View style={styles.bookingDetailRow}>
          <Route size={16} color="#94A3B8" />
          <Text style={styles.bookingDetailText}>{booking.route}</Text>
        </View>
        <View style={styles.bookingDetailRow}>
          <Car size={16} color="#94A3B8" />
          <Text style={styles.bookingDetailText}>{booking.vehicle}</Text>
        </View>
      </View>

      <View style={styles.bookingCardFooter}>
        <Text style={styles.footerLabel}>Tổng thời gian</Text>
        <Text style={styles.footerValue}>
          {formatTotalHours(booking.totalHours)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface ScheduleCalendarProps {
  currentDate: Date;
  selectedDate: string;
  onCurrentDateChange: (date: Date) => void;
  onSelectedDateChange: (date: string) => void;
  bookings: BookingItem[];
}

function ScheduleCalendar({
  currentDate,
  selectedDate,
  onCurrentDateChange,
  onSelectedDateChange,
  bookings,
}: ScheduleCalendarProps) {
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

        const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
        const isSelected = dateString === selectedDate;
        const hasBookings = bookings.some(
          (booking) => booking.date === dateString
        );

        weekDays.push(
          <TouchableOpacity
            key={dateString}
            style={[
              styles.calendarDayButton,
              !isCurrentMonth && styles.calendarDayButtonMuted,
              isSelected && styles.calendarDayButtonSelected,
            ]}
            activeOpacity={0.9}
            onPress={() => onSelectedDateChange(dateString)}
          >
            <Text
              style={[
                styles.calendarDayNumber,
                !isCurrentMonth && styles.calendarDayNumberMuted,
                isSelected && styles.calendarDayNumberSelected,
              ]}
            >
              {cellDate.getDate()}
            </Text>
            <View style={styles.calendarIndicators}>
              {hasBookings && <View style={styles.calendarIndicatorGreen} />}
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
          activeOpacity={0.7}
          style={styles.calendarHeaderButton}
        >
          <ChevronLeft size={20} color="#16A34A" />
        </TouchableOpacity>

        <Text style={styles.calendarHeaderTitle}>
          {currentDate.toLocaleDateString("vi-VN", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity
          onPress={handleNextMonth}
          activeOpacity={0.7}
          style={styles.calendarHeaderButton}
        >
          <ChevronRight size={20} color="#16A34A" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarDayHeaders}>{headerDays}</View>
      <View>{weeks}</View>

      <View style={styles.calendarLegend}>
        <View style={styles.legendItem}>
          <View style={styles.legendGreenDot} />
          <Text style={styles.legendText}>Ngày có buổi tập lái</Text>
        </View>
      </View>
    </View>
  );
}

interface ScheduleBookingListProps {
  selectedDate: string;
  bookings: BookingItem[];
  onBookingPress: (booking: BookingItem) => void;
}

function ScheduleBookingList({
  selectedDate,
  bookings,
  onBookingPress,
}: ScheduleBookingListProps) {
  return (
    <View style={styles.bookingListContainer}>
      <View style={styles.selectedDateCard}>
        <View style={styles.selectedDateHeader}>
          <Calendar size={24} color={AppColors.primary} />
          <View>
            <Text style={styles.selectedDateTitle}>
              {formatDisplayDate(selectedDate)}
            </Text>
            <Text style={styles.selectedDateSubtitle}>
              {bookings.length} buổi tập lái
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingCardsWrapper}>
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onPress={onBookingPress}
            />
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Calendar size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>
              Không có buổi tập lái nào trong ngày này
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Hãy chọn ngày khác để xem lịch
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface UpdateScheduleButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

function UpdateScheduleButton({ onPress, style }: UpdateScheduleButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.updateScheduleButton, style]}
      onPress={onPress}
    >
      <SquarePen size={18} color="#FFFFFF" />
      <Text style={styles.updateScheduleButtonText}>
        Thiết lập lịch rảnh huấn luyện
      </Text>
    </TouchableOpacity>
  );
}

export default function ScheduleScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
  }, []);

  const bookingsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return BOOKINGS_DATA.filter(
      (booking) => booking.date === selectedDate
    ).sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  }, [selectedDate]);

  const handleBookingPress = (booking: BookingItem) => {
    router.push(ROUTES.BOOKING);
  };

  const handleUpdateSchedule = () => {
    router.push(ROUTES.SCHEDULE_DETAIL);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: tabBarHeight + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[
          AppColors.primary,
          AppColors.gradientStart,
          AppColors.gradientEnd,
        ]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Lịch Làm Việc</Text>
            <Text style={styles.headerSubtitle}>
              Quản lý lịch trình công việc của bạn
            </Text>
          </View>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      <View style={styles.contentWrapper}>
        <UpdateScheduleButton
          onPress={handleUpdateSchedule}
          style={styles.updateScheduleButtonFullWidth}
        />

        <View style={styles.sectionSpacing}>
          <ScheduleCalendar
            currentDate={currentDate}
            selectedDate={selectedDate}
            onCurrentDateChange={setCurrentDate}
            onSelectedDateChange={setSelectedDate}
            bookings={BOOKINGS_DATA}
          />
        </View>

        <View style={styles.sectionSpacing}>
          <ScheduleBookingList
            selectedDate={selectedDate}
            bookings={bookingsForSelectedDate}
            onBookingPress={handleBookingPress}
          />
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: (StatusBar.currentHeight ?? 0) + 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextGroup: {
    flex: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
  },
  headerCurve: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  updateScheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#16A34A",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  updateScheduleButtonFullWidth: {
    alignSelf: "flex-end",
  },
  updateScheduleButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionSpacing: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calendarHeaderButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
  },
  calendarHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    backgroundColor: "#F8FAFC",
    borderColor: "transparent",
  },
  calendarDayButtonSelected: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
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
  calendarIndicators: {
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
  calendarIndicatorGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },
  calendarLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendGreenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
  },
  legendText: {
    fontSize: 13,
    color: "#475569",
  },
  bookingListContainer: {
    gap: 16,
  },
  selectedDateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  selectedDateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  selectedDateSubtitle: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
  },
  bookingCardsWrapper: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRightWidth: 1,
    borderColor: "#E2E8F0",
  },
  bookingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  bookingCardTitleContainer: {
    flex: 1,
  },
  bookingCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  bookingCardMeta: {
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bookingCardBody: {
    gap: 8,
    marginBottom: 12,
  },
  bookingDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookingDetailText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
  },
  bookingCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerLabel: {
    fontSize: 13,
    color: "#94A3B8",
  },
  footerValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  emptyStateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },
});
