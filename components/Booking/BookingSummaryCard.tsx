import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import {
    ChevronDown,
    ChevronUp,
    Users,
    Package,
    Clock,
    Car,
    Calendar,
    MapPin,
} from "lucide-react-native";

type BookingSummaryCardProps = {
    isExpanded: boolean;
    onToggle: () => void;
    instructorName?: string;
    packageName?: string;
    packageDuration?: number | string | null;
    vehicleName?: string | null;
    selectedDate?: string | null;
    selectedStartTime?: string;
    selectedEndTime?: string;
    selectedDuration?: number;
    pickupLocation?: string;
    dropoffLocation?: string;
    isSameDropoff?: boolean;
};

const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
    isExpanded,
    onToggle,
    instructorName,
    packageName,
    packageDuration,
    vehicleName,
    selectedDate,
    selectedStartTime,
    selectedEndTime,
    selectedDuration = 0,
    pickupLocation,
    dropoffLocation,
    isSameDropoff = true,
}) => {
    const hasTimeRange =
        !!selectedStartTime && !!selectedEndTime && selectedDuration > 0;

    const formattedDate = selectedDate
        ? new Date(selectedDate).toLocaleDateString("vi-VN")
        : "";

    return (
        <View style={styles.card}>
            <TouchableOpacity style={styles.header} onPress={onToggle} activeOpacity={0.7}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Thông tin đặt lịch</Text>
                </View>
                {isExpanded ? (
                    <ChevronUp size={20} color="#4338ca" />
                ) : (
                    <ChevronDown size={20} color="#4338ca" />
                )}
            </TouchableOpacity>

            {isExpanded ? (
                <ScrollView
                    style={styles.expandedContent}
                    showsVerticalScrollIndicator
                    nestedScrollEnabled
                >
                    <View style={styles.group}>
                        {instructorName ? (
                            <InfoRow
                                icon={<Users size={16} color="#667eea" />}
                                label="Người hướng dẫn"
                                value={instructorName}
                            />
                        ) : null}

                        {packageName ? (
                            <InfoRow
                                icon={<Package size={16} color="#667eea" />}
                                label="Gói thuê"
                                value={packageName}
                            />
                        ) : null}

                        {packageDuration ? (
                            <InfoRow
                                icon={<Clock size={16} color="#667eea" />}
                                label="Thời lượng"
                                value={`${packageDuration} giờ`}
                            />
                        ) : null}

                        {vehicleName ? (
                            <InfoRow
                                icon={<Car size={16} color="#667eea" />}
                                label="Xe"
                                value={vehicleName}
                            />
                        ) : null}
                    </View>

                    <View style={styles.group}>
                        {formattedDate ? (
                            <InfoRow
                                icon={<Calendar size={16} color="#667eea" />}
                                label="Ngày"
                                value={formattedDate}
                            />
                        ) : null}

                        {hasTimeRange ? (
                            <InfoRow
                                icon={<Clock size={16} color="#667eea" />}
                                label="Thời gian"
                                value={`${selectedStartTime} - ${selectedEndTime} (${selectedDuration}h)`}
                            />
                        ) : null}

                        {pickupLocation ? (
                            <InfoRow
                                icon={<MapPin size={16} color="#667eea" />}
                                label="Điểm đón (chọn từ bản đồ)"
                                value={pickupLocation}
                                valueNumberOfLines={2}
                            />
                        ) : null}
                        {pickupLocation && (
                            <InfoRow
                                icon={<MapPin size={16} color="#f97316" />}
                                label="Điểm thả (chọn từ bản đồ)"
                                value={isSameDropoff ? "Giống điểm đón" : (dropoffLocation || "Chưa chọn")}
                                valueNumberOfLines={isSameDropoff ? 1 : 2}
                            />
                        )}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.collapsedContent}>
                    {instructorName ? (
                        <CollapsedRow label="Người hướng dẫn:" value={instructorName} />
                    ) : null}
                    {packageName ? (
                        <CollapsedRow label="Gói thuê:" value={packageName} />
                    ) : null}
                    {formattedDate ? (
                        <CollapsedRow label="Ngày:" value={formattedDate} />
                    ) : null}
                </View>
            )}
        </View>
    );
};

type InfoRowProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueNumberOfLines?: number;
};

const InfoRow: React.FC<InfoRowProps> = ({
    icon,
    label,
    value,
    valueNumberOfLines = 1,
}) => (
    <View style={styles.row}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.infoContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} numberOfLines={valueNumberOfLines}>
                {value}
            </Text>
        </View>
    </View>
);

type CollapsedRowProps = {
    label: string;
    value: string;
};

const CollapsedRow: React.FC<CollapsedRowProps> = ({ label, value }) => (
    <View style={styles.collapsedRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1}>
            {value}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        marginTop: -10,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: "#e0e7ff",
        zIndex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#4338ca",
    },
    expandedContent: {
        maxHeight: 200,
    },
    collapsedContent: {
        gap: 8,
    },
    group: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#f0f9ff",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 2,
    },
    infoContainer: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "500",
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        color: "#1e293b",
        fontWeight: "600",
        lineHeight: 20,
    },
    collapsedRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
});

export default BookingSummaryCard;


