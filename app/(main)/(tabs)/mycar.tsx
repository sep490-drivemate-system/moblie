import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  TextInput,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Plus,
  MapPin,
  X,
  Trash2,
  Eye,
  Car,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";
import HeaderList from "@/components/Commons/HeaderList";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { InstructorListCarViewModel } from "@/viewmodels/car/InstructorListCarViewModel";
import { RootState } from "@/lib/redux/store";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";
import { ICar } from "@/models/car/car";
import { CarStatus } from "@/constants/enums";

const { width: screenWidth } = Dimensions.get("window");

interface CardOverviewProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string[];
  delay?: number;
  fullWidth?: boolean;
}

const CardOverview: React.FC<CardOverviewProps> = ({
  title,
  value,
  sub,
  icon,
  color,
  delay = 0,
  fullWidth = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <LinearGradient
      colors={color as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.cardOverview,
        fullWidth && styles.cardOverviewFullWidth,
        {
          opacity: isVisible ? 1 : 0,
          transform: [{ translateY: isVisible ? 0 : 32 }],
        },
      ]}
    >
      <View style={styles.cardOverviewContent}>
        <View style={styles.cardOverviewTextContainer}>
          <Text style={styles.cardOverviewTitle}>{title}</Text>
          <Text style={styles.cardOverviewValue}>{value}</Text>
          {sub && <Text style={styles.cardOverviewSub}>{sub}</Text>}
        </View>
        <View style={styles.cardOverviewIconContainer}>{icon}</View>
      </View>
    </LinearGradient>
  );
};
interface VehicleCardProps {
  vehicle: ICar;
  onDetail: () => void;
  onDelete: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onDetail,
  onDelete,
}) => {
  return (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleImageContainer}>
        <View style={styles.vehicleImagePlaceholder}>
          <Image
            source={require(`@/assets/images/image_3-guide10.png`)}
            style={styles.vehicleImage}
          />
        </View>
        <View
          style={[
            styles.statusBadge,
            vehicle.status === CarStatus.Approved
              ? styles.statusApproved
              : styles.statusPending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              vehicle.status === CarStatus.Approved
                ? styles.statusTextApproved
                : styles.statusTextPending,
            ]}
          >
            {vehicle.status === CarStatus.Approved ? "Đã Duyệt" : "Chờ Duyệt"}
          </Text>
        </View>
      </View>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleBrand}>{vehicle.brand}</Text>
        <Text style={styles.vehicleModel}>{vehicle.modelName}</Text>
        <Text style={styles.vehiclePlate}>{vehicle.license_plate}</Text>
        <View style={styles.vehicleDetails}>
          <Text style={styles.vehicleDetailText}>{vehicle.seatCounts} chỗ</Text>
          <Text style={styles.vehiclePrice}>
            {vehicle.price.toLocaleString("vi-VN")} VNĐ
          </Text>
        </View>
      </View>
      <View style={styles.vehicleActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={onDetail}
        >
          <Eye size={16} color={AppColors.primary} />
          <Text style={styles.viewButtonText}>Xem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <Trash2 size={16} color={AppColors.error} />
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface VehicleModalProps {
  vehicle: ICar | null;
  visible: boolean;
  onClose: () => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  visible,
  onClose,
}) => {
  if (!vehicle) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {vehicle.brand} {vehicle.modelName}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={AppColors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Biển số xe</Text>
              <Text style={styles.modalValue}>{vehicle.license_plate}</Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Nhiên liệu</Text>
              <Text style={styles.modalValue}>{vehicle.fuel}</Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Số chỗ ngồi</Text>
              <Text style={styles.modalValue}>{vehicle.seatCounts}</Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Giá</Text>
              <Text style={styles.modalValue}>
                {vehicle.price.toLocaleString("vi-VN")} VNĐ
              </Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Trạng thái</Text>
              <View
                style={[
                  styles.statusBadge,
                  vehicle.status === CarStatus.Approved
                    ? styles.statusApproved
                    : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    vehicle.status === CarStatus.Approved
                      ? styles.statusTextApproved
                      : styles.statusTextPending,
                  ]}
                >
                  {vehicle.status === CarStatus.Approved
                    ? "Đã Duyệt"
                    : "Chờ Duyệt"}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function MyCarScreen() {
  const [selectedVehicle, setSelectedVehicle] = useState<ICar | null>(null);
  const [cars, setCars] = useState<ICar[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [carState, viewModel] = useViewModel(
    InstructorListCarViewModel,
    (state: RootState) => state.car
  );

  const handleGoBack = () => {
    router.back();
  };

  const handleDelete = (id: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa xe này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => setCars(cars.filter((v) => v.id !== id)),
      },
    ]);
  };

  const approvedCount = cars.filter(
    (v) => v.status === CarStatus.Approved
  ).length;
  const pendingCount = cars.filter(
    (v) => v.status === CarStatus.Pending
  ).length;
  const averagePrice =
    cars.length > 0
      ? Math.round(cars.reduce((s, v) => s + v.price, 0) / cars.length / 1000)
      : 0;

  const getIntructorListCar = useCallback(async () => {
    const userId = await getUserIdFromToken();
    const cars = await viewModel.getCarsForInstructor(userId);
    setCars(cars);
    console.log(cars);
  }, [viewModel]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getIntructorListCar();
    } catch (error) {
      console.error("Error refreshing cars:", error);
    } finally {
      setRefreshing(false);
    }
  }, [getIntructorListCar]);

  useEffect(() => {
    getIntructorListCar();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getIntructorListCar();
    }, [getIntructorListCar])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
      >
        <HeaderList
          title="Quản Lý Xe Học Lái"
          description="Quản lý danh sách xe và theo dõi tình trạng kiểm duyệt"
        />

        {refreshing ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={{ marginTop: 16, color: AppColors.gray600 }}>
              Đang tải dữ liệu...
            </Text>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <CardOverview
                title="Tổng Xe"
                value={`${cars.length}`}
                sub="Xe trong hệ thống"
                icon={<Car size={24} color={AppColors.textWhite} />}
                color={[
                  AppColors.primary,
                  AppColors.primaryDark || AppColors.primary,
                ]}
                delay={0}
                fullWidth
              />
              <CardOverview
                title="Đã Duyệt"
                value={`${approvedCount}`}
                sub="Xe đã được phê duyệt"
                icon={<CheckCircle size={24} color={AppColors.textWhite} />}
                color={[AppColors.success, AppColors.success]}
                delay={100}
                fullWidth
              />
              <CardOverview
                title="Chờ Duyệt"
                value={`${pendingCount}`}
                sub="Xe đang chờ xử lý"
                icon={<Clock size={24} color={AppColors.textWhite} />}
                color={[AppColors.yellow, AppColors.yellow]}
                delay={200}
                fullWidth
              />
              <CardOverview
                title="Giá Trung Bình"
                value={`${averagePrice?.toLocaleString("vi-VN")}K VNĐ`}
                sub="Giá trung bình mỗi xe"
                icon={<DollarSign size={24} color={AppColors.textWhite} />}
                color={[AppColors.blue, AppColors.blue]}
                delay={300}
                fullWidth
              />
            </View>

            {/* Add Car Button - Only show when cars exist */}
            {cars.length > 0 && (
              <View style={styles.addButtonContainer}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() =>
                    router.push("/(onboarding)/(car)/(car-registration)/form")
                  }
                >
                  <Plus size={20} color="#ffffff" />
                  <Text style={styles.addButtonText}>Thêm Xe Mới</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Vehicles List */}
            <View style={styles.listContainer}>
              {cars.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <MapPin size={32} color={AppColors.gray500} />
                  </View>
                  <Text style={styles.emptyTitle}>Chưa có xe nào</Text>
                  <Text style={styles.emptySubtitle}>
                    Thêm xe của bạn để bắt đầu quản lý
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() =>
                      router.push("/(onboarding)/(car)/(car-registration)/form")
                    }
                  >
                    <Plus size={20} color="#ffffff" />
                    <Text style={styles.emptyButtonText}>Thêm Xe Đầu Tiên</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.vehiclesGrid}>
                  {cars.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onDetail={() => {
                        setSelectedVehicle(vehicle);
                        setShowModal(true);
                      }}
                      onDelete={() => handleDelete(vehicle.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <VehicleModal
        vehicle={selectedVehicle}
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedVehicle(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D8F45",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  addButtonContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  listContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: "#ffffff",
  },
  cardOverview: {
    width: (screenWidth - 64) / 2,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardOverviewFullWidth: {
    width: "100%",
  },
  cardOverviewContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardOverviewTextContainer: {
    flex: 1,
  },
  cardOverviewTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  cardOverviewValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.textWhite,
    marginBottom: 4,
  },
  cardOverviewSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  cardOverviewIconContainer: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  vehiclesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  vehicleCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  vehicleImageContainer: {
    position: "relative",
    height: 180,
    backgroundColor: AppColors.gray100,
  },
  vehicleImagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.gray200,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  vehicleImageText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.gray600,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusApproved: {
    backgroundColor: AppColors.success,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  statusPending: {
    backgroundColor: AppColors.yellow,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusTextApproved: {
    color: "#ffffff",
  },
  statusTextPending: {
    color: "#ffffff",
  },
  vehicleInfo: {
    padding: 16,
  },
  vehicleBrand: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
    color: AppColors.gray600,
    marginBottom: 12,
  },
  vehicleDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehicleDetailText: {
    fontSize: 14,
    color: AppColors.gray600,
  },
  vehiclePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.primary,
  },
  vehicleActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  viewButton: {
    backgroundColor: `${AppColors.primary}15`,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  viewButtonText: {
    color: AppColors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: `${AppColors.error}15`,
    borderWidth: 1,
    borderColor: AppColors.error,
  },
  deleteButtonText: {
    color: AppColors.error,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AppColors.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.gray600,
    marginBottom: 24,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.gray600,
    marginBottom: 8,
  },
  modalValue: {
    fontSize: 16,
    color: AppColors.textPrimary,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureTag: {
    backgroundColor: AppColors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: AppColors.gray50,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: AppColors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  submitButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0D8F45",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#0D8F45",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D8F45",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
