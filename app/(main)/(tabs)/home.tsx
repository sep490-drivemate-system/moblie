import CarItem from "@/components/ui/car-item";

import InstructorItem from "@/components/ui/instructor-item";
import PackageItem from "@/components/ui/package-item";
import { listCar, popularPackages } from "@/data/home_data";
import { instructorsData } from "@/data/instructors_data";
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
  TouchableOpacity,
  View,
} from "react-native";
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
import { RootState } from "@/lib/redux/store";
import { IInstructors } from "@/models/instructor/instructor.type";
import { InstructorViewModel } from "@/viewmodels/instructor/InstructorViewModel";

export default function HomeScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [walletState, walletViewModel] = useViewModel(
    WalletViewModel,
    (state) => state.wallet
  );
  const [chatState, chatHubViewModel] = useViewModel(
    ChatHubViewModel,
    (state) => state.chat
  );
  const [notificationState, notificationHubViewModel] = useViewModel(
    NotificationHubViewModel,
    (state) => state.notification
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recommendedPackages, setRecommendedPackages] = useState<Package[]>([]);
  const [recommendedInstructors, setRecommendedInstructors] = useState<IInstructors[]>([]);
  const [packageState, packageViewModel] = useViewModel(
    PackageViewModel,
    (state) => state.package
  );
  const [instructorState, instructorViewModel] = useViewModel(
    InstructorViewModel,
    (state) => state.instructor
  );
  // Lấy SignalR connections từ context (đã được tạo ở layout)
  const { chatHub, notificationHub } = useSignalRContext();

  // Thiết lập connections cho viewmodels
  useEffect(() => {
    if (chatHub) {
      chatHubViewModel.setSignalRConnection(chatHub);
    }
  }, [chatHub, chatHubViewModel]);

  useEffect(() => {
    if (notificationHub) {
      notificationHubViewModel.setSignalRConnection(notificationHub);
    }
  }, [notificationHub, notificationHubViewModel]);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      await chatHubViewModel.getUnreadMessageCount();
      await notificationHubViewModel.getUnreadNotificationCount();
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
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
    } finally {
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    const getRecommendedPackages = async () => {
      const result = await packageViewModel.getRecommendedPackages();
      setRecommendedPackages(result as Package[]);
      console.log(result);
    };
    getRecommendedPackages();
  }, [packageViewModel]);

  useEffect(() => {
    const getRecommendedInstructors = async () => {
      const result = await instructorViewModel.fetchRecommendedInstructors();
      setRecommendedInstructors(result ?? []);
      console.log(result);
    };
    getRecommendedInstructors();
  }, [instructorViewModel]);

  const renderDrivingLicense = ({ item }: ListRenderItemInfo<LicenseType>) => (
    <TouchableOpacity key={item.id} style={styles.drivingLicenseItem}>
      <Text style={styles.drivingLicenseItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#70E000"
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.floatingContainer}>
          <TouchableOpacity
            style={styles.walletSection}
            onPress={() => router.push(ROUTES.MAIN_NO_TABS_WALLET)}
          >
            <Wallet size={30} color={AppColors.primary} />
            <View style={styles.walletTextContainer}>
              <Text style={styles.headerItemLabel}>Ví DriveMate</Text>
              <Text style={styles.headerItemValue}>
                {Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(walletState.balance || 0)}
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
                <Bell size={24} color={"#70E000"} />
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
                <MessageSquareMore size={24} color={"#70E000"} />
                {chatState.unreadMessageCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {chatState.unreadMessageCount > 99
                        ? "99+"
                        : chatState.unreadMessageCount}
                    </Text>
                  </View>
                ) : null}
                {/* Debug: Hiển thị count ngay cả khi là 0 để test */}
                {/* <Text style={{ position: 'absolute', top: -10, right: -10, fontSize: 10, color: 'red' }}>
                  {chatState.unreadMessageCount}
                </Text> */}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
        <View style={styles.listItemContainer}>
          <Text style={styles.listLabel}>Gói được thuê thường xuyên</Text>
          <FlatList
            data={recommendedPackages}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.listItem}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <PackageItem pkg={item} key={item.id} />
            )}
          />
        </View>
        <View style={styles.listItemContainer}>
          <Text style={styles.listLabel}>Người hướng dẫn nổi bật</Text>
          <FlatList
            data={recommendedInstructors}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.listItem}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <InstructorItem instructor={item} />}
          />
        </View>
        {/* <View style={styles.listItemContainer}>
          <Text style={styles.listLabel}>Xe nổi bật</Text>
          <FlatList
            data={listCar}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.listItem}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <CarItem car={item as unknown as ICar} key={item.id} />}
          />
        </View> */}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F5",
  },
  header: {
    backgroundColor: "#70E000",
    paddingTop: StatusBar.currentHeight,
    alignItems: "center",
    position: "relative",
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
    gap: 25,
    paddingLeft: 12,
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
    color: "#70E000",
    marginBottom: 15,
  },
  listItem: {
    gap: 10,
  },
  drivingLicenseItem: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: "#70E000",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  drivingLicenseItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#70E000",
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
