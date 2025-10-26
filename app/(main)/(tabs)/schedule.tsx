// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   StatusBar,
//   Modal,
//   FlatList,
//   Alert,
//   TextInput,
//   Dimensions,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Calendar } from 'react-native-calendars';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// import { LinearGradient } from 'expo-linear-gradient';
// import {
//   CalendarDays,
//   Clock,
//   MapPin,
//   User,
//   Car,
//   CheckCircle,
//   X,
//   ChevronRight,
//   Star,
//   Timer,
//   Route,
//   Target,
//   Award,
//   Settings,
//   Navigation,
//   Plus,
//   Trash2,
//   Map,
//   Send,
//   Eye,
//   Edit3,
//   AlertCircle,
//   Check,
//   XCircle,
//   DollarSign,
//   RefreshCw,
//   AlertTriangle,
//   Info,
// } from 'lucide-react-native';
// import { Booking, CancelRefundInfo, InstructorRoute, MapPoint, RoutePoint, RouteSegment, RouteStep } from '@/models/booking/booking';

// const { width, height } = Dimensions.get('window');

// export default function ScheduleScreen() {
//   const router = useRouter();

//   // State management
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
//   const [showBookingDetail, setShowBookingDetail] = useState(false);
//   const [showRouteModal, setShowRouteModal] = useState(false);
//   const [selectedTab, setSelectedTab] = useState<'all' | 'requested' | 'pending_confirmation' | 'in_progress' | 'completed'>('all');

//   // Cancel & Refund states
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelRefundInfo, setCancelRefundInfo] = useState<CancelRefundInfo | null>(null);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);

//   // Instructor workflow states
//   const [showRouteDetailsModal, setShowRouteDetailsModal] = useState(false);
//   const [selectedRoute, setSelectedRoute] = useState<InstructorRoute | null>(null);
//   // Removed userRole state - only instructor view

//   // Route creation states
//   const [showRouteCreator, setShowRouteCreator] = useState(false);
//   const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
//   const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
//   const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
//   const [isCreatingRoute, setIsCreatingRoute] = useState(false);
//   const [showAddressInput, setShowAddressInput] = useState(false);
//   const [addressInput, setAddressInput] = useState('');
//   const [mapRegion, setMapRegion] = useState({
//     latitude: 10.8231,
//     longitude: 106.6297,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   });

//   const packageColors = {
//     basic: { bg: '#e0f2fe', text: '#0277bd', label: 'Cơ bản - 150xu' },
//     standard: { bg: '#f3e5f5', text: '#7b1fa2', label: 'Tiêu chuẩn - 200xu' },
//     premium: { bg: '#fff3e0', text: '#ef6c00', label: 'Cao cấp - 300xu' },
//     instructor: { bg: '#f0f9ff', text: '#0369a1', label: 'Thuê người hướng dẫn' },
//     full: { bg: '#fef3c7', text: '#d97706', label: 'Thuê trọn gói' },
//   };

//   const statusColors = {
//     upcoming: { bg: '#e3f2fd', text: '#1976d2', label: 'Sắp tới' },
//     in_progress: { bg: '#fff3e0', text: '#f57c00', label: 'Đang thuê' },
//     completed: { bg: '#e8f5e8', text: '#388e3c', label: 'Hoàn thành' },
//     cancelled: { bg: '#ffebee', text: '#d32f2f', label: 'Đã hủy' },
//     requested: { bg: '#fef3c7', text: '#d97706', label: 'Yêu cầu' },
//     pending_confirmation: { bg: '#dbeafe', text: '#2563eb', label: 'Đợi xác nhận' },
//     rejected: { bg: '#fecaca', text: '#dc2626', label: 'Từ chối' },
//   };

//   // Helper functions for instructor workflow
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'requested': return '#f59e0b';
//       case 'pending_confirmation': return '#3b82f6';
//       case 'rejected': return '#ef4444';
//       case 'in_progress': return '#8b5cf6';
//       case 'completed': return '#10b981';
//       case 'upcoming': return '#1976d2';
//       case 'cancelled': return '#d32f2f';
//       default: return '#6b7280';
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'requested': return 'Yêu cầu';
//       case 'pending_confirmation': return 'Đợi xác nhận';
//       case 'rejected': return 'Từ chối';
//       case 'in_progress': return 'Đang thực hiện';
//       case 'completed': return 'Hoàn thành';
//       case 'upcoming': return 'Sắp tới';
//       case 'cancelled': return 'Đã hủy';
//       default: return 'Không xác định';
//     }
//   };

//   // Initialize with sample bookings for instructor
//   useEffect(() => {
//     const sampleBookings: Booking[] = [
//       // Yêu cầu từ NoviceDriver - chờ duyệt (cần tạo lộ trình)
//       {
//         id: '1',
//         date: '2025-01-15',
//         time: 'Ca sáng (6:00 - 10:00)',
//         duration: 240,
//         instructorName: 'Tôi',
//         instructorAvatar: '👨‍🏫',
//         instructorRating: 4.9,
//         vehicleType: 'Toyota Vios',
//         pickupLocation: 'FPT University Hồ Chí Minh',
//         status: 'requested',
//         price: 200,
//         packageType: 'instructor',
//         studentName: 'Nguyễn Văn A',
//         selectedRoadTypes: ['urban', 'highway'],
//         selectedSkills: ['basic_control', 'parking'],
//         hasRoute: false,
//         coins: 200,
//       },
//       {
//         id: '2',
//         date: '2025-01-16',
//         time: 'Ca chiều (14:00 - 18:00)',
//         duration: 240,
//         instructorName: 'Tôi',
//         instructorAvatar: '👨‍🏫',
//         instructorRating: 4.9,
//         vehicleType: 'Honda City',
//         pickupLocation: 'FPT University Hà Nội',
//         status: 'requested',
//         price: 200,
//         packageType: 'full',
//         studentName: 'Trần Thị B',
//         selectedRoadTypes: ['residential', 'urban'],
//         selectedSkills: ['lane_change', 'overtaking'],
//         hasRoute: false,
//         coins: 200,
//       },
//       // Đã tạo lộ trình - chờ xác nhận
//       {
//         id: '3',
//         date: '2025-01-17',
//         time: 'Ca tối (18:00 - 22:00)',
//         duration: 240,
//         instructorName: 'Tôi',
//         instructorAvatar: '👨‍🏫',
//         instructorRating: 4.9,
//         vehicleType: 'Mazda 3',
//         pickupLocation: 'FPT University Đà Nẵng',
//         status: 'pending_confirmation',
//         price: 300,
//         packageType: 'instructor',
//         studentName: 'Lê Văn C',
//         selectedRoadTypes: ['highway', 'night'],
//         selectedSkills: ['night_driving', 'defensive_driving'],
//         hasRoute: true,
//         route: {
//           id: 'route_3',
//           bookingId: '3',
//           points: [
//             {
//               id: '1',
//               address: 'FPT University Đà Nẵng',
//               coordinates: { latitude: 16.0544, longitude: 108.2022 },
//               isStart: true,
//             },
//             {
//               id: '2',
//               address: 'Cầu Rồng, Đà Nẵng',
//               coordinates: { latitude: 16.0619, longitude: 108.2278 },
//             },
//             {
//               id: '3',
//               address: 'Bãi biển Mỹ Khê, Đà Nẵng',
//               coordinates: { latitude: 16.0583, longitude: 108.2431 },
//               isEnd: true,
//             },
//           ],
//           status: 'draft',
//           notes: 'Luyện tập lái xe ban đêm và kỹ năng phòng thủ',
//           createdAt: '2025-01-10T14:30:00Z',
//         },
//       },
//       // Đang thực hiện
//       {
//         id: '4',
//         date: '2025-01-18',
//         time: 'Ca sáng (6:00 - 10:00)',
//         duration: 240,
//         instructorName: 'Tôi',
//         instructorAvatar: '👨‍🏫',
//         instructorRating: 4.9,
//         vehicleType: 'Toyota Vios',
//         pickupLocation: 'FPT University Hồ Chí Minh',
//         status: 'in_progress',
//         price: 200,
//         packageType: 'instructor',
//         studentName: 'Phạm Thị D',
//         selectedRoadTypes: ['urban', 'highway'],
//         selectedSkills: ['basic_control', 'parking'],
//         hasRoute: true,
//         route: {
//           id: 'route_4',
//           bookingId: '4',
//           points: [
//             {
//               id: '1',
//               address: 'FPT University Hồ Chí Minh',
//               coordinates: { latitude: 10.8231, longitude: 106.6297 },
//               isStart: true,
//             },
//             {
//               id: '2',
//               address: 'Bến Thành, Quận 1, Hồ Chí Minh',
//               coordinates: { latitude: 10.7720, longitude: 106.6980 },
//             },
//             {
//               id: '3',
//               address: 'Bitexco Financial Tower, Quận 1, Hồ Chí Minh',
//               coordinates: { latitude: 10.7717, longitude: 106.7041 },
//               isEnd: true,
//             },
//           ],
//           status: 'accepted',
//           notes: 'Luyện tập lái xe trong khu vực trung tâm thành phố',
//           createdAt: '2025-01-08T09:00:00Z',
//         },
//       },
//       // Hoàn thành
//       {
//         id: '5',
//         date: '2025-01-12',
//         time: 'Ca chiều (14:00 - 18:00)',
//         duration: 240,
//         instructorName: 'Tôi',
//         instructorAvatar: '👨‍🏫',
//         instructorRating: 4.9,
//         vehicleType: 'Honda City',
//         pickupLocation: 'FPT University Hà Nội',
//         status: 'completed',
//         price: 200,
//         packageType: 'full',
//         studentName: 'Võ Văn E',
//         selectedRoadTypes: ['residential', 'urban'],
//         selectedSkills: ['lane_change', 'overtaking'],
//         hasRoute: true,
//         route: {
//           id: 'route_5',
//           bookingId: '5',
//           points: [
//             {
//               id: '1',
//               address: 'FPT University Hà Nội',
//               coordinates: { latitude: 21.0285, longitude: 105.8542 },
//               isStart: true,
//             },
//             {
//               id: '2',
//               address: 'Hồ Gươm, Hoàn Kiếm, Hà Nội',
//               coordinates: { latitude: 21.0285, longitude: 105.8542 },
//             },
//             {
//               id: '3',
//               address: 'Lăng Chủ tịch Hồ Chí Minh, Ba Đình, Hà Nội',
//               coordinates: { latitude: 21.0368, longitude: 105.8342 },
//               isEnd: true,
//             },
//           ],
//           status: 'accepted',
//           notes: 'Luyện tập lái xe trong khu vực lịch sử Hà Nội',
//           createdAt: '2025-01-05T10:00:00Z',
//         },
//       },
//     ];
//     setBookings(sampleBookings);
//   }, []);

//   // Get bookings for selected date
//   const getBookingsForDate = (date: string) => {
//     return bookings.filter(booking => booking.date === date);
//   };

//   // Get filtered bookings based on selected tab
//   const getFilteredBookings = () => {
//     if (selectedTab === 'all') {
//       return bookings.filter(b => b.instructorName === 'Tôi');
//     }
//     return bookings.filter(booking => {
//       switch (selectedTab) {
//         case 'requested':
//           return booking.status === 'requested';
//         case 'pending_confirmation':
//           return booking.status === 'pending_confirmation';
//         case 'in_progress':
//           return booking.status === 'in_progress';
//         case 'completed':
//           return booking.status === 'completed';
//         default:
//           return true;
//       }
//     });
//   };

//   // Get marked dates for calendar
//   const getMarkedDates = () => {
//     const marked: any = {};
//     bookings.forEach(booking => {
//       const statusColor = statusColors[booking.status];
//       marked[booking.date] = {
//         marked: true,
//         dotColor: statusColor.text,
//         selectedColor: statusColor.text,
//       };
//     });

