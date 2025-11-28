// import React, { useState, useMemo, useEffect } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   StatusBar,
//   TouchableOpacity,
//   RefreshControl,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { LinearGradient } from "expo-linear-gradient";
// import { AppColors } from "@/constants/Colors";
// import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
// import { UserRole } from "@/models/enum/UserRole.enum";
// import {
//   MessageCircle,
//   Calendar,
//   CalendarX,
//   Wallet,
//   CheckCircle,
//   XCircle,
//   Bell,
//   Clock,
//   Computer,
// } from "lucide-react-native";
// import { useSignalR } from "@/lib/signalr/useSignalR";
// import { SignalRHubUrls } from "@/lib/signalr/signalRConfig";
// import { INotification } from "@/models/notification/notification";
// import {
//   getNotifications,
//   markNotificationAsRead,
//   markAllNotificationsAsRead,
//   addNotification,
// } from "@/features/notification/notificationSlice";

// type NotificationCategory = "all" | "system" | "customer" | "instructor";

// // Helper to map INotification to display format
// const mapNotificationType = (type: string): string => {
//   switch (type) {
//     case "booking":
//       return "schedule_change";
//     case "route":
//       return "schedule_change";
//     case "payment":
//       return "payment_success";
//     case "system":
//       return "wallet_change";
//     default:
//       return "message";
//   }
// };

// // Format time relative to now
// const formatTime = (dateString: string): string => {
//   const date = new Date(dateString);
//   const now = new Date();
//   const diff = now.getTime() - date.getTime();
//   const minutes = Math.floor(diff / 60000);
//   const hours = Math.floor(diff / 3600000);
//   const days = Math.floor(diff / 86400000);

//   if (minutes < 1) return "Vừa xong";
//   if (minutes < 60) return `${minutes} phút trước`;
//   if (hours < 24) return `${hours} giờ trước`;
//   if (days < 7) return `${days} ngày trước`;

//   return date.toLocaleDateString("vi-VN", {
//     day: "2-digit",
//     month: "2-digit",
//     year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
//   });
// };

// export default function NotificationsScreen() {
//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const role = useAppSelector((s) => s.auth.user?.role ?? null);
//   const { notifications, unreadCount, isLoading } = useAppSelector(
//     (state) => state.notification
//   );

//   const { connectionId, isConnected, on, off } = useSignalR({
//     hubPath: SignalRHubUrls.NOTIFICATION,
//     enabled: true,
//   });

//   const [activeFilter, setActiveFilter] =
//     useState<NotificationCategory>("all");
//   const [refreshing, setRefreshing] = useState(false);

//   // Load notifications on mount
//   useEffect(() => {
//     loadNotifications();
//   }, []);

//   // Listen for new notifications via SignalR
//   useEffect(() => {
//     if (isConnected) {
//       const handleNewNotification = (notification: INotification) => {
//         dispatch(addNotification(notification));
//       };

//       on("ReceiveNotification", handleNewNotification);

//       return () => {
//         off("ReceiveNotification", handleNewNotification);
//       };
//     }
//   }, [isConnected, on, off, dispatch]);

//   const loadNotifications = async () => {
//     try {
//       await dispatch(getNotifications()).unwrap();
//     } catch (error) {
//       console.error("Error loading notifications:", error);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await loadNotifications();
//     setRefreshing(false);
//   };

//   // Convert INotification to display format
//   const displayNotifications = useMemo(() => {
//     return notifications.map((notif) => ({
//       ...notif,
//       type: mapNotificationType(notif.type),
//       time: formatTime(notif.createdAt),
//       read: notif.isRead,
//     }));
//   }, [notifications]);

//   // Use Redux notifications or fallback to empty array
//   const notificationsToDisplay = displayNotifications.length > 0
//     ? displayNotifications
//     : [];

