import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import {
  Check,
  MessageCircle,
  Wallet,
  Plus,
  LogOut,
  User,
  Shield,
  Heart,
  Settings,
  Globe,
  Star,
  FileText,
  Info,
  ArrowRight,
  StepBack,
  IdCard,
  Package,
  Package2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { mockPerformance, mockUserProfile } from "@/data/profile-screen";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { UserRole } from "@/models/enum/UserRole.enum";
import { logout } from "@/features/auth/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock data matching the UI design

function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const role = UserRole.Instructor;

  const handleManageExams = () => {
    Alert.alert("Manage Exams", "Exam management coming soon!");
  };

  const handleViewDetails = () => {
    Alert.alert("View Details", "Performance details coming soon!");
  };

  const handleTopup = () => {
    router.push("/(main)/(no-tabs)/deposit");
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            // Xóa token từ AsyncStorage
            await AsyncStorage.removeItem(process.env.EXPO_PUBLIC_STORAGE_TOKEN || '@token');
            
            // Reset Redux state
            dispatch(logout());
            
            console.log("Logout successful - Token removed");
            
            // Navigate to intro screen
            router.replace("/(onboarding)/intro");
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng xuất");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Image
                  source={{ uri: mockUserProfile.avatar }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{mockUserProfile.name}</Text>
              <Text style={styles.userEmail}>{mockUserProfile.email}</Text>
              <Text style={styles.userPhone}>{mockUserProfile.phone}</Text>
            </View>
          </View>

          {/* Wallet Section */}
          <View style={styles.walletSection}>
            <View style={styles.walletContent}>
              <View style={styles.walletInfo}>
                <View style={styles.walletHeader}>
                  <Wallet size={16} color="white" />
                  <Text style={styles.walletLabel}>Số dư ví</Text>
                </View>
                <Text style={styles.walletBalance}>
                  {mockUserProfile.walletBalance.toLocaleString("vi-VN")} vnd
                </Text>
              </View>
              <TouchableOpacity
                style={styles.topupButton}
                onPress={handleTopup}
              >
                <Text style={styles.topupButtonText}>Nạp tiền</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.menuCard}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Tài khoản</Text>
          </View>
          <View style={styles.menuItemsContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(main)/(no-tabs)/profile-detail")}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <User size={20} color="#70E000" />
                <Text style={styles.menuItemText}>Thông tin tài khoản</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <IdCard size={20} color="#70E000" />
                <Text style={styles.menuItemText}>Giấy tờ tùy thân</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                router.push("/(main)/(no-tabs)/(transaction)/transaction")
              }
            >
              <View style={styles.menuItemLeft}>
                <Shield size={20} color="#70E000" />
                <Text style={styles.menuItemText}>Lịch sử giao dịch</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Overview Section */}
        <View style={styles.menuCard}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Tổng quát</Text>
          </View>
          <View style={styles.menuItemsContainer}>
            {role as UserRole === UserRole.Instructor && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  router.push(
                    "/(main)/(no-tabs)/(service-package)/service-package-management"
                  )
                }
              >
                <View style={styles.menuItemLeft}>
                  <Package2 size={20} color="#70E000" />
                  <Text style={styles.menuItemText}>Gói thuê</Text>
                </View>
              </TouchableOpacity>
            )}
            {/* {role as UserRole === UserRole.NoviceDriver && (
              
            )} */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                router.push(
                  "/(main)/(no-tabs)/my-packages"
                )
              }
            >
              <View style={styles.menuItemLeft}>
                <Package2 size={20} color="#70E000" />
                <Text style={styles.menuItemText}>Gói đã mua</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Star size={20} color="#70E000" />
                <Text style={styles.menuItemText}>Đánh giá</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Other Section */}
        <View style={styles.menuCard}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Thông tin khác</Text>
          </View>
          <View style={styles.menuItemsContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <FileText size={20} color="#70E000" />
                <Text style={styles.menuItemText}>Điều khoản và điều kiện</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Info size={20} color="#70E000" />
                <Text style={styles.menuItemText}>Thông tin về DriveMate</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuItemLeft}>
                <LogOut size={20} color="#70E000" />
                <Text style={styles.menuItemText}>Đăng xuất</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6", // gray-100
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 32,
  },

  // Profile Card styles
  profileCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    bottom: 10,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: "#d1d5db",
    borderRadius: 40,
    overflow: "hidden",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
    paddingTop: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 12,
    color: "#4b5563",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
  },

  // Wallet styles
  walletSection: {
    backgroundColor: "#1AD562", // blue-500 to purple-600 gradient effect
    borderRadius: 16,
    padding: 16,
  },
  walletContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walletInfo: {
    flex: 1,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  walletLabel: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  walletBalance: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  topupButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  topupButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Menu Card styles
  menuCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#70E000",
  },
  menuItemsContainer: {
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
    fontWeight: "500",
  },

  // Performance Card styles
  performanceCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  performanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  viewDetailsText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  performanceCirclesContainer: {
    flexDirection: "row",
    marginBottom: 24,
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  performanceCircleLeft: {
    alignItems: "flex-start",
    flex: 1,
  },
  performanceCircleRight: {
    alignItems: "flex-end",
    flex: 1,
  },
  performanceCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  accuracyCircle: {
    backgroundColor: "#dbeafe",
  },
  timeCircle: {
    backgroundColor: "#f3e8ff",
  },
  circleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  circleTextPurple: {
    color: "#7c3aed",
  },
  performanceChangeGreen: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
    marginBottom: 2,
  },
  performanceChangeRed: {
    fontSize: 12,
    fontWeight: "500",
    color: "#dc2626",
    marginBottom: 2,
  },
  performanceLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  performanceStatsContainer: {
    flexDirection: "row",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  performanceStat: {
    flex: 1,
    alignItems: "center",
  },
  performanceStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  performanceStatLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
});

export default React.memo(ProfileScreen);