//     if (selectedDate) {
//       marked[selectedDate] = {
//         ...marked[selectedDate],
//         selected: true,
//         selectedColor: '#6366f1',
//       };
//     }

//     return marked;
//   };

//   const formatDuration = (minutes: number) => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     if (hours > 0) {
//       return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
//     }
//     return `${mins}m`;
//   };

//   const handleBookingPress = (booking: Booking) => {
//     setSelectedBooking(booking);
//     setShowBookingDetail(true);
//   };

//   const handleViewRoute = () => {
//     setShowBookingDetail(false);
//     setShowRouteModal(true);
//   };

//   // Instructor workflow handlers
//   const handleViewRouteDetails = (route: InstructorRoute) => {
//     setSelectedRoute(route);
//     setShowRouteDetailsModal(true);
//   };

//   const handleCreateRoute = (bookingId: string) => {
//     setCurrentBookingId(bookingId);
//     setShowRouteCreator(true);
//     setMapPoints([]);
//     setRouteSegments([]);
//     setIsCreatingRoute(false);
//   };

//   const handleEditRoute = (routeId: string) => {
//     router.push({
//       pathname: '/(main)/(no-tabs)/create-route',
//       params: { routeId }
//     });
//   };

//   const handleSendRoute = (bookingId: string) => {
//     Alert.alert(
//       'Xác nhận gửi lộ trình',
//       'Bạn có chắc chắn muốn gửi lộ trình này cho học viên?',
//       [
//         { text: 'Hủy', style: 'cancel' },
//         {
//           text: 'Gửi',
//           onPress: () => {
//             // Update booking status to pending_confirmation
//             setBookings(prev => prev.map(booking =>
//               booking.id === bookingId
//                 ? { ...booking, status: 'pending_confirmation' as const }
//                 : booking
//             ));
//             Alert.alert('Thành công', 'Lộ trình đã được gửi cho học viên');
//           }
//         }
//       ]
//     );
//   };

//   // Removed toggleUserRole - only instructor view

//   // Cancel & Refund functions for Instructor
//   const calculateInstructorPenalty = (booking: Booking): CancelRefundInfo => {
//     const sessionDate = new Date(booking.date);
//     const now = new Date();
//     const hoursUntilSession = Math.max(0, (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60));

//     let penaltyPercentage = 0;
//     let cancellationFee = 0;

//     if (hoursUntilSession >= 24) {
//       // Instructor hủy trước 24h: không bị penalty
//       penaltyPercentage = 0;
//     } else if (hoursUntilSession >= 4) {
//       // Instructor hủy dưới 24h: penalty 10%
//       penaltyPercentage = 10;
//     } else {
//       // Instructor hủy dưới 4h: penalty 50%
//       penaltyPercentage = 50;
//     }

//     const coins = booking.coins || booking.price;
//     const penaltyAmount = (coins * penaltyPercentage) / 100;
//     const instructorCompensation = coins - penaltyAmount;
//     const refundAmount = coins; // Student gets full refund
//     const systemFee = penaltyAmount * 0.5; // 50% of penalty goes to system
//     const studentBonus = penaltyAmount * 0.5; // 50% of penalty goes to student as bonus

//     return {
//       refundAmount,
//       refundPercentage: 100,
//       penaltyAmount,
//       hoursUntilSession,
//       cancellationFee: penaltyAmount,
//       instructorCompensation: instructorCompensation,
//       systemFee,
//     };
//   };

//   const calculateMultiSessionInstructorPenalty = (booking: Booking): CancelRefundInfo => {
//     if (!booking.sessions || !booking.isMultiSession) {
//       return calculateInstructorPenalty(booking);
//     }

//     let totalRefund = 0;
//     let totalPenalty = 0;
//     let totalInstructorComp = 0;
//     let totalSystemFee = 0;

//     const upcomingSessions = booking.sessions.filter(session => session.status === 'upcoming');

//     upcomingSessions.forEach(session => {
//       const sessionDate = new Date(session.date);
//       const now = new Date();
//       const hoursUntilSession = Math.max(0, (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60));

//       let penaltyPercentage = 0;

//       if (hoursUntilSession >= 24) {
//         penaltyPercentage = 0;
//       } else if (hoursUntilSession >= 4) {
//         penaltyPercentage = 10;
//       } else {
//         penaltyPercentage = 50;
//       }

//       const sessionCoins = session.price / 1000; // Convert to coins
//       const sessionPenalty = (sessionCoins * penaltyPercentage) / 100;
//       const sessionInstructorComp = sessionCoins - sessionPenalty;
//       const sessionSystemFee = sessionPenalty * 0.5;

//       totalRefund += sessionCoins; // Student gets full refund for all sessions
//       totalPenalty += sessionPenalty;
//       totalInstructorComp += sessionInstructorComp;
//       totalSystemFee += sessionSystemFee;
//     });

//     const avgHoursUntilSession = upcomingSessions.length > 0
//       ? upcomingSessions.reduce((sum, session) => {
//         const sessionDate = new Date(session.date);
//         const now = new Date();
//         return sum + Math.max(0, (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60));
//       }, 0) / upcomingSessions.length
//       : 0;

//     return {
//       refundAmount: totalRefund,
//       refundPercentage: 100,
//       penaltyAmount: totalPenalty,
//       hoursUntilSession: avgHoursUntilSession,
//       cancellationFee: totalPenalty,
//       instructorCompensation: totalInstructorComp,
//       systemFee: totalSystemFee,
//     };
//   };

//   const handleInstructorCancelBooking = (booking: Booking) => {
//     setSelectedBooking(booking);

//     const refundInfo = booking.isMultiSession
//       ? calculateMultiSessionInstructorPenalty(booking)
//       : calculateInstructorPenalty(booking);

//     setCancelRefundInfo(refundInfo);
//     setShowCancelModal(true);
//   };

//   const confirmInstructorCancelBooking = () => {
//     if (!selectedBooking || !cancelRefundInfo) return;

//     setShowCancelModal(false);
//     setShowConfirmModal(true);
//   };

//   const executeInstructorCancelBooking = () => {
//     if (!selectedBooking || !cancelRefundInfo) return;

//     // Simulate API call to cancel booking
//     Alert.alert(
//       '✅ Hủy lịch thành công!',
//       `Đã hủy lịch với học viên ${selectedBooking.studentName}\n\n` +
//       `💰 Học viên nhận hoàn lại: ${cancelRefundInfo.refundAmount.toLocaleString()} xu\n` +
//       `⚠️ Phí penalty của bạn: ${cancelRefundInfo.penaltyAmount.toLocaleString()} xu\n` +
//       `💵 Bạn nhận được: ${cancelRefundInfo.instructorCompensation.toLocaleString()} xu\n` +
//       `📧 Thông báo đã được gửi đến học viên`,
//       [
//         {
//           text: 'OK',
//           onPress: () => {
//             setShowConfirmModal(false);
//             setSelectedBooking(null);
//             setCancelRefundInfo(null);

//             // Update booking status to cancelled
//             setBookings(prev => prev.map(booking =>
//               booking.id === selectedBooking.id
//                 ? { ...booking, status: 'cancelled' as const }
//                 : booking
//             ));
//           }
//         }
//       ]
//     );
//   };

//   // Route creation functions
//   const handleMapPress = (event: any) => {
//     if (!isCreatingRoute) return;

//     const coordinate = event.nativeEvent.coordinate;

//     // Determine point type: first = start, last will be end when finished, others = waypoints
//     let pointType: 'start' | 'waypoint' | 'end';
//     let title: string;

//     if (mapPoints.length === 0) {
//       pointType = 'start';
//       title = 'Điểm bắt đầu';
//     } else {
//       pointType = 'waypoint';
//       title = `Điểm trung gian ${mapPoints.length}`;
//     }

//     const newPoint: MapPoint = {
//       id: `point-${Date.now()}`,
//       coordinate,
//       title,
//       description: `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
//       type: pointType,
//     };

//     setMapPoints(prev => [...prev, newPoint]);

//     // Auto generate route segment if we have 2+ points (disabled for now)
//     // if (mapPoints.length >= 1) {
//     //   generateRouteSegment(mapPoints[mapPoints.length - 1], newPoint);
//     // }
//   };

//   const generateRouteSegment = async (startPoint: MapPoint, endPoint: MapPoint) => {
//     try {
//       // 🚀 PRODUCTION: Use Google Directions API to get real routes
//       // 1. Get API key from Google Cloud Console
//       // 2. Enable Directions API
//       // 3. Replace YOUR_GOOGLE_MAPS_API_KEY with actual key
//       const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?` +
//         `origin=${startPoint.coordinate.latitude},${startPoint.coordinate.longitude}&` +
//         `destination=${endPoint.coordinate.latitude},${endPoint.coordinate.longitude}&` +
//         `mode=driving&` +
//         `alternatives=true&` + // Get multiple route options
//         `avoid=tolls&` + // Avoid toll roads for learning
//         `key=`; // Replace with your API key

//       // 🚀 PRODUCTION MODE: Use real Google Directions API
//       try {
//         const response = await fetch(directionsUrl);
//         const data = await response.json();

//         if (data.status === 'OK' && data.routes.length > 0) {
//           const route = data.routes[0];
//           const leg = route.legs[0];

//           // Decode polyline to get real road coordinates
//           const coordinates = decodePolyline(route.overview_polyline.points);

//           const segment: RouteSegment = {
//             id: `segment-${Date.now()}`,
//             startPoint,
//             endPoint,
//             distance: leg.distance.value, // Real distance from Google
//             duration: Math.round(leg.duration.value / 60), // Convert to minutes
//             roadType: determineRoadType(leg.distance.value, route.summary),
//             difficulty: determineDifficulty(leg.distance.value, route.summary),
//             coordinates: coordinates, // Real road path
//           };

//           setRouteSegments(prev => [...prev, segment]);
//           return;
//         }
//       } catch (apiError) {
//         console.log('Google API not available, using simulation');
//       }

//       // 🔧 FALLBACK: Simulate realistic route data if API fails
//       const simulatedRoute = generateRealisticRoute(startPoint.coordinate, endPoint.coordinate);

//       const segment: RouteSegment = {
//         id: `segment-${Date.now()}`,
//         startPoint,
//         endPoint,
//         distance: simulatedRoute.distance,
//         duration: simulatedRoute.duration,
//         roadType: simulatedRoute.roadType,
//         difficulty: simulatedRoute.difficulty,
//         coordinates: simulatedRoute.coordinates,
//       };

//       setRouteSegments(prev => [...prev, segment]);
//     } catch (error) {
//       console.error('Error generating route:', error);
//       // Fallback to straight line if API fails
//       const fallbackDistance = calculateDistance(startPoint.coordinate, endPoint.coordinate);
//       const segment: RouteSegment = {
//         id: `segment-${Date.now()}`,
//         startPoint,
//         endPoint,
//         distance: fallbackDistance,
//         duration: Math.round(fallbackDistance / 1000 * 3),
//         roadType: 'urban',
//         difficulty: 'medium',
//         coordinates: [startPoint.coordinate, endPoint.coordinate],
//       };
//       setRouteSegments(prev => [...prev, segment]);
//     }
//   };

//   // Generate realistic route simulation (mimics Google Directions API response)
//   const generateRealisticRoute = (start: any, end: any) => {
//     const directDistance = calculateDistance(start, end);

//     // Create realistic waypoints that follow roads
//     const coordinates = [];
//     const numWaypoints = Math.max(3, Math.floor(directDistance / 1000)); // More waypoints for longer routes

//     coordinates.push(start);

//     // Generate intermediate points that simulate following roads
//     for (let i = 1; i < numWaypoints; i++) {
//       const progress = i / numWaypoints;