//   // Calculate statistics by category
//   const stats = useMemo(() => {
//     const total = notificationsToDisplay.length;
//     const system = notificationsToDisplay.filter(
//       (n) => n.type === "wallet_change" || n.type === "payment_success" || n.type === "payment_failed"
//     ).length;
//     const customer = notificationsToDisplay.filter(
//       (n) => n.type === "message" || n.type === "schedule_change" || n.type === "schedule_cancel"
//     ).length;
//     return { total, system, customer };
//   }, [notificationsToDisplay]);

//   // Get filtered notifications
//   const filteredNotifications = useMemo(() => {
//     if (activeFilter === "all") {
//       return notificationsToDisplay;
//     }
//     if (activeFilter === "system") {
//       return notificationsToDisplay.filter(
//         (n) => n.type === "wallet_change" || n.type === "payment_success" || n.type === "payment_failed"
//       );
//     }
//     // For customer/instructor filter
//     if (activeFilter === "customer" || activeFilter === "instructor") {
//       return notificationsToDisplay.filter(
//         (n) => n.type === "message" || n.type === "schedule_change" || n.type === "schedule_cancel"
//       );
//     }
//     return notificationsToDisplay;
//   }, [notificationsToDisplay, activeFilter]);

//   // Get filter label based on role
//   const getFilterLabel = () => {
//     if (role === UserRole.Instructor) {
//       return "Khách hàng";
//     }
//     if (role === UserRole.NoviceDriver) {
//       return "Người hướng dẫn";
//     }
//     return "Khách hàng";
//   };

//   // Get notification icon component
//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case "message":
//         return MessageCircle;
//       case "schedule_change":
//         return Calendar;
//       case "schedule_cancel":
//         return CalendarX;
//       case "wallet_change":
//         return Wallet;
//       case "payment_success":
//         return CheckCircle;
//       case "payment_failed":
//         return XCircle;
//       default:
//         return Bell;
//     }
//   };

//   // Mark notification as read
//   const handleMarkAsRead = async (notificationId: string) => {
//     try {
//       await dispatch(markNotificationAsRead({ notificationId })).unwrap();
//     } catch (error) {
//       console.error("Error marking notification as read:", error);
//     }
//   };

//   // Mark all as read
//   const handleMarkAllAsRead = async () => {
//     try {
//       await dispatch(markAllNotificationsAsRead()).unwrap();
//     } catch (error) {
//       console.error("Error marking all notifications as read:", error);
//     }
//   };

//   // Handle notification press
//   const handleNotificationPress = async (notification: any) => {
//     // Mark as read when clicked
//     if (!notification.read) {
//       await handleMarkAsRead(notification.id);
//     }

//     // Navigate based on notification data
//     if (notification.data?.route) {
//       router.push(notification.data.route as any);
//     } else if (notification.data?.bookingId) {
//       router.push({
//         pathname: "/(main)/(no-tabs)/booking",
//         params: { bookingId: notification.data.bookingId },
//       } as any);
//     } else if (notification.data?.sessionId) {
//       router.push({
//         pathname: "/(main)/(no-tabs)/driving-session-detail",
//         params: { sessionId: notification.data.sessionId },
//       } as any);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />

//       {/* Modern Header with Gradient */}
//       <LinearGradient
//         colors={[
//           AppColors.primary,
//           AppColors.gradientStart,
//           AppColors.gradientEnd,
//         ]}
//         style={styles.header}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View style={styles.headerContent}>
//           <View style={styles.headerTextContainer}>
//             <Text style={styles.headerTitle}>Thông báo</Text>
//             <Text style={styles.headerSubtitle}>
//               Cập nhật hoạt động của bạn
//             </Text>
//           </View>
//           <View style={styles.headerStats}>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {unreadCount > 0 ? unreadCount : filteredNotifications.length}
//               </Text>
//               <Text style={styles.statLabel}>
//                 {unreadCount > 0 ? "Chưa đọc" : "Tổng"}
//               </Text>
//             </View>
//           </View>
//         </View>
//         <View style={styles.headerCurve} />
//       </LinearGradient>

