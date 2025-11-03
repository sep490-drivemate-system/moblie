import { AppColors } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Settings, Car } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

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

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function BookingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView | null>(null);

  // Parse the booking data from params
  const booking: BookingItem = JSON.parse(params.booking as string);

  // Mock location data (you'll replace this with real coordinates from your booking)
  const pickupLocation = {
    latitude: 10.8491,
    longitude: 106.7714,
    title: "Gym house",
  };

  const dropoffLocation = {
    latitude: 10.7717,
    longitude: 106.7041,
    title: "Museum",
  };

  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(false);
  const [startButtonBg, setStartButtonBg] = useState<string>(
    AppColors.brandBlue
  );
  const [startButtonText, setStartButtonText] = useState<string>("Bắt đầu đón");
  const [buttonState, setButtonState] = useState<"start" | "waiting" | "arrived" | "ready" | "inSession">("start");
  const [routePoints, setRoutePoints] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [routeAddresses, setRouteAddresses] = useState<string[]>([]);

  const generateRandomDistinctPoints = (
    center: { latitude: number; longitude: number },
    count: number,
    radiusDeg = 0.01,
    minSeparation = 0.002
  ) => {
    let points: Array<{ latitude: number; longitude: number }> = [];
    // let attempts = 0;
    // while (points.length < count && attempts < 200) {
    //   const p = getRandomPointNear(center, radiusDeg);
    //   const tooClose = points.some((q) => distanceApprox(p, q) < minSeparation) || distanceApprox(p, center) < minSeparation;
    //   if (!tooClose) points.push(p);
    //   attempts++;
    // }
    const coordinates = [
      { latitude: 10.8686, longitude: 106.6422 }, // Quận 12
      { latitude: 10.838, longitude: 106.6653 }, // Gò Vấp
      { latitude: 10.804, longitude: 106.7078 }, // Bình Thạnh
      { latitude: 10.787, longitude: 106.749 }, // Quận 2
    ];
    points = [...coordinates];
    return points;
  };

  const handleStartPickup = () => {
    if (isStartButtonDisabled) return;
    if (buttonState === "start") {
      // Lần nhấn 1: disable 2s, rồi thành "Đón thành công"
      setIsStartButtonDisabled(true);
      setStartButtonBg(AppColors.gray300);
      setStartButtonText("Đang đón...");
      setButtonState("waiting");

      setTimeout(() => {
        setIsStartButtonDisabled(false);
        setStartButtonBg(AppColors.brandBlue);
        setStartButtonText("Đón thành công");
        setButtonState("arrived");
      }, 2000);
      return;
    }

    if (buttonState === "arrived") {
      // Lần nhấn 2: tạo routePoints, fit map, đổi nút sang "Bắt đầu buổi hướng dẫn"
      const randoms = generateRandomDistinctPoints(pickupLocation, 4);
      const newPoints = [pickupLocation, ...randoms, pickupLocation];
      setRoutePoints(newPoints);

      setTimeout(() => {
        mapRef.current?.fitToCoordinates(newPoints, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
      }, 300);

      setStartButtonText("Bắt đầu buổi hướng dẫn");
      setButtonState("ready");
      return;
    }

    if (buttonState === "ready") {
      // Lần nhấn 3: vào trạng thái buổi hướng dẫn đang diễn ra
      setButtonState("inSession");
      return;
    }
  };

  // Auto-fit khi routePoints thay đổi
  useEffect(() => {
    if (routePoints.length > 1) {
      mapRef.current?.fitToCoordinates(routePoints, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });
    }
  }, [routePoints]);

  // Lấy địa chỉ (reverse geocoding) cho mỗi điểm khi routePoints đổi
  useEffect(() => {
    const fetchAddresses = async () => {
      if (routePoints.length === 0) {
        setRouteAddresses([]);
        return;
      }
      try {
        const results = await Promise.all(
          routePoints.map(async (p) => {
            try {
              const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${p.latitude},${p.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
              const res = await fetch(url);
              const json = await res.json();
              if (json.status === "OK" && json.results?.length > 0) {
                return json.results[0].formatted_address as string;
              }
            } catch (e) {}
            return `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`;
          })
        );
        setRouteAddresses(results);
      } catch (e) {
        setRouteAddresses(
          routePoints.map(
            (p) => `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`
          )
        );
      }
    };
    fetchAddresses();
  }, [routePoints]);

  const removePointAt = (index: number) => {
    setRoutePoints((prev) => prev.filter((_, i) => i !== index));
  };

  const movePoint = (from: number, to: number) => {
    setRoutePoints((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Settings size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: pickupLocation.latitude,
              longitude: pickupLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {routePoints.length > 0 ? (
              routePoints.map((point, index) => (
                <Marker
                  key={`route-point-${index}`}
                  coordinate={point}
                  title={`Điểm ${index + 1}${
                    index === 0 || index === routePoints.length - 1
                      ? " (bắt đầu/kết thúc)"
                      : ""
                  }`}
                  pinColor={
                    index === 0 || index === routePoints.length - 1
                      ? "#10b981"
                      : "#ef4444"
                  }
                />
              ))
            ) : (
              <>
                {/* Pickup marker */}
                <Marker
                  coordinate={pickupLocation}
                  title={pickupLocation.title}
                  pinColor="#10b981"
                />
              </>
            )}

            {routePoints.length > 1 && (
              <>
                {routePoints.map((point, index) => {
                  if (index === routePoints.length - 1) return null;
                  const nextPoint = routePoints[index + 1];
                  return (
                    <Polyline
                      key={`segment-${index}`}
                      coordinates={[point, nextPoint]}
                      strokeColor={AppColors.brandBlue}
                      strokeWidth={4}
                    />
                  );
                })}
              </>
            )}
          </MapView>
        </View>

        {/* Booking Info / Route List Section */}
        <View style={styles.infoContainer}>
          {/* Date and Time */}
          <View style={styles.dateTimeRow}>
            <Text style={styles.dateText}>{formatDate(booking.date)}</Text>
            <Text style={styles.timeText}>{booking.time}</Text>
          </View>

          {buttonState === "inSession" ? (
            <View style={[styles.section, styles.sessionContainer]}>
              <View style={styles.sessionIconWrapper}>
                <Car color={AppColors.brandBlue} size={56} />
              </View>
              <Text style={styles.sessionText}>Hoàn tất buổi hướng dẫn</Text>
            </View>
          ) : routePoints.length > 1 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lộ trình theo thứ tự điểm</Text>

              <DraggableFlatList
                data={routePoints}
                keyExtractor={(item, index) =>
                  `${item.latitude},${item.longitude}-${index}`
                }
                containerStyle={{ paddingTop: 4 }}
                scrollEnabled={false}
                onDragEnd={({
                  data,
                }: {
                  data: { latitude: number; longitude: number }[];
                }) => setRoutePoints(data)}
                renderItem={({
                  item,
                  drag,
                  isActive,
                  getIndex,
                }: RenderItemParams<{
                  latitude: number;
                  longitude: number;
                }>) => {
                  const idx = getIndex?.() ?? 0;
                  return (
                    <TouchableOpacity
                      onLongPress={drag}
                      activeOpacity={0.9}
                      style={[
                        styles.routeListItem,
                        isActive && { opacity: 0.8 },
                      ]}
                    >
                      <View style={styles.routeListIndex}>
                        <Text style={styles.routeListIndexText}>{idx + 1}</Text>
                      </View>
                      <View style={styles.routeListInfo}>
                        <Text style={styles.routeListLabel}>
                          {idx === 0
                            ? "Điểm bắt đầu"
                            : idx === routePoints.length - 1
                            ? "Điểm kết thúc"
                            : `Điểm ${idx + 1}`}
                        </Text>
                        <Text style={styles.routeListAddress} numberOfLines={2}>
                          {routeAddresses[idx] ||
                            `${item.latitude.toFixed(
                              5
                            )}, ${item.longitude.toFixed(5)}`}
                        </Text>
                      </View>
                      <View style={styles.routeListActions}>
                        <TouchableOpacity
                          onPress={() => removePointAt(idx)}
                          style={[styles.actionBtn, styles.deleteBtn]}
                        >
                          <Text style={styles.deleteBtnText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>

              <View style={styles.customerCard}>
                <View style={styles.customerInfo}>
                  {/* Avatar placeholder */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {booking.studentName.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.customerDetails}>
                    <Text style={styles.label}>Khách hàng</Text>
                    <Text style={styles.customerName}>
                      {booking.studentName}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Vehicle Info Section (only if vehicle is rented) */}
          {booking.vehicle && booking.vehicle !== "Không có" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đã thuê phương tiện</Text>

              <View style={styles.vehicleCard}>
                <Text style={styles.licensePlate}>51H - 59565</Text>
                <Text style={styles.vehicleModel}>{booking.vehicle}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomButtonContainer}>
        {buttonState === "inSession" ? (
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={[styles.secondaryButton]}
              onPress={() => router.replace("/(main)/(tabs)/schedule")}
            >
              <Text style={styles.secondaryButtonText}>Màn hình chính</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton]}
              onPress={() => {}}
            >
              <Text style={styles.primaryButtonText}>Ghi chú</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: startButtonBg }]}
            onPress={handleStartPickup}
            disabled={isStartButtonDisabled}
          >
            <Text style={styles.startButtonText}>{startButtonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 1000,
    backgroundColor: "transparent",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00000040",
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 500,
    backgroundColor: "#e0e0e0",
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
    paddingTop: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    backgroundColor: "#ffffff",
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
  },
  customerCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppColors.brandBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  customerDetails: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  vehicleCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
  },
  licensePlate: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  vehicleModel: {
    fontSize: 16,
    color: "#666666",
  },
  bottomButtonContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  startButton: {
    backgroundColor: AppColors.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: AppColors.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  routeListItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  routeListIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  routeListIndexText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  routeListInfo: {
    flex: 1,
  },
  routeListLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  routeListAddress: {
    fontSize: 14,
    color: "#000000",
  },
  routeListActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: AppColors.gray200,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    color: AppColors.textPrimary,
    fontWeight: "700",
  },
  deleteBtn: {
    backgroundColor: AppColors.error,
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 16,
  },
  sessionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  sessionIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F0F6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  sessionText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
});