//       // Add some realistic deviation from straight line (simulating roads)
//       const latOffset = (Math.random() - 0.5) * 0.002; // Small random offset
//       const lngOffset = (Math.random() - 0.5) * 0.002;

//       const waypoint = {
//         latitude: start.latitude + (end.latitude - start.latitude) * progress + latOffset,
//         longitude: start.longitude + (end.longitude - start.longitude) * progress + lngOffset,
//       };

//       coordinates.push(waypoint);
//     }

//     coordinates.push(end);

//     // Calculate realistic distance (usually 20-40% longer than direct distance)
//     const routeDistance = directDistance * (1.2 + Math.random() * 0.2);
//     const duration = Math.round(routeDistance / 1000 * 2.5); // 2.5 minutes per km (realistic city driving)

//     // Determine road type and difficulty based on distance and area
//     let roadType = 'residential';
//     let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

//     if (routeDistance > 8000) {
//       roadType = 'highway';
//       difficulty = 'hard';
//     } else if (routeDistance > 3000) {
//       roadType = 'urban';
//       difficulty = 'medium';
//     }

//     return {
//       distance: routeDistance,
//       duration,
//       roadType,
//       difficulty,
//       coordinates,
//     };
//   };

//   const calculateDistance = (coord1: any, coord2: any) => {
//     const R = 6371e3; // Earth's radius in meters
//     const φ1 = coord1.latitude * Math.PI / 180;
//     const φ2 = coord2.latitude * Math.PI / 180;
//     const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
//     const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

//     const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//       Math.cos(φ1) * Math.cos(φ2) *
//       Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c;
//   };

//   // 🔧 Helper function to decode Google polyline (for production use)
//   const decodePolyline = (encoded: string) => {
//     const coordinates = [];
//     let index = 0;
//     let lat = 0;
//     let lng = 0;

//     while (index < encoded.length) {
//       let b, shift = 0, result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
//       lat += dlat;

//       shift = 0;
//       result = 0;
//       do {
//         b = encoded.charCodeAt(index++) - 63;
//         result |= (b & 0x1f) << shift;
//         shift += 5;
//       } while (b >= 0x20);
//       const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
//       lng += dlng;

//       coordinates.push({
//         latitude: lat / 1e5,
//         longitude: lng / 1e5,
//       });
//     }

//     return coordinates;
//   };

//   // Helper functions for Google API response
//   const determineRoadType = (distance: number, summary: string) => {
//     const summaryLower = summary.toLowerCase();
//     if (summaryLower.includes('highway') || summaryLower.includes('expressway') || distance > 8000) {
//       return 'highway';
//     } else if (summaryLower.includes('avenue') || summaryLower.includes('boulevard') || distance > 3000) {
//       return 'urban';
//     } else {
//       return 'residential';
//     }
//   };

//   const determineDifficulty = (distance: number, summary: string): 'easy' | 'medium' | 'hard' => {
//     const summaryLower = summary.toLowerCase();
//     if (summaryLower.includes('highway') || distance > 8000) {
//       return 'hard';
//     } else if (distance > 3000) {
//       return 'medium';
//     } else {
//       return 'easy';
//     }
//   };

//   const startRouteCreation = () => {
//     setIsCreatingRoute(true);
//     setMapPoints([]);
//     setRouteSegments([]);
//   };

//   const markLastPointAsEnd = () => {
//     if (mapPoints.length < 2) return;

//     setMapPoints(prev => prev.map((point, index) => {
//       if (index === prev.length - 1) {
//         // Mark last point as end
//         return {
//           ...point,
//           type: 'end' as const,
//           title: 'Điểm kết thúc'
//         };
//       }
//       return point;
//     }));
//   };

//   const finishRouteCreation = () => {
//     if (mapPoints.length < 2) {
//       Alert.alert('Lỗi', 'Cần ít nhất 2 điểm để tạo lộ trình');
//       return;
//     }

//     if (!currentBookingId) {
//       Alert.alert('Lỗi', 'Không tìm thấy booking để tạo lộ trình');
//       return;
//     }

//     setIsCreatingRoute(false);

//     // Tạo route object từ mapPoints
//     const routePoints: RoutePoint[] = mapPoints.map((point, index) => ({
//       id: point.id,
//       address: point.description,
//       coordinates: point.coordinate,
//       isStart: point.type === 'start',
//       isEnd: point.type === 'end',
//     }));

//     const newRoute: InstructorRoute = {
//       id: `route_${currentBookingId}_${Date.now()}`,
//       bookingId: currentBookingId,
//       points: routePoints,
//       status: 'draft',
//       notes: `Lộ trình học lái xe cho ${mapPoints.length} điểm`,
//       createdAt: new Date().toISOString(),
//     };

//     // Cập nhật booking với route mới
//     setBookings(prev => prev.map(booking =>
//       booking.id === currentBookingId
//         ? {
//           ...booking,
//           hasRoute: true,
//           route: newRoute,
//           status: 'pending_confirmation' as const
//         }
//         : booking
//     ));

//     const totalDistance = routeSegments.reduce((total, segment) => total + segment.distance, 0);
//     const totalDuration = routeSegments.reduce((total, segment) => total + segment.duration, 0);

//     Alert.alert(
//       'Lộ trình đã tạo thành công! 🎉',
//       `📍 ${mapPoints.length} điểm đã chọn\n` +
//       `🛣️ ${routeSegments.length} đoạn đường thực tế\n` +
//       `📏 Tổng khoảng cách: ${(totalDistance / 1000).toFixed(1)} km\n` +
//       `⏱️ Thời gian ước tính: ${totalDuration} phút\n\n` +
//       `Lộ trình đã được lưu và chuyển sang trạng thái "Đợi xác nhận"!`,
//       [
//         {
//           text: 'Tuyệt vời!',
//           onPress: () => {
//             setShowRouteCreator(false);
//             setCurrentBookingId(null);
//             setMapPoints([]);
//             setRouteSegments([]);
//           }
//         }
//       ]
//     );
//   };

//   const clearRoute = () => {
//     setMapPoints([]);
//     setRouteSegments([]);
//     setIsCreatingRoute(false);
//   };

//   const removePoint = (pointId: string) => {
//     setMapPoints(prev => prev.filter(p => p.id !== pointId));
//     setRouteSegments(prev => prev.filter(s =>
//       s.startPoint.id !== pointId && s.endPoint.id !== pointId
//     ));
//   };

//   // Geocode address to coordinates
//   const geocodeAddress = async (address: string) => {
//     try {
//       const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?` +
//         `address=${encodeURIComponent(address)}&` +
//         `key=YOUR_GOOGLE_MAPS_API_KEY`;

//       const response = await fetch(geocodeUrl);
//       const data = await response.json();

//       if (data.status === 'OK' && data.results.length > 0) {
//         const location = data.results[0].geometry.location;
//         return {
//           latitude: location.lat,
//           longitude: location.lng,
//         };
//       }
//       throw new Error('Address not found');
//     } catch (error) {
//       // Fallback: Use some common HCM addresses for demo
//       const commonAddresses: { [key: string]: any } = {
//         'ben thanh': { latitude: 10.7720, longitude: 106.6980 },
//         'bitexco': { latitude: 10.7717, longitude: 106.7041 },
//         'dam sen': { latitude: 10.7553, longitude: 106.6363 },
//         'tan binh': { latitude: 10.8006, longitude: 106.6519 },
//         'phu nhuan': { latitude: 10.7980, longitude: 106.6826 },
//         'quan 1': { latitude: 10.7769, longitude: 106.7009 },
//         'quan 3': { latitude: 10.7860, longitude: 106.6917 },
//         'quan 7': { latitude: 10.7378, longitude: 106.7197 },
//       };

//       const addressLower = address.toLowerCase();
//       for (const [key, coords] of Object.entries(commonAddresses)) {
//         if (addressLower.includes(key)) {
//           return coords;
//         }
//       }

//       throw new Error('Không tìm thấy địa chỉ');
//     }
//   };

//   const handleAddAddress = async () => {
//     if (!addressInput.trim()) {
//       Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
//       return;
//     }

//     try {
//       const coordinate = await geocodeAddress(addressInput);
//       const pointType = mapPoints.length === 0 ? 'start' :
//         mapPoints.length === 1 ? 'waypoint' : 'end';

//       const newPoint: MapPoint = {
//         id: `point-${Date.now()}`,
//         coordinate,
//         title: pointType === 'start' ? 'Điểm bắt đầu' :
//           pointType === 'waypoint' ? `Điểm ${mapPoints.length}` : 'Điểm kết thúc',
//         description: addressInput,
//         type: pointType,
//       };

//       setMapPoints(prev => [...prev, newPoint]);

//       // Auto generate route segment if we have 2+ points
//       if (mapPoints.length >= 1) {
//         generateRouteSegment(mapPoints[mapPoints.length - 1], newPoint);
//       }

//       setAddressInput('');
//       setShowAddressInput(false);

//       // Update map region to show the new point
//       setMapRegion({
//         latitude: coordinate.latitude,
//         longitude: coordinate.longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       });

//     } catch (error) {
//       Alert.alert('Lỗi', 'Không thể tìm thấy địa chỉ này. Vui lòng thử lại.');
//     }
//   };

//   const renderBookingCard = ({ item: booking }: { item: Booking }) => {
//     const packageStyle = packageColors[booking.packageType] || { bg: '#e2e8f0', text: '#64748b', label: booking.packageType };
//     const statusStyle = statusColors[booking.status] || { bg: '#e2e8f0', text: '#64748b', label: getStatusText(booking.status) };

//     return (
//       <TouchableOpacity
//         style={styles.bookingCard}
//         onPress={() => handleBookingPress(booking)}
//       >
//         <View style={styles.bookingHeader}>
//           <View style={styles.timeContainer}>
//             <Clock size={16} color="#6366f1" strokeWidth={2} />
//             <Text style={styles.timeText}>{booking.time}</Text>
//           </View>
//           <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
//             <Text style={[styles.statusText, { color: statusStyle.text }]}>
//               {statusStyle.label}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.bookingContent}>
//           <View style={styles.instructorInfo}>
//             <Text style={styles.instructorAvatar}>{booking.instructorAvatar}</Text>
//             <View style={styles.instructorDetails}>
//               <Text style={styles.instructorName}>
//                 {booking.studentName}
//               </Text>
//               <View style={styles.ratingContainer}>
//                 <Star size={12} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
//                 <Text style={styles.ratingText}>{booking.instructorRating}</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.bookingInfo}>
//             <View style={styles.infoRow}>
//               <Car size={14} color="#64748b" strokeWidth={2} />
//               <Text style={styles.infoText}>{booking.vehicleType}</Text>
//             </View>
//             <View style={styles.infoRow}>
//               <Timer size={14} color="#64748b" strokeWidth={2} />
//               <Text style={styles.infoText}>{formatDuration(booking.duration)}</Text>
//             </View>
//             <View style={styles.infoRow}>
//               <MapPin size={14} color="#64748b" strokeWidth={2} />
//               <Text style={styles.infoText} numberOfLines={1}>{booking.pickupLocation}</Text>
//             </View>
//             {booking.selectedRoadTypes && (
//               <View style={styles.infoRow}>
//                 <Route size={14} color="#64748b" strokeWidth={2} />
//                 <Text style={styles.infoText}>
//                   {booking.packageType === 'instructor' ? 'Thuê người hướng dẫn' : 'Thuê trọn gói'}
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Instructor route section */}
//           {booking.hasRoute && booking.route && (
//             <View style={styles.routeSection}>
//               <View style={styles.routeHeader}>
//                 <Text style={styles.routeTitle}>Lộ trình đã tạo</Text>
//                 <TouchableOpacity
//                   style={styles.viewRouteButton}
//                   onPress={() => handleViewRouteDetails(booking.route!)}
//                 >
//                   <Eye size={16} color="#3b82f6" strokeWidth={2} />
//                   <Text style={styles.viewRouteText}>Xem chi tiết</Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.routePoints}>
//                 {booking.route.points.map((point, index) => (
//                   <View key={point.id} style={styles.routePoint}>
//                     <View style={[
//                       styles.pointIndicator,
//                       point.isStart && styles.startPoint,
//                       point.isEnd && styles.endPoint
//                     ]}>
//                       {point.isStart && <Text style={styles.pointText}>Bắt đầu</Text>}
//                       {point.isEnd && <Text style={styles.pointText}>Kết thúc</Text>}
//                       {!point.isStart && !point.isEnd && <Text style={styles.pointText}>{index}</Text>}
//                     </View>
//                     <Text style={styles.pointAddress} numberOfLines={2}>
//                       {point.address}
//                     </Text>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           )}

