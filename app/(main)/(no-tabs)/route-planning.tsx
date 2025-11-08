import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import {
  ArrowLeft,
  Plus,
  X,
  Navigation2,
  MapPin,
  Check,
  Target,
  Clock,
  Route as RouteIcon,
  Loader,
  Maximize2,
  Minimize2,
  Info,
  Calendar,
  Car,
  User,
  Edit2,
  Trash2,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { userPackagesData } from "@/data/user_packages_data";
import { mockUserProfile } from "@/data/profile-screen";

interface Waypoint {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  description?: string;
  estimatedTime?: string; // Format: "HH:mm" or "X giờ"
  skills?: string[];
  isStart?: boolean;
  isEnd?: boolean;
}

interface RouteInfo {
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
}

const SKILL_OPTIONS = [
  "Điều khiển cơ bản",
  "Đỗ xe",
  "Chuyển làn",
  "Vượt xe",
  "Qua ngã tư",
  "Đi vòng xuyến",
  "Lùi xe",
  "Lên/xuống dốc",
  "Lái xe ban đêm",
  "Lái xe trong mưa",
];

export default function RoutePlanningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId: string;
    pickupLocation: string;
  }>();

  const mapRef = useRef<MapView>(null);

  // Get session data
  const allSessions = userPackagesData.flatMap((p) => p.sessions || []);
  const session = useMemo(() => {
    return allSessions.find((s) => s.id === params.sessionId);
  }, [params.sessionId]);

  const [pickupLocation, setPickupLocation] = useState<Waypoint>({
    id: "pickup",
    name: params.pickupLocation || session?.location || "Điểm đón",
    latitude: 10.8231,
    longitude: 106.6297,
    isStart: true,
    isEnd: true,
  });

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState<
    "pickup" | "waypoint" | null
  >(null);
  const [newWaypointName, setNewWaypointName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [outboundDistance, setOutboundDistance] = useState(0);
  const [returnDistance, setReturnDistance] = useState(0);
  const [editingWaypointId, setEditingWaypointId] = useState<string | null>(
    null
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedRescheduleReasons, setSelectedRescheduleReasons] = useState<
    string[]
  >([]);
  const [vehicleOwner, setVehicleOwner] = useState<"instructor" | "customer">(
    "customer"
  );

  const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_KEY || "";

  const cancellationReasons = [
    "Tôi muốn hủy lịch do bận đột xuất",
    "Tôi muốn hủy lịch do thời tiết bất lợi",
    "Không có lý do nào phù hợp",
  ];

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Thông báo", "Quyền truy cập vị trí bị từ chối");
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude);

      setPickupLocation({
        id: "pickup",
        name: address || "Vị trí hiện tại",
        latitude,
        longitude,
      });

      // Animate map to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại");
    } finally {
      setIsLoading(false);
    }
  };

  // Reverse geocoding - Get address from coordinates
  const reverseGeocode = async (
    lat: number,
    lng: number
  ): Promise<string | null> => {
    try {
      // Using Nominatim OpenStreetMap (free alternative to Google)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  // Helper: Calculate distance between two points (Haversine formula)
  const calculatePointDistance = (
    point1: Waypoint,
    point2: Waypoint
  ): number => {
    const R = 6371e3;
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}phút`;
    return `${minutes} phút`;
  };

  const getSessionStatusMeta = (status?: string) => {
    switch (status) {
      case "upcoming":
        return { label: "Sắp diễn ra", color: AppColors.yellow, bg: "#fef9c3" };
      case "in_progress":
        return {
          label: "Đang diễn ra",
          color: AppColors.primary,
          bg: "#dcfce7",
        };
      case "completed":
        return { label: "Hoàn thành", color: AppColors.gray, bg: "#e5e7eb" };
      case "cancelled":
        return { label: "Đã hủy", color: AppColors.red, bg: "#fee2e2" };
      case "reschedule":
        return { label: "Dời lịch", color: AppColors.blue, bg: "#dbeafe" };
      case "route_planning":
      case "planing":
        return {
          label: "Đang lên lộ trình",
          color: AppColors.yellow,
          bg: "#fef9c3",
        };
      default:
        return {
          label: "Không xác định",
          color: AppColors.gray,
          bg: "#e5e7eb",
        };
    }
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const toggleRescheduleReason = (reason: string) => {
    setSelectedRescheduleReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const toggleSkill = (waypointId: string, skill: string) => {
    setWaypoints(
      waypoints.map((wp) => {
        if (wp.id === waypointId) {
          const skills = wp.skills || [];
          const newSkills = skills.includes(skill)
            ? skills.filter((s) => s !== skill)
            : [...skills, skill];
          return { ...wp, skills: newSkills };
        }
        return wp;
      })
    );
  };

  const updateWaypoint = (id: string, updates: Partial<Waypoint>) => {
    setWaypoints(
      waypoints.map((wp) => (wp.id === id ? { ...wp, ...updates } : wp))
    );
  };

  const handleMapPress = async (event: any) => {
    console.log("🗺️ Map pressed, isSelectingLocation:", isSelectingLocation);

    if (!isSelectingLocation) {
      console.log("⚠️ Not in selection mode, ignoring map press");
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log("📍 Selected coordinates:", { latitude, longitude });

    const address = await reverseGeocode(latitude, longitude);
    console.log("🏠 Reverse geocoded address:", address);

    if (isSelectingLocation === "pickup") {
      console.log("✅ Setting pickup location");
      setPickupLocation({
        ...pickupLocation,
        name: address || "Điểm đón",
        address: address || undefined,
        latitude,
        longitude,
      });
      setIsSelectingLocation(null);
    } else if (isSelectingLocation === "waypoint") {
      console.log("✅ Adding waypoint");
      const name =
        newWaypointName.trim() ||
        address ||
        `Điểm dừng ${waypoints.length + 1}`;
      const newWaypoint: Waypoint = {
        id: Date.now().toString(),
        name,
        address: address || undefined,
        latitude,
        longitude,
        description: "",
        estimatedTime: "",
        skills: [],
      };
      setWaypoints([...waypoints, newWaypoint]);
      setNewWaypointName("");
      setIsSelectingLocation(null);
      setEditingWaypointId(newWaypoint.id);
      console.log("✅ Waypoint added, total waypoints:", waypoints.length + 1);
    }
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter((wp) => wp.id !== id));
    if (editingWaypointId === id) {
      setEditingWaypointId(null);
    }
  };

  const handleSaveRoute = () => {
    if (waypoints.length === 0) {
      Alert.alert("Thông báo", "Vui lòng thêm ít nhất một điểm dừng");
      return;
    }

    Alert.alert(
      "Thành công",
      `Đã lưu lộ trình với ${waypoints.length} điểm dừng`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1e293b" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Xét lộ trình</Text>
          <Text style={styles.headerSubtitle}>
            Chọn điểm đón và các điểm dừng
          </Text>
        </View>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader size={20} color={AppColors.primary} strokeWidth={2} />
          ) : (
            <Target size={20} color={AppColors.primary} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          zoomEnabled={true}
          scrollEnabled={true}
        >
          {/* Pickup/Dropoff Marker */}
          <Marker
            coordinate={{
              latitude: pickupLocation.latitude,
              longitude: pickupLocation.longitude,
            }}
            title={pickupLocation.name}
            description="Điểm đón và trả"
            pinColor={AppColors.primary}
            draggable
            onDragEnd={async (e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              const address = await reverseGeocode(latitude, longitude);
              setPickupLocation({
                ...pickupLocation,
                name: address || pickupLocation.name,
                address: address || undefined,
                latitude,
                longitude,
              });
            }}
          />

          {/* Waypoint Markers */}
          {waypoints.map((waypoint, index) => (
            <Marker
              key={waypoint.id}
              coordinate={{
                latitude: waypoint.latitude,
                longitude: waypoint.longitude,
              }}
              title={waypoint.name}
              description={`Điểm dừng ${index + 1}`}
              pinColor="#f59e0b"
              draggable
              onDragEnd={async (e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                const address = await reverseGeocode(latitude, longitude);
                setWaypoints(
                  waypoints.map((wp) =>
                    wp.id === waypoint.id
                      ? {
                          ...wp,
                          name: address || wp.name,
                          address: address || undefined,
                          latitude,
                          longitude,
                        }
                      : wp
                  )
                );
              }}
            />
          ))}
          {waypoints.length > 0 && GOOGLE_MAPS_APIKEY && (
            <MapViewDirections
              origin={{
                latitude: pickupLocation.latitude,
                longitude: pickupLocation.longitude,
              }}
              destination={{
                latitude: waypoints[waypoints.length - 1].latitude,
                longitude: waypoints[waypoints.length - 1].longitude,
              }}
              waypoints={waypoints.slice(0, -1).map((wp) => ({
                latitude: wp.latitude,
                longitude: wp.longitude,
              }))}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={6}
              strokeColor={AppColors.primary}
              optimizeWaypoints={true}
              precision="high"
              onReady={(result) => {
                console.log("📍 Outbound route ready:", {
                  distance: `${result.distance.toFixed(2)} km`,
                  duration: `${Math.round(result.duration)} phút`,
                });
                setOutboundDistance(result.distance * 1000);

                // Update total route info
                const totalDist = result.distance * 1000 + returnDistance;
                const totalDur =
                  result.duration * 60 + (returnDistance / 1000) * 120;
                setRouteInfo({
                  distance: formatDistance(totalDist),
                  duration: formatDuration(totalDur),
                  distanceValue: totalDist,
                  durationValue: totalDur,
                });

                // Fit map to route
                if (mapRef.current) {
                  mapRef.current.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      top: 150,
                      right: 50,
                      bottom: isFullscreen ? 100 : 300,
                      left: 50,
                    },
                    animated: true,
                  });
                }
              }}
              onError={(errorMessage) => {
                console.error("❌ Outbound route error:", errorMessage);
              }}
            />
          )}

          {/* Return Route with MapViewDirections (Về) */}
          {waypoints.length > 0 && GOOGLE_MAPS_APIKEY && (
            <MapViewDirections
              origin={{
                latitude: waypoints[waypoints.length - 1].latitude,
                longitude: waypoints[waypoints.length - 1].longitude,
              }}
              destination={{
                latitude: pickupLocation.latitude,
                longitude: pickupLocation.longitude,
              }}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={6}
              strokeColor="#f59e0b"
              lineDashPattern={[5, 10]}
              precision="high"
              onReady={(result) => {
                console.log("📍 Return route ready:", {
                  distance: `${result.distance.toFixed(2)} km`,
                  duration: `${Math.round(result.duration)} phút`,
                });
                setReturnDistance(result.distance * 1000);

                // Update total route info
                const totalDist = outboundDistance + result.distance * 1000;
                const totalDur =
                  (outboundDistance / 1000) * 120 + result.duration * 60;
                setRouteInfo({
                  distance: formatDistance(totalDist),
                  duration: formatDuration(totalDur),
                  distanceValue: totalDist,
                  durationValue: totalDur,
                });
              }}
              onError={(errorMessage) => {
                console.error("❌ Return route error:", errorMessage);
              }}
            />
          )}
        </MapView>

        {/* Route Legend */}
        {waypoints.length > 0 && (
          <View style={styles.routeLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, styles.legendLineOutbound]} />
              <Text style={styles.legendText}>Lộ trình đi</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, styles.legendLineReturn]} />
              <Text style={styles.legendText}>Lộ trình về</Text>
            </View>
          </View>
        )}

        {/* Route Info Card */}
        {routeInfo && (
          <View style={styles.routeInfoCard}>
            <View style={styles.routeInfoRow}>
              <RouteIcon size={18} color={AppColors.primary} strokeWidth={2} />
              <Text style={styles.routeInfoText}>{routeInfo.distance}</Text>
            </View>
            <View style={styles.routeInfoRow}>
              <Clock size={18} color={AppColors.primary} strokeWidth={2} />
              <Text style={styles.routeInfoText}>{routeInfo.duration}</Text>
            </View>
            <View style={styles.routeInfoRow}>
              <MapPin size={18} color={AppColors.primary} strokeWidth={2} />
              <Text style={styles.routeInfoText}>{waypoints.length} điểm</Text>
            </View>
          </View>
        )}

        {/* Fullscreen Toggle */}
        <TouchableOpacity
          style={styles.fullscreenButton}
          onPress={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize2 size={20} color="#ffffff" strokeWidth={2} />
          ) : (
            <Maximize2 size={20} color="#ffffff" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Panel */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.bottomPanel, isFullscreen && styles.bottomPanelHidden]}
      >
        <ScrollView
          style={styles.panelContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Customer Information */}
          {session && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
              <View style={styles.customerCard}>
                <View style={styles.customerHeader}>
                  <User size={20} color={AppColors.primary} strokeWidth={2} />
                  <Text style={styles.customerName}>
                    {mockUserProfile.name}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Calendar size={16} color="#64748b" strokeWidth={2} />
                  <Text style={styles.infoText}>
                    {new Date(session.date).toLocaleDateString("vi-VN")}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Clock size={16} color="#64748b" strokeWidth={2} />
                  <Text style={styles.infoText}>
                    {session.startTime} - {session.endTime}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Clock size={16} color="#64748b" strokeWidth={2} />
                  <Text style={styles.infoText}>
                    Tổng thời gian: {session.duration}h
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Trạng thái:</Text>
                  {(() => {
                    const meta = getSessionStatusMeta(session.status);
                    return (
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: meta.bg },
                        ]}
                      >
                        <Text
                          style={[styles.statusText, { color: meta.color }]}
                        >
                          {meta.label}
                        </Text>
                      </View>
                    );
                  })()}
                </View>

                {session.vehicleName && (
                  <View style={styles.infoRow}>
                    <Car size={16} color="#64748b" strokeWidth={2} />
                    <Text style={styles.infoText}>{session.vehicleName}</Text>
                    <TouchableOpacity
                      style={styles.vehicleOwnerToggle}
                      onPress={() =>
                        setVehicleOwner(
                          vehicleOwner === "customer"
                            ? "instructor"
                            : "customer"
                        )
                      }
                    >
                      <Text style={styles.vehicleOwnerText}>
                        (
                        {vehicleOwner === "customer"
                          ? "Xe của khách hàng"
                          : "Xe của tôi"}
                        )
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.sessionActions}>
                  <TouchableOpacity
                    style={styles.cancelLessonButton}
                    onPress={() => setShowCancelModal(true)}
                  >
                    <Text style={styles.cancelLessonButtonText}>
                      Hủy buổi tập lái
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rescheduleLessonButton}
                    onPress={() => {
                      setSelectedRescheduleReasons([]);
                      setShowRescheduleModal(true);
                    }}
                  >
                    <Text style={styles.rescheduleLessonButtonText}>
                      Dời lịch buổi tập lái
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Pickup Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Điểm đón & Trả</Text>
            <View style={styles.locationCard}>
              <MapPin size={20} color={AppColors.primary} strokeWidth={2} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName} numberOfLines={2}>
                  {pickupLocation.name}
                </Text>
                <Text style={styles.locationCoordinates}>
                  {pickupLocation.latitude.toFixed(6)},{" "}
                  {pickupLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.locationActions}>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => setIsSelectingLocation("pickup")}
                >
                  <Text style={styles.changeButtonText}>Đổi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Waypoints */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Điểm dừng ({waypoints.length})
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setIsSelectingLocation("waypoint");
                }}
              >
                <Plus size={18} color="#ffffff" strokeWidth={2} />
                <Text style={styles.addButtonText}>Thêm điểm</Text>
              </TouchableOpacity>
            </View>

            {/* Waypoint Input */}
            {isSelectingLocation === "waypoint" && (
              <View style={styles.waypointInputContainer}>
                <TextInput
                  style={styles.waypointInput}
                  placeholder="Nhập tên điểm dừng (tùy chọn)..."
                  placeholderTextColor="#94a3b8"
                  value={newWaypointName}
                  onChangeText={setNewWaypointName}
                />
                <Text style={styles.waypointHint}>
                  Hoặc chạm vào bản đồ để chọn vị trí
                </Text>
              </View>
            )}

            {/* Waypoints List */}
            {waypoints.map((waypoint, index) => (
              <View key={waypoint.id} style={styles.waypointCard}>
                <View style={styles.waypointHeader}>
                  <View style={styles.waypointNumber}>
                    <Text style={styles.waypointNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.waypointInfo}>
                    <Text style={styles.waypointName} numberOfLines={2}>
                      {waypoint.name}
                    </Text>
                    {waypoint.address && (
                      <Text style={styles.waypointAddress} numberOfLines={1}>
                        {waypoint.address}
                      </Text>
                    )}
                  </View>
                  <View style={styles.waypointActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        setEditingWaypointId(
                          editingWaypointId === waypoint.id ? null : waypoint.id
                        )
                      }
                    >
                      <Edit2
                        size={16}
                        color={AppColors.primary}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeWaypoint(waypoint.id)}
                    >
                      <Trash2 size={16} color="#ef4444" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Edit Section */}
                {editingWaypointId === waypoint.id && (
                  <View style={styles.waypointEditSection}>
                    <Text style={styles.editLabel}>Mô tả:</Text>
                    <TextInput
                      style={styles.editInput}
                      placeholder="Nhập mô tả điểm dừng..."
                      placeholderTextColor="#94a3b8"
                      value={waypoint.description || ""}
                      onChangeText={(text) =>
                        updateWaypoint(waypoint.id, { description: text })
                      }
                      multiline
                      numberOfLines={3}
                    />

                    <Text style={styles.editLabel}>Thời gian dự kiến:</Text>
                    <TextInput
                      style={styles.editInput}
                      placeholder="VD: 30 phút hoặc 1 giờ"
                      placeholderTextColor="#94a3b8"
                      value={waypoint.estimatedTime || ""}
                      onChangeText={(text) =>
                        updateWaypoint(waypoint.id, { estimatedTime: text })
                      }
                    />

                    <Text style={styles.editLabel}>Kỹ năng luyện tập:</Text>
                    <View style={styles.skillsContainer}>
                      {SKILL_OPTIONS.map((skill) => {
                        const isSelected =
                          waypoint.skills?.includes(skill) || false;
                        return (
                          <TouchableOpacity
                            key={skill}
                            style={[
                              styles.skillTag,
                              isSelected && styles.skillTagSelected,
                            ]}
                            onPress={() => toggleSkill(waypoint.id, skill)}
                          >
                            <Text
                              style={[
                                styles.skillTagText,
                                isSelected && styles.skillTagTextSelected,
                              ]}
                            >
                              {skill}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Display Section */}
                {editingWaypointId !== waypoint.id && (
                  <View style={styles.waypointDisplaySection}>
                    {waypoint.description && (
                      <Text style={styles.waypointDescription}>
                        {waypoint.description}
                      </Text>
                    )}
                    {waypoint.estimatedTime && (
                      <Text style={styles.waypointTime}>
                        ⏱️ {waypoint.estimatedTime}
                      </Text>
                    )}
                    {waypoint.skills && waypoint.skills.length > 0 && (
                      <View style={styles.skillsDisplayContainer}>
                        <Text style={styles.skillsLabel}>
                          Kỹ năng luyện tập:
                        </Text>
                        <View style={styles.skillsTags}>
                          {waypoint.skills.map((skill, skillIndex) => (
                            <View
                              key={skillIndex}
                              style={styles.skillTagDisplay}
                            >
                              <Text style={styles.skillTagTextDisplay}>
                                {skill}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}

            {waypoints.length === 0 && (
              <View style={styles.emptyWaypoints}>
                <Navigation2 size={32} color="#cbd5e1" strokeWidth={1.5} />
                <Text style={styles.emptyWaypointsText}>
                  Chưa có điểm dừng nào. Nhấn "Thêm điểm" để thêm điểm dừng.
                </Text>
              </View>
            )}
          </View>

          {/* Route Summary */}
          {routeInfo && (
            <View style={styles.routeSummaryCard}>
              <View style={styles.routeSummaryHeader}>
                <Info size={20} color={AppColors.primary} strokeWidth={2} />
                <Text style={styles.routeSummaryTitle}>
                  Tổng quan lộ trình khứ hồi
                </Text>
              </View>

              {/* Outbound and Return Breakdown */}
              <View style={styles.routeBreakdown}>
                <View style={styles.routeBreakdownItem}>
                  <View style={styles.routeBreakdownHeader}>
                    <View
                      style={[
                        styles.routeIndicator,
                        styles.routeIndicatorOutbound,
                      ]}
                    />
                    <Text style={styles.routeBreakdownTitle}>Lộ trình đi</Text>
                  </View>
                  <Text style={styles.routeBreakdownDistance}>
                    {formatDistance(outboundDistance)}
                  </Text>
                  <Text style={styles.routeBreakdownWaypoints}>
                    {waypoints.length} điểm dừng
                  </Text>
                </View>

                <View style={styles.routeBreakdownDivider} />

                <View style={styles.routeBreakdownItem}>
                  <View style={styles.routeBreakdownHeader}>
                    <View
                      style={[
                        styles.routeIndicator,
                        styles.routeIndicatorReturn,
                      ]}
                    />
                    <Text style={styles.routeBreakdownTitle}>Lộ trình về</Text>
                  </View>
                  <Text style={styles.routeBreakdownDistance}>
                    {formatDistance(returnDistance)}
                  </Text>
                  <Text style={styles.routeBreakdownWaypoints}>
                    Về điểm đón
                  </Text>
                </View>
              </View>

              <View style={styles.routeSummaryDivider} />

              <View style={styles.routeSummaryRow}>
                <Text style={styles.routeSummaryLabel}>Tổng khoảng cách:</Text>
                <Text style={styles.routeSummaryValue}>
                  {routeInfo.distance}
                </Text>
              </View>
              <View style={styles.routeSummaryRow}>
                <Text style={styles.routeSummaryLabel}>Thời gian dự kiến:</Text>
                <Text style={styles.routeSummaryValue}>
                  {routeInfo.duration}
                </Text>
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              waypoints.length === 0 && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveRoute}
            disabled={waypoints.length === 0}
          >
            <Check size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.saveButtonText}>Lưu lộ trình</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Xác nhận hủy buổi tập</Text>

            {session && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Ngày giờ đặt lịch</Text>
                  <Text style={styles.modalValue}>
                    {new Date(session.date).toLocaleDateString("vi-VN")}{" "}
                    {session.startTime} - {session.endTime}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Thời điểm hủy</Text>
                  <Text style={styles.modalValue}>
                    {new Date().toLocaleString("vi-VN")}
                  </Text>
                </View>
              </>
            )}

            <Text style={styles.modalSectionTitle}>Lý do hủy lịch</Text>

            <View style={styles.reasonList}>
              {cancellationReasons.map((reason) => {
                const selected = selectedReasons.includes(reason);
                return (
                  <TouchableOpacity
                    key={reason}
                    style={styles.reasonRow}
                    onPress={() => toggleReason(reason)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}
                    >
                      {selected ? (
                        <Text style={styles.checkboxTick}>✓</Text>
                      ) : null}
                    </View>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  setShowCancelModal(false);
                  Alert.alert("Hủy lịch thành công", `Bạn đã hủy buổi tập.`);
                }}
              >
                <Text style={styles.modalConfirmBtnText}>Xác nhận hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        visible={showRescheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Xác nhận dời lịch</Text>

            {session && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Ngày giờ đặt lịch</Text>
                  <Text style={styles.modalValue}>
                    {new Date(session.date).toLocaleDateString("vi-VN")}{" "}
                    {session.startTime} - {session.endTime}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Thời điểm yêu cầu dời</Text>
                  <Text style={styles.modalValue}>
                    {new Date().toLocaleString("vi-VN")}
                  </Text>
                </View>
              </>
            )}

            <Text style={styles.modalSectionTitle}>Lý do dời lịch</Text>

            <View style={styles.reasonList}>
              {cancellationReasons.map((reason) => {
                const selected = selectedRescheduleReasons.includes(reason);
                return (
                  <TouchableOpacity
                    key={reason}
                    style={styles.reasonRow}
                    onPress={() => toggleRescheduleReason(reason)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}
                    >
                      {selected ? (
                        <Text style={styles.checkboxTick}>✓</Text>
                      ) : null}
                    </View>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowRescheduleModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rescheduleConfirmBtn}
                onPress={() => {
                  setShowRescheduleModal(false);
                  if (session) {
                    const qp = new URLSearchParams({
                      sessionId: String(session.id),
                      instructorName: String(session.instructorName || ""),
                      date: String(session.date),
                      startTime: String(session.startTime || ""),
                      duration: String(session.duration || ""),
                      endTime: String(session.endTime || ""),
                      location: String(session.location || ""),
                      reasons: JSON.stringify(selectedRescheduleReasons),
                    }).toString();
                    router.push(`/(main)/(no-tabs)/reschedule-session?${qp}`);
                  }
                }}
              >
                <Text style={styles.modalConfirmBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  routeLegend: {
    position: "absolute",
    top: 170,
    left: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    zIndex: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendLine: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  legendLineOutbound: {
    backgroundColor: AppColors.primary,
  },
  legendLineReturn: {
    backgroundColor: "#f59e0b",
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  routeInfoCard: {
    position: "absolute",
    top: 170,
    right: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    zIndex: 5,
    minWidth: 200,
  },
  routeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeInfoText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  mapOverlay: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  overlayCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: AppColors.primary + "30",
  },
  overlayText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  overlayCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomPanel: {
    height: "45%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomPanelHidden: {
    height: 0,
    opacity: 0,
  },
  fullscreenButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 5,
  },
  directionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  directionsPanel: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    maxHeight: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    zIndex: 5,
  },
  routeSummaryInPanel: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  routeSummaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  routeSummaryIconOutbound: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  routeSummaryIconReturn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
  },
  routeSummaryDetails: {
    flex: 1,
  },
  directionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  directionsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
  },
  directionsCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  directionsList: {
    padding: 16,
  },
  directionStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  directionStepHeader: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primary,
  },
  directionStepWaypoint: {
    paddingLeft: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNumberWaypoint: {
    backgroundColor: "#f59e0b",
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  stepNumberText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
    lineHeight: 20,
  },
  stepTextHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: AppColors.primary,
  },
  stepTextWaypoint: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  routeBreakdown: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 16,
  },
  routeBreakdownItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  routeBreakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  routeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeIndicatorOutbound: {
    backgroundColor: AppColors.primary,
  },
  routeIndicatorReturn: {
    backgroundColor: "#f59e0b",
  },
  routeBreakdownTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  routeBreakdownDistance: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.primary,
    marginBottom: 4,
  },
  routeBreakdownWaypoints: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  routeBreakdownDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
  },
  routeSummaryDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  panelContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: AppColors.primary + "30",
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  locationCoordinates: {
    fontSize: 12,
    color: "#64748b",
  },
  locationActions: {
    flexDirection: "row",
    gap: 8,
  },
  changeButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  waypointInputContainer: {
    marginBottom: 12,
  },
  waypointInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#1e293b",
    borderWidth: 2,
    borderColor: AppColors.primary + "30",
    marginBottom: 8,
  },
  waypointHint: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 4,
  },
  waypointCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  waypointNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
  },
  waypointNumberText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  waypointInfo: {
    flex: 1,
  },
  waypointName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  waypointAddress: {
    fontSize: 12,
    color: "#64748b",
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyWaypoints: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyWaypointsText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
  routeSummaryCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.primary + "30",
  },
  routeSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  routeSummaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
  },
  routeSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  routeSummaryLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  routeSummaryValue: {
    fontSize: 14,
    fontWeight: "800",
    color: AppColors.primary,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  // Customer Info Styles
  customerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  vehicleOwnerToggle: {
    marginLeft: 8,
  },
  vehicleOwnerText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: "600",
    fontStyle: "italic",
  },
  sessionActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelLessonButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelLessonButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  rescheduleLessonButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rescheduleLessonButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  // Waypoint Edit Styles
  waypointHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  waypointActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
  },
  waypointEditSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    marginTop: 8,
  },
  editInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  skillTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  skillTagSelected: {
    backgroundColor: AppColors.primary + "20",
    borderColor: AppColors.primary,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  skillTagTextSelected: {
    color: AppColors.primary,
    fontWeight: "700",
  },
  waypointDisplaySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  waypointDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 18,
  },
  waypointTime: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
    marginBottom: 8,
  },
  skillsDisplayContainer: {
    marginTop: 8,
  },
  skillsLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    fontWeight: "600",
  },
  skillsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTagDisplay: {
    backgroundColor: "#fef3c7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  skillTagTextDisplay: {
    fontSize: 11,
    fontWeight: "500",
    color: "#d97706",
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 10,
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  modalLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  modalValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    marginLeft: 8,
  },
  reasonList: {
    gap: 10,
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  checkboxSelected: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  checkboxTick: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 16,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  modalCancelBtnText: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "800",
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  rescheduleConfirmBtn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
