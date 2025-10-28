import { AppColors } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ChevronLeft,
    Settings
} from "lucide-react-native";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

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

export default function BookingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the booking data from params
  const booking: BookingItem = JSON.parse(params.booking as string);

  // Mock location data (you'll replace this with real coordinates from your booking)
  const pickupLocation = {
    latitude: 10.8231,
    longitude: 106.6297,
    title: "Gym house",
  };

  const dropoffLocation = {
    latitude: 10.7717,
    longitude: 106.7041,
    title: "Museum",
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
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: 10.7974,
              longitude: 106.6669,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {/* Pickup marker */}
            <Marker
              coordinate={pickupLocation}
              title={pickupLocation.title}
              pinColor="#10b981"
            />
            
            {/* Dropoff marker */}
            <Marker
              coordinate={dropoffLocation}
              title={dropoffLocation.title}
            />
          </MapView>
        </View>

        {/* Booking Info Section */}
        <View style={styles.infoContainer}>
          {/* Date and Time */}
          <View style={styles.dateTimeRow}>
            <Text style={styles.dateText}>{formatDate(booking.date)}</Text>
            <Text style={styles.timeText}>{booking.time}</Text>
          </View>

          {/* Customer Info Section */}
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
                  <Text style={styles.customerName}>{booking.studentName}</Text>
                </View>
              </View>
            </View>
          </View>

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

          {/* Route Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin tuyến đường</Text>
            
            <View style={styles.routeCard}>
              <View style={styles.routePoint}>
                <View style={styles.routeIconContainer}>
                  <View style={[styles.routeDot, styles.startDot]} />
                </View>
                <Text style={styles.routeText}>Điểm bắt đầu</Text>
              </View>
              <Text style={styles.routeAddress}>{pickupLocation.title}</Text>
            </View>

            <View style={styles.routeCard}>
              <View style={styles.routePoint}>
                <View style={styles.routeIconContainer}>
                  <View style={[styles.routeDot, styles.endDot]} />
                </View>
                <Text style={styles.routeText}>Điểm kết thúc</Text>
              </View>
              <Text style={styles.routeAddress}>{dropoffLocation.title}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Bắt đầu đón</Text>
        </TouchableOpacity>
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
  routeCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  routeIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  startDot: {
    backgroundColor: "#10b981",
  },
  endDot: {
    backgroundColor: "#ef4444",
  },
  routeText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  routeAddress: {
    fontSize: 14,
    color: "#000000",
    marginLeft: 32,
  },
  bottomButtonContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  startButton: {
    backgroundColor: AppColors.brandBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