//           <View style={styles.bookingFooter}>
//             <View style={[styles.packageBadge, { backgroundColor: packageStyle.bg }]}>
//               <Text style={[styles.packageText, { color: packageStyle.text }]}>
//                 {packageStyle.label}
//               </Text>
//             </View>
//             <ChevronRight size={16} color="#94a3b8" strokeWidth={2} />
//           </View>

//           {/* Instructor action buttons */}
//           {(
//             <View style={styles.actionButtons}>
//               {booking.hasRoute ? (
//                 <View style={styles.routeActions}>
//                   <TouchableOpacity
//                     style={styles.editButton}
//                     onPress={() => handleEditRoute(booking.route!.id)}
//                   >
//                     <Edit3 size={16} color="#3b82f6" strokeWidth={2} />
//                     <Text style={styles.editButtonText}>Chỉnh sửa</Text>
//                   </TouchableOpacity>

//                   {booking.route?.status === 'draft' && (
//                     <TouchableOpacity
//                       style={styles.sendButton}
//                       onPress={() => handleSendRoute(booking.id)}
//                     >
//                       <LinearGradient
//                         colors={['#3b82f6', '#2563eb']}
//                         style={styles.sendButtonGradient}
//                       >
//                         <Send size={16} color="#ffffff" strokeWidth={2} />
//                         <Text style={styles.sendButtonText}>Gửi lộ trình</Text>
//                       </LinearGradient>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               ) : (
//                 <TouchableOpacity
//                   style={styles.createButton}
//                   onPress={() => handleCreateRoute(booking.id)}
//                 >
//                   <LinearGradient
//                     colors={['#10b981', '#059669']}
//                     style={styles.createButtonGradient}
//                   >
//                     <Plus size={16} color="#ffffff" strokeWidth={2} />
//                     <Text style={styles.createButtonText}>Tạo lộ trình</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               )}

//               {/* Cancel Button - Show for cancelable bookings */}
//               {(booking.status === 'requested' || booking.status === 'pending_confirmation' || booking.status === 'in_progress') && (
//                 <TouchableOpacity
//                   style={styles.cancelButton}
//                   onPress={() => handleInstructorCancelBooking(booking)}
//                 >
//                   <XCircle size={16} color="#ffffff" strokeWidth={2} />
//                   <Text style={styles.cancelButtonText}>Hủy lịch</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderRouteStep = ({ item: step }: { item: RouteStep }) => {
//     return (
//       <View style={[styles.stepCard, step.completed && styles.stepCardCompleted]}>
//         <View style={styles.stepHeader}>
//           <Text style={styles.stepTitle}>{step.title}</Text>
//           {step.completed && (
//             <CheckCircle size={20} color="#10b981" strokeWidth={2} />
//           )}
//         </View>
//         <Text style={styles.stepDescription}>{step.description}</Text>
//         <View style={styles.stepDetails}>
//           <View style={styles.stepDetailItem}>
//             <Timer size={12} color="#6366f1" strokeWidth={2} />
//             <Text style={styles.stepDetailText}>{formatDuration(step.duration)}</Text>
//           </View>
//           <View style={styles.stepDetailItem}>
//             <MapPin size={12} color="#6366f1" strokeWidth={2} />
//             <Text style={styles.stepDetailText}>{step.location}</Text>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Ultra Modern Header */}
//       <LinearGradient
//         colors={['#667eea', '#764ba2']}
//         style={styles.header}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View style={styles.headerContent}>
//           <View style={styles.headerLeft}>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.headerTitle}>
//                 Tổng quát lịch thuê
//               </Text>

//             </View>
//           </View>
//           <View style={styles.headerRight}>
//             <TouchableOpacity
//               style={styles.createRouteButton}
//               onPress={() => setShowRouteCreator(true)}
//             >
//               <Map size={18} color="#ffffff" strokeWidth={2} />
//               <Text style={styles.createRouteButtonText}>
//                 Tạo lộ trình
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//         <View style={styles.headerCurve} />
//       </LinearGradient>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Calendar */}
//         <View style={styles.calendarContainer}>
//           <Calendar
//             current={new Date().toISOString().split('T')[0]}
//             onDayPress={(day) => setSelectedDate(day.dateString)}
//             markedDates={getMarkedDates()}
//             theme={{
//               todayTextColor: '#6366f1',
//               selectedDayBackgroundColor: '#6366f1',
//               selectedDayTextColor: '#ffffff',
//               arrowColor: '#6366f1',
//               monthTextColor: '#1e293b',
//               textDayFontWeight: '500',
//               textMonthFontWeight: '700',
//               textDayHeaderFontWeight: '600',
//             }}
//             style={styles.calendar}
//           />
//         </View>

//         {/* Modern Status Filter Tabs */}
//         <View style={styles.tabsContainer}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.tabsScrollContent}
//           >
//             <TouchableOpacity
//               style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
//               onPress={() => setSelectedTab('all')}
//             >
//               <View style={styles.tabContent}>
//                 <CalendarDays size={16} color={selectedTab === 'all' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
//                 <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
//                   Tất cả
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.tab, selectedTab === 'requested' && styles.activeTab]}
//               onPress={() => setSelectedTab('requested')}
//             >
//               <View style={styles.tabContent}>
//                 <Clock size={16} color={selectedTab === 'requested' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
//                 <Text style={[styles.tabText, selectedTab === 'requested' && styles.activeTabText]}>
//                   Yêu cầu
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.tab, selectedTab === 'pending_confirmation' && styles.activeTab]}
//               onPress={() => setSelectedTab('pending_confirmation')}
//             >
//               <View style={styles.tabContent}>
//                 <AlertCircle size={16} color={selectedTab === 'pending_confirmation' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
//                 <Text style={[styles.tabText, selectedTab === 'pending_confirmation' && styles.activeTabText]}>
//                   Đợi xác nhận
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.tab, selectedTab === 'in_progress' && styles.activeTab]}
//               onPress={() => setSelectedTab('in_progress')}
//             >
//               <View style={styles.tabContent}>
//                 <CheckCircle size={16} color={selectedTab === 'in_progress' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
//                 <Text style={[styles.tabText, selectedTab === 'in_progress' && styles.activeTabText]}>
//                   Đang thực hiện
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
//               onPress={() => setSelectedTab('completed')}
//             >
//               <View style={styles.tabContent}>
//                 <Check size={16} color={selectedTab === 'completed' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
//                 <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
//                   Hoàn thành
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           </ScrollView>
//         </View>

//         {/* Bookings for selected date */}
//         {selectedDate && (
//           <View style={styles.bookingsSection}>
//             <Text style={styles.sectionTitle}>
//               Lịch học ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
//             </Text>
//             <FlatList
//               data={getBookingsForDate(selectedDate)}
//               renderItem={renderBookingCard}
//               keyExtractor={item => item.id}
//               scrollEnabled={false}
//               ListEmptyComponent={
//                 <View style={styles.emptyContainer}>
//                   <CalendarDays size={48} color="#cbd5e1" strokeWidth={1} />
//                   <Text style={styles.emptyTitle}>Không có lịch học</Text>
//                   <Text style={styles.emptyDescription}>
//                     Bạn chưa có lịch học nào trong ngày này
//                   </Text>
//                 </View>
//               }
//             />
//           </View>
//         )}

//         {/* All upcoming bookings */}
//         <View style={styles.bookingsSection}>
//           <Text style={styles.sectionTitle}>
//             Lịch dạy của tôi
//           </Text>
//           <FlatList
//             data={getFilteredBookings()}
//             renderItem={renderBookingCard}
//             keyExtractor={item => item.id}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <View style={styles.emptyContainer}>
//                 <Clock size={48} color="#cbd5e1" strokeWidth={1} />
//                 <Text style={styles.emptyTitle}>
//                   {selectedTab === 'all' ? 'Chưa có lịch dạy nào' :
//                     selectedTab === 'requested' ? 'Chưa có yêu cầu nào' :
//                       selectedTab === 'pending_confirmation' ? 'Chưa có lịch chờ xác nhận' :
//                         selectedTab === 'in_progress' ? 'Chưa có lịch đang thực hiện' :
//                           'Chưa có lịch hoàn thành'
//                   }
//                 </Text>
//                 <Text style={styles.emptyDescription}>
//                   Học viên sẽ gửi yêu cầu đặt lịch cho bạn
//                 </Text>
//               </View>
//             }
//           />
//         </View>

//       </ScrollView>

//       {/* Booking Detail Modal */}
//       <Modal
//         visible={showBookingDetail}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowBookingDetail(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Chi tiết lịch học</Text>
//               <TouchableOpacity onPress={() => setShowBookingDetail(false)}>
//                 <X size={24} color="#64748b" strokeWidth={2} />
//               </TouchableOpacity>
//             </View>

//             {selectedBooking && (
//               <ScrollView style={styles.modalBody}>
//                 <View style={styles.bookingDetailCard}>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Ngày học:</Text>
//                     <Text style={styles.detailValue}>
//                       {new Date(selectedBooking.date).toLocaleDateString('vi-VN')}
//                     </Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Giờ học:</Text>
//                     <Text style={styles.detailValue}>{selectedBooking.time}</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Thời lượng:</Text>
//                     <Text style={styles.detailValue}>{formatDuration(selectedBooking.duration)}</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Giảng viên:</Text>
//                     <Text style={styles.detailValue}>{selectedBooking.instructorName}</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Xe học:</Text>
//                     <Text style={styles.detailValue}>{selectedBooking.vehicleType}</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Địa điểm đón:</Text>
//                     <Text style={styles.detailValue}>{selectedBooking.pickupLocation}</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Gói học:</Text>
//                     <Text style={styles.detailValue}>
//                       {packageColors[selectedBooking.packageType].label}
//                     </Text>
//                   </View>
//                 </View>

//                 {selectedBooking.learningRoute && (
//                   <TouchableOpacity
//                     style={styles.routeButton}
//                     onPress={handleViewRoute}
//                   >
//                     <Route size={20} color="#6366f1" strokeWidth={2} />
//                     <Text style={styles.routeButtonText}>Xem lộ trình học</Text>
//                     <ChevronRight size={16} color="#6366f1" strokeWidth={2} />
//                   </TouchableOpacity>
//                 )}
//               </ScrollView>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Learning Route Modal */}
//       <Modal
//         visible={showRouteModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowRouteModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Lộ trình học</Text>
//               <TouchableOpacity onPress={() => setShowRouteModal(false)}>
//                 <X size={24} color="#64748b" strokeWidth={2} />
//               </TouchableOpacity>
//             </View>

//             {selectedBooking?.learningRoute && (
//               <ScrollView style={styles.modalBody}>
//                 <View style={styles.routeInfoContainer}>
//                   <Text style={styles.routeTitle}>{selectedBooking.learningRoute.title}</Text>
//                   <Text style={styles.routeDescription}>{selectedBooking.learningRoute.description}</Text>

