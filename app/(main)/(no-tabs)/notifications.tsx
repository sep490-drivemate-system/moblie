import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { UserRole } from "@/models/enum/UserRole.enum";
import {
    MessageCircle,
    Bell,
    Clock,
    Computer,
    CheckCheck,
} from "lucide-react-native";
import { NotificationHubViewModel } from "@/viewmodels/notification/NotificationHubViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { useSignalRContext } from "@/lib/signalr/SignalRContext";
import { INotification } from "@/models/notification/notification.type";
import { NotificationType } from "@/models/notification/notification.enum";
import { setUnreadCount } from "@/features/notification/notificationSlice";
import HeaderList from "@/components/Commons/HeaderList";
import { ROUTES } from "@/constants/routes";

type NotificationCategory = "all" | "system" | "customer" | "instructor";

export default function NotificationsScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const role = useAppSelector((s) => s.auth.user?.role ?? null);
    const [notificationState, notificationHubViewModel] = useViewModel(
        NotificationHubViewModel,
        (state) => state.notification
    );
    const { notificationHub } = useSignalRContext();
    const [activeFilter, setActiveFilter] = useState<NotificationCategory>("all");
    const [refreshing, setRefreshing] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        notificationHubViewModel.setSignalRConnection(notificationHub);
    }, [notificationHub, notificationHubViewModel]);

    useEffect(() => {
        loadNotifications();
        notificationHubViewModel.getUnreadNotificationCount();
    }, [notificationHubViewModel.isConnected]);

    useEffect(() => {
        if (!notificationHub?.isConnected) return;

        const handleUnreadCountUpdated = (count: number) => {
            dispatch(setUnreadCount(count));
        };

        notificationHub.on("UnreadCountUpdated", handleUnreadCountUpdated);

        return () => {
            notificationHub.off("UnreadCountUpdated", handleUnreadCountUpdated);
        };
    }, [notificationHub, dispatch]);

    const loadNotifications = useCallback(async () => {
        if (!notificationHubViewModel.isConnected) {
            return;
        }

        try {
            await notificationHubViewModel.getUserNotifications(pageNumber, 50);
        } catch (error) {
            console.error("Error loading notifications:", error);
        }
    }, [notificationHubViewModel, pageNumber]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        setPageNumber(1);
        try {
            await loadNotifications();
            await notificationHubViewModel.getUnreadNotificationCount();
        } catch (error) {
            console.error("Error refreshing notifications:", error);
        } finally {
            setRefreshing(false);
        }
    }, [loadNotifications, notificationHubViewModel]);

    const handleMarkAsRead = useCallback(
        async (notificationId: string) => {
            try {
                await notificationHubViewModel.markAsRead(notificationId);
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        },
        [notificationHubViewModel]
    );


    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.System:
                return Bell;
            case NotificationType.NoviceDriver:
                return role === UserRole.Instructor ? MessageCircle : Bell;
            case NotificationType.Instructor:
                return role === UserRole.NoviceDriver ? MessageCircle : Bell;
            default:
                return Bell;
        }
    };

    const getNotificationCategory = (notification: INotification): NotificationCategory => {
        switch (notification.type) {
            case NotificationType.System:
                return "system";
            case NotificationType.NoviceDriver:
                return role === UserRole.Instructor ? "customer" : "system";
            case NotificationType.Instructor:
                return role === UserRole.NoviceDriver ? "instructor" : "system";
            default:
                return "system";
        }
    };

    const stats = useMemo(() => {
        const notifications = notificationState.notifications || [];
        const total = notifications.length;
        const system = notifications.filter((n) => getNotificationCategory(n) === "system").length;
        const customer = notifications.filter(
            (n) => getNotificationCategory(n) === "customer" || getNotificationCategory(n) === "instructor"
        ).length;
        return { total, system, customer };
    }, [notificationState.notifications, role]);

    const filteredNotifications = useMemo(() => {
        const notifications = notificationState.notifications || [];
        if (activeFilter === "all") {
            return notifications;
        }
        if (activeFilter === "system") {
            return notifications.filter((n) => getNotificationCategory(n) === "system");
        }
        if (activeFilter === "customer" || activeFilter === "instructor") {
            return notifications.filter(
                (n) => getNotificationCategory(n) === "customer" || getNotificationCategory(n) === "instructor"
            );
        }
        return notifications;
    }, [notificationState.notifications, activeFilter, role]);

    const getFilterLabel = () => {
        if (role === UserRole.Instructor) {
            return "Khách hàng";
        }
        if (role === UserRole.NoviceDriver) {
            return "Người hướng dẫn";
        }
        return "Khách hàng";
    };

    const handleNotificationPress = useCallback(
        async (notification: INotification) => {
            if (!notification.isRead) {
                await handleMarkAsRead(notification.id);
            }
            if (notification.actionUrl) {
                router.push(notification.actionUrl as any);
            }
        },
        [handleMarkAsRead, router]
    );

    return (
        <View style={styles.container}>
            <HeaderList actionReturnScreen={ROUTES.BACK} title="Thông báo" />
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

            {notificationState.isLoading && notificationState.notifications.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={AppColors.primary} />
                    <Text style={styles.loadingText}>Đang tải thông báo...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={AppColors.primary}
                        />
                    }
                >
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
                                                            !notification.isRead && styles.iconContainerUnread,
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
                                                                !notification.isRead && styles.unreadTitle,
                                                            ]}
                                                            numberOfLines={1}
                                                        >
                                                            {notification.title}
                                                        </Text>
                                                        {!notification.isRead && (
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
                                                    {notification.content}
                                                </Text>
                                                <View style={styles.timeRow}>
                                                    <Clock size={14} color="#6b7280" strokeWidth={2} />
                                                    <Text style={styles.notificationTime}>
                                                        {notificationHubViewModel.formatTime(notification.createdAt || "")}
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
            )}
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
    headerActions: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: AppColors.white,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    markAllButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        alignSelf: "flex-end",
    },
    markAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: AppColors.primary,
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 80,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "500",
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
