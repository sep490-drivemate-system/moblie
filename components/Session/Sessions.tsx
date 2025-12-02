import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { useAppDispatch } from "@/lib/redux/hooks";
import { useRouter } from "expo-router";
import {
    getAllSessions,
    getBookingSessions,
} from "@/features/booking/bookingThunk";
import { IBookingSession } from "@/models/booking/booking";
import { SessionStatus } from "@/models/session/session.enum";
import { AppColors } from "@/constants/Colors";
import {
    AlertCircle,
    Calendar,
    Car,
    ChevronRight,
    Clock,
    MapPin,
} from "lucide-react-native";
import { ROUTES } from "@/constants/routes";

export type StatusFilter =
    | "all"
    | "planning"
    | "upcoming"
    | "in_progress"
    | "completed"
    | "reschedule"
    | "cancelled";

type NormalizedSession = IBookingSession & {
    statusKey: StatusFilter;
};

const STATUS_CONFIG: Record<
    Exclude<StatusFilter, "all">,
    { label: string; color: string }
> = {
    planning: { label: "Lên lộ trình", color: AppColors.yellow },
    upcoming: { label: "Sắp diễn ra", color: AppColors.yellow },
    in_progress: { label: "Đang diễn ra", color: AppColors.primary },
    completed: { label: "Đã hoàn thành", color: "#94a3b8" },
    reschedule: { label: "Đổi lịch", color: AppColors.blue },
    cancelled: { label: "Đã hủy", color: AppColors.red },
};

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "planning", label: STATUS_CONFIG.planning.label },
    { key: "upcoming", label: STATUS_CONFIG.upcoming.label },
    { key: "in_progress", label: STATUS_CONFIG.in_progress.label },
    { key: "completed", label: STATUS_CONFIG.completed.label },
    { key: "reschedule", label: STATUS_CONFIG.reschedule.label },
    { key: "cancelled", label: STATUS_CONFIG.cancelled.label },
];

const mapStatusKey = (status?: SessionStatus | number | string): StatusFilter => {
    if (status === undefined || status === null) return "planning";
    const statusNumber =
        typeof status === "string" ? parseInt(status, 10) : Number(status);

    switch (statusNumber) {
        case SessionStatus.Planning:
            return "planning";
        case SessionStatus.Upcoming:
            return "upcoming";
        case SessionStatus.InProgress:
            return "in_progress";
        case SessionStatus.Completed:
            return "completed";
        case SessionStatus.Reschedule:
            return "reschedule";
        case SessionStatus.Cancelled:
            return "cancelled";
        default:
            return "planning";
    }
};

const getStatusIcon = (statusKey: StatusFilter) => {
    switch (statusKey) {
        case "planning":
            return <Calendar size={16} color={AppColors.yellow} strokeWidth={2} />;
        case "upcoming":
            return <Clock size={16} color={AppColors.yellow} strokeWidth={2} />;
        case "in_progress":
            return <Clock size={16} color={AppColors.primary} strokeWidth={2} />;
        case "completed":
            return <Calendar size={16} color="#94a3b8" strokeWidth={2} />;
        case "reschedule":
            return <Clock size={16} color={AppColors.blue} strokeWidth={2} />;
        case "cancelled":
            return <AlertCircle size={16} color={AppColors.red} strokeWidth={2} />;
        default:
            return null;
    }
};

export interface SessionsListProps {
    bookingId?: string;
    instructorId?: string;
    title?: string;
    initialStatus?: StatusFilter;
    enableScroll?: boolean;
    showHeader?: boolean;
    style?: StyleProp<ViewStyle>;
    emptyStateText?: string;
    onSessionPress?: (session: NormalizedSession) => void;
    detailRoute?: string;
    detailParamsMapper?: (
        session: NormalizedSession
    ) => Record<string, string | number | undefined>;
}

