import CarItem from "@/components/ui/car-item";

import InstructorItem from "@/components/ui/instructor-item";
import PackageItem from "@/components/ui/package-item";
import { LicenseType } from "@/models/license/license";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bell,
  ChevronRight,
  MessageSquareMore,
  Wallet,
} from "lucide-react-native";
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import { useWindowDimensions } from "react-native";
import { WalletViewModel } from "@/viewmodels/wallet/WalletViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { drivingLicenses } from "@/utils/utils";
import { AppColors } from "@/constants/Colors";
import { ROUTES } from "@/constants/routes";
import { router } from "expo-router";
import { useSignalRContext } from "@/lib/signalr/SignalRContext";
import { NotificationHubViewModel } from "@/viewmodels/notification/NotificationHubViewModel";
import { ChatHubViewModel } from "@/viewmodels/chat/ChatHubViewModel";
import { Package } from "@/models/package/package";
import { PackageViewModel } from "@/viewmodels/package/PackageViewModel";
import { IInstructors } from "@/models/instructor/instructor.type";
import { InstructorViewModel } from "@/viewmodels/instructor/InstructorViewModel";
import VNDCurrency from "@/components/Commons/VNDCurrency ";
import { CarViewModel } from "@/viewmodels/car/CarViewModel";
import { ICar } from "@/models/car/car";
const logoWhiteBg = require("@/assets/images/logo_whitebg_main.png");