//       {/* Modern Tabs */}
//       <View style={styles.tabsContainer}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.tabsScrollContent}
//         >
//           <TouchableOpacity
//             style={[styles.tab, activeFilter === "all" && styles.activeTab]}
//             onPress={() => setActiveFilter("all")}
//           >
//             <View style={styles.tabContent}>
//               <Bell
//                 size={16}
//                 color={activeFilter === "all" ? "#ffffff" : "#6b7280"}
//                 strokeWidth={2}
//               />
//               <Text
//                 style={[
//                   styles.tabText,
//                   activeFilter === "all" && styles.activeTabText,
//                 ]}
//               >
//                 Tất cả ({stats.total})
//               </Text>
//             </View>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.tab,
//               (activeFilter === "customer" || activeFilter === "instructor") &&
//               styles.activeTab,
//             ]}
//             onPress={() =>
//               setActiveFilter(
//                 role === UserRole.Instructor ? "customer" : "instructor"
//               )
//             }
//           >
//             <View style={styles.tabContent}>
//               <MessageCircle
//                 size={16}
//                 color={
//                   activeFilter === "customer" || activeFilter === "instructor"
//                     ? "#ffffff"
//                     : "#6b7280"
//                 }
//                 strokeWidth={2}
//               />
//               <Text
//                 style={[
//                   styles.tabText,
//                   (activeFilter === "customer" ||
//                     activeFilter === "instructor") &&
//                   styles.activeTabText,
//                 ]}
//               >
//                 {getFilterLabel()} ({stats.customer})
//               </Text>
//             </View>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tab, activeFilter === "system" && styles.activeTab]}
//             onPress={() => setActiveFilter("system")}
//           >
//             <View style={styles.tabContent}>
//               <Computer
//                 size={16}
//                 color={activeFilter === "system" ? "#ffffff" : "#6b7280"}
//                 strokeWidth={2}
//               />
//               <Text
//                 style={[
//                   styles.tabText,
//                   activeFilter === "system" && styles.activeTabText,
//                 ]}
//               >
//                 Hệ thống ({stats.system})
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>

//       <ScrollView
//         style={styles.content}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor={AppColors.primary}
//           />
//         }
//       >
//         {filteredNotifications.length === 0 ? (
//           <View style={styles.emptyState}>
//             <View style={styles.emptyIconContainer}>
//               <Bell size={48} color={AppColors.primary} strokeWidth={1.5} />
//             </View>
//             <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
//             <Text style={styles.emptySubtitle}>
//               Bạn sẽ thấy thông báo ở đây khi có hoạt động trên tài khoản của
//               bạn.
//             </Text>
//           </View>
//         ) : (
//           filteredNotifications.map((notification) => {
//             const NotificationIcon = getNotificationIcon(notification.type);
//             return (
//               <Pressable
//                 key={notification.id}
//                 onPress={() => handleNotificationPress(notification)}
//               >
//                 <View style={styles.notificationCard}>
//                   <LinearGradient
//                     colors={["#ffffff", "#f8fafc"]}
//                     style={styles.cardGradient}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 1 }}
//                   >
//                     <View style={styles.notificationHeader}>
//                       <View style={styles.iconInfo}>
//                         <View
//                           style={[
//                             styles.iconContainer,
//                             !notification.read && styles.iconContainerUnread,
//                           ]}
//                         >
//                           <NotificationIcon
//                             size={24}
//                             color={AppColors.primary}
//                             strokeWidth={2}
//                           />
//                         </View>
//                         <View style={styles.textContainer}>
//                           <Text
//                             style={[
//                               styles.notificationTitle,
//                               !notification.read && styles.unreadTitle,
//                             ]}
//                             numberOfLines={1}
//                           >
//                             {notification.title}
//                           </Text>
//                           {!notification.read && (
//                             <View style={styles.unreadBadge}>
//                               <View style={styles.unreadDot} />
//                               <Text style={styles.unreadText}>Chưa đọc</Text>
//                             </View>
//                           )}
//                         </View>
//                       </View>
//                     </View>

