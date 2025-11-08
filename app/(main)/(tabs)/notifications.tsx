import React, { useState, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";
import { useAppSelector } from "@/lib/redux/hooks";
import { UserRole } from "@/models/enum/UserRole.enum";
import {
  MessageCircle,
  Calendar,
  CalendarX,
  Wallet,
  CheckCircle,
  XCircle,
  Bell,
  Clock,
  Computer,
} from "lucide-react-native";

type NotificationType =
  | "message"
  | "schedule_change"
  | "schedule_cancel"
  | "wallet_change"
  | "payment_success"
  | "payment_failed";

type NotificationCategory = "all" | "system" | "customer" | "instructor";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  category: NotificationCategory; // system, customer, or instructor
  read: boolean;
  route?: string; // Route to navigate when clicked
  data?: any; // Additional data for navigation
}

export default function NotificationsScreen() {
  const router = useRouter();
  const role = useAppSelector((s) => s.auth.user?.role ?? null);
  const [activeFilter, setActiveFilter] = useState<NotificationCategory>("all");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Tin nhắn mới từ khách hàng",
      message: "Bạn có tin nhắn mới từ Nguyễn Văn A về buổi tập lái.",
      time: "5 phút trước",
      type: "message",
      category: role === UserRole.Instructor ? "customer" : "instructor",
      read: false,
      route: "/(main)/(no-tabs)/booking-details",
      data: { bookingId: 1 },
    },
    {
      id: 2,
      title: "Khách hàng thay đổi lịch tập lái",
      message:
        "Khách hàng Nguyễn Văn B đã thay đổi buổi tập lái ngày 15/12/2024 từ 9:00 sang 10:00.",
      time: "1 giờ trước",
      type: "schedule_change",
      category: role === UserRole.Instructor ? "customer" : "instructor",
      read: false,
      route: "/(main)/(no-tabs)/reschedule-session",
      data: { sessionId: 2 },
    },
    {
      id: 3,
      title: "Khách hàng hủy buổi tập lái",
      message:
        "Khách hàng Trần Thị C đã hủy buổi tập lái ngày 20/12/2024. Vui lòng kiểm tra và xác nhận.",
      time: "2 giờ trước",
      type: "schedule_cancel",
      category: role === UserRole.Instructor ? "customer" : "instructor",
      read: false,
      route: "/(main)/(no-tabs)/cancel-booking",
      data: { bookingId: 3 },
    },
    {
      id: 4,
      title: "Thay đổi số dư ví",
      message:
        "Số dư ví của bạn đã thay đổi: +500,000 VNĐ từ giao dịch nạp tiền.",
      time: "3 giờ trước",
      type: "wallet_change",
      category: "system",
      read: true,
      route: "/(main)/(no-tabs)/(transaction)/transaction",
    },
    {
      id: 5,
      title: "Thanh toán thành công",
      message: "Bạn đã thanh toán thành công 1,000,000 VNĐ cho gói học lái xe.",
      time: "1 ngày trước",
      type: "payment_success",
      category: "system",
      read: true,
      route: "/(main)/(no-tabs)/payment-success",
      data: { amount: 1000000 },
    },
    {
      id: 6,
      title: "Thanh toán thất bại",
      message:
        "Giao dịch thanh toán 500,000 VNĐ đã thất bại. Vui lòng thử lại.",
      time: "2 ngày trước",
      type: "payment_failed",
      category: "system",
      read: true,
      route: "/(main)/(no-tabs)/payment-failed",
      data: { amount: 500000 },
    },
    {
      id: 7,
      title: "Đổi lịch tập lái thành công",
      message:
        "Bạn đã đổi lịch tập lái thành công từ ngày 10/12/2024 sang 12/12/2024.",
      time: "3 ngày trước",
      type: "schedule_change",
      category: "system",
      read: true,
      route: "/(main)/(no-tabs)/reschedule-session",
      data: { sessionId: 7 },
    },
    {
      id: 8,
      title: "Tin nhắn mới từ khách hàng",
      message: "Bạn có tin nhắn mới từ Lê Văn D về lịch học.",
      time: "3 ngày trước",
      type: "message",
      category: role === UserRole.Instructor ? "customer" : "instructor",
      read: true,
      route: "/(main)/(no-tabs)/booking-details",
      data: { bookingId: 8 },
    },
    {
      id: 9,
      title: "Khách hàng thay đổi lịch tập lái",
      message:
        "Khách hàng Phạm Thị E đã thay đổi buổi tập lái ngày 10/12/2024 từ 14:00 sang 15:00.",
      time: "1 tuần trước",
      type: "schedule_change",
      category: role === UserRole.Instructor ? "customer" : "instructor",
      read: true,
      route: "/(main)/(no-tabs)/reschedule-session",
      data: { sessionId: 9 },
    },
    {
      id: 10,
      title: "Thay đổi số dư ví",
      message:
        "Số dư ví của bạn đã thay đổi: -200,000 VNĐ từ giao dịch thanh toán.",
      time: "1 tuần trước",
      type: "wallet_change",
      category: "system",
      read: true,
      route: "/(main)/(no-tabs)/(transaction)/transaction",
    },
  ]);

  // Calculate statistics by category
  const stats = useMemo(() => {
    const total = notifications.length;
    const system = notifications.filter((n) => n.category === "system").length;
    const customer = notifications.filter(
      (n) => n.category === "customer" || n.category === "instructor"
    ).length;
    return { total, system, customer };
  }, [notifications]);

  // Get filtered notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") {
      return notifications;
    }
    if (activeFilter === "system") {
      return notifications.filter((n) => n.category === "system");
    }
    // For customer/instructor filter - check both customer and instructor
    if (activeFilter === "customer" || activeFilter === "instructor") {
      return notifications.filter(
        (n) => n.category === "customer" || n.category === "instructor"
      );
    }
    return notifications;
  }, [notifications, activeFilter]);

  // Get filter label based on role
  const getFilterLabel = () => {
    if (role === UserRole.Instructor) {
      return "Khách hàng";
    }
    if (role === UserRole.NoviceDriver) {
      return "Người hướng dẫn";
    }
    return "Khách hàng";
  };

  // Get notification icon component
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "message":
        return MessageCircle;
      case "schedule_change":
        return Calendar;
      case "schedule_cancel":
        return CalendarX;
      case "wallet_change":
        return Wallet;
      case "payment_success":
        return CheckCircle;
      case "payment_failed":
        return XCircle;
      default:
        return Bell;
    }
  };

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to detail page if route exists
    if (notification.route) {
      router.push(notification.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Modern Header with Gradient */}
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Thông báo</Text>
            <Text style={styles.headerSubtitle}>
              Cập nhật hoạt động của bạn
            </Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {filteredNotifications.length}
              </Text>
              <Text style={styles.statLabel}>Tổng</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      {/* Modern Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeFilter === "all" && styles.activeTab]}
            onPress={() => setActiveFilter("all")}
          >
            <View style={styles.tabContent}>
              <Bell
                size={16}
                color={activeFilter === "all" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  activeFilter === "all" && styles.activeTabText,
                ]}
              >
                Tất cả ({stats.total})
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              (activeFilter === "customer" || activeFilter === "instructor") &&
                styles.activeTab,
            ]}
            onPress={() =>
              setActiveFilter(
                role === UserRole.Instructor ? "customer" : "instructor"
              )
            }
          >
            <View style={styles.tabContent}>
              <MessageCircle
                size={16}
                color={
                  activeFilter === "customer" || activeFilter === "instructor"
                    ? "#ffffff"
                    : "#6b7280"
                }
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  (activeFilter === "customer" ||
                    activeFilter === "instructor") &&
                    styles.activeTabText,
                ]}
              >
                {getFilterLabel()} ({stats.customer})
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeFilter === "system" && styles.activeTab]}
            onPress={() => setActiveFilter("system")}
          >
            <View style={styles.tabContent}>
              <Computer
                size={16}
                color={activeFilter === "system" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  activeFilter === "system" && styles.activeTabText,
                ]}
              >
                Hệ thống ({stats.system})
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Bell size={48} color={AppColors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
            <Text style={styles.emptySubtitle}>
              Bạn sẽ thấy thông báo ở đây khi có hoạt động trên tài khoản của
              bạn.
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => {
            const NotificationIcon = getNotificationIcon(notification.type);
            return (
              <Pressable
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={styles.notificationCard}>
                  <LinearGradient
                    colors={["#ffffff", "#f8fafc"]}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.notificationHeader}>
                      <View style={styles.iconInfo}>
                        <View
                          style={[
                            styles.iconContainer,
                            !notification.read && styles.iconContainerUnread,
                          ]}
                        >
                          <NotificationIcon
                            size={24}
                            color={AppColors.primary}
                            strokeWidth={2}
                          />
                        </View>
                        <View style={styles.textContainer}>
                          <Text
                            style={[
                              styles.notificationTitle,
                              !notification.read && styles.unreadTitle,
                            ]}
                            numberOfLines={1}
                          >
                            {notification.title}
                          </Text>
                          {!notification.read && (
                            <View style={styles.unreadBadge}>
                              <View style={styles.unreadDot} />
                              <Text style={styles.unreadText}>Chưa đọc</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.notificationDetails}>
                      <Text
                        style={styles.notificationMessage}
                        numberOfLines={3}
                      >
                        {notification.message}
                      </Text>
                      <View style={styles.timeRow}>
                        <Clock size={14} color="#6b7280" strokeWidth={2} />
                        <Text style={styles.notificationTime}>
                          {notification.time}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </Pressable>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  headerStats: {
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  headerCurve: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -25,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 1,
  },
  tabsScrollContent: {
    paddingHorizontal: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: AppColors.background,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  notificationCard: {
    borderRadius: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 20,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${AppColors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: `${AppColors.primary}30`,
  },
  iconContainerUnread: {
    backgroundColor: `${AppColors.primary}25`,
    borderColor: AppColors.primary,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 4,
  },
  unreadTitle: {
    color: "#1e293b",
    fontWeight: "800",
  },
  unreadBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.primary,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.primary,
  },
  notificationDetails: {
    gap: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
});
