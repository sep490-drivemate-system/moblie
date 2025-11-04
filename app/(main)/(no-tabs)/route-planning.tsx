import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
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
  RefreshCw,
  Info,
  Maximize2,
  Minimize2,
  List,
  ChevronRight,
} from 'lucide-react-native';
import { AppColors } from '@/constants/Colors';

interface Waypoint {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
}

interface RouteInfo {
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
}


export default function RoutePlanningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId: string;
    pickupLocation: string;
  }>();

  const mapRef = useRef<MapView>(null);

  // Log API key for debugging (only first 10 chars for security)
  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_KEY || '';
    console.log('🔑 Google API Key Status:', {
      hasKey: !!apiKey && apiKey !== '',
      keyLength: apiKey.length,
      keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET',
      fullKey: apiKey // Log full key for debugging (remove in production)
    });
  }, []);

  // Initial pickup location (Ho Chi Minh City center)
  const [pickupLocation, setPickupLocation] = useState<Waypoint>({
    id: 'pickup',
    name: params.pickupLocation || 'Điểm đón',
    latitude: 10.8231,
    longitude: 106.6297,
  });

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState<'pickup' | 'waypoint' | null>(null);
  const [newWaypointName, setNewWaypointName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [routeSteps, setRouteSteps] = useState<string[]>([]);
  const [outboundRoute, setOutboundRoute] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [returnRoute, setReturnRoute] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [outboundDistance, setOutboundDistance] = useState(0);
  const [returnDistance, setReturnDistance] = useState(0);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Thông báo', 'Quyền truy cập vị trí bị từ chối');
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
        id: 'pickup',
        name: address || 'Vị trí hiện tại',
        latitude,
        longitude,
      });

      // Animate map to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    } finally {
      setIsLoading(false);
    }
  };

  // Reverse geocoding - Get address from coordinates
  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Using Nominatim OpenStreetMap (free alternative to Google)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };


  // Generate route steps/directions - separated into outbound and return
  const generateRouteSteps = (): string[] => {
    const steps: string[] = [];

    // Outbound route (Đi)
    steps.push(`🚀 BẮT ĐẦU - ${pickupLocation.name}`);

    let totalOutbound = 0;
    waypoints.forEach((wp, index) => {
      const distance = index === 0
        ? calculatePointDistance(pickupLocation, wp)
        : calculatePointDistance(waypoints[index - 1], wp);
      totalOutbound += distance;
      steps.push(`  → Điểm ${index + 1}: ${wp.name} (${formatDistance(distance)})`);
    });

    // Return route (Về)
    const lastWaypoint = waypoints[waypoints.length - 1];
    const returnDist = lastWaypoint
      ? calculatePointDistance(lastWaypoint, pickupLocation)
      : 0;

    steps.push(`\n🔄 QUAY VỀ - ${pickupLocation.name}`);
    steps.push(`  → Trở về điểm đón (${formatDistance(returnDist)})`);

    return steps;
  };

  const calculatePointDistance = (point1: Waypoint, point2: Waypoint): number => {
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

  // Decode polyline from Google Directions API
  const decodePolyline = (encoded: string): Array<{ latitude: number; longitude: number }> => {
    const poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5,
      });
    }

    return poly;
  };

  // Generate smooth curved route between two points with more segments for smoother curve
  const generateSmoothRoute = (
    start: Waypoint,
    end: Waypoint,
    segments: number = 50 // More segments for smoother curve
  ): Array<{ latitude: number; longitude: number }> => {
    const route: Array<{ latitude: number; longitude: number }> = [];

    const distance = calculatePointDistance(start, end);
    const numSegments = Math.max(20, Math.min(segments, Math.floor(distance / 50))); // Adaptive segments based on distance

    // Calculate bearing (direction) for more realistic curve
    const lat1 = (start.latitude * Math.PI) / 180;
    const lat2 = (end.latitude * Math.PI) / 180;
    const dLon = ((end.longitude - start.longitude) * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearing = Math.atan2(y, x);

    // Generate intermediate points with smooth curve
    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments;

      // Linear interpolation
      const latDiff = end.latitude - start.latitude;
      const lngDiff = end.longitude - start.longitude;

      // Add curve using sine wave for natural road appearance
      // Curve intensity based on distance
      const curveIntensity = Math.min(distance * 0.00015, 0.005); // Max 0.005 degrees offset
      const curvePhase = t * Math.PI;

      // Perpendicular offset to create curve
      const perpLat = Math.sin(bearing + Math.PI / 2) * Math.sin(curvePhase) * curveIntensity;
      const perpLng = Math.cos(bearing + Math.PI / 2) * Math.sin(curvePhase) * curveIntensity;

      const latitude = start.latitude + latDiff * t + perpLat;
      const longitude = start.longitude + lngDiff * t + perpLng;

      route.push({ latitude, longitude });
    }

    return route;
  };

  // Fetch route from Google Directions API or use smooth mock route
  const fetchRouteWithDirections = async (
    origin: Waypoint,
    destination: Waypoint,
    waypointsList: Waypoint[] = []
  ): Promise<Array<{ latitude: number; longitude: number }>> => {
    try {
      // Option 1: Try Google Directions API (if API key is available)
      // Note: Set EXPO_PUBLIC_GOOGLE_KEY in your .env file for real routes
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_KEY || '';
      console.log('🔑 API Key in fetchRouteWithDirections:', {
        hasKey: !!apiKey && apiKey !== '',
        keyLength: apiKey.length,
        keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET',
        fullKey: apiKey // Log full key for debugging
      });

      if (apiKey && apiKey !== '' && apiKey !== 'YOUR_GOOGLE_KEY') {
        // Build waypoints string for Google Directions API
        const waypointsStr = waypointsList
          .map(wp => `${wp.latitude},${wp.longitude}`)
          .join('|');

        // Construct URL with proper encoding
        const originStr = `${origin.latitude},${origin.longitude}`;
        const destStr = `${destination.latitude},${destination.longitude}`;
        const waypointsParam = waypointsList.length > 0
          ? `&waypoints=${encodeURIComponent(waypointsStr)}`
          : '';

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}${waypointsParam}&key=${apiKey}&language=vi&units=metric`;

        console.log('📍 Fetching route from Google Directions API...');
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const polyline = route.overview_polyline.points;
          const decoded = decodePolyline(polyline);
          console.log('✅ Successfully decoded route with', decoded.length, 'points');
          return decoded;
        } else {
          console.warn('⚠️ Google Directions API response:', data.status, data.error_message || '');
          throw new Error(data.error_message || `API returned status: ${data.status}`);
        }
      } else {
        console.log('ℹ️ Google API key not found, using mock route');
      }

      // Option 2: Generate smooth curved route through waypoints (mock for demo)
      // This creates a curved path that looks more like a real road
      const allPoints = [origin, ...waypointsList, destination];
      const smoothRoute: Array<{ latitude: number; longitude: number }> = [];

      for (let i = 0; i < allPoints.length - 1; i++) {
        const segment = generateSmoothRoute(allPoints[i], allPoints[i + 1], 50);
        if (i === 0) {
          smoothRoute.push(...segment);
        } else {
          // Skip first point to avoid duplicates
          smoothRoute.push(...segment.slice(1));
        }
      }

      return smoothRoute.length > 0 ? smoothRoute : [origin, destination].map(p => ({
        latitude: p.latitude,
        longitude: p.longitude
      }));
    } catch (error) {
      console.error('Error fetching route:', error);
      // Fallback: return smooth route
      const allPoints = [origin, ...waypointsList, destination];
      const fallbackRoute: Array<{ latitude: number; longitude: number }> = [];

      for (let i = 0; i < allPoints.length - 1; i++) {
        const segment = generateSmoothRoute(allPoints[i], allPoints[i + 1]);
        if (i === 0) {
          fallbackRoute.push(...segment);
        } else {
          fallbackRoute.push(...segment.slice(1));
        }
      }

      return fallbackRoute.length > 0 ? fallbackRoute : allPoints.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude
      }));
    }
  };

  // Fetch route from Google Directions API
  const fetchRoute = async () => {
    if (waypoints.length === 0) {
      setRouteCoordinates([]);
      setOutboundRoute([]);
      setReturnRoute([]);
      setRouteInfo(null);
      setRouteSteps([]);
      setOutboundDistance(0);
      setReturnDistance(0);
      return;
    }

    setIsLoading(true);
    try {
      // Try to fetch route info from Google Directions API
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_KEY || '';
      console.log('🔑 API Key in fetchRoute:', {
        hasKey: !!apiKey && apiKey !== '',
        keyLength: apiKey.length,
        keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET',
        fullKey: apiKey // Log full key for debugging
      });

      let totalDistance = 0;
      let totalDuration = 0;
      let outDist = 0;
      let retDist = 0;

      if (apiKey && apiKey !== '' && apiKey !== 'YOUR_GOOGLE_KEY' && waypoints.length > 0) {
        try {
          // Fetch outbound route info
          const waypointsStr = waypoints
            .slice(0, -1)
            .map(wp => `${wp.latitude},${wp.longitude}`)
            .join('|');

          const originStr = `${pickupLocation.latitude},${pickupLocation.longitude}`;
          const destStr = `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`;
          const waypointsParam = waypoints.length > 1
            ? `&waypoints=${encodeURIComponent(waypointsStr)}`
            : '';

          const outboundUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}${waypointsParam}&key=${apiKey}&language=vi&units=metric`;

          const outboundResponse = await fetch(outboundUrl);
          const outboundData = await outboundResponse.json();

          if (outboundData.status === 'OK' && outboundData.routes && outboundData.routes.length > 0) {
            const route = outboundData.routes[0];
            const leg = route.legs[0];
            outDist = leg.distance.value; // in meters
            totalDistance += outDist;
            totalDuration += leg.duration.value; // in seconds
          }

          // Fetch return route info
          const returnUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${destStr}&destination=${originStr}&key=${apiKey}&language=vi&units=metric`;

          const returnResponse = await fetch(returnUrl);
          const returnData = await returnResponse.json();

          if (returnData.status === 'OK' && returnData.routes && returnData.routes.length > 0) {
            const route = returnData.routes[0];
            const leg = route.legs[0];
            retDist = leg.distance.value; // in meters
            totalDistance += retDist;
            totalDuration += leg.duration.value; // in seconds
          }
        } catch (error) {
          console.warn('⚠️ Failed to fetch route info from API, using calculated values:', error);
          // Fallback to calculated values
          totalDistance = calculateDistance(pickupLocation, waypoints);
          totalDuration = Math.round(totalDistance / 1000 * 120); // Estimate: 2 min per km

          let prevPoint = pickupLocation;
          for (const waypoint of waypoints) {
            outDist += calculatePointDistance(prevPoint, waypoint);
            prevPoint = waypoint;
          }
          retDist = calculatePointDistance(waypoints[waypoints.length - 1], pickupLocation);
        }
      } else {
        // Use calculated values if no API key
        totalDistance = calculateDistance(pickupLocation, waypoints);
        totalDuration = Math.round(totalDistance / 1000 * 120); // Estimate: 2 min per km

        let prevPoint = pickupLocation;
        for (const waypoint of waypoints) {
          outDist += calculatePointDistance(prevPoint, waypoint);
          prevPoint = waypoint;
        }
        retDist = calculatePointDistance(waypoints[waypoints.length - 1], pickupLocation);
      }

      setRouteInfo({
        distance: formatDistance(totalDistance),
        duration: formatDuration(totalDuration),
        distanceValue: totalDistance,
        durationValue: totalDuration,
      });

      setOutboundDistance(outDist);
      setReturnDistance(retDist);

      // Generate route steps
      const steps = generateRouteSteps();
      setRouteSteps(steps);

      // Fetch actual route coordinates with waypoints
      const outboundCoords = await fetchRouteWithDirections(
        pickupLocation,
        waypoints[waypoints.length - 1],
        waypoints.slice(0, -1) // All waypoints except the last one
      );

      // Fetch return route coordinates
      const returnCoords = waypoints.length > 0
        ? await fetchRouteWithDirections(
          waypoints[waypoints.length - 1],
          pickupLocation,
          []
        )
        : [];

      setOutboundRoute(outboundCoords);
      setReturnRoute(returnCoords);

      // Keep total route for backward compatibility
      setRouteCoordinates([
        ...outboundCoords,
        ...returnCoords,
      ]);

      // Fit map to show all markers
      if (mapRef.current) {
        const allPoints = [pickupLocation, ...waypoints];
        mapRef.current.fitToCoordinates(
          allPoints.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
          {
            edgePadding: { top: 150, right: 50, bottom: isFullscreen ? 100 : 300, left: 50 },
            animated: true,
          }
        );
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Lỗi', 'Không thể tải lộ trình. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate distance between points (Haversine formula)
  const calculateDistance = (start: Waypoint, waypoints: Waypoint[]): number => {
    const R = 6371e3; // Earth radius in meters
    let totalDistance = 0;
    let previousPoint = start;

    for (const waypoint of waypoints) {
      const φ1 = (previousPoint.latitude * Math.PI) / 180;
      const φ2 = (waypoint.latitude * Math.PI) / 180;
      const Δφ = ((waypoint.latitude - previousPoint.latitude) * Math.PI) / 180;
      const Δλ = ((waypoint.longitude - previousPoint.longitude) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      totalDistance += R * c;
      previousPoint = waypoint;
    }

    // Distance back to start
    const φ1 = (previousPoint.latitude * Math.PI) / 180;
    const φ2 = (start.latitude * Math.PI) / 180;
    const Δφ = ((start.latitude - previousPoint.latitude) * Math.PI) / 180;
    const Δλ = ((start.longitude - previousPoint.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    totalDistance += R * c;

    return totalDistance;
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

  useEffect(() => {
    if (waypoints.length > 0) {
      fetchRoute();
    } else {
      setRouteCoordinates([]);
      setRouteInfo(null);
    }
  }, [waypoints, pickupLocation]);

  const handleMapPress = async (event: any) => {
    console.log('🗺️ Map pressed, isSelectingLocation:', isSelectingLocation);

    if (!isSelectingLocation) {
      console.log('⚠️ Not in selection mode, ignoring map press');
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log('📍 Selected coordinates:', { latitude, longitude });

    const address = await reverseGeocode(latitude, longitude);
    console.log('🏠 Reverse geocoded address:', address);

    if (isSelectingLocation === 'pickup') {
      console.log('✅ Setting pickup location');
      setPickupLocation({
        ...pickupLocation,
        name: address || 'Điểm đón',
        address: address || undefined,
        latitude,
        longitude,
      });
      setIsSelectingLocation(null);
    } else if (isSelectingLocation === 'waypoint') {
      console.log('✅ Adding waypoint');
      const name = newWaypointName.trim() || address || `Điểm dừng ${waypoints.length + 1}`;
      const newWaypoint: Waypoint = {
        id: Date.now().toString(),
        name,
        address: address || undefined,
        latitude,
        longitude,
      };
      setWaypoints([...waypoints, newWaypoint]);
      setNewWaypointName('');
      setIsSelectingLocation(null);
      console.log('✅ Waypoint added, total waypoints:', waypoints.length + 1);
    }
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id));
  };

  const handleSaveRoute = () => {
    if (waypoints.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng thêm ít nhất một điểm dừng');
      return;
    }

    Alert.alert(
      'Thành công',
      `Đã lưu lộ trình với ${waypoints.length} điểm dừng`,
      [
        {
          text: 'OK',
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
          <Text style={styles.headerSubtitle}>Chọn điểm đón và các điểm dừng</Text>
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
                setWaypoints(waypoints.map(wp =>
                  wp.id === waypoint.id
                    ? {
                      ...wp,
                      name: address || wp.name,
                      address: address || undefined,
                      latitude,
                      longitude,
                    }
                    : wp
                ));
              }}
            />
          ))}

          {/* Outbound Route Polyline (Đi) */}
          {outboundRoute.length > 1 && (
            <Polyline
              coordinates={outboundRoute}
              strokeColor={AppColors.primary}
              strokeWidth={6}
              lineDashPattern={[10, 5]}
              geodesic={true}
            />
          )}

          {/* Return Route Polyline (Về) */}
          {returnRoute.length > 1 && (
            <Polyline
              coordinates={returnRoute}
              strokeColor="#f59e0b"
              strokeWidth={6}
              lineDashPattern={[5, 10]}
              geodesic={true}
            />
          )}
        </MapView>

        {/* Route Legend */}
        {(outboundRoute.length > 1 || returnRoute.length > 1) && (
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
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => setShowDirections(!showDirections)}
            >
              <List size={16} color={AppColors.primary} strokeWidth={2} />
            </TouchableOpacity>
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

        {/* Route Directions Panel */}
        {showDirections && routeSteps.length > 0 && (
          <View style={styles.directionsPanel}>
            <View style={styles.directionsHeader}>
              <Text style={styles.directionsTitle}>Lộ trình khứ hồi</Text>
              <TouchableOpacity
                onPress={() => setShowDirections(false)}
                style={styles.directionsCloseButton}
              >
                <X size={20} color="#64748b" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Route Summary */}
            <View style={styles.routeSummaryInPanel}>
              <View style={styles.routeSummaryItem}>
                <View style={styles.routeSummaryIconOutbound}>
                  <RouteIcon size={14} color="#ffffff" strokeWidth={2} />
                </View>
                <View style={styles.routeSummaryDetails}>
                  <Text style={styles.routeSummaryLabel}>Lộ trình đi</Text>
                  <Text style={styles.routeSummaryValue}>{formatDistance(outboundDistance)}</Text>
                </View>
              </View>
              <View style={styles.routeSummaryItem}>
                <View style={styles.routeSummaryIconReturn}>
                  <RouteIcon size={14} color="#ffffff" strokeWidth={2} />
                </View>
                <View style={styles.routeSummaryDetails}>
                  <Text style={styles.routeSummaryLabel}>Lộ trình về</Text>
                  <Text style={styles.routeSummaryValue}>{formatDistance(returnDistance)}</Text>
                </View>
              </View>
            </View>

            <ScrollView style={styles.directionsList} showsVerticalScrollIndicator={false}>
              {routeSteps.map((step, index) => {
                const isSectionHeader = step.startsWith('🚀') || step.startsWith('🔄');
                const isWaypoint = step.trim().startsWith('→');

                return (
                  <View key={index} style={[
                    styles.directionStep,
                    isSectionHeader && styles.directionStepHeader,
                    isWaypoint && styles.directionStepWaypoint,
                  ]}>
                    {!isSectionHeader && (
                      <View style={[
                        styles.stepNumber,
                        isWaypoint && styles.stepNumberWaypoint,
                      ]}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                    )}
                    <Text style={[
                      styles.stepText,
                      isSectionHeader && styles.stepTextHeader,
                      isWaypoint && styles.stepTextWaypoint,
                    ]}>
                      {step}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

      </View>

      {/* Bottom Panel */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.bottomPanel, isFullscreen && styles.bottomPanelHidden]}
      >
        <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
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
                  {pickupLocation.latitude.toFixed(6)}, {pickupLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.locationActions}>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => setIsSelectingLocation('pickup')}
                >
                  <Text style={styles.changeButtonText}>Đổi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Waypoints */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Điểm dừng ({waypoints.length})</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setIsSelectingLocation('waypoint');
                }}
              >
                <Plus size={18} color="#ffffff" strokeWidth={2} />
                <Text style={styles.addButtonText}>Thêm điểm</Text>
              </TouchableOpacity>
            </View>

            {/* Waypoint Input */}
            {isSelectingLocation === 'waypoint' && (
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
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeWaypoint(waypoint.id)}
                >
                  <X size={18} color="#ef4444" strokeWidth={2} />
                </TouchableOpacity>
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
                <Text style={styles.routeSummaryTitle}>Tổng quan lộ trình khứ hồi</Text>
              </View>

              {/* Outbound and Return Breakdown */}
              <View style={styles.routeBreakdown}>
                <View style={styles.routeBreakdownItem}>
                  <View style={styles.routeBreakdownHeader}>
                    <View style={[styles.routeIndicator, styles.routeIndicatorOutbound]} />
                    <Text style={styles.routeBreakdownTitle}>Lộ trình đi</Text>
                  </View>
                  <Text style={styles.routeBreakdownDistance}>{formatDistance(outboundDistance)}</Text>
                  <Text style={styles.routeBreakdownWaypoints}>{waypoints.length} điểm dừng</Text>
                </View>

                <View style={styles.routeBreakdownDivider} />

                <View style={styles.routeBreakdownItem}>
                  <View style={styles.routeBreakdownHeader}>
                    <View style={[styles.routeIndicator, styles.routeIndicatorReturn]} />
                    <Text style={styles.routeBreakdownTitle}>Lộ trình về</Text>
                  </View>
                  <Text style={styles.routeBreakdownDistance}>{formatDistance(returnDistance)}</Text>
                  <Text style={styles.routeBreakdownWaypoints}>Về điểm đón</Text>
                </View>
              </View>

              <View style={styles.routeSummaryDivider} />

              <View style={styles.routeSummaryRow}>
                <Text style={styles.routeSummaryLabel}>Tổng khoảng cách:</Text>
                <Text style={styles.routeSummaryValue}>{routeInfo.distance}</Text>
              </View>
              <View style={styles.routeSummaryRow}>
                <Text style={styles.routeSummaryLabel}>Thời gian dự kiến:</Text>
                <Text style={styles.routeSummaryValue}>{routeInfo.duration}</Text>
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, waypoints.length === 0 && styles.saveButtonDisabled]}
            onPress={handleSaveRoute}
            disabled={waypoints.length === 0}
          >
            <Check size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.saveButtonText}>Lưu lộ trình</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  routeLegend: {
    position: 'absolute',
    top: 170,
    left: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#f59e0b',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  routeInfoCard: {
    position: 'absolute',
    top: 170,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 5,
    minWidth: 200,
  },
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeInfoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  mapOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  overlayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: AppColors.primary + '30',
  },
  overlayText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  overlayCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPanel: {
    height: '45%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
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
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: AppColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionsPanel: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 5,
  },
  routeSummaryInPanel: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  routeSummaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  routeSummaryIconOutbound: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeSummaryIconReturn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeSummaryDetails: {
    flex: 1,
  },
  directionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  directionsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  directionsCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionsList: {
    padding: 16,
  },
  directionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  directionStepHeader: {
    backgroundColor: '#f0f9ff',
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
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberWaypoint: {
    backgroundColor: '#f59e0b',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    lineHeight: 20,
  },
  stepTextHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: AppColors.primary,
  },
  stepTextWaypoint: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  routeBreakdown: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 16,
  },
  routeBreakdownItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  routeBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#f59e0b',
  },
  routeBreakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  routeBreakdownDistance: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.primary,
    marginBottom: 4,
  },
  routeBreakdownWaypoints: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  routeBreakdownDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  routeSummaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  panelContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: AppColors.primary + '30',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  locationCoordinates: {
    fontSize: 12,
    color: '#64748b',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  changeButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  waypointInputContainer: {
    marginBottom: 12,
  },
  waypointInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1e293b',
    borderWidth: 2,
    borderColor: AppColors.primary + '30',
    marginBottom: 8,
  },
  waypointHint: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  waypointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  waypointNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waypointNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  waypointInfo: {
    flex: 1,
  },
  waypointName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  waypointAddress: {
    fontSize: 12,
    color: '#64748b',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWaypoints: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyWaypointsText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  routeSummaryCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.primary + '30',
  },
  routeSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  routeSummaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  routeSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  routeSummaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  routeSummaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.primary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