//                     <View style={styles.notificationDetails}>
//                       <Text
//                         style={styles.notificationMessage}
//                         numberOfLines={3}
//                       >
//                         {notification.message}
//                       </Text>
//                       <View style={styles.timeRow}>
//                         <Clock size={14} color="#6b7280" strokeWidth={2} />
//                         <Text style={styles.notificationTime}>
//                           {notification.time}
//                         </Text>
//                       </View>
//                     </View>
//                   </LinearGradient>
//                 </View>
//               </Pressable>
//             );
//           })
//         )}

//         <View style={{ height: 100 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: AppColors.background,
//   },
//   header: {
//     paddingTop: 50,
//     paddingBottom: 40,
//     paddingHorizontal: 20,
//     position: "relative",
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//   },
//   headerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   headerTextContainer: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#ffffff",
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 13,
//     color: "rgba(255, 255, 255, 0.8)",
//     fontWeight: "500",
//   },
//   headerStats: {
//     alignItems: "center",
//   },
//   statItem: {
//     alignItems: "center",
//     backgroundColor: "rgba(255, 255, 255, 0.15)",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 12,
//   },
//   statNumber: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#ffffff",
//   },
//   statLabel: {
//     fontSize: 11,
//     color: "rgba(255, 255, 255, 0.8)",
//     fontWeight: "600",
//   },
//   headerCurve: {
//     position: "absolute",
//     bottom: -25,
//     left: 0,
//     right: 0,
//     height: 50,
//     backgroundColor: AppColors.background,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   tabsContainer: {
//     backgroundColor: "#ffffff",
//     paddingHorizontal: 16,
//     paddingTop: 20,
//     paddingBottom: 20,
//     marginTop: -25,
//     borderRadius: 24,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 12,
//     zIndex: 1,
//   },
//   tabsScrollContent: {
//     paddingHorizontal: 4,
//   },
//   tab: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     marginRight: 8,
//     borderRadius: 24,
//     backgroundColor: "#f8fafc",
//     borderWidth: 2,
//     borderColor: "#e2e8f0",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   activeTab: {
//     backgroundColor: AppColors.primary,
//     borderColor: AppColors.primary,
//     shadowColor: AppColors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   tabContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   tabText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#6b7280",
//   },
//   activeTabText: {
//     color: "#ffffff",
//     fontWeight: "700",
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     backgroundColor: AppColors.background,
//   },
//   emptyState: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 80,
//     paddingHorizontal: 32,
//   },
//   emptyIconContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#f0f4ff",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 20,
//     shadowColor: AppColors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1e293b",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: "#6b7280",
//     textAlign: "center",
//     lineHeight: 20,
//   },
//   notificationCard: {
//     borderRadius: 20,
//     marginTop: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.15,
//     shadowRadius: 16,
//     elevation: 8,
//     overflow: "hidden",
//   },
//   cardGradient: {
//     padding: 20,
//   },
//   notificationHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },
//   iconInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   iconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: `${AppColors.primary}15`,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//     borderWidth: 2,
//     borderColor: `${AppColors.primary}30`,
//   },
//   iconContainerUnread: {
//     backgroundColor: `${AppColors.primary}25`,
//     borderColor: AppColors.primary,
//   },
//   textContainer: {
//     flex: 1,
//   },
//   notificationTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#6b7280",
//     marginBottom: 4,
//   },
//   unreadTitle: {
//     color: "#1e293b",
//     fontWeight: "800",
//   },
//   unreadBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     marginTop: 4,
//   },
//   unreadDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: AppColors.primary,
//   },
//   unreadText: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: AppColors.primary,
//   },
//   notificationDetails: {
//     gap: 8,
//   },
//   notificationMessage: {
//     fontSize: 14,
//     color: "#6b7280",
//     lineHeight: 20,
//   },
//   timeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginTop: 4,
//   },
//   notificationTime: {
//     fontSize: 12,
//     color: "#9ca3af",
//     fontWeight: "500",
//   },
// });
