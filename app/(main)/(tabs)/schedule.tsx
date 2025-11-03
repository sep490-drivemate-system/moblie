import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Car,
  Route,
  SquarePen,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";

interface BookingItem {
  id: string;
  studentName: string;
  time: string;
  date: string;
  status: "ongoing" | "completed" | "cancelled";
  route: string;
  vehicle: string;
  price: number;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("2025-10-26");
  const tabBarHeight = useBottomTabBarHeight();

  // Ensure selectedDate is always current date on mount
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;
    console.log("Setting selectedDate to:", todayString);
    setSelectedDate(todayString);
  }, []);

  // Sample data based on the images
  const bookings: BookingItem[] = [
    {
      id: "1",
      studentName: "Nguyễn Văn B",
      time: "8:00 - 12:00",
      date: "2025-01-15",
      status: "ongoing",
      route: "Chưa cài đặt lộ trình",
      vehicle: "KIA Carnival 2024",
      price: 800,
    },
    {
      id: "2",
      studentName: "Trần Thị C",
      time: "13:00 - 17:00",
      date: "2025-01-15",
      status: "completed",
      route: "Quận 9 - Quận 1",
      vehicle: "Không có",
      price: 800,
    },
    {
      id: "3",
      studentName: "Lê Văn D",
      time: "18:00 - 22:00",
      date: "2025-01-15",
      status: "cancelled",
      route: "Tân Hòa, quận 9 - Cống Quỳnh, quận 1",
      vehicle: "KIA Carnival 2024",
      price: 800,
    },
    {
      id: "4",
      studentName: "Phạm Thị E",
      time: "8:00 - 12:00",
      date: "2025-01-16",
      status: "ongoing",
      route: "Quận 7 - Quận 1",
      vehicle: "Toyota Vios",
      price: 600,
    },
    {
      id: "5",
      studentName: "Võ Văn F",
      time: "14:00 - 18:00",
      date: "2025-01-16",
      status: "completed",
      route: "Quận 2 - Quận 3",
      vehicle: "Honda City",
      price: 700,
    },
    {
      id: "6",
      studentName: "Nguyễn Thị G",
      time: "9:00 - 13:00",
      date: "2025-01-17",
      status: "ongoing",
      route: "Quận 4 - Quận 5",
      vehicle: "Mazda 3",
      price: 750,
    },
    // Add some bookings for today's date (26/10/2025) with different times
    {
      id: "7",
      studentName: "Hồ Văn H",
      time: "8:00 - 12:00",
      date: "2025-10-26",
      status: "ongoing",
      route: "Quận 1 - Quận 3",
      vehicle: "Hyundai Accent",
      price: 650,
    },
    {
      id: "8",
      studentName: "Đặng Thị I",
      time: "14:00 - 18:00",
      date: "2025-10-26",
      status: "completed",
      route: "Quận 2 - Quận 7",
      vehicle: "Ford Focus",
      price: 720,
    },
    {
      id: "9",
      studentName: "Lê Văn K",
      time: "6:00 - 10:00",
      date: "2025-10-26",
      status: "completed",
      route: "Quận 5 - Quận 8",
      vehicle: "Toyota Camry",
      price: 800,
    },
    {
      id: "10",
      studentName: "Phạm Thị L",
      time: "19:00 - 23:00",
      date: "2025-10-26",
      status: "ongoing",
      route: "Quận 10 - Quận 11",
      vehicle: "Honda Civic",
      price: 700,
    },
    // Add bookings for tomorrow (27/10/2025)
    {
      id: "13",
      studentName: "Võ Văn O",
      time: "9:00 - 13:00",
      date: "2025-10-27",
      status: "ongoing",
      route: "Quận 6 - Quận 9",
      vehicle: "Nissan Altima",
      price: 750,
    },
    {
      id: "14",
      studentName: "Bùi Thị P",
      time: "15:00 - 19:00",
      date: "2025-10-27",
      status: "completed",
      route: "Quận 12 - Quận Thủ Đức",
      vehicle: "KIA Sorento",
      price: 680,
    },
    // Add bookings for other days in October 2025
    {
      id: "15",
      studentName: "Đỗ Văn Q",
      time: "10:00 - 14:00",
      date: "2025-10-28",
      status: "ongoing",
      route: "Quận 1 - Quận 4",
      vehicle: "Toyota Innova",
      price: 850,
    },
    {
      id: "16",
      studentName: "Hoàng Thị R",
      time: "16:00 - 20:00",
      date: "2025-10-29",
      status: "completed",
      route: "Quận 7 - Quận 8",
      vehicle: "Honda CR-V",
      price: 900,
    },
    // Add more bookings for 2025-01-15 to test sorting
    {
      id: "11",
      studentName: "Trần Văn M",
      time: "6:00 - 10:00",
      date: "2025-01-15",
      status: "completed",
      route: "Quận 1 - Quận 2",
      vehicle: "Mazda CX-5",
      price: 900,
    },
    {
      id: "12",
      studentName: "Nguyễn Thị N",
      time: "20:00 - 24:00",
      date: "2025-01-15",
      status: "ongoing",
      route: "Quận 3 - Quận 4",
      vehicle: "Hyundai Tucson",
      price: 850,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "#10b981";
      case "completed":
        return "#3b82f6";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ongoing":
        return "Đang diễn ra";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Chưa xác định";
    }
  };

  const getBookingsForSelectedDate = () => {
    console.log("getBookingsForSelectedDate - selectedDate:", selectedDate);
    const filteredBookings = bookings
      .filter((booking) => booking.date === selectedDate)
      .sort((a, b) => {
        // Extract time from "8:00 - 12:00" format and compare
        const getStartTime = (timeStr: string) => {
          const startTime = timeStr.split(" - ")[0];
          const [hours, minutes] = startTime.split(":").map(Number);
          return hours * 60 + minutes; // Convert to minutes for comparison
        };

        return getStartTime(a.time) - getStartTime(b.time);
      });
    return filteredBookings;
  };

  const formatSelectedDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    console.log("Input dateString test:", dateString);
    console.log("Parsed date:", date);
    console.log(
      "Formatted date:",
      date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    );

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderCalendar = () => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Calculate start date of calendar grid (Monday of the week containing first day)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const days = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Header with day names
    const headerDays = dayNames.map((day) => (
      <View key={day} style={styles.dayHeader}>
        <Text style={styles.dayHeaderText}>{day}</Text>
      </View>
    ));

    // Generate calendar days
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const dayNum = String(currentDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${dayNum}`;

        const isCurrent = currentDate.getMonth() === current.getMonth();
        const isSelected = dateString === selectedDate;
        const dayNumber = currentDate.getDate();

        // Check if this date has bookings
        const hasBookings = bookings.some(
          (booking) => booking.date === dateString
        );
        const isBusy = false; // You can add logic for busy days if needed

        weekDays.push(
          <TouchableOpacity
            key={dateString}
            style={[
              styles.dayButton,
              !isCurrent && styles.dayButtonOtherMonth,
              isSelected && styles.dayButtonSelected,
            ]}
            onPress={() => {
              console.log("Calendar day clicked - dateString:", dateString);
              console.log("Calendar day clicked - dayNumber:", dayNumber);
              setSelectedDate(dateString);
            }}
          >
            <Text
              style={[
                styles.dayText,
                !isCurrent && styles.dayTextOtherMonth,
                isSelected && styles.dayTextSelected,
              ]}
            >
              {dayNumber}
            </Text>
            <View style={styles.dayIndicators}>
              {hasBookings && <View style={styles.greenDot} />}
              {isBusy && <View style={styles.redDot} />}
            </View>
          </TouchableOpacity>
        );
      }
      days.push(
        <View key={week} style={styles.weekRow}>
          {weekDays}
        </View>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              const newMonth = new Date(current);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setCurrent(newMonth);
            }}
          >
            <ChevronLeft size={20} color={"#70E000"} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {current.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}
          </Text>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              const newMonth = new Date(current);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setCurrent(newMonth);
            }}
          >
            <ChevronRight size={20} color={"#70E000"} />
          </TouchableOpacity>
        </View>

        <View style={styles.dayHeaders}>{headerDays}</View>

        {days}
      </View>
    );
  };

  // navigate to the map
  const handleBookingPress = (booking: BookingItem) => {
    router.push({
      pathname: "/booking-details",
      params: {
        booking: JSON.stringify(booking),
      },
    });
  };

  const renderBookingCard = (booking: BookingItem) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => handleBookingPress(booking)}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.studentName}>{booking.studentName}</Text>
          <Text style={styles.timeDate}>
            {booking.time} | {booking.date}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(booking.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.routeInfo}>
          <View style={styles.routeLine} />
          <View style={styles.routeContent}>
            <View style={styles.routeItem}>
              <Route size={16} color="#6b7280" />
              <Text style={styles.routeText}>{booking.route}</Text>
            </View>
            <View style={styles.routeItem}>
              <Car size={16} color="#6b7280" />
              <Text style={styles.routeText}>{booking.vehicle}</Text>
            </View>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>Giá: {booking.price} GF</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: tabBarHeight + 200 }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />
      {/* Update Schedule Button */}
      <View style={styles.updateButtonContainer}>
        <TouchableOpacity style={styles.updateButton}>
          <SquarePen size={16} color={"#FFFFFF"} strokeWidth={2} />
          <Text style={styles.updateButtonText}>Cập nhật lịch làm việc</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      {renderCalendar()}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendGreenDot} />
          <Text style={styles.legendText}>Ngày có đơn thuê</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendRedDot} />
          <Text style={styles.legendText}>Ngày bận</Text>
        </View>
      </View>

      {/* Selected Date and Bookings Container */}
      <View style={styles.selectedDateContainer}>
        <View style={styles.selectedDateHeader}>
          <Calendar size={20} color={AppColors.brandBlue} />
          <Text style={styles.selectedDateText}>
            {formatSelectedDate(selectedDate)}
          </Text>
        </View>
        {/* Bookings List for Selected Date */}
        <View style={styles.bookingsList}>
          {getBookingsForSelectedDate().length > 0 ? (
            getBookingsForSelectedDate().map(renderBookingCard)
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={"#70E000"} strokeWidth={2} />
              <Text style={styles.emptyText}>
                Không có đơn thuê nào trong ngày này
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: StatusBar.currentHeight,
  },

  // Update Button Styles
  updateButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "flex-end",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#70E000",
    backgroundColor: "#70E000",
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },

  // Calendar Styles
  calendarContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#70E000",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayButton: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
    borderRadius: 8,
    position: "relative",
  },
  dayButtonOtherMonth: {
    opacity: 0.3,
  },
  dayButtonSelected: {
    backgroundColor: AppColors.brandBlue,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  dayTextOtherMonth: {
    color: "#cccccc",
  },
  dayTextSelected: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  dayIndicators: {
    position: "absolute",
    bottom: 4,
    flexDirection: "row",
    gap: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2ed573",
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },

  // Legend Styles
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  legendGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2ed573",
    marginRight: 6,
  },
  legendRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666666",
  },

  // Selected Date Container
  selectedDateContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 50,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Selected Date Header
  selectedDateHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 8,
  },

  // Bookings List Styles
  bookingsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Booking Card Styles
  bookingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  timeDate: {
    fontSize: 14,
    color: "#666666",
  },
  statusBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  bookingDetails: {
    gap: 8,
  },
  routeInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: "#e0e0e0",
    marginRight: 12,
    marginTop: 4,
  },
  routeContent: {
    flex: 1,
    gap: 8,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routeText: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00000080",
  },

  // Empty State Styles
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 12,
    textAlign: "center",
  },
});