export default function HomeScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [walletState, walletViewModel] = useViewModel(WalletViewModel, (state) => state.wallet);
  const [chatState, chatHubViewModel] = useViewModel(ChatHubViewModel, (state) => state.chat);
  const [notificationState, notificationHubViewModel] = useViewModel(NotificationHubViewModel, (state) => state.notification
  );
  const { width } = useWindowDimensions();
  const heroSlides = [
    {
      title: "Nền tảng bổ túc lái xe thông minh",
      desc: "Kết nối tài xế mới với thầy bảo trợ dạy lái xe ô tô",
    },
    {
      title: "Hỗ trợ chọn gói nhanh chóng",
      desc: "Tiếp tục hành trình lái xe tự tin: chọn gói học, đặt lịch, kết nối người hướng dẫn phù hợp chỉ trong vài chạm.",
    },
    {
      title: "Thanh toán linh hoạt",
      desc: "Nạp rút nhanh, hiển thị ví và lịch sử ngay trong ứng dụng.",
    },
  ];


  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recommendedPackages, setRecommendedPackages] = useState<Package[]>([]);
  const [recommendedInstructors, setRecommendedInstructors] = useState<IInstructors[]>([]);
  const [recommendedCars, setRecommendedCars] = useState<ICar[]>([]);
  const [, packageViewModel] = useViewModel(PackageViewModel, (state) => state.package);
  const [, carViewModel] = useViewModel(CarViewModel, (state) => state.car);
  const [, instructorViewModel] = useViewModel(InstructorViewModel, (state) => state.instructor);
  const { chatHub, notificationHub } = useSignalRContext();

  useEffect(() => {
    if (chatHub) {
      chatHubViewModel.setSignalRConnection(chatHub);
      if (notificationHub) {
        notificationHubViewModel.setSignalRConnection(notificationHub);
      }
    }
  }, [chatHub, chatHubViewModel, notificationHub, notificationHubViewModel]);

  const fetchUnreadCounts = useCallback(async () => {
    await chatHubViewModel.getUnreadMessageCount();
    await notificationHubViewModel.getUnreadNotificationCount();

  }, [chatHubViewModel, notificationHubViewModel]);

  const hasFetchedBalanceRef = useRef(false);

  useEffect(() => {
    if (hasFetchedBalanceRef.current || walletState.balance !== 0) {
      return;
    }
    hasFetchedBalanceRef.current = true;
    walletViewModel.getWalletBalance();

    fetchUnreadCounts();
  }, [walletState.balance, walletViewModel]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await walletViewModel.getWalletBalance();
      await fetchUnreadCounts();
      await packageViewModel.getRecommendedPackages();
      await instructorViewModel.fetchRecommendedInstructors();
    } finally {
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    const getRecommendedPackages = async () => {
      const result = await packageViewModel.getRecommendedPackages();
      setRecommendedPackages(result as Package[]);
    };
    getRecommendedPackages();
  }, [packageViewModel]);

  useEffect(() => {
    const getRecommendedInstructors = async () => {
      const result = await instructorViewModel.fetchRecommendedInstructors();
      setRecommendedInstructors(result ?? []);
    };
    getRecommendedInstructors();
  }, [instructorViewModel]);

  useEffect(() => {
    const getRecommendedCars = async () => {
      const result = await carViewModel.getRecommendedCars();
      setRecommendedCars(result ?? []);

    };
    getRecommendedCars();
  }, [carViewModel]);

  const renderDrivingLicense = ({ item }: ListRenderItemInfo<LicenseType>) => (
    <TouchableOpacity key={item.id} style={styles.drivingLicenseItem}>
      <Text style={styles.drivingLicenseItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={[styles.header]}>
        <View style={styles.floatingContainer}>
          <TouchableOpacity
            style={styles.walletSection}
            onPress={() => router.push(ROUTES.MAIN_NO_TABS_WALLET)}
          >
            <Wallet size={30} color={AppColors.primary} />
            <View style={styles.walletTextContainer}>
              <Text style={styles.headerItemLabel}>Ví DriveMate</Text>
              <Text style={styles.headerItemValue}>
                <VNDCurrency amount={walletState.balance} />
              </Text>
            </View>
            <ChevronRight size={20} color="#92929D" />
          </TouchableOpacity>

          <View style={styles.iconGroup}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push(ROUTES.MAIN_NO_TABS_NOTIFICATIONS)}
            >
              <View style={styles.iconContainer}>
                <Bell size={24} color={AppColors.primary} />
                {notificationState.unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationState.unreadCount > 99
                        ? "99+"
                        : notificationState.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push(ROUTES.MAIN_NO_TABS_CHATS)}
            >
              <View style={styles.iconContainer}>
                <MessageSquareMore size={24} color={AppColors.primary} />
                {chatState.unreadMessageCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {chatState.unreadMessageCount > 99
                        ? "99+"
                        : chatState.unreadMessageCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
            progressBackgroundColor={AppColors.primary}
            progressViewOffset={100}
          />
        }
      >

        <View style={styles.body}>
          <View style={styles.listItemContainer}>
            <Text style={styles.listLabel}>
              Loại giấy phép lái xe bạn quan tâm
            </Text>
            <FlatList
              data={drivingLicenses}
              keyExtractor={(item) => item.id}
              horizontal
              renderItem={renderDrivingLicense}
              contentContainerStyle={styles.listItem}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <View style={styles.heroCard}>
            <View style={{ flex: 1, gap: 8 }}>
              <View style={styles.heroBrandRow}>
                <View style={styles.heroLogoWrap}>
                  <Image source={logoWhiteBg} style={styles.heroLogoSingle} />
                </View>
                <View style={styles.heroBrandText}>
                  <Text style={styles.heroBrandTitle}>Nền tảng kết nối tài xế mới với thầy bảo trợ dạy lái xe ô tô</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>Trở lại để nâng trình lái xe</Text>
              <Text style={styles.heroSubtitle}>
                Tiếp tục hành trình lái xe tự tin: chọn gói học, đặt lịch, kết nối huấn luyện viên phù hợp chỉ trong vài chạm.
              </Text>
              <View style={styles.heroInfoList}>
                {heroSlides.map((slide) => (
                  <View key={slide.title} style={styles.heroInfoRow}>
                    <Text style={styles.heroInfoTitle}>{slide.title}</Text>
                    <Text style={styles.heroInfoDesc}>{slide.desc}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.heroActions}>
                <TouchableOpacity
                  style={[styles.heroButton, styles.heroButtonGhost]}
                  onPress={() => router.push(ROUTES.PACKAGES)}
                >
                  <Text style={styles.heroButtonPrimaryText}>Tìm gói thuê</Text>
                  <ChevronRight size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.heroButton, styles.heroButtonGhost]}
                  onPress={() => router.push(ROUTES.MAIN_NO_TABS_INSTRUCTOR_ROUTES)}
                >
                  <Text style={styles.heroButtonGhostText}>Người hướng dẫn</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.listItemContainer}>
            <Text style={styles.listLabel}>Gói thuê thường xuyên</Text>
            <FlatList
              data={recommendedPackages}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.listItem}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <PackageItem pkg={item} key={item.id} />}
            />
          </View>
          <View style={styles.listItemContainer}>
            <Text style={styles.listLabel}>Người hướng dẫn thường xuyên</Text>
            <FlatList
              data={recommendedInstructors}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.listItem}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <InstructorItem instructor={item} />}
            />
          </View>
          <View style={styles.listItemContainer}>
            <Text style={styles.listLabel}>Xe thường xuyên thuê</Text>
            <FlatList
              data={recommendedCars}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.listItem}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <CarItem car={item} key={item.id} />}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F5",
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 16,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: AppColors.primary,
    paddingTop: StatusBar.currentHeight,
    alignItems: "center",
    height: 80,
  },
  floatingContainer: {
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    position: "absolute",
    top: 50,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  walletSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#E5E5E5",
  },
  walletTextContainer: {
    flex: 1,
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
    // paddingLeft: 12,
    marginRight: 20,
    marginLeft: 20,
  },
  headerItemLabel: {
    fontSize: 12,
    color: "#92929D",
  },
  headerItemValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  body: {
    alignItems: "center",
    marginTop: 50,
    gap: 20,
  },
  listItemContainer: {
    width: "95%",
    backgroundColor: "#FFF",
    paddingVertical: 20,
    paddingLeft: 20,
    borderRadius: 5,
    elevation: 3,
  },
  listLabel: {
    fontSize: 16,
    fontWeight: 500,
    color: AppColors.primary,
    marginBottom: 15,
  },
  listItem: {
    gap: 10,
  },
  heroCard: {
    width: "95%",
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  heroTitle: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#e5ecff",
    lineHeight: 20,
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
  },
  heroBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  heroLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: 8,
  },
  heroLogoSingle: {
    width: 35,
    height: 35,
    aspectRatio: 2.6,
    resizeMode: "contain",
  },
  heroLogoWrap: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  heroBrandText: {
    flex: 1,
    gap: 2,
  },
  heroBrandTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  heroBrandSubtitle: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
  },
  heroInfoList: {
    gap: 8,
  },
  heroInfoRow: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(249, 205, 46, 0.65)",
    marginBottom: 10,
    marginTop: 5,
  },
  heroInfoTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  heroInfoDesc: {
    color: "#e2e8f0",
    fontSize: 13,
    lineHeight: 18,
  },
  heroSlider: {
    gap: 6,
  },
  heroSlideCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  heroSlideTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  heroSlideDesc: {
    color: "#e2e8f0",
    fontSize: 12,
    lineHeight: 18,
  },

  heroDotsRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  heroDotActive: {
    backgroundColor: "#fff",
    width: 14,
  },
  heroQuickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroChipText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  promoStrip: {
    width: "95%",
  },
  promoImage: {
    width: 230,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  heroButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroButtonPrimary: {
    backgroundColor: "#0F172A",
  },
  heroButtonPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  heroButtonGhost: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroButtonGhostText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  drivingLicenseItem: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: AppColors.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  drivingLicenseItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.primary,
  },
  iconButton: {
    padding: 4,
  },
  iconContainer: {
    position: "relative",
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#FF3B30",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
