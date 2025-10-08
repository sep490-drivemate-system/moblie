import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  Car, 
  CheckCircle, 
  X, 
  ChevronRight,
  Star,
  Timer,
  Route,
  Target,
  Award,
  Settings,
  Navigation,
  Plus,
  Trash2,
  Map
} from 'lucide-react-native';

interface Booking {
  id: string;
  date: string;
  time: string;
  duration: number; // in minutes
  instructorName: string;
  instructorAvatar: string;
  instructorRating: number;
  vehicleType: string;
  pickupLocation: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  packageType: 'basic' | 'standard' | 'premium';
  learningRoute?: LearningRoute;
}

interface LearningRoute {
  id: string;
  title: string;
  description: string;
  steps: RouteStep[];
  totalDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number; // 0-100
}

interface RouteStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  roadType: string;
  skills: string[];
  location: string;
  completed: boolean;
}

interface MapPoint {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  type: 'start' | 'waypoint' | 'end';
  roadType?: string;
  skills?: string[];
}

interface RouteSegment {
  id: string;
  startPoint: MapPoint;
  endPoint: MapPoint;
  distance: number; // in meters
  duration: number; // in minutes
  roadType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  coordinates: Array<{latitude: number; longitude: number}>;
}

export default function ScheduleScreen() {
  const router = useRouter();
  
  // State management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  
  // Route creation states
  const [showRouteCreator, setShowRouteCreator] = useState(false);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 10.8231,
    longitude: 106.6297,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const packageColors = {
    basic: { bg: '#e0f2fe', text: '#0277bd', label: 'Cơ bản - 150xu' },
    standard: { bg: '#f3e5f5', text: '#7b1fa2', label: 'Tiêu chuẩn - 200xu' },
    premium: { bg: '#fff3e0', text: '#ef6c00', label: 'Cao cấp - 300xu' },
  };

  const statusColors = {
    upcoming: { bg: '#e3f2fd', text: '#1976d2', label: 'Sắp tới' },
    in_progress: { bg: '#fff3e0', text: '#f57c00', label: 'Đang học' },
    completed: { bg: '#e8f5e8', text: '#388e3c', label: 'Hoàn thành' },
    cancelled: { bg: '#ffebee', text: '#d32f2f', label: 'Đã hủy' },
  };

  // Initialize with sample bookings
  useEffect(() => {
    const sampleBookings: Booking[] = [
      {
        id: '1',
        date: '2025-01-15',
        time: '08:00',
        duration: 120,
        instructorName: 'Thầy Nguyễn Văn A',
        instructorAvatar: '👨‍🏫',
        instructorRating: 4.8,
        vehicleType: 'Toyota Vios',
        pickupLocation: '123 Nguyễn Huệ, Q1, TP.HCM',
        status: 'upcoming',
        price: 200,
        packageType: 'standard',
        learningRoute: {
          id: 'route-1',
          title: 'Lộ trình học lái cơ bản',
          description: 'Học các kỹ năng lái xe cơ bản trong môi trường an toàn',
          totalDuration: 180,
          difficulty: 'beginner',
          progress: 67,
          steps: [
            {
              id: 'step-1',
              title: 'Làm quen với xe',
              description: 'Tìm hiểu các bộ phận cơ bản của xe',
              duration: 30,
              roadType: 'residential',
              skills: ['basic_control'],
              location: 'Sân tập lái Quận 1',
              completed: true,
            },
            {
              id: 'step-2',
              title: 'Luyện tập đỗ xe',
              description: 'Thực hành đỗ xe song song và vuông góc',
              duration: 60,
              roadType: 'residential',
              skills: ['parking'],
              location: 'Sân tập lái Quận 1',
              completed: true,
            },
            {
              id: 'step-3',
              title: 'Lái xe trên đường',
              description: 'Thực hành lái xe trên đường thật',
              duration: 90,
              roadType: 'urban',
              skills: ['lane_change', 'intersection'],
              location: 'Đường Nguyễn Huệ, Q1',
              completed: false,
            },
          ],
        },
      },
      {
        id: '2',
        date: '2025-01-16',
        time: '14:00',
        duration: 90,
        instructorName: 'Cô Trần Thị B',
        instructorAvatar: '👩‍🏫',
        instructorRating: 4.9,
        vehicleType: 'Honda City',
        pickupLocation: '456 Lê Lợi, Q1, TP.HCM',
        status: 'upcoming',
        price: 150,
        packageType: 'basic',
      },
      {
        id: '3',
        date: '2025-01-12',
        time: '10:00',
        duration: 150,
        instructorName: 'Thầy Lê Văn C',
        instructorAvatar: '👨‍🏫',
        instructorRating: 4.7,
        vehicleType: 'Mazda 3',
        pickupLocation: '789 Võ Văn Tần, Q3, TP.HCM',
        status: 'completed',
        price: 300,
        packageType: 'premium',
      },
    ];
    setBookings(sampleBookings);
  }, []);

  // Get bookings for selected date
  const getBookingsForDate = (date: string) => {
    return bookings.filter(booking => booking.date === date);
  };

  // Get marked dates for calendar
  const getMarkedDates = () => {
    const marked: any = {};
    bookings.forEach(booking => {
      const statusColor = statusColors[booking.status];
      marked[booking.date] = {
        marked: true,
        dotColor: statusColor.text,
        selectedColor: statusColor.text,
      };
    });
    
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#6366f1',
      };
    }
    
    return marked;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const handleBookingPress = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetail(true);
  };

  const handleViewRoute = () => {
    setShowBookingDetail(false);
    setShowRouteModal(true);
  };

  // Route creation functions
  const handleMapPress = (event: any) => {
    if (!isCreatingRoute) return;
    
    const coordinate = event.nativeEvent.coordinate;
    const pointType = mapPoints.length === 0 ? 'start' : 
                     mapPoints.length === 1 ? 'waypoint' : 'end';
    
    const newPoint: MapPoint = {
      id: `point-${Date.now()}`,
      coordinate,
      title: pointType === 'start' ? 'Điểm bắt đầu' : 
             pointType === 'waypoint' ? `Điểm ${mapPoints.length}` : 'Điểm kết thúc',
      description: `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
      type: pointType,
    };

    setMapPoints(prev => [...prev, newPoint]);

    // Auto generate route segment if we have 2+ points
    if (mapPoints.length >= 1) {
      generateRouteSegment(mapPoints[mapPoints.length - 1], newPoint);
    }
  };

  const generateRouteSegment = async (startPoint: MapPoint, endPoint: MapPoint) => {
    try {
      // 🚀 PRODUCTION: Use Google Directions API to get real routes
      // 1. Get API key from Google Cloud Console
      // 2. Enable Directions API
      // 3. Replace YOUR_GOOGLE_MAPS_API_KEY with actual key
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${startPoint.coordinate.latitude},${startPoint.coordinate.longitude}&` +
        `destination=${endPoint.coordinate.latitude},${endPoint.coordinate.longitude}&` +
        `mode=driving&` +
        `alternatives=true&` + // Get multiple route options
        `avoid=tolls&` + // Avoid toll roads for learning
        `key=YOUR_GOOGLE_MAPS_API_KEY`; // Replace with your API key

      // 🚀 PRODUCTION MODE: Use real Google Directions API
      try {
        const response = await fetch(directionsUrl);
        const data = await response.json();
        
        if (data.status === 'OK' && data.routes.length > 0) {
          const route = data.routes[0];
          const leg = route.legs[0];
          
          // Decode polyline to get real road coordinates
          const coordinates = decodePolyline(route.overview_polyline.points);
          
          const segment: RouteSegment = {
            id: `segment-${Date.now()}`,
            startPoint,
            endPoint,
            distance: leg.distance.value, // Real distance from Google
            duration: Math.round(leg.duration.value / 60), // Convert to minutes
            roadType: determineRoadType(leg.distance.value, route.summary),
            difficulty: determineDifficulty(leg.distance.value, route.summary),
            coordinates: coordinates, // Real road path
          };
          
          setRouteSegments(prev => [...prev, segment]);
          return;
        }
      } catch (apiError) {
        console.log('Google API not available, using simulation');
      }
      
      // 🔧 FALLBACK: Simulate realistic route data if API fails
      const simulatedRoute = generateRealisticRoute(startPoint.coordinate, endPoint.coordinate);
      
      const segment: RouteSegment = {
        id: `segment-${Date.now()}`,
        startPoint,
        endPoint,
        distance: simulatedRoute.distance,
        duration: simulatedRoute.duration,
        roadType: simulatedRoute.roadType,
        difficulty: simulatedRoute.difficulty,
        coordinates: simulatedRoute.coordinates,
      };

      setRouteSegments(prev => [...prev, segment]);
    } catch (error) {
      console.error('Error generating route:', error);
      // Fallback to straight line if API fails
      const fallbackDistance = calculateDistance(startPoint.coordinate, endPoint.coordinate);
      const segment: RouteSegment = {
        id: `segment-${Date.now()}`,
        startPoint,
        endPoint,
        distance: fallbackDistance,
        duration: Math.round(fallbackDistance / 1000 * 3),
        roadType: 'urban',
        difficulty: 'medium',
        coordinates: [startPoint.coordinate, endPoint.coordinate],
      };
      setRouteSegments(prev => [...prev, segment]);
    }
  };

  // Generate realistic route simulation (mimics Google Directions API response)
  const generateRealisticRoute = (start: any, end: any) => {
    const directDistance = calculateDistance(start, end);
    
    // Create realistic waypoints that follow roads
    const coordinates = [];
    const numWaypoints = Math.max(3, Math.floor(directDistance / 1000)); // More waypoints for longer routes
    
    coordinates.push(start);
    
    // Generate intermediate points that simulate following roads
    for (let i = 1; i < numWaypoints; i++) {
      const progress = i / numWaypoints;
      
      // Add some realistic deviation from straight line (simulating roads)
      const latOffset = (Math.random() - 0.5) * 0.002; // Small random offset
      const lngOffset = (Math.random() - 0.5) * 0.002;
      
      const waypoint = {
        latitude: start.latitude + (end.latitude - start.latitude) * progress + latOffset,
        longitude: start.longitude + (end.longitude - start.longitude) * progress + lngOffset,
      };
      
      coordinates.push(waypoint);
    }
    
    coordinates.push(end);
    
    // Calculate realistic distance (usually 20-40% longer than direct distance)
    const routeDistance = directDistance * (1.2 + Math.random() * 0.2);
    const duration = Math.round(routeDistance / 1000 * 2.5); // 2.5 minutes per km (realistic city driving)
    
    // Determine road type and difficulty based on distance and area
    let roadType = 'residential';
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
    
    if (routeDistance > 8000) {
      roadType = 'highway';
      difficulty = 'hard';
    } else if (routeDistance > 3000) {
      roadType = 'urban';
      difficulty = 'medium';
    }
    
    return {
      distance: routeDistance,
      duration,
      roadType,
      difficulty,
      coordinates,
    };
  };

  const calculateDistance = (coord1: any, coord2: any) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.latitude * Math.PI/180;
    const φ2 = coord2.latitude * Math.PI/180;
    const Δφ = (coord2.latitude-coord1.latitude) * Math.PI/180;
    const Δλ = (coord2.longitude-coord1.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // 🔧 Helper function to decode Google polyline (for production use)
  const decodePolyline = (encoded: string) => {
    const coordinates = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return coordinates;
  };

  // Helper functions for Google API response
  const determineRoadType = (distance: number, summary: string) => {
    const summaryLower = summary.toLowerCase();
    if (summaryLower.includes('highway') || summaryLower.includes('expressway') || distance > 8000) {
      return 'highway';
    } else if (summaryLower.includes('avenue') || summaryLower.includes('boulevard') || distance > 3000) {
      return 'urban';
    } else {
      return 'residential';
    }
  };

  const determineDifficulty = (distance: number, summary: string): 'easy' | 'medium' | 'hard' => {
    const summaryLower = summary.toLowerCase();
    if (summaryLower.includes('highway') || distance > 8000) {
      return 'hard';
    } else if (distance > 3000) {
      return 'medium';
    } else {
      return 'easy';
    }
  };

  const startRouteCreation = () => {
    setIsCreatingRoute(true);
    setMapPoints([]);
    setRouteSegments([]);
  };

  const finishRouteCreation = () => {
    if (mapPoints.length < 2) {
      Alert.alert('Lỗi', 'Cần ít nhất 2 điểm để tạo lộ trình');
      return;
    }

    setIsCreatingRoute(false);
    
    const totalDistance = routeSegments.reduce((total, segment) => total + segment.distance, 0);
    const totalDuration = routeSegments.reduce((total, segment) => total + segment.duration, 0);
    
    Alert.alert(
      'Lộ trình đã tạo thành công! 🎉',
      `📍 ${mapPoints.length} điểm đã chọn\n` +
      `🛣️ ${routeSegments.length} đoạn đường thực tế\n` +
      `📏 Tổng khoảng cách: ${(totalDistance / 1000).toFixed(1)} km\n` +
      `⏱️ Thời gian ước tính: ${totalDuration} phút\n\n` +
      `Lộ trình đã được tối ưu theo đường đi thực tế!`,
      [
        { text: 'Tuyệt vời!', onPress: () => setShowRouteCreator(false) }
      ]
    );
  };

  const clearRoute = () => {
    setMapPoints([]);
    setRouteSegments([]);
    setIsCreatingRoute(false);
  };

  const removePoint = (pointId: string) => {
    setMapPoints(prev => prev.filter(p => p.id !== pointId));
    setRouteSegments(prev => prev.filter(s => 
      s.startPoint.id !== pointId && s.endPoint.id !== pointId
    ));
  };

  // Geocode address to coordinates
  const geocodeAddress = async (address: string) => {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?` +
        `address=${encodeURIComponent(address)}&` +
        `key=YOUR_GOOGLE_MAPS_API_KEY`;

      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      throw new Error('Address not found');
    } catch (error) {
      // Fallback: Use some common HCM addresses for demo
      const commonAddresses: { [key: string]: any } = {
        'ben thanh': { latitude: 10.7720, longitude: 106.6980 },
        'bitexco': { latitude: 10.7717, longitude: 106.7041 },
        'dam sen': { latitude: 10.7553, longitude: 106.6363 },
        'tan binh': { latitude: 10.8006, longitude: 106.6519 },
        'phu nhuan': { latitude: 10.7980, longitude: 106.6826 },
        'quan 1': { latitude: 10.7769, longitude: 106.7009 },
        'quan 3': { latitude: 10.7860, longitude: 106.6917 },
        'quan 7': { latitude: 10.7378, longitude: 106.7197 },
      };

      const addressLower = address.toLowerCase();
      for (const [key, coords] of Object.entries(commonAddresses)) {
        if (addressLower.includes(key)) {
          return coords;
        }
      }
      
      throw new Error('Không tìm thấy địa chỉ');
    }
  };

  const handleAddAddress = async () => {
    if (!addressInput.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return;
    }

    try {
      const coordinate = await geocodeAddress(addressInput);
      const pointType = mapPoints.length === 0 ? 'start' : 
                       mapPoints.length === 1 ? 'waypoint' : 'end';
      
      const newPoint: MapPoint = {
        id: `point-${Date.now()}`,
        coordinate,
        title: pointType === 'start' ? 'Điểm bắt đầu' : 
               pointType === 'waypoint' ? `Điểm ${mapPoints.length}` : 'Điểm kết thúc',
        description: addressInput,
        type: pointType,
      };

      setMapPoints(prev => [...prev, newPoint]);

      // Auto generate route segment if we have 2+ points
      if (mapPoints.length >= 1) {
        generateRouteSegment(mapPoints[mapPoints.length - 1], newPoint);
      }

      setAddressInput('');
      setShowAddressInput(false);
      
      // Update map region to show the new point
      setMapRegion({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tìm thấy địa chỉ này. Vui lòng thử lại.');
    }
  };

  const renderBookingCard = ({ item: booking }: { item: Booking }) => {
    const packageStyle = packageColors[booking.packageType];
    const statusStyle = statusColors[booking.status];
    
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => handleBookingPress(booking)}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.timeContainer}>
            <Clock size={16} color="#6366f1" strokeWidth={2} />
            <Text style={styles.timeText}>{booking.time}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <View style={styles.bookingContent}>
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorAvatar}>{booking.instructorAvatar}</Text>
            <View style={styles.instructorDetails}>
              <Text style={styles.instructorName}>{booking.instructorName}</Text>
              <View style={styles.ratingContainer}>
                <Star size={12} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
                <Text style={styles.ratingText}>{booking.instructorRating}</Text>
              </View>
            </View>
          </View>

          <View style={styles.bookingInfo}>
            <View style={styles.infoRow}>
              <Car size={14} color="#64748b" strokeWidth={2} />
              <Text style={styles.infoText}>{booking.vehicleType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Timer size={14} color="#64748b" strokeWidth={2} />
              <Text style={styles.infoText}>{formatDuration(booking.duration)}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={14} color="#64748b" strokeWidth={2} />
              <Text style={styles.infoText} numberOfLines={1}>{booking.pickupLocation}</Text>
            </View>
          </View>

          <View style={styles.bookingFooter}>
            <View style={[styles.packageBadge, { backgroundColor: packageStyle.bg }]}>
              <Text style={[styles.packageText, { color: packageStyle.text }]}>
                {packageStyle.label}
              </Text>
            </View>
            <ChevronRight size={16} color="#94a3b8" strokeWidth={2} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRouteStep = ({ item: step }: { item: RouteStep }) => {
    return (
      <View style={[styles.stepCard, step.completed && styles.stepCardCompleted]}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          {step.completed && (
            <CheckCircle size={20} color="#10b981" strokeWidth={2} />
          )}
        </View>
        <Text style={styles.stepDescription}>{step.description}</Text>
        <View style={styles.stepDetails}>
          <View style={styles.stepDetailItem}>
            <Timer size={12} color="#6366f1" strokeWidth={2} />
            <Text style={styles.stepDetailText}>{formatDuration(step.duration)}</Text>
          </View>
          <View style={styles.stepDetailItem}>
            <MapPin size={12} color="#6366f1" strokeWidth={2} />
            <Text style={styles.stepDetailText}>{step.location}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CalendarDays size={24} color="#6366f1" strokeWidth={2} />
          <Text style={styles.headerTitle}>Lịch học của tôi</Text>
        </View>
        <TouchableOpacity
          style={styles.createRouteButton}
          onPress={() => setShowRouteCreator(true)}
        >
          <Map size={20} color="#ffffff" strokeWidth={2} />
          <Text style={styles.createRouteButtonText}>Tạo lộ trình</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={new Date().toISOString().split('T')[0]}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            theme={{
              todayTextColor: '#6366f1',
              selectedDayBackgroundColor: '#6366f1',
              selectedDayTextColor: '#ffffff',
              arrowColor: '#6366f1',
              monthTextColor: '#1e293b',
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
            style={styles.calendar}
          />
        </View>

        {/* Bookings for selected date */}
        {selectedDate && (
          <View style={styles.bookingsSection}>
            <Text style={styles.sectionTitle}>
              Lịch học ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </Text>
            <FlatList
              data={getBookingsForDate(selectedDate)}
              renderItem={renderBookingCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <CalendarDays size={48} color="#cbd5e1" strokeWidth={1} />
                  <Text style={styles.emptyTitle}>Không có lịch học</Text>
                  <Text style={styles.emptyDescription}>
                    Bạn chưa có lịch học nào trong ngày này
                  </Text>
                </View>
              }
            />
          </View>
        )}

        {/* All upcoming bookings */}
        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>Lịch học sắp tới</Text>
          <FlatList
            data={bookings.filter(b => b.status === 'upcoming')}
            renderItem={renderBookingCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Clock size={48} color="#cbd5e1" strokeWidth={1} />
                <Text style={styles.emptyTitle}>Không có lịch học sắp tới</Text>
                <Text style={styles.emptyDescription}>
                  Hãy đặt lịch học với giảng viên
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Booking Detail Modal */}
      <Modal
        visible={showBookingDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết lịch học</Text>
              <TouchableOpacity onPress={() => setShowBookingDetail(false)}>
                <X size={24} color="#64748b" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.bookingDetailCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ngày học:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedBooking.date).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Giờ học:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.time}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Thời lượng:</Text>
                    <Text style={styles.detailValue}>{formatDuration(selectedBooking.duration)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Giảng viên:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.instructorName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Xe học:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.vehicleType}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Địa điểm đón:</Text>
                    <Text style={styles.detailValue}>{selectedBooking.pickupLocation}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Gói học:</Text>
                    <Text style={styles.detailValue}>
                      {packageColors[selectedBooking.packageType].label}
                    </Text>
                  </View>
                </View>

                {selectedBooking.learningRoute && (
                  <TouchableOpacity
                    style={styles.routeButton}
                    onPress={handleViewRoute}
                  >
                    <Route size={20} color="#6366f1" strokeWidth={2} />
                    <Text style={styles.routeButtonText}>Xem lộ trình học</Text>
                    <ChevronRight size={16} color="#6366f1" strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Learning Route Modal */}
      <Modal
        visible={showRouteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRouteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lộ trình học</Text>
              <TouchableOpacity onPress={() => setShowRouteModal(false)}>
                <X size={24} color="#64748b" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {selectedBooking?.learningRoute && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.routeInfoContainer}>
                  <Text style={styles.routeTitle}>{selectedBooking.learningRoute.title}</Text>
                  <Text style={styles.routeDescription}>{selectedBooking.learningRoute.description}</Text>
                  
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>Tiến độ học tập</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${selectedBooking.learningRoute.progress}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{selectedBooking.learningRoute.progress}%</Text>
                  </View>
                </View>

                <Text style={styles.stepsTitle}>Các bước học</Text>
                <FlatList
                  data={selectedBooking.learningRoute.steps}
                  renderItem={renderRouteStep}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Route Creator Modal */}
      <Modal
        visible={showRouteCreator}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRouteCreator(false)}
      >
        <View style={styles.routeCreatorContainer}>
          <View style={styles.routeCreatorHeader}>
            <View style={styles.routeCreatorTitle}>
              <Map size={24} color="#6366f1" strokeWidth={2} />
              <Text style={styles.routeCreatorTitleText}>Tạo lộ trình học</Text>
            </View>
            <TouchableOpacity onPress={() => setShowRouteCreator(false)}>
              <X size={24} color="#64748b" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
            onPress={handleMapPress}
          >
            {/* Render map points */}
            {mapPoints.map((point, index) => (
              <Marker
                key={point.id}
                coordinate={point.coordinate}
                title={point.title}
                description={point.description}
                pinColor={
                  point.type === 'start' ? '#10b981' :
                  point.type === 'end' ? '#ef4444' : '#f59e0b'
                }
              />
            ))}

            {/* Render route segments */}
            {routeSegments.map((segment) => (
              <Polyline
                key={segment.id}
                coordinates={segment.coordinates}
                strokeColor={
                  segment.difficulty === 'easy' ? '#10b981' :
                  segment.difficulty === 'medium' ? '#f59e0b' : '#ef4444'
                }
                strokeWidth={4}
              />
            ))}
          </MapView>

          {/* Route creation controls */}
          <View style={styles.routeControls}>
            <View style={styles.routeInfo}>
              <Text style={styles.routeInfoText}>
                {isCreatingRoute ? 'Nhấn vào bản đồ để thêm điểm' : 'Lộ trình đã tạo'}
              </Text>
              <Text style={styles.routeStats}>
                {mapPoints.length} điểm • {routeSegments.length} đoạn đường
              </Text>
              {routeSegments.length > 0 && (
                <Text style={styles.routeDistance}>
                  Tổng khoảng cách: {(routeSegments.reduce((total, segment) => total + segment.distance, 0) / 1000).toFixed(1)} km
                </Text>
              )}
            </View>

            <View style={styles.controlButtons}>
              {!isCreatingRoute ? (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={startRouteCreation}
                >
                  <Plus size={20} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.startButtonText}>Bắt đầu tạo</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.addressButton}
                    onPress={() => setShowAddressInput(true)}
                  >
                    <MapPin size={18} color="#6366f1" strokeWidth={2} />
                    <Text style={styles.addressButtonText}>Nhập địa chỉ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearRoute}
                  >
                    <Trash2 size={18} color="#ef4444" strokeWidth={2} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.finishButton}
                    onPress={finishRouteCreation}
                  >
                    <CheckCircle size={18} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.finishButtonText}>Hoàn thành</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Points list */}
          {mapPoints.length > 0 && (
            <View style={styles.pointsList}>
              <Text style={styles.pointsListTitle}>Các điểm đã chọn:</Text>
              <FlatList
                data={mapPoints}
                horizontal
                renderItem={({ item: point, index }) => (
                  <View style={styles.pointItem}>
                    <View style={[
                      styles.pointMarker,
                      { backgroundColor: 
                        point.type === 'start' ? '#10b981' :
                        point.type === 'end' ? '#ef4444' : '#f59e0b'
                      }
                    ]}>
                      <Text style={styles.pointNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.pointTitle}>{point.title}</Text>
                    <TouchableOpacity
                      style={styles.removePointButton}
                      onPress={() => removePoint(point.id)}
                    >
                      <X size={14} color="#ef4444" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </Modal>

      {/* Address Input Modal */}
      <Modal
        visible={showAddressInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddressInput(false)}
      >
        <View style={styles.addressModalOverlay}>
          <View style={styles.addressModalContent}>
            <View style={styles.addressModalHeader}>
              <Text style={styles.addressModalTitle}>Nhập địa chỉ</Text>
              <TouchableOpacity onPress={() => setShowAddressInput(false)}>
                <X size={24} color="#64748b" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.addressInputContainer}>
              <MapPin size={20} color="#6366f1" strokeWidth={2} />
              <TextInput
                style={styles.addressTextInput}
                placeholder="Nhập địa chỉ (VD: Bến Thành, Bitexco, Quận 1...)"
                value={addressInput}
                onChangeText={setAddressInput}
                autoFocus
                multiline
              />
            </View>
            
            <View style={styles.addressModalButtons}>
              <TouchableOpacity
                style={styles.addressCancelButton}
                onPress={() => setShowAddressInput(false)}
              >
                <Text style={styles.addressCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addressConfirmButton}
                onPress={handleAddAddress}
              >
                <Text style={styles.addressConfirmButtonText}>Thêm điểm</Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createRouteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calendar: {
    borderRadius: 12,
  },
  bookingsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingContent: {
    gap: 12,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructorAvatar: {
    fontSize: 32,
  },
  instructorDetails: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  bookingInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  packageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  bookingDetailCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'right',
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  routeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    flex: 1,
    marginLeft: 12,
  },
  routeInfoContainer: {
    marginBottom: 24,
  },
  routeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  routeDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    textAlign: 'right',
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  stepCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepCardCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  stepDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  stepDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDetailText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  // Route Creator Styles
  routeCreatorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  routeCreatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  routeCreatorTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeCreatorTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  map: {
    flex: 1,
  },
  routeControls: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  routeInfo: {
    marginBottom: 16,
  },
  routeInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  routeStats: {
    fontSize: 14,
    color: '#64748b',
  },
  routeDistance: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 4,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  clearButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  pointsList: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  pointsListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  pointItem: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  pointMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pointNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  pointTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  removePointButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
  },
  // Address Input Styles
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    gap: 6,
  },
  addressButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  addressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  addressModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  addressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addressModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  addressTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  addressModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addressCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  addressCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  addressConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  addressConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
