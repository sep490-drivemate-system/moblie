import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { MapPressEvent, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { AppColors } from "@/constants/Colors";

type SearchResult = {
    id: string;
    description: string;
    latitude: number;
    longitude: number;
};

type MapPickerModalProps = {
    visible: boolean;
    selectionType: "pickup" | "dropoff";
    initialCoordinate?: { latitude: number; longitude: number };
    onClose: () => void;
    onConfirm: (location: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
};

const DEFAULT_COORDINATE = { latitude: 10.776889, longitude: 106.700806 };
const DEFAULT_REGION = {
    latitude: DEFAULT_COORDINATE.latitude,
    longitude: DEFAULT_COORDINATE.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};

const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY;

const MapPickerModal: React.FC<MapPickerModalProps> = ({
    visible,
    selectionType,
    initialCoordinate,
    onClose,
    onConfirm,
}) => {
    const [region, setRegion] = useState<Region>(DEFAULT_REGION);
    const [selectedCoordinate, setSelectedCoordinate] = useState<{
        latitude: number;
        longitude: number;
    } | null>(DEFAULT_COORDINATE);
    const [selectedAddress, setSelectedAddress] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const canUseGoong = useMemo(() => {
        if (!GOONG_API_KEY) {
            console.warn(
                "[MapPickerModal] Missing EXPO_PUBLIC_GOONG_API_KEY. Goong search will be disabled."
            );
            return false;
        }
        return true;
    }, []);

    const reverseGeocode = useCallback(
        async (lat: number, lng: number) => {
            if (!canUseGoong) {
                setSelectedAddress("Không có khóa Goong API");
                return;
            }

            setIsFetchingAddress(true);
            try {
                const response = await fetch(
                    `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`
                );
                const data = await response.json();
                if (data.status === "OK" && data.results?.length) {
                    setSelectedAddress(data.results[0].formatted_address);
                } else {
                    setSelectedAddress("Không xác định");
                }
            } catch (error) {
                console.error("reverseGeocode error", error);
                setSelectedAddress("Không xác định");
            } finally {
                setIsFetchingAddress(false);
            }
        },
        [canUseGoong]
    );

    const resetState = useCallback(
        (coord?: { latitude: number; longitude: number }) => {
            const coordinate = coord ?? initialCoordinate ?? DEFAULT_COORDINATE;
            setRegion({
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                latitudeDelta: DEFAULT_REGION.latitudeDelta,
                longitudeDelta: DEFAULT_REGION.longitudeDelta,
            });
            setSelectedCoordinate(coordinate);
            setSearchQuery("");
            setSearchResults([]);
            setErrorMessage(null);
            setLocationError(null);
            if (canUseGoong) {
                reverseGeocode(coordinate.latitude, coordinate.longitude);
            } else {
                setSelectedAddress("Không có khóa Goong API");
            }
        },
        [initialCoordinate, canUseGoong, reverseGeocode]
    );

    const fetchCurrentLocation = useCallback(async () => {
        if (!visible) return;

        setIsFetchingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setLocationError("Không được quyền truy cập vị trí. Đang dùng vị trí mặc định.");
                resetState();
                return;
            }

            const servicesEnabled = await Location.hasServicesEnabledAsync();
            if (!servicesEnabled) {
                setLocationError("Vui lòng bật dịch vụ vị trí để lấy vị trí hiện tại.");
                resetState();
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const coordinate = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            resetState(coordinate);
        } catch (error) {
            console.error("MapPickerModal - fetchCurrentLocation error", error);
            setLocationError("Không thể lấy vị trí hiện tại. Đang dùng vị trí mặc định.");
            resetState();
        } finally {
            setIsFetchingLocation(false);
        }
    }, [resetState, visible]);

    useEffect(() => {
        if (!visible) return;
        fetchCurrentLocation();
    }, [visible, fetchCurrentLocation]);

    const handleMapPress = useCallback(
        (event: MapPressEvent) => {
            const { latitude, longitude } = event.nativeEvent.coordinate;
            setSelectedCoordinate({ latitude, longitude });
            setRegion((prev) => ({
                ...prev,
                latitude,
                longitude,
            }));
            reverseGeocode(latitude, longitude);
        },
        [reverseGeocode]
    );

    const performSearch = useCallback(
        async (query: string) => {
            if (!canUseGoong) {
                return;
            }
            if (query.trim().length < 3) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(
                    `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(
                        query
                    )}&api_key=${GOONG_API_KEY}`
                );
                const data = await response.json();
                if (data.results && Array.isArray(data.results)) {
                    const formatted: SearchResult[] = data.results.map(
                        (item: any, index: number) => ({
                            id: item.place_id || `${item.geometry?.location?.lat}-${item.geometry?.location?.lng}-${index}`,
                            description: item.formatted_address,
                            latitude: item.geometry?.location?.lat ?? DEFAULT_COORDINATE.latitude,
                            longitude: item.geometry?.location?.lng ?? DEFAULT_COORDINATE.longitude,
                        })
                    );
                    setSearchResults(formatted);
                } else {
                    setSearchResults([]);
                }
                setErrorMessage(null);
            } catch (error) {
                console.error("Goong search error", error);
                setErrorMessage("Không thể tìm kiếm địa điểm. Vui lòng thử lại.");
            } finally {
                setIsSearching(false);
            }
        },
        [canUseGoong]
    );

    useEffect(() => {
        if (!visible) return;
        if (!canUseGoong) return;

        if (searchQuery.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            performSearch(searchQuery);
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchQuery, visible, performSearch, canUseGoong]);

    const handleSelectResult = (result: SearchResult) => {
        setSelectedCoordinate({
            latitude: result.latitude,
            longitude: result.longitude,
        });
        setRegion((prev) => ({
            ...prev,
            latitude: result.latitude,
            longitude: result.longitude,
        }));
        setSelectedAddress(result.description);
        setSearchResults([]);
        setSearchQuery(result.description);
    };

    const handleConfirm = () => {
        if (!selectedCoordinate) return;
        const address =
            selectedAddress && selectedAddress.length > 0
                ? selectedAddress
                : `${selectedCoordinate.latitude.toFixed(5)}, ${selectedCoordinate.longitude.toFixed(5)}`;

        onConfirm({
            latitude: selectedCoordinate.latitude,
            longitude: selectedCoordinate.longitude,
            address,
        });
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        {selectionType === "pickup" ? "Chọn điểm đón" : "Chọn điểm trả"}
                    </Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Đóng</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm địa điểm..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                        placeholderTextColor="#94a3b8"
                    />
                    {isSearching && (
                        <ActivityIndicator style={styles.searchSpinner} size="small" color={AppColors.primary} />
                    )}
                </View>

                {errorMessage && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                )}
                {locationError && (
                    <Text style={styles.errorText}>{locationError}</Text>
                )}

                {searchResults.length > 0 && (
                    <View style={styles.resultsContainer}>
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.resultItem}
                                    onPress={() => handleSelectResult(item)}
                                >
                                    <Text style={styles.resultText}>{item.description}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                <View style={styles.mapContainer}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={StyleSheet.absoluteFill}
                        region={region}
                        onRegionChangeComplete={setRegion}
                        onPress={handleMapPress}
                    >
                        {selectedCoordinate && (
                            <Marker coordinate={selectedCoordinate} />
                        )}
                    </MapView>
                    {isFetchingLocation && (
                        <View style={styles.mapOverlay}>
                            <ActivityIndicator size="large" color={AppColors.primary} />
                            <Text style={styles.mapOverlayText}>Đang lấy vị trí hiện tại...</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressLabel}>Địa chỉ được chọn</Text>
                        <View style={styles.addressRow}>
                            {isFetchingAddress && (
                                <ActivityIndicator size="small" color={AppColors.primary} />
                            )}
                            <Text style={styles.addressText} numberOfLines={2}>
                                {selectedAddress || "Chạm vào bản đồ để chọn địa điểm"}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            !selectedCoordinate && styles.confirmButtonDisabled,
                        ]}
                        onPress={handleConfirm}
                        disabled={!selectedCoordinate}
                    >
                        <Text style={styles.confirmButtonText}>Xác nhận vị trí</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default MapPickerModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e2e8f0",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    closeButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "#f1f5f9",
        borderRadius: 8,
    },
    closeButtonText: {
        fontSize: 14,
        color: "#475569",
        fontWeight: "600",
    },
    searchWrapper: {
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
    },
    searchInput: {
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#0f172a",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    searchSpinner: {
        position: "absolute",
        right: 30,
        top: 14,
    },
    errorText: {
        marginHorizontal: 20,
        color: "#dc2626",
        fontSize: 13,
        marginBottom: 4,
    },
    resultsContainer: {
        maxHeight: 200,
        marginHorizontal: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 12,
    },
    resultItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#f1f5f9",
    },
    resultText: {
        fontSize: 14,
        color: "#0f172a",
    },
    mapContainer: {
        flex: 1,
        marginHorizontal: 0,
        borderRadius: 0,
        overflow: "hidden",
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.85)",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    mapOverlayText: {
        fontSize: 14,
        color: "#475569",
        fontWeight: "600",
    },
    footer: {
        padding: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#e2e8f0",
        backgroundColor: "#fff",
    },
    addressContainer: {
        marginBottom: 16,
    },
    addressLabel: {
        fontSize: 13,
        color: "#475569",
        fontWeight: "600",
        marginBottom: 6,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    addressText: {
        flex: 1,
        fontSize: 15,
        color: "#0f172a",
        fontWeight: "600",
    },
    confirmButton: {
        backgroundColor: AppColors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});


