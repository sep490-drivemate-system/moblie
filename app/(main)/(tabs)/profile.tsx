import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from "react-native";
import {
  Wallet,
  LogOut,
  Shield,
  FileText,
  Info,
  IdCard,
  Package2,
  Navigation,
} from "lucide-react-native";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "expo-router";
import { UserRole } from "@/models/enum/UserRole.enum";
import { AuthViewModel } from "@/viewmodels/auth/AuthViewModel";
import { WalletViewModel } from "@/viewmodels/wallet/WalletViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { AppColors } from "@/constants/Colors";
import VNDCurrency from "@/components/Commons/VNDCurrency ";
import { AppAlert } from "@/components/Commons/AppAlert";
const UserIcon = require("@/assets/images/icon_avatar_user.jpg");

export default function ProfileScreen() {
  const [walletState, walletViewModel] = useViewModel(WalletViewModel, (state) => state.wallet);
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authState, authViewModel] = useViewModel(AuthViewModel, (state) => state.auth);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTermsAlert, setShowTermsAlert] = useState(false);
  const [showAboutAlert, setShowAboutAlert] = useState(false);
  const URL_WEBAPP = process.env.EXPO_PUBLIC_URL_WEBAPP;
  useEffect(() => {
    if (authState.isAuthenticated) {
      authViewModel.fetchUserInfo().catch((error) => {
        console.log("Error fetching user info:", error);
      });
    }
  }, [authState.isAuthenticated]);

  const handleRefresh = async () => {
    if (!authState.isAuthenticated) return;
    setIsRefreshing(true);
    await Promise.all([
      authViewModel.fetchUserInfo(),
      walletViewModel.getWalletBalance(),
    ]);
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Image
                source={authState.userInfo?.avatarUrl ? { uri: authState.userInfo?.avatarUrl } : UserIcon}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {authState.userInfo?.fullName}
            </Text>
            <Text style={styles.userEmail}>{authState.userInfo?.email}</Text>
            <Text style={styles.userPhone}>{authState.userInfo?.phone}</Text>
          </View>
        </View>

        <View style={styles.walletSection}>
          <View style={styles.walletContent}>
            <View style={styles.walletInfo}>
              <View style={styles.walletHeader}>
                <Wallet size={16} color="white" />
                <Text style={styles.walletLabel}>Số dư ví</Text>
              </View>
              <Text style={styles.walletBalance}>
                <VNDCurrency amount={walletState.balance} />
              </Text>
            </View>
            <TouchableOpacity
              style={styles.topupButton}
              onPress={() => router.push(ROUTES.MAIN_NO_TABS_WALLET)}
            >
              <Text style={styles.topupButtonText}>Xem ví</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
      >

        <View style={styles.menuCard}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Tài khoản</Text>
          </View>
          <View style={styles.menuItemsContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() =>
                router.push(
                  ROUTES.MAIN_NO_TABS_IDENTIFICATION_DOCUMENT_MANAGEMENT
                )
              }
            >
              <View style={styles.menuItemLeft}>
                <IdCard size={20} color={AppColors.primary} />
                <Text style={styles.menuItemText}>
                  Quản lý thông tin tài khoản
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                router.push(ROUTES.MAIN_NO_TABS_HISTORY)
              }
            >
              <View style={styles.menuItemLeft}>
                <Shield size={20} color={AppColors.primary} />
                <Text style={styles.menuItemText}>Lịch sử giao dịch</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.menuItemsContainer}>
              {(authState.userInfo?.role as UserRole) === UserRole.Instructor && (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() =>
                      router.push(
                        ROUTES.MAIN_NO_TABS_SERVICE_PACKAGE_SERVICE_PACKAGE_MANAGEMENT
                      )
                    }
                  >
                    <View style={styles.menuItemLeft}>
                      <Package2 size={20} color={AppColors.primary} />
                      <Text style={styles.menuItemText}>Quản lý gói dịch vụ</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() =>
                      router.push(ROUTES.MAIN_NO_TABS_INSTRUCTOR_ROUTES)
                    }
                  >
                    <View style={styles.menuItemLeft}>
                      <Navigation size={20} color={AppColors.primary} />
                      <Text style={styles.menuItemText}>Quản lý tuyến đường</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}

              {(authState.userInfo?.role as UserRole) ===
                UserRole.NoviceDriver && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push(ROUTES.MAIN_NO_TABS_MY_PACKAGES)}
                  >
                    <View style={styles.menuItemLeft}>
                      <Package2 size={20} color={AppColors.primary} />
                      <Text style={styles.menuItemText}>Quản lý gói đã mua</Text>
                    </View>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </View>
        <View style={styles.menuCard}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Thông tin khác</Text>
          </View>
          <View style={styles.menuItemsContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowTermsAlert(true);
              }}
            >
              <View style={styles.menuItemLeft}>
                <FileText size={20} color={AppColors.primary} />
                <Text style={styles.menuItemText}>Điều khoản và dịch vụ</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowAboutAlert(true);
              }}
            >
              <View style={styles.menuItemLeft}>
                <Info size={20} color={AppColors.primary} />
                <Text style={styles.menuItemText}>Thông tin về DriveMate</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowLogoutModal(true)}
            >
              <View style={styles.menuItemLeft}>
                <LogOut size={20} color={AppColors.primary} />
                <Text style={styles.menuItemText}>Đăng xuất</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <AppAlert
        visible={showTermsAlert}
        title="Rời khỏi ứng dụng?"
        message="Bạn có muốn mở trang điều khoản và dịch vụ trong trình duyệt?"
        primaryButton={{
          label: "Mở",
          onPress: async () => {
            const url = `${URL_WEBAPP}/terms-and-sersvices`;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
              await Linking.openURL(url);
            } else {
              Alert.alert("Lỗi", "Không thể mở liên kết này");
            }
          },
        }}
        secondaryButton={{
          label: "Hủy",
          variant: "secondary",
        }}
        onDismiss={() => setShowTermsAlert(false)}
      />

      <AppAlert
        visible={showAboutAlert}
        title="Rời khỏi ứng dụng?"
        message="Bạn có muốn mở trang thông tin về DriveMate trong trình duyệt?"
        primaryButton={{
          label: "Mở",
          onPress: async () => {
            const url = `${URL_WEBAPP}/about-us`;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
              await Linking.openURL(url);
            } else {
              Alert.alert("Lỗi", "Không thể mở liên kết này");
            }
          },
        }}
        secondaryButton={{
          label: "Hủy",
          variant: "secondary",
        }}
        onDismiss={() => setShowAboutAlert(false)}
      />

      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <LogOut size={48} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Đăng xuất tài khoản?</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản DriveMate?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.logoutButton]}
                onPress={async () => {
                  setIsLoggingOut(true);
                  await authViewModel.handleSignOut();
                  setIsLoggingOut(false);
                  setShowLogoutModal(false);
                  router.push(ROUTES.MAIN_NO_TABS_INTRO as any);
                }}
                disabled={isLoggingOut}
                activeOpacity={0.7}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: AppColors.white,
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
    color: AppColors.primary,
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

  // Logout Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