//                   <View style={styles.progressContainer}>
//                     <Text style={styles.progressLabel}>Tiến độ học tập</Text>
//                     <View style={styles.progressBar}>
//                       <View
//                         style={[
//                           styles.progressFill,
//                           { width: `${selectedBooking.learningRoute.progress}%` }
//                         ]}
//                       />
//                     </View>
//                     <Text style={styles.progressText}>{selectedBooking.learningRoute.progress}%</Text>
//                   </View>
//                 </View>

//                 <Text style={styles.stepsTitle}>Các bước học</Text>
//                 <FlatList
//                   data={selectedBooking.learningRoute.steps}
//                   renderItem={renderRouteStep}
//                   keyExtractor={item => item.id}
//                   scrollEnabled={false}
//                 />
//               </ScrollView>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Route Creator Modal */}
//       <Modal
//         visible={showRouteCreator}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowRouteCreator(false)}
//       >
//         <View style={styles.routeCreatorContainer}>
//           <View style={styles.routeCreatorHeader}>
//             <View style={styles.routeCreatorTitle}>
//               <Map size={24} color="#6366f1" strokeWidth={2} />
//               <View style={styles.routeCreatorTitleContainer}>
//                 <Text style={styles.routeCreatorTitleText}>
//                   Tạo lộ trình học
//                 </Text>
//                 {currentBookingId && (
//                   <Text style={styles.routeCreatorSubtitle}>
//                     Cho booking #{currentBookingId}
//                   </Text>
//                 )}
//               </View>
//             </View>
//             <TouchableOpacity onPress={() => setShowRouteCreator(false)}>
//               <X size={24} color="#64748b" strokeWidth={2} />
//             </TouchableOpacity>
//           </View>

//           <MapView
//             provider={PROVIDER_GOOGLE}
//             style={styles.map}
//             region={mapRegion}
//             onRegionChangeComplete={setMapRegion}
//             onPress={handleMapPress}
//           >
//             {/* Render map points */}
//             {mapPoints.map((point, index) => (
//               <Marker
//                 key={point.id}
//                 coordinate={point.coordinate}
//                 title={point.title}
//                 description={point.description}
//                 pinColor={
//                   point.type === 'start' ? '#10b981' :
//                     point.type === 'end' ? '#ef4444' : '#f59e0b'
//                 }
//               />
//             ))}

//             {/* Render route segments - DISABLED */}
//             {/* {routeSegments.map((segment) => (
//               <Polyline
//                 key={segment.id}
//                 coordinates={segment.coordinates}
//                 strokeColor={
//                   segment.difficulty === 'easy' ? '#10b981' :
//                     segment.difficulty === 'medium' ? '#f59e0b' : '#ef4444'
//                 }
//                 strokeWidth={4}
//               />
//             ))} */}
//           </MapView>

//           {/* Route creation controls */}
//           <View style={styles.routeControls}>
//             <View style={styles.routeInfo}>
//               <Text style={styles.routeInfoText}>
//                 {isCreatingRoute ? 'Nhấn vào bản đồ để thêm điểm trung gian' : 'Lộ trình đã tạo'}
//               </Text>
//               <Text style={styles.routeStats}>
//                 {mapPoints.length} điểm đã chọn
//               </Text>
//               {/* Distance info disabled since no polylines */}
//               {/* {routeSegments.length > 0 && (
//                 <Text style={styles.routeDistance}>
//                   Tổng khoảng cách: {(routeSegments.reduce((total, segment) => total + segment.distance, 0) / 1000).toFixed(1)} km
//                 </Text>
//               )} */}
//             </View>

//             <View style={styles.controlButtons}>
//               {(
//                 !isCreatingRoute ? (
//                   <TouchableOpacity
//                     style={styles.startButton}
//                     onPress={startRouteCreation}
//                   >
//                     <Plus size={20} color="#ffffff" strokeWidth={2} />
//                     <Text style={styles.startButtonText}>Bắt đầu tạo</Text>
//                   </TouchableOpacity>
//                 ) : (
//                   <>
//                     <TouchableOpacity
//                       style={styles.addressButton}
//                       onPress={() => setShowAddressInput(true)}
//                     >
//                       <MapPin size={18} color="#6366f1" strokeWidth={2} />
//                       <Text style={styles.addressButtonText}>Nhập địa chỉ</Text>
//                     </TouchableOpacity>
//                     {mapPoints.length >= 2 && (
//                       <TouchableOpacity
//                         style={styles.endPointButton}
//                         onPress={markLastPointAsEnd}
//                       >
//                         <Target size={18} color="#ef4444" strokeWidth={2} />
//                         <Text style={styles.endPointButtonText}>Điểm cuối</Text>
//                       </TouchableOpacity>
//                     )}
//                     <TouchableOpacity
//                       style={styles.clearButton}
//                       onPress={clearRoute}
//                     >
//                       <Trash2 size={18} color="#ef4444" strokeWidth={2} />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={styles.finishButton}
//                       onPress={finishRouteCreation}
//                     >
//                       <CheckCircle size={18} color="#ffffff" strokeWidth={2} />
//                       <Text style={styles.finishButtonText}>Hoàn thành</Text>
//                     </TouchableOpacity>
//                   </>
//                 )
//               )}
//             </View>
//           </View>

//           {/* Points list */}
//           {mapPoints.length > 0 && (
//             <View style={styles.pointsList}>
//               <Text style={styles.pointsListTitle}>Các điểm đã chọn:</Text>
//               <FlatList
//                 data={mapPoints}
//                 horizontal
//                 renderItem={({ item: point, index }) => (
//                   <View style={styles.pointItem}>
//                     <View style={[
//                       styles.pointMarker,
//                       {
//                         backgroundColor:
//                           point.type === 'start' ? '#10b981' :
//                             point.type === 'end' ? '#ef4444' : '#f59e0b'
//                       }
//                     ]}>
//                       <Text style={styles.pointNumber}>{index + 1}</Text>
//                     </View>
//                     <Text style={styles.pointTitle}>{point.title}</Text>
//                     <TouchableOpacity
//                       style={styles.removePointButton}
//                       onPress={() => removePoint(point.id)}
//                     >
//                       <X size={14} color="#ef4444" strokeWidth={2} />
//                     </TouchableOpacity>
//                   </View>
//                 )}
//                 keyExtractor={item => item.id}
//                 showsHorizontalScrollIndicator={false}
//               />
//             </View>
//           )}
//         </View>
//       </Modal>

//       {/* Address Input Modal */}
//       <Modal
//         visible={showAddressInput}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowAddressInput(false)}
//       >
//         <View style={styles.addressModalOverlay}>
//           <View style={styles.addressModalContent}>
//             <View style={styles.addressModalHeader}>
//               <Text style={styles.addressModalTitle}>Nhập địa chỉ</Text>
//               <TouchableOpacity onPress={() => setShowAddressInput(false)}>
//                 <X size={24} color="#64748b" strokeWidth={2} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.addressInputContainer}>
//               <MapPin size={20} color="#6366f1" strokeWidth={2} />
//               <TextInput
//                 style={styles.addressTextInput}
//                 placeholder="Nhập địa chỉ (VD: Bến Thành, Bitexco, Quận 1...)"
//                 value={addressInput}
//                 onChangeText={setAddressInput}
//                 autoFocus
//                 multiline
//               />
//             </View>

//             <View style={styles.addressModalButtons}>
//               <TouchableOpacity
//                 style={styles.addressCancelButton}
//                 onPress={() => setShowAddressInput(false)}
//               >
//                 <Text style={styles.addressCancelButtonText}>Hủy</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.addressConfirmButton}
//                 onPress={handleAddAddress}
//               >
//                 <Text style={styles.addressConfirmButtonText}>Thêm điểm</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Route Details Modal with Google Maps */}
//       <Modal
//         visible={showRouteDetailsModal}
//         animationType="slide"
//         presentationStyle="pageSheet"
//         onRequestClose={() => setShowRouteDetailsModal(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalHeader}>
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={() => setShowRouteDetailsModal(false)}
//             >
//               <Text style={styles.modalCloseText}>✕</Text>
//             </TouchableOpacity>
//             <Text style={styles.modalTitle}>Chi tiết lộ trình</Text>
//             <View style={styles.modalRight} />
//           </View>

//           {selectedRoute && (
//             <ScrollView style={styles.modalContent}>
//               {/* Route Info */}
//               <View style={styles.routeInfoCard}>
//                 <Text style={styles.routeInfoTitle}>Thông tin lộ trình</Text>
//                 <View style={styles.routeInfoRow}>
//                   <Text style={styles.routeInfoLabel}>Trạng thái:</Text>
//                   <Text style={[
//                     styles.routeInfoValue,
//                     { color: getStatusColor(selectedRoute.status) }
//                   ]}>
//                     {getStatusText(selectedRoute.status)}
//                   </Text>
//                 </View>
//                 {selectedRoute.notes && (
//                   <View style={styles.routeInfoRow}>
//                     <Text style={styles.routeInfoLabel}>Ghi chú:</Text>
//                     <Text style={styles.routeInfoValue}>{selectedRoute.notes}</Text>
//                   </View>
//                 )}
//               </View>

//               {/* Route Points */}
//               <View style={styles.routePointsCard}>
//                 <Text style={styles.routePointsTitle}>Các điểm dừng</Text>
//                 {selectedRoute.points.map((point, index) => (
//                   <View key={point.id} style={styles.routePointItem}>
//                     <View style={styles.routePointNumber}>
//                       {point.isStart ? (
//                         <Text style={styles.routePointStartText}>Bắt đầu</Text>
//                       ) : point.isEnd ? (
//                         <Text style={styles.routePointEndText}>Kết thúc</Text>
//                       ) : (
//                         <Text style={styles.routePointNumberText}>{index}</Text>
//                       )}
//                     </View>
//                     <Text style={styles.routePointAddress}>{point.address}</Text>
//                   </View>
//                 ))}
//               </View>

//               {/* Google Maps */}
//               <View style={styles.mapContainer}>
//                 <Text style={styles.mapTitle}>Bản đồ lộ trình</Text>
//                 <MapView
//                   style={styles.map}
//                   initialRegion={{
//                     latitude: selectedRoute.points[0].coordinates.latitude,
//                     longitude: selectedRoute.points[0].coordinates.longitude,
//                     latitudeDelta: 0.05,
//                     longitudeDelta: 0.05,
//                   }}
//                 >
//                   {selectedRoute.points.map((point, index) => (
//                     <Marker
//                       key={point.id}
//                       coordinate={point.coordinates}
//                       title={point.isStart ? 'Bắt đầu' : point.isEnd ? 'Kết thúc' : `Điểm ${index}`}
//                       description={point.address}
//                     >
//                       <View style={[
//                         styles.markerContainer,
//                         point.isStart && styles.startMarker,
//                         point.isEnd && styles.endMarker,
//                         !point.isStart && !point.isEnd && styles.waypointMarker
//                       ]}>
//                         <Text style={styles.markerText}>
//                           {point.isStart ? 'B' : point.isEnd ? 'K' : index}
//                         </Text>
//                       </View>
//                     </Marker>
//                   ))}

//                   {/* Route Line - DISABLED */}
//                   {/* <Polyline
//                     coordinates={selectedRoute.points.map(point => point.coordinates)}
//                     strokeColor="#3b82f6"
//                     strokeWidth={3}
//                     lineDashPattern={[5, 5]}
//                   /> */}
//                 </MapView>
//               </View>

//               {/* Action Buttons */}
//               <View style={styles.modalActions}>
//                 <TouchableOpacity
//                   style={styles.modalEditButton}
//                   onPress={() => {
//                     setShowRouteDetailsModal(false);
//                     handleEditRoute(selectedRoute.id);
//                   }}
//                 >
//                   <Edit3 size={20} color="#3b82f6" strokeWidth={2} />
//                   <Text style={styles.modalEditText}>Chỉnh sửa lộ trình</Text>
//                 </TouchableOpacity>

