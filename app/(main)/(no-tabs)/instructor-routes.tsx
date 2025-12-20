import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Navigation, Flag, Save, Info } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import MapView, { Marker, Polyline, LatLng, MapPressEvent, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import HeaderList from "@/components/Commons/HeaderList";
import { ROUTES } from "@/constants/routes";

type LocationInfo = {
    latitude: number;
    longitude: number;
    address: string;
} | null;

const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY;
const GOONG_DIRECTION_API = "https://rsapi.goong.io/Direction";
const GOONG_GEOCODE_API = "https://rsapi.goong.io/Geocode";

type StepInfo = {
    instruction: string;
    distanceText: string;
    durationText: string;
};

const decodePolyline = (encoded: string): LatLng[] => {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates: LatLng[] = [];

    while (index < encoded.length) {
        let result = 0;
        let shift = 0;
        let b;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += deltaLat;

        result = 0;
        shift = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += deltaLng;

        coordinates.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5,
        });
    }

    return coordinates;
};


export default function InstructorRoutesScreen() {
    const router = useRouter();
    const [selectionType, setSelectionType] = useState<"pickup" | "dropoff">("pickup");
    const [startLocation, setStartLocation] = useState<LocationInfo>(null);
    const [endLocation, setEndLocation] = useState<LocationInfo>(null);
    const [polylineCoords, setPolylineCoords] = useState<LatLng[]>([]);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [routeModalVisible, setRouteModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(true);
    const [steps, setSteps] = useState<StepInfo[]>([]);
    const [routeName, setRouteName] = useState("");
    const mapRef = useRef<MapView | null>(null);
    const hasCenteredOnCurrent = useRef(false);

    const distanceKm = useMemo(() => {
        if (polylineCoords.length < 2) return 0;
        const toRad = (v: number) => (v * Math.PI) / 180;
        const [a, b] = polylineCoords;
        const R = 6371; // km
        const dLat = toRad(b.latitude - a.latitude);
        const dLon = toRad(b.longitude - a.longitude);
        const lat1 = toRad(a.latitude);
        const lat2 = toRad(b.latitude);
        const hav =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
        return Math.round(R * c * 100) / 100;
    }, [polylineCoords]);

    const estimatedMinutes = useMemo(() => {
        if (!distanceKm) return 0;
        const avgSpeed = 40; // km/h giả định
        return Math.round((distanceKm / avgSpeed) * 60);
    }, [distanceKm]);

    const routeNameSuggestions = useMemo(() => {
        if (!startLocation || !endLocation) return [];
        const shortLabel = (addr: string | undefined | null) => {
            if (!addr) return "";
            const [first] = addr.split(",");
            return (first || addr).trim();
        };
        const a = shortLabel(startLocation.address);
        const b = shortLabel(endLocation.address);
        const fallbackA = startLocation.address || "Điểm đầu";
        const fallbackB = endLocation.address || "Điểm cuối";
        return [
            `${a || fallbackA} -> ${b || fallbackB}`,
            `Tuyến ${a || fallbackA} đến ${b || fallbackB}`,
            `Lộ trình ${a || fallbackA} - ${b || fallbackB}`,
        ];
    }, [startLocation, endLocation]);

    const fetchRouteFromGoong = async (from: LocationInfo, to: LocationInfo) => {
        if (!GOONG_API_KEY || !from || !to) return;
        try {
            setIsLoadingRoute(true);
            const url = `${GOONG_DIRECTION_API}?origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&vehicle=car&api_key=${GOONG_API_KEY}`;
            const res = await fetch(url);
            const json = await res.json();
            const encoded = json?.routes?.[0]?.overview_polyline?.points;
            const rawSteps = json?.routes?.[0]?.legs?.[0]?.steps || [];
            if (encoded) {
                const decoded = decodePolyline(encoded);
                setPolylineCoords(decoded);
                const parsedSteps: StepInfo[] = rawSteps.map((s: any) => ({
                    instruction: (s?.html_instructions || "").replace(/<[^>]+>/g, ""),
                    distanceText: s?.distance?.text || "",
                    durationText: s?.duration?.text || "",
                }));
                setSteps(parsedSteps);

                if (mapRef.current && decoded.length > 0) {
                    mapRef.current.fitToCoordinates(decoded, {
                        edgePadding: { top: 80, bottom: 80, left: 60, right: 60 },
                        animated: true,
                    });
                }
            } else {
                Alert.alert("Không lấy được tuyến đường", "Vui lòng thử lại sau.");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể lấy tuyến đường từ Goong.");
        } finally {
            setIsLoadingRoute(false);
        }
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        if (!GOONG_API_KEY) return null;
        try {
            const url = `${GOONG_GEOCODE_API}?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`;
            const res = await fetch(url);
            const json = await res.json();
            const addr = json?.results?.[0]?.formatted_address;
            return addr || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        } catch {
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    };

    useEffect(() => {
        const initCurrentLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Thiếu quyền vị trí", "Vui lòng cấp quyền để hiển thị vị trí hiện tại.");
                    return;
                }
                const current = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = current.coords;
                const address = (await reverseGeocode(latitude, longitude)) ?? "Vị trí hiện tại";
                const loc = { latitude, longitude, address };
                setStartLocation(loc);

                if (mapRef.current && !hasCenteredOnCurrent.current) {
                    mapRef.current.animateToRegion(
                        {
                            latitude,
                            longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        },
                        500
                    );
                    hasCenteredOnCurrent.current = true;
                }
            } catch (error) {
                Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
            }
        };

        initCurrentLocation();
    }, []);

    const handleMapPress = (e: MapPressEvent) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        reverseGeocode(latitude, longitude).then((addr) => {
            const address = addr || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            if (selectionType === "pickup") {
                const loc = { latitude, longitude, address };
                setStartLocation(loc);
                if (endLocation) {
                    fetchRouteFromGoong(loc, endLocation);
                }
            } else {
                const loc = { latitude, longitude, address };
                setEndLocation(loc);
                if (startLocation) {
                    fetchRouteFromGoong(startLocation, loc);
                }
            }
        });
    };

    const handleSaveRoute = () => {
        if (!startLocation || !endLocation) {
            Alert.alert("Thiếu thông tin", "Vui lòng chọn điểm đầu và điểm cuối.");
            return;
        }
        if (polylineCoords.length < 2) {
            Alert.alert("Chưa có tuyến", "Vui lòng chạm map để lấy tuyến đường.");
            return;
        }
        if (!routeName.trim()) {
            Alert.alert("Thiếu tên", "Vui lòng nhập hoặc chọn tên cho tuyến đường.");
            return;
        }
        // TODO: integrate API save route
        Alert.alert(
            "Đã lưu",
            `Tên: ${routeName}\nĐiểm đầu: ${startLocation.address}\nĐiểm cuối: ${endLocation.address}`
        );
    };

    return (
        <View style={styles.container}>

            <HeaderList title="Lộ trình của bạn" actionReturnScreen={ROUTES.BACK as any} />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                        setIsEditing(true);
                        setRouteModalVisible(true);
                    }}
                    activeOpacity={0.85}
                >
                    <Navigation size={18} color="#fff" />
                    <Text style={styles.primaryButtonText}>Thiết lập tuyến đường</Text>
                </TouchableOpacity>

                {(startLocation || endLocation) && (
                    <TouchableOpacity
                        style={styles.summaryCard}
                        activeOpacity={0.85}
                        onPress={() => {
                            setIsEditing(false);
                            setRouteModalVisible(true);
                        }}
                    >
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Điểm đầu:</Text>
                            <Text style={styles.summaryValue}>
                                {startLocation ? startLocation.address : "Chưa chọn"}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Điểm cuối:</Text>
                            <Text style={styles.summaryValue}>
                                {endLocation ? endLocation.address : "Chưa chọn"}
                            </Text>
                        </View>
                        {polylineCoords.length >= 2 && (
                            <Text style={styles.summaryHint}>Nhấn để xem lộ trình trên bản đồ</Text>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>

            <Modal
                visible={routeModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRouteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.setupModal}>
                        <Text style={styles.modalTitle}>
                            {isEditing ? "Thiết lập tuyến đường" : "Xem lộ trình"}
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            Chạm map để chọn {selectionType === "pickup" ? "điểm đầu" : "điểm cuối"}
                        </Text>

                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Chế độ chọn:</Text>
                            <View style={styles.toggleButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.toggleBtn,
                                        selectionType === "pickup" && styles.toggleBtnActive,
                                        !isEditing && styles.toggleBtnDisabled,
                                    ]}
                                    onPress={() => isEditing && setSelectionType("pickup")}
                                    activeOpacity={isEditing ? 0.85 : 1}
                                >
                                    <Text
                                        style={[
                                            styles.toggleBtnText,
                                            selectionType === "pickup" && styles.toggleBtnTextActive,
                                        ]}
                                    >
                                        Điểm đầu
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.toggleBtn,
                                        selectionType === "dropoff" && styles.toggleBtnActive,
                                        !isEditing && styles.toggleBtnDisabled,
                                    ]}
                                    onPress={() => isEditing && setSelectionType("dropoff")}
                                    activeOpacity={isEditing ? 0.85 : 1}
                                >
                                    <Text
                                        style={[
                                            styles.toggleBtnText,
                                            selectionType === "dropoff" && styles.toggleBtnTextActive,
                                        ]}
                                    >
                                        Điểm cuối
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.mapWrapper, { height: 320 }]}>
                            <MapView
                                ref={mapRef}
                                showsUserLocation={true}
                                showsTraffic={true}
                                showsCompass={true}
                                showsScale={true}
                                style={styles.map}
                                initialRegion={{
                                    latitude: startLocation?.latitude || 10.823019,
                                    longitude: startLocation?.longitude || 106.700806,
                                    latitudeDelta: 0.05,
                                    longitudeDelta: 0.05,
                                }}
                                onPress={isEditing ? handleMapPress : undefined}
                            >
                                {startLocation && (
                                    <Marker
                                        coordinate={{ latitude: startLocation.latitude, longitude: startLocation.longitude }}
                                        pinColor={AppColors.primary}
                                        title="Điểm đầu"
                                        description={startLocation.address}
                                    />
                                )}
                                {endLocation && (
                                    <Marker
                                        coordinate={{ latitude: endLocation.latitude, longitude: endLocation.longitude }}
                                        pinColor={AppColors.red}
                                        title="Điểm cuối"
                                        description={endLocation.address}
                                    />
                                )}
                                {polylineCoords.length >= 2 && (
                                    <Polyline
                                        coordinates={polylineCoords}
                                        strokeColor={AppColors.primary}
                                        strokeWidth={4}
                                    />
                                )}
                            </MapView>
                            {polylineCoords.length >= 2 && (
                                <View style={styles.routeSummary}>
                                    <Info size={16} color={AppColors.primary} />
                                    <Text style={styles.routeSummaryText}>
                                        Dài khoảng {distanceKm} km · Ước tính {estimatedMinutes} phút
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Điểm đầu:</Text>
                                <Text style={styles.summaryValue}>
                                    {startLocation ? startLocation.address : "Chưa chọn"}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Điểm cuối:</Text>
                                <Text style={styles.summaryValue}>
                                    {endLocation ? endLocation.address : "Chưa chọn"}
                                </Text>
                            </View>
                        </View>

                        {isEditing && (
                            <TouchableOpacity
                                style={[styles.saveButton, { marginTop: 10 }]}
                                onPress={() => {
                                    if (!startLocation || !endLocation) {
                                        Alert.alert("Thiếu thông tin", "Vui lòng chọn đủ điểm đầu và điểm cuối.");
                                        return;
                                    }
                                    if (polylineCoords.length < 2) {
                                        Alert.alert("Chưa có tuyến", "Vui lòng chạm map để lấy tuyến đường.");
                                        return;
                                    }
                                    setRouteModalVisible(false);
                                }}
                                activeOpacity={0.85}
                            >
                                {isLoadingRoute ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Save size={18} color="#fff" />
                                        <Text style={styles.saveButtonText}>Lưu lộ trình</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setRouteModalVisible(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalCloseText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
    content: {
        padding: 16,
        gap: 16,
    },
    mapWrapper: {
        height: 260,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#e2e8f0",
    },
    map: {
        flex: 1,
    },
    routeSummary: {
        position: "absolute",
        bottom: 12,
        left: 12,
        right: 12,
        backgroundColor: "rgba(255,255,255,0.92)",
        borderRadius: 12,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    routeSummaryText: {
        fontSize: 13,
        color: AppColors.gray700,
        fontWeight: "600",
    },
    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: AppColors.primary,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "800",
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    toggleLabel: {
        fontSize: 14,
        color: AppColors.gray700,
        fontWeight: "600",
    },
    toggleButtons: {
        flexDirection: "row",
        gap: 8,
    },
    toggleBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: AppColors.border,
        backgroundColor: "#fff",
    },
    toggleBtnActive: {
        backgroundColor: `${AppColors.primary}1A`,
        borderColor: AppColors.primary,
    },
    toggleBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: AppColors.gray700,
    },
    toggleBtnTextActive: {
        color: AppColors.primary,
    },
    stepList: {
        marginTop: 12,
        gap: 8,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: AppColors.textPrimary,
    },
    stepItem: {
        flexDirection: "row",
        gap: 8,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.border,
    },
    stepIndex: {
        fontSize: 13,
        fontWeight: "700",
        color: AppColors.gray700,
        width: 20,
    },
    stepInstruction: {
        fontSize: 14,
        fontWeight: "600",
        color: AppColors.textPrimary,
    },
    stepMeta: {
        fontSize: 12,
        color: AppColors.gray600,
        marginTop: 2,
    },
    toggleBtnDisabled: {
        opacity: 0.6,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: AppColors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: AppColors.gray600,
        lineHeight: 20,
    },
    card: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        gap: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: AppColors.textPrimary,
    },
    addressText: {
        fontSize: 14,
        color: AppColors.gray600,
    },
    selectButton: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: AppColors.primary,
        paddingVertical: 12,
        borderRadius: 12,
    },
    selectButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: AppColors.primary,
        paddingVertical: 14,
        borderRadius: 14,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "800",
    },
    summaryCard: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        gap: 10,
    },
    summaryRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: AppColors.gray700,
        width: 72,
    },
    summaryValue: {
        flex: 1,
        fontSize: 14,
        color: AppColors.gray700,
    },
    summaryHint: {
        marginTop: 8,
        fontSize: 12,
        color: AppColors.gray600,
        fontStyle: "italic",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    setupModal: {
        width: "100%",
        backgroundColor: AppColors.cardBackground,
        borderRadius: 16,
        padding: 16,
        gap: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: AppColors.textPrimary,
    },
    modalSubtitle: {
        fontSize: 13,
        color: AppColors.gray600,
        marginBottom: 4,
    },
    modalClose: {
        alignItems: "center",
        marginTop: 8,
    },
    modalCloseText: {
        color: AppColors.gray600,
        fontSize: 14,
        fontWeight: "600",
    },
});