export default function SessionsList({
    bookingId,
    instructorId,
    title = "Danh sách buổi thuê",
    initialStatus = "all",
    enableScroll = true,
    showHeader = true,
    style,
    emptyStateText,
}: SessionsListProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [sessions, setSessions] = useState<NormalizedSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] =
        useState<StatusFilter>(initialStatus);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setSelectedStatus(initialStatus);
    }, [initialStatus]);

    const fetchSessions = useCallback(async () => {
        try {
            console.log("Fetching sessions with bookingId:", bookingId);
            setIsLoading(true);
            setErrorMessage(null);

            let result;
            if (bookingId) {
                // Fetch sessions for specific booking
                result = await dispatch(getBookingSessions({ bookingId })).unwrap();
            } else {
                // Fetch all sessions
                result = await dispatch(getAllSessions(undefined)).unwrap();
            }

            const sessionsData = (result as any)?.value ?? result ?? [];
            const normalized: NormalizedSession[] = sessionsData.map(
                (session: IBookingSession) => ({
                    ...session,
                    statusKey: mapStatusKey(session.status),
                })
            );

            setSessions(normalized);
        } catch (error: any) {
            console.error("Failed to fetch sessions:", error);
            setErrorMessage(error?.message || "Không thể tải dữ liệu phiên học");
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    }, [bookingId, dispatch]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchSessions();
        setIsRefreshing(false);
    }, [fetchSessions]);

    const statusCounts = useMemo(() => {
        const counts: Record<StatusFilter, number> = {
            all: sessions.length,
            planning: 0,
            upcoming: 0,
            in_progress: 0,
            completed: 0,
            reschedule: 0,
            cancelled: 0,
        };

        sessions.forEach((session) => {
            counts[session.statusKey] += 1;
        });

        return counts;
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        if (selectedStatus === "all") return sessions;
        return sessions.filter((session) => session.statusKey === selectedStatus);
    }, [sessions, selectedStatus]);



    const content = (
        <View style={[styles.wrapper, style]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterBar}
            >
                {STATUS_OPTIONS.map((option) => {
                    const isActive = selectedStatus === option.key;
                    const baseColor =
                        option.key === "all"
                            ? "#cbd5f5"
                            : STATUS_CONFIG[option.key as Exclude<StatusFilter, "all">]
                                ?.color ?? AppColors.primary;
                    return (
                        <TouchableOpacity activeOpacity={1}
                            key={option.key}
                            style={[
                                styles.filterChip,
                                isActive && { backgroundColor: `${baseColor}22` },
                            ]}
                            onPress={() => setSelectedStatus(option.key)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    isActive && { color: baseColor },
                                ]}
                            >
                                {option.label}
                            </Text>
                            <View
                                style={[
                                    styles.filterCount,
                                    { backgroundColor: isActive ? baseColor : "#e2e8f0" },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterCountText,
                                        isActive && { color: "#fff" },
                                    ]}
                                >
                                    {statusCounts[option.key] ?? 0}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {errorMessage && !isLoading && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    <TouchableOpacity onPress={fetchSessions}>
                        <Text style={styles.retryText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLoading && sessions.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={AppColors.primary} />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            ) : filteredSessions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>Chưa có lịch phù hợp</Text>
                    <Text style={styles.emptySubtitle}>
                        {emptyStateText ||
                            "Khi có buổi học tương ứng với trạng thái đã chọn, chúng sẽ xuất hiện tại đây."}
                    </Text>
                </View>
            ) : (
                <View style={styles.sessionsList}>
                    {filteredSessions.map((session) => {
                        const statusConfig =
                            STATUS_CONFIG[session.statusKey as Exclude<StatusFilter, "all">];
                        const statusColor = statusConfig?.color ?? AppColors.primary;

                        return (
                            <View key={session.id} style={styles.sessionCard}>
                                {/* <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            borderColor: statusColor,
                                            backgroundColor: `${statusColor}20`,
                                        },
                                    ]}
                                >
                                    {getStatusIcon(session.statusKey)}
                                    <Text
                                        style={[styles.statusText, { color: statusColor }]}
                                    >
                                        {statusConfig?.label}
                                    </Text>
                                </View> */}

                                <View style={styles.sessionRow}>
                                    <Calendar size={18} color="#64748b" strokeWidth={2} />
                                    <Text style={styles.sessionText}>
                                        {new Date(session.date).toLocaleDateString("vi-VN")}
                                    </Text>
                                </View>

                                <View style={styles.sessionRow}>
                                    <Clock size={18} color="#64748b" strokeWidth={2} />
                                    <Text style={styles.sessionText}>
                                        {session.startTime} - {session.endTime} ({session.duration}
                                        h)
                                    </Text>
                                </View>

                                {session.displayStartLocationName && (
                                    <View style={styles.locationRow}>
                                        <MapPin size={18} color="#22c55e" strokeWidth={2} />
                                        <View style={styles.locationInfo}>
                                            <Text style={styles.locationLabel}>Điểm đón</Text>
                                            <Text style={styles.locationValue}>
                                                {session.displayStartLocationName}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {session.displayEndLocationName && (
                                    <View style={styles.locationRow}>
                                        <MapPin size={18} color="#f97316" strokeWidth={2} />
                                        <View style={styles.locationInfo}>
                                            <Text style={styles.locationLabel}>Điểm trả</Text>
                                            <Text style={styles.locationValue}>
                                                {session.displayEndLocationName}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {session.vehicleName && (
                                    <View style={styles.sessionRow}>
                                        <Car size={18} color="#64748b" strokeWidth={2} />
                                        <Text style={styles.sessionText}>{session.vehicleName}</Text>
                                    </View>
                                )}


                                <View style={styles.sessionFooter}>
                                    <TouchableOpacity
                                        onPress={() => router.push({
                                            pathname: ROUTES.DRIVING_SESSION_DETAIL,
                                            params: { sessionId: session.id, instructorId: instructorId },
                                        })}
                                        style={styles.viewDetailButton}
                                    >
                                        <Text style={styles.viewDetailText}>Chi tiết</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>)}
        </View>
    );

    if (enableScroll) {
        return (
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[AppColors.primary]}
                        tintColor={AppColors.primary}
                    />
                }
            >
                {content}
            </ScrollView>
        );
    }

    return <View style={[styles.container, styles.embeddedContainer]}>{content}</View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    embeddedContainer: {
        marginBottom: 16,
    },
    wrapper: {
        backgroundColor: AppColors.white,
        borderRadius: 16,
        padding: 16,
        gap: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1e293b",
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#94a3b8",
        marginTop: 4,
    },
    filterBar: {
        flexGrow: 0,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: AppColors.white,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        marginRight: 8,
        gap: 8,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#475569",
    },
    filterCount: {
        minWidth: 22,
        height: 22,
        paddingHorizontal: 6,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
    },
    filterCountText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#475569",
    },
    errorBox: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#fee2e2",
    },
    errorText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#b91c1c",
    },
    retryText: {
        marginTop: 4,
        fontSize: 13,
        fontWeight: "700",
        color: AppColors.primary,
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#475569",
    },
    emptyState: {
        paddingVertical: 32,
        alignItems: "center",
        gap: 8,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        lineHeight: 20,
    },
    sessionsList: {
        gap: 12,
    },
    sessionCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        alignSelf: "flex-start",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },
    sessionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    locationInfo: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#94a3b8",
        marginBottom: 2,
    },
    locationValue: {
        fontSize: 14,
        color: "#1e293b",
    },
    sessionText: {
        fontSize: 14,
        color: "#475569",
        flex: 1,
    },
    sessionFooter: {
        marginTop: 12,
        alignItems: "stretch",
    },
    viewDetailButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: AppColors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 6,
    },
    viewDetailText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#ffffff",
    },
});