//                 {selectedRoute.status === 'draft' && (
//                   <TouchableOpacity
//                     style={styles.modalSendButton}
//                     onPress={() => {
//                       setShowRouteDetailsModal(false);
//                       handleSendRoute(selectedRoute.bookingId);
//                     }}
//                   >
//                     <LinearGradient
//                       colors={['#3b82f6', '#2563eb']}
//                       style={styles.modalSendGradient}
//                     >
//                       <Send size={20} color="#ffffff" strokeWidth={2} />
//                       <Text style={styles.modalSendText}>Gửi lộ trình</Text>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </ScrollView>
//           )}
//         </View>
//       </Modal>

//       {/* Cancel Booking Modal for Instructor */}
//       <Modal
//         visible={showCancelModal}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setShowCancelModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <LinearGradient
//               colors={['#ffffff', '#f8fafc']}
//               style={styles.modalContent}
//             >
//               <View style={styles.modalHeader}>
//                 <View style={styles.modalIconContainer}>
//                   <AlertTriangle size={24} color="#f59e0b" strokeWidth={2} />
//                 </View>
//                 <Text style={styles.modalTitle}>Hủy lịch dạy</Text>
//                 <TouchableOpacity
//                   style={styles.modalCloseButton}
//                   onPress={() => setShowCancelModal(false)}
//                 >
//                   <X size={20} color="#6b7280" strokeWidth={2} />
//                 </TouchableOpacity>
//               </View>

//               {selectedBooking && cancelRefundInfo && (
//                 <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
//                   <View style={styles.bookingInfoSection}>
//                     <Text style={styles.sectionTitle}>Thông tin lịch dạy</Text>
//                     <View style={styles.bookingInfoCard}>
//                       <View style={styles.infoRow}>
//                         <User size={16} color="#6b7280" strokeWidth={2} />
//                         <Text style={styles.infoLabel}>Học viên:</Text>
//                         <Text style={styles.infoValue}>{selectedBooking.studentName}</Text>
//                       </View>
//                       <View style={styles.infoRow}>
//                         <CalendarDays size={16} color="#6b7280" strokeWidth={2} />
//                         <Text style={styles.infoLabel}>Ngày:</Text>
//                         <Text style={styles.infoValue}>{selectedBooking.date}</Text>
//                       </View>
//                       <View style={styles.infoRow}>
//                         <Clock size={16} color="#6b7280" strokeWidth={2} />
//                         <Text style={styles.infoLabel}>Giờ:</Text>
//                         <Text style={styles.infoValue}>{selectedBooking.time}</Text>
//                       </View>
//                       <View style={styles.infoRow}>
//                         <DollarSign size={16} color="#6b7280" strokeWidth={2} />
//                         <Text style={styles.infoLabel}>Giá:</Text>
//                         <Text style={styles.infoValue}>{selectedBooking.coins || selectedBooking.price} xu</Text>
//                       </View>
//                     </View>
//                   </View>

//                   <View style={styles.refundInfoSection}>
//                     <Text style={styles.sectionTitle}>Chi tiết penalty & hoàn tiền</Text>
//                     <View style={styles.refundCard}>
//                       <View style={styles.timeInfoRow}>
//                         <Info size={16} color="#3b82f6" strokeWidth={2} />
//                         <Text style={styles.timeInfoText}>
//                           Còn {Math.round(cancelRefundInfo.hoursUntilSession)} giờ đến buổi dạy
//                         </Text>
//                       </View>

//                       <View style={styles.refundRow}>
//                         <Text style={styles.refundLabel}>Học viên nhận hoàn lại:</Text>
//                         <Text style={[styles.refundValue, { color: '#10b981' }]}>
//                           {cancelRefundInfo.refundAmount.toLocaleString()} xu (100%)
//                         </Text>
//                       </View>

//                       <View style={styles.refundRow}>
//                         <Text style={styles.refundLabel}>Phí penalty của bạn:</Text>
//                         <Text style={[styles.refundValue, { color: '#ef4444' }]}>
//                           -{cancelRefundInfo.penaltyAmount.toLocaleString()} xu
//                         </Text>
//                       </View>

//                       <View style={styles.refundRow}>
//                         <Text style={styles.refundLabel}>Bạn nhận được:</Text>
//                         <Text style={[styles.refundValue, styles.refundAmount]}>
//                           {cancelRefundInfo.instructorCompensation.toLocaleString()} xu
//                         </Text>
//                       </View>

//                       <View style={styles.refundRow}>
//                         <Text style={styles.refundLabel}>Phí hệ thống:</Text>
//                         <Text style={styles.refundValue}>
//                           {cancelRefundInfo.systemFee.toLocaleString()} xu
//                         </Text>
//                       </View>

//                       {selectedBooking.isMultiSession && (
//                         <View style={styles.multiSessionInfo}>
//                           <Text style={styles.multiSessionTitle}>📅 Gói nhiều buổi</Text>
//                           <Text style={styles.multiSessionText}>
//                             Penalty tính theo từng buổi học còn lại
//                           </Text>
//                         </View>
//                       )}
//                     </View>
//                   </View>

//                   <View style={styles.warningSection}>
//                     <View style={styles.warningCard}>
//                       <AlertTriangle size={20} color="#f59e0b" strokeWidth={2} />
//                       <View style={styles.warningContent}>
//                         <Text style={styles.warningTitle}>Lưu ý quan trọng</Text>
//                         <Text style={styles.warningText}>
//                           • Hành động này không thể hoàn tác{'\n'}
//                           • Học viên sẽ nhận thông báo ngay lập tức{'\n'}
//                           • Tiền sẽ được xử lý trong 5-10 phút{'\n'}
//                           {cancelRefundInfo.hoursUntilSession < 24 && '• Hủy muộn có thể ảnh hưởng đến uy tín instructor'}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 </ScrollView>
//               )}

//               <View style={styles.modalActions}>
//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.cancelModalButton]}
//                   onPress={() => setShowCancelModal(false)}
//                 >
//                   <Text style={styles.cancelModalButtonText}>Đóng</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.modalButton, styles.confirmModalButton]}
//                   onPress={confirmInstructorCancelBooking}
//                 >
//                   <Text style={styles.confirmModalButtonText}>Xác nhận hủy</Text>
//                 </TouchableOpacity>
//               </View>
//             </LinearGradient>
//           </View>
//         </View>
//       </Modal>

//       {/* Confirmation Modal for Instructor */}
//       <Modal
//         visible={showConfirmModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowConfirmModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.confirmModalContainer}>
//             <LinearGradient
//               colors={['#ffffff', '#f8fafc']}
//               style={styles.confirmModalContent}
//             >
//               <View style={styles.confirmIconContainer}>
//                 <XCircle size={48} color="#ef4444" strokeWidth={2} />
//               </View>
//               <Text style={styles.confirmTitle}>Xác nhận hủy lịch dạy?</Text>
//               <Text style={styles.confirmMessage}>
//                 Bạn có chắc chắn muốn hủy lịch dạy này không?{'\n'}
//                 Hành động này không thể hoàn tác.
//               </Text>

//               {cancelRefundInfo && (
//                 <View style={styles.confirmRefundInfo}>
//                   <Text style={styles.confirmRefundText}>
//                     ⚠️ Penalty: {cancelRefundInfo.penaltyAmount.toLocaleString()} xu{'\n'}
//                     💵 Bạn nhận: {cancelRefundInfo.instructorCompensation.toLocaleString()} xu
//                   </Text>
//                 </View>
//               )}

//               <View style={styles.confirmActions}>
//                 <TouchableOpacity
//                   style={[styles.confirmButton, styles.confirmCancelButton]}
//                   onPress={() => setShowConfirmModal(false)}
//                 >
//                   <Text style={styles.confirmCancelButtonText}>Không</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.confirmButton, styles.confirmDeleteButton]}
//                   onPress={executeInstructorCancelBooking}
//                 >
//                   <Text style={styles.confirmDeleteButtonText}>Có, hủy lịch</Text>
//                 </TouchableOpacity>
//               </View>
//             </LinearGradient>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f1f5f9',
//   },
//   header: {
//     paddingTop: 50,
//     paddingBottom: 30,
//     paddingHorizontal: 20,
//     position: 'relative',
//     borderBottomLeftRadius: 32,
//     borderBottomRightRadius: 32,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   headerIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//     flex: 1,
//   },
//   headerTextContainer: {
//     flex: 1,
//   },
//   createRouteButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 16,
//     gap: 4,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   createRouteButtonText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#ffffff',
//     marginBottom: 2,
//   },
//   headerSubtitle: {
//     fontSize: 12,
//     color: 'rgba(255, 255, 255, 0.7)',
//     fontWeight: '500',
//   },
//   headerCurve: {
//     position: 'absolute',
//     bottom: -20,
//     left: 0,
//     right: 0,
//     height: 40,
//     backgroundColor: '#f1f5f9',
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   content: {
//     flex: 1,
//   },
//   calendarContainer: {
//     backgroundColor: '#ffffff',
//     margin: 16,
//     borderRadius: 16,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   calendar: {
//     borderRadius: 12,
//   },
//   bookingsSection: {
//     paddingHorizontal: 16,
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1e293b',
//     marginBottom: 12,
//   },
//   bookingCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   bookingHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   timeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   timeText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#6366f1',
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   bookingContent: {
//     gap: 12,
//   },
//   instructorInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   instructorAvatar: {
//     fontSize: 32,
//   },
//   instructorDetails: {
//     flex: 1,
//   },
//   instructorName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1e293b',
//     marginBottom: 4,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   ratingText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#64748b',
//   },
//   bookingInfo: {
//     gap: 8,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   infoText: {
//     fontSize: 14,
//     color: '#64748b',
//     flex: 1,
//   },
//   bookingFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   packageBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   packageText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//   },
//   emptyTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#64748b',
//     marginTop: 12,
//     marginBottom: 6,
//   },
//   emptyDescription: {
//     fontSize: 14,
//     color: '#94a3b8',
//     textAlign: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#ffffff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 24,
//     paddingVertical: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1e293b',
//   },
//   modalBody: {
//     paddingHorizontal: 24,
//     paddingVertical: 20,
//   },
//   bookingDetailCard: {
//     backgroundColor: '#f8fafc',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//   },
//   detailLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#64748b',
//   },
//   detailValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1e293b',
//     flex: 1,
//     textAlign: 'right',
//   },
//   routeButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#f0f9ff',
//     borderRadius: 12,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#e0f2fe',
//   },
//   routeButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#6366f1',
//     flex: 1,
//     marginLeft: 12,
//   },
//   routeInfoContainer: {
//     marginBottom: 24,
//   },
//   routeTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1e293b',
//     marginBottom: 8,
//   },
//   routeDescription: {
//     fontSize: 14,
//     color: '#64748b',
//     lineHeight: 20,
//     marginBottom: 16,
//   },
//   progressContainer: {
//     marginBottom: 16,
//   },
//   progressLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 8,
//   },
//   progressBar: {
//     height: 8,
//     backgroundColor: '#e2e8f0',
//     borderRadius: 4,
//     marginBottom: 8,
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: '#10b981',
//     borderRadius: 4,
//   },
//   progressText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#10b981',
//     textAlign: 'right',
//   },
//   stepsTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1e293b',
//     marginBottom: 12,
//   },
//   stepCard: {
//     backgroundColor: '#f8fafc',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   stepCardCompleted: {
//     backgroundColor: '#f0fdf4',
//     borderColor: '#10b981',
//   },
//   stepHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   stepTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1e293b',
//     flex: 1,
//   },
//   stepDescription: {
//     fontSize: 14,
//     color: '#64748b',
//     lineHeight: 18,
//     marginBottom: 12,
//   },
//   stepDetails: {
//     flexDirection: 'row',
//     gap: 16,
//   },
//   stepDetailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   stepDetailText: {
//     fontSize: 12,
//     color: '#6366f1',
//     fontWeight: '500',
//   },
//   // Route Creator Styles
//   routeCreatorContainer: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   routeCreatorHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     paddingTop: 50,
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//   },
//   routeCreatorTitle: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   routeCreatorTitleContainer: {
//     flex: 1,
//   },
//   routeCreatorTitleText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1e293b',
//   },
//   routeCreatorSubtitle: {
//     fontSize: 12,
//     color: '#64748b',
//     marginTop: 2,
//   },
//   map: {
//     flex: 1,
//   },
//   routeControls: {
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#e2e8f0',
//   },
//   routeInfo: {
//     marginBottom: 16,
//   },
//   routeInfoText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1e293b',
//     marginBottom: 4,
//   },
//   routeStats: {
//     fontSize: 14,
//     color: '#64748b',
//   },
//   routeDistance: {
//     fontSize: 12,
//     color: '#6366f1',
//     fontWeight: '600',
//     marginTop: 4,
//   },
//   controlButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   startButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#6366f1',
//     paddingVertical: 12,
//     borderRadius: 12,
//     gap: 8,
//   },
//   startButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   clearButton: {
//     width: 48,
//     height: 48,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fef2f2',
//     borderRadius: 12,
//   },
//   finishButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#10b981',
//     paddingVertical: 12,
//     borderRadius: 12,
//     gap: 8,
//   },
//   finishButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   viewButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#6366f1',
//     paddingVertical: 12,
//     borderRadius: 12,
//     gap: 8,
//   },
//   viewButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   pointsList: {
//     backgroundColor: '#f8fafc',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#e2e8f0',
//   },
//   pointsListTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 12,
//   },
//   pointItem: {
//     alignItems: 'center',
//     marginRight: 16,
//     minWidth: 80,
//   },
//   pointMarker: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   pointNumber: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#ffffff',
//   },
//   pointTitle: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#374151',
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   removePointButton: {
//     width: 20,
//     height: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fef2f2',
//     borderRadius: 10,
//   },
//   // Address Input Styles
//   addressButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f9ff',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0f2fe',
//     gap: 6,
//   },
//   addressButtonText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#6366f1',
//   },
//   addressModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   addressModalContent: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     padding: 24,
//     width: '100%',
//     maxWidth: 400,
//   },
//   addressModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   addressModalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1e293b',
//   },
//   addressInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#f8fafc',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     gap: 12,
//   },
//   addressTextInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#1e293b',
//     minHeight: 40,
//     textAlignVertical: 'top',
//   },
//   addressModalButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   addressCancelButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     backgroundColor: '#f1f5f9',
//     alignItems: 'center',
//   },
//   addressCancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#64748b',
//   },
//   addressConfirmButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     backgroundColor: '#6366f1',
//     alignItems: 'center',
//   },
//   addressConfirmButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   // Header styles
//   headerRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   // Removed role toggle styles
//   // Route Section Styles
//   routeSection: {
//     marginTop: 16,
//     padding: 16,
//     backgroundColor: '#f8fafc',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   routeHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   viewRouteButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: '#eff6ff',
//     borderRadius: 8,
//     gap: 4,
//   },
//   viewRouteText: {
//     fontSize: 12,
//     color: '#3b82f6',
//     fontWeight: '500',
//   },
//   routePoints: {
//     gap: 8,
//   },
//   routePoint: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   pointIndicator: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#e2e8f0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   startPoint: {
//     backgroundColor: '#10b981',
//   },
//   endPoint: {
//     backgroundColor: '#ef4444',
//   },
//   pointText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   pointAddress: {
//     flex: 1,
//     fontSize: 14,
//     color: '#4b5563',
//     lineHeight: 20,
//   },
//   // Action Buttons
//   actionButtons: {
//     marginTop: 16,
//   },
//   routeActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   createButton: {
//     flex: 1,
//     overflow: 'hidden',
//     borderRadius: 8,
//   },
//   createButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     gap: 6,
//   },
//   createButtonText: {
//     color: '#ffffff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   editButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     backgroundColor: '#eff6ff',
//     borderRadius: 8,
//     gap: 6,
//   },
//   editButtonText: {
//     color: '#3b82f6',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   sendButton: {
//     flex: 1,
//     overflow: 'hidden',
//     borderRadius: 8,
//   },
//   sendButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     gap: 6,
//   },
//   sendButtonText: {
//     color: '#ffffff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   // Modal Styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   modalCloseButton: {
//     width: 32,
//     height: 32,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f1f5f9',
//     borderRadius: 16,
//   },
//   modalCloseText: {
//     fontSize: 16,
//     color: '#64748b',
//     fontWeight: '600',
//   },
//   modalRight: {
//     width: 32,
//   },
//   // Route Info Card
//   routeInfoCard: {
//     backgroundColor: '#f8fafc',
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 16,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   routeInfoTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1e293b',
//     marginBottom: 12,
//   },
//   routeInfoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   routeInfoLabel: {
//     fontSize: 14,
//     color: '#6b7280',
//     fontWeight: '500',
//   },
//   routeInfoValue: {
//     fontSize: 14,
//     color: '#1e293b',
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'right',
//   },
//   // Route Points Card
//   routePointsCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 16,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   routePointsTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1e293b',
//     marginBottom: 12,
//   },
//   routePointItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 12,
//   },
//   routePointNumber: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#e2e8f0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   routePointStartText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#10b981',
//   },
//   routePointEndText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#ef4444',
//   },
//   routePointNumberText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#6b7280',
//   },
//   routePointAddress: {
//     flex: 1,
//     fontSize: 14,
//     color: '#4b5563',
//     lineHeight: 20,
//   },
//   // Map Container
//   mapContainer: {
//     marginTop: 16,
//     borderRadius: 12,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   mapTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1e293b',
//     marginBottom: 12,
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   // Markers
//   markerContainer: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   startMarker: {
//     backgroundColor: '#10b981',
//   },
//   endMarker: {
//     backgroundColor: '#ef4444',
//   },
//   waypointMarker: {
//     backgroundColor: '#3b82f6',
//   },
//   markerText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#ffffff',
//   },
//   // Modal Actions
//   modalActions: {
//     flexDirection: 'row',
//     gap: 12,
//     paddingVertical: 20,
//     paddingBottom: 40,
//   },
//   modalEditButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     backgroundColor: '#eff6ff',
//     borderRadius: 8,
//     gap: 8,
//   },
//   modalEditText: {
//     fontSize: 14,
//     color: '#3b82f6',
//     fontWeight: '600',
//   },
//   modalSendButton: {
//     flex: 1,
//     overflow: 'hidden',
//     borderRadius: 8,
//   },
//   modalSendGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     gap: 8,
//   },
//   modalSendText: {
//     fontSize: 14,
//     color: '#ffffff',
//     fontWeight: '600',
//   },
//   // Guide Section Styles
//   guideSection: {
//     backgroundColor: '#ffffff',
//     margin: 16,
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   guideTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1e293b',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   guideSteps: {
//     gap: 12,
//   },
//   guideStep: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   guideStepNumber: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#6366f1',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   guideStepNumberText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#ffffff',
//   },
//   guideStepText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#4b5563',
//     lineHeight: 20,
//   },
//   // Ultra Modern Tabs Container
//   tabsContainer: {
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 16,
//     marginTop: -20,
//     marginHorizontal: 16,
//     borderTopLeftRadius: 0,
//     borderTopRightRadius: 0,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 6,
//     zIndex: 1,
//   },
//   tabsScrollContent: {
//     paddingHorizontal: 4,
//     alignItems: 'center',
//   },
//   tab: {
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     marginRight: 6,
//     borderRadius: 20,
//     backgroundColor: '#f8fafc',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//     minWidth: 90,
//   },
//   activeTab: {
//     backgroundColor: '#667eea',
//     borderColor: '#667eea',
//     shadowColor: '#667eea',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   tabContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//   },
//   tabText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#6b7280',
//   },
//   activeTabText: {
//     color: '#ffffff',
//     fontWeight: '700',
//   },
//   // Cancel Button Styles
//   cancelButton: {
//     backgroundColor: '#ef4444',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginTop: 8,
//     shadowColor: '#ef4444',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   cancelButtonText: {
//     color: '#ffffff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   // Modal Styles for Cancel & Refund (only new styles not already existing)
//   modalIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#fef3c7',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   bookingInfoSection: {
//     marginBottom: 20,
//   },
//   bookingInfoCard: {
//     backgroundColor: '#f9fafb',
//     borderRadius: 12,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: '#6b7280',
//     fontWeight: '500',
//     minWidth: 80,
//   },
//   infoValue: {
//     fontSize: 14,
//     color: '#1f2937',
//     fontWeight: '600',
//     flex: 1,
//   },
//   refundInfoSection: {
//     marginBottom: 20,
//   },
//   refundCard: {
//     backgroundColor: '#f0f9ff',
//     borderRadius: 12,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#bfdbfe',
//   },
//   timeInfoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     gap: 8,
//     backgroundColor: '#dbeafe',
//     padding: 12,
//     borderRadius: 8,
//   },
//   timeInfoText: {
//     fontSize: 14,
//     color: '#1e40af',
//     fontWeight: '600',
//   },
//   refundRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   refundLabel: {
//     fontSize: 14,
//     color: '#374151',
//     fontWeight: '500',
//   },
//   refundValue: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#1f2937',
//   },
//   refundAmount: {
//     color: '#10b981',
//     fontSize: 16,
//   },
//   multiSessionInfo: {
//     marginTop: 12,
//     padding: 12,
//     backgroundColor: '#fef3c7',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#fbbf24',
//   },
//   multiSessionTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#92400e',
//     marginBottom: 4,
//   },
//   multiSessionText: {
//     fontSize: 12,
//     color: '#92400e',
//     fontStyle: 'italic',
//   },
//   warningSection: {
//     marginBottom: 20,
//   },
//   warningCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fef3c7',
//     borderRadius: 12,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#fbbf24',
//     gap: 12,
//   },
//   warningContent: {
//     flex: 1,
//   },
//   warningTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#92400e',
//     marginBottom: 8,
//   },
//   warningText: {
//     fontSize: 12,
//     color: '#92400e',
//     lineHeight: 18,
//   },
//   modalButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cancelModalButton: {
//     backgroundColor: '#f3f4f6',
//     borderWidth: 1,
//     borderColor: '#d1d5db',
//   },
//   cancelModalButtonText: {
//     color: '#374151',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   confirmModalButton: {
//     backgroundColor: '#ef4444',
//   },
//   confirmModalButtonText: {
//     color: '#ffffff',
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   // Confirmation Modal Styles
//   confirmModalContainer: {
//     width: '90%',
//     maxWidth: 400,
//     borderRadius: 20,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 20,
//   },
//   confirmModalContent: {
//     padding: 24,
//     alignItems: 'center',
//   },
//   confirmIconContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#fee2e2',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 20,
//   },
//   confirmTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1f2937',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   confirmMessage: {
//     fontSize: 14,
//     color: '#6b7280',
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   confirmRefundInfo: {
//     backgroundColor: '#fef3c7',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#fbbf24',
//   },
//   confirmRefundText: {
//     fontSize: 14,
//     color: '#92400e',
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   confirmActions: {
//     flexDirection: 'row',
//     gap: 12,
//     width: '100%',
//   },
//   confirmButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   confirmCancelButton: {
//     backgroundColor: '#f3f4f6',
//     borderWidth: 1,
//     borderColor: '#d1d5db',
//   },
//   confirmCancelButtonText: {
//     color: '#374151',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   confirmDeleteButton: {
//     backgroundColor: '#ef4444',
//   },
//   confirmDeleteButtonText: {
//     color: '#ffffff',
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   // End Point Button
//   endPointButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fef2f2',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 4,
//     borderWidth: 1,
//     borderColor: '#fecaca',
//   },
//   endPointButtonText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#ef4444',
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Car,
  Route,
  SquarePen,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";

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

export default function ScheduleScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("2025-10-26");
  const tabBarHeight = useBottomTabBarHeight();

  // Ensure selectedDate is always current date on mount
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;
    console.log("Setting selectedDate to:", todayString);
    setSelectedDate(todayString);
  }, []);

  // Sample data based on the images
  const bookings: BookingItem[] = [
    {
      id: "1",
      studentName: "Nguyễn Văn B",
      time: "8:00 - 12:00",
      date: "2025-01-15",
      status: "ongoing",
      route: "Chưa cài đặt lộ trình",
      vehicle: "KIA Carnival 2024",
      price: 800,
    },
    {
      id: "2",
      studentName: "Trần Thị C",
      time: "13:00 - 17:00",
      date: "2025-01-15",
      status: "completed",
      route: "Quận 9 - Quận 1",
      vehicle: "Không có",
      price: 800,
    },
    {
      id: "3",
      studentName: "Lê Văn D",
      time: "18:00 - 22:00",
      date: "2025-01-15",
      status: "cancelled",
      route: "Tân Hòa, quận 9 - Cống Quỳnh, quận 1",
      vehicle: "KIA Carnival 2024",
      price: 800,
    },
    {
      id: "4",
      studentName: "Phạm Thị E",
      time: "8:00 - 12:00",
      date: "2025-01-16",
      status: "ongoing",
      route: "Quận 7 - Quận 1",
      vehicle: "Toyota Vios",
      price: 600,
    },
    {
      id: "5",
      studentName: "Võ Văn F",
      time: "14:00 - 18:00",
      date: "2025-01-16",
      status: "completed",
      route: "Quận 2 - Quận 3",
      vehicle: "Honda City",
      price: 700,
    },
    {
      id: "6",
      studentName: "Nguyễn Thị G",
      time: "9:00 - 13:00",
      date: "2025-01-17",
      status: "ongoing",
      route: "Quận 4 - Quận 5",
      vehicle: "Mazda 3",
      price: 750,
    },
    // Add some bookings for today's date (26/10/2025) with different times
    {
      id: "7",
      studentName: "Hồ Văn H",
      time: "8:00 - 12:00",
      date: "2025-10-26",
      status: "ongoing",
      route: "Quận 1 - Quận 3",
      vehicle: "Hyundai Accent",
      price: 650,
    },
    {
      id: "8",
      studentName: "Đặng Thị I",
      time: "14:00 - 18:00",
      date: "2025-10-26",
      status: "completed",
      route: "Quận 2 - Quận 7",
      vehicle: "Ford Focus",
      price: 720,
    },
    {
      id: "9",
      studentName: "Lê Văn K",
      time: "6:00 - 10:00",
      date: "2025-10-26",
      status: "completed",
      route: "Quận 5 - Quận 8",
      vehicle: "Toyota Camry",
      price: 800,
    },
    {
      id: "10",
      studentName: "Phạm Thị L",
      time: "19:00 - 23:00",
      date: "2025-10-26",
      status: "ongoing",
      route: "Quận 10 - Quận 11",
      vehicle: "Honda Civic",
      price: 700,
    },
    // Add bookings for tomorrow (27/10/2025)
    {
      id: "13",
      studentName: "Võ Văn O",
      time: "9:00 - 13:00",
      date: "2025-10-27",
      status: "ongoing",
      route: "Quận 6 - Quận 9",
      vehicle: "Nissan Altima",
      price: 750,
    },
    {
      id: "14",
      studentName: "Bùi Thị P",
      time: "15:00 - 19:00",
      date: "2025-10-27",
      status: "completed",
      route: "Quận 12 - Quận Thủ Đức",
      vehicle: "KIA Sorento",
      price: 680,
    },
    // Add bookings for other days in October 2025
    {
      id: "15",
      studentName: "Đỗ Văn Q",
      time: "10:00 - 14:00",
      date: "2025-10-28",
      status: "ongoing",
      route: "Quận 1 - Quận 4",
      vehicle: "Toyota Innova",
      price: 850,
    },
    {
      id: "16",
      studentName: "Hoàng Thị R",
      time: "16:00 - 20:00",
      date: "2025-10-29",
      status: "completed",
      route: "Quận 7 - Quận 8",
      vehicle: "Honda CR-V",
      price: 900,
    },
    // Add more bookings for 2025-01-15 to test sorting
    {
      id: "11",
      studentName: "Trần Văn M",
      time: "6:00 - 10:00",
      date: "2025-01-15",
      status: "completed",
      route: "Quận 1 - Quận 2",
      vehicle: "Mazda CX-5",
      price: 900,
    },
    {
      id: "12",
      studentName: "Nguyễn Thị N",
      time: "20:00 - 24:00",
      date: "2025-01-15",
      status: "ongoing",
      route: "Quận 3 - Quận 4",
      vehicle: "Hyundai Tucson",
      price: 850,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "#10b981";
      case "completed":
        return "#3b82f6";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ongoing":
        return "Đang diễn ra";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Chưa xác định";
    }
  };

  const getBookingsForSelectedDate = () => {
    console.log("getBookingsForSelectedDate - selectedDate:", selectedDate);
    const filteredBookings = bookings
      .filter((booking) => booking.date === selectedDate)
      .sort((a, b) => {
        // Extract time from "8:00 - 12:00" format and compare
        const getStartTime = (timeStr: string) => {
          const startTime = timeStr.split(" - ")[0];
          const [hours, minutes] = startTime.split(":").map(Number);
          return hours * 60 + minutes; // Convert to minutes for comparison
        };

        return getStartTime(a.time) - getStartTime(b.time);
      });
    return filteredBookings;
  };

  const formatSelectedDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    console.log("Input dateString test:", dateString);
    console.log("Parsed date:", date);
    console.log(
      "Formatted date:",
      date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    );

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderCalendar = () => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Calculate start date of calendar grid (Monday of the week containing first day)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const days = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Header with day names
    const headerDays = dayNames.map((day) => (
      <View key={day} style={styles.dayHeader}>
        <Text style={styles.dayHeaderText}>{day}</Text>
      </View>
    ));

    // Generate calendar days
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const dayNum = String(currentDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${dayNum}`;

        const isCurrent = currentDate.getMonth() === current.getMonth();
        const isSelected = dateString === selectedDate;
        const dayNumber = currentDate.getDate();

        // Check if this date has bookings
        const hasBookings = bookings.some(
          (booking) => booking.date === dateString
        );
        const isBusy = false; // You can add logic for busy days if needed

        weekDays.push(
          <TouchableOpacity
            key={dateString}
            style={[
              styles.dayButton,
              !isCurrent && styles.dayButtonOtherMonth,
              isSelected && styles.dayButtonSelected,
            ]}
            onPress={() => {
              console.log("Calendar day clicked - dateString:", dateString);
              console.log("Calendar day clicked - dayNumber:", dayNumber);
              setSelectedDate(dateString);
            }}
          >
            <Text
              style={[
                styles.dayText,
                !isCurrent && styles.dayTextOtherMonth,
                isSelected && styles.dayTextSelected,
              ]}
            >
              {dayNumber}
            </Text>
            <View style={styles.dayIndicators}>
              {hasBookings && <View style={styles.greenDot} />}
              {isBusy && <View style={styles.redDot} />}
            </View>
          </TouchableOpacity>
        );
      }
      days.push(
        <View key={week} style={styles.weekRow}>
          {weekDays}
        </View>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              const newMonth = new Date(current);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setCurrent(newMonth);
            }}
          >
            <ChevronLeft size={20} color={"#70E000"} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {current.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}
          </Text>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              const newMonth = new Date(current);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setCurrent(newMonth);
            }}
          >
            <ChevronRight size={20} color={"#70E000"} />
          </TouchableOpacity>
        </View>

        <View style={styles.dayHeaders}>{headerDays}</View>

        {days}
      </View>
    );
  };

  // navigate to the map
  // const handleBookingPress = (booking: BookingItem) => {
  //   router.push({
  //     pathname: "/booking-details",
  //     params: {
  //       booking: JSON.stringify(booking),
  //     },
  //   });
  // };

  const renderBookingCard = (booking: BookingItem) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.studentName}>{booking.studentName}</Text>
          <Text style={styles.timeDate}>
            {booking.time} | {booking.date}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(booking.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.routeInfo}>
          <View style={styles.routeLine} />
          <View style={styles.routeContent}>
            <View style={styles.routeItem}>
              <Route size={16} color="#6b7280" />
              <Text style={styles.routeText}>{booking.route}</Text>
            </View>
            <View style={styles.routeItem}>
              <Car size={16} color="#6b7280" />
              <Text style={styles.routeText}>{booking.vehicle}</Text>
            </View>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>Giá: {booking.price} GF</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: tabBarHeight + 200 }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />
      {/* Update Schedule Button */}
      <View style={styles.updateButtonContainer}>
        <TouchableOpacity style={styles.updateButton}>
          <SquarePen size={16} color={"#FFFFFF"} strokeWidth={2} />
          <Text style={styles.updateButtonText}>Cập nhật lịch làm việc</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      {renderCalendar()}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendGreenDot} />
          <Text style={styles.legendText}>Ngày có đơn thuê</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendRedDot} />
          <Text style={styles.legendText}>Ngày bận</Text>
        </View>
      </View>

      {/* Selected Date and Bookings Container */}
      <View style={styles.selectedDateContainer}>
        <View style={styles.selectedDateHeader}>
          <Calendar size={20} color={AppColors.brandBlue} />
          <Text style={styles.selectedDateText}>
            {formatSelectedDate(selectedDate)}
          </Text>
        </View>
        {/* Bookings List for Selected Date */}
        <View style={styles.bookingsList}>
          {getBookingsForSelectedDate().length > 0 ? (
            getBookingsForSelectedDate().map(renderBookingCard)
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={"#70E000"} strokeWidth={2} />
              <Text style={styles.emptyText}>
                Không có đơn thuê nào trong ngày này
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: StatusBar.currentHeight,
  },

  // Update Button Styles
  updateButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "flex-end",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#70E000",
    backgroundColor: "#70E000",
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },

  // Calendar Styles
  calendarContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#70E000",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayButton: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
    borderRadius: 8,
    position: "relative",
  },
  dayButtonOtherMonth: {
    opacity: 0.3,
  },
  dayButtonSelected: {
    backgroundColor: AppColors.brandBlue,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  dayTextOtherMonth: {
    color: "#cccccc",
  },
  dayTextSelected: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  dayIndicators: {
    position: "absolute",
    bottom: 4,
    flexDirection: "row",
    gap: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2ed573",
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },

  // Legend Styles
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  legendGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2ed573",
    marginRight: 6,
  },
  legendRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666666",
  },

  // Selected Date Container
  selectedDateContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 50,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Selected Date Header
  selectedDateHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 8,
  },

  // Bookings List Styles
  bookingsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Booking Card Styles
  bookingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  timeDate: {
    fontSize: 14,
    color: "#666666",
  },
  statusBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  bookingDetails: {
    gap: 8,
  },
  routeInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: "#e0e0e0",
    marginRight: 12,
    marginTop: 4,
  },
  routeContent: {
    flex: 1,
    gap: 8,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routeText: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00000080",
  },

  // Empty State Styles
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 12,
    textAlign: "center",
  },
});
