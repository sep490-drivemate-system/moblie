import React, { useState } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, MapPin, X, Trash2, Eye } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  licensePlate: string;
  seats: number;
  price: number;
  image: string;
  status: "approved" | "pending";
  approvedDate: string | null;
  year: number;
  fuelType: string;
  transmission: string;
  features: string[];
}

const mockVehicles: Vehicle[] = [
  {
    id: 1,
    brand: "Toyota",
    model: "Vios",
    licensePlate: "51A-123.45",
    seats: 5,
    price: 150000,
    image: "image_3-guide10.png",
    status: "approved",
    approvedDate: "2025-01-15",
    year: 2023,
    fuelType: "Petrol",
    transmission: "Manual",
    features: ["Air Conditioning", "Power Steering", "ABS", "Airbags"],
  },
  {
    id: 2,
    brand: "Honda",
    model: "Accord",
    licensePlate: "51B-456.78",
    seats: 5,
    price: 250000,
    image: "image_3-guide10.png",
    status: "approved",
    approvedDate: "2025-01-10",
    year: 2024,
    fuelType: "Petrol",
    transmission: "Automatic",
    features: [
      "Air Conditioning",
      "Power Steering",
      "ABS",
      "Airbags",
      "Cruise Control",
    ],
  },
  {
    id: 3,
    brand: "BMW",
    model: "3 Series",
    licensePlate: "51C-789.01",
    seats: 5,
    price: 450000,
    image: "image_3-guide10.png",
    status: "pending",
    approvedDate: null,
    year: 2024,
    fuelType: "Diesel",
    transmission: "Automatic",
    features: [
      "Air Conditioning",
      "Power Steering",
      "ABS",
      "Airbags",
      "Sunroof",
      "Navigation",
    ],
  },
  {
    id: 4,
    brand: "Kia",
    model: "Cerato",
    licensePlate: "51D-234.56",
    seats: 5,
    price: 180000,
    image: "image_3-guide10.png",
    status: "approved",
    approvedDate: "2025-01-20",
    year: 2023,
    fuelType: "Petrol",
    transmission: "Manual",
    features: ["Air Conditioning", "Power Steering", "ABS", "Airbags"],
  },
];

interface VehicleCardProps {
  vehicle: Vehicle;
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
            vehicle.status === "approved"
              ? styles.statusApproved
              : styles.statusPending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              vehicle.status === "approved"
                ? styles.statusTextApproved
                : styles.statusTextPending,
            ]}
          >
            {vehicle.status === "approved" ? "Đã Duyệt" : "Chờ Duyệt"}
          </Text>
        </View>
      </View>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleBrand}>{vehicle.brand}</Text>
        <Text style={styles.vehicleModel}>{vehicle.model}</Text>
        <Text style={styles.vehiclePlate}>{vehicle.licensePlate}</Text>
        <View style={styles.vehicleDetails}>
          <Text style={styles.vehicleDetailText}>
            {vehicle.seats} chỗ • {vehicle.year}
          </Text>
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
  vehicle: Vehicle | null;
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
              {vehicle.brand} {vehicle.model}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={AppColors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Biển số xe</Text>
              <Text style={styles.modalValue}>{vehicle.licensePlate}</Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Năm sản xuất</Text>
              <Text style={styles.modalValue}>{vehicle.year}</Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Nhiên liệu</Text>
              <Text style={styles.modalValue}>{vehicle.fuelType}</Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Hộp số</Text>
              <Text style={styles.modalValue}>{vehicle.transmission}</Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Số chỗ ngồi</Text>
              <Text style={styles.modalValue}>{vehicle.seats}</Text>
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
                  vehicle.status === "approved"
                    ? styles.statusApproved
                    : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    vehicle.status === "approved"
                      ? styles.statusTextApproved
                      : styles.statusTextPending,
                  ]}
                >
                  {vehicle.status === "approved" ? "Đã Duyệt" : "Chờ Duyệt"}
                </Text>
              </View>
            </View>
            {vehicle.approvedDate && (
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Ngày duyệt</Text>
                <Text style={styles.modalValue}>{vehicle.approvedDate}</Text>
              </View>
            )}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Tính năng</Text>
              <View style={styles.featuresContainer}>
                {vehicle.features.map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface AddVehicleModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (vehicle: Omit<Vehicle, "id">) => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    licensePlate: "",
    seats: "",
    price: "",
    year: "",
    fuelType: "Petrol",
    transmission: "Manual",
    features: [] as string[],
  });

  const handleSubmit = () => {
    if (
      !formData.brand ||
      !formData.model ||
      !formData.licensePlate ||
      !formData.seats ||
      !formData.price ||
      !formData.year
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    onAdd({
      brand: formData.brand,
      model: formData.model,
      licensePlate: formData.licensePlate,
      seats: parseInt(formData.seats),
      price: parseInt(formData.price),
      year: parseInt(formData.year),
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      features: formData.features,
      image: "",
      status: "pending",
      approvedDate: null,
    });

    setFormData({
      brand: "",
      model: "",
      licensePlate: "",
      seats: "",
      price: "",
      year: "",
      fuelType: "Petrol",
      transmission: "Manual",
      features: [],
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm Xe Mới</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={AppColors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hãng xe *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.brand}
                onChangeText={(text) =>
                  setFormData({ ...formData, brand: text })
                }
                placeholder="VD: Toyota"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Model *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.model}
                onChangeText={(text) =>
                  setFormData({ ...formData, model: text })
                }
                placeholder="VD: Vios"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Biển số xe *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.licensePlate}
                onChangeText={(text) =>
                  setFormData({ ...formData, licensePlate: text })
                }
                placeholder="VD: 51A-123.45"
              />
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Số chỗ *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.seats}
                  onChangeText={(text) =>
                    setFormData({ ...formData, seats: text })
                  }
                  placeholder="5"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Năm *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.year}
                  onChangeText={(text) =>
                    setFormData({ ...formData, year: text })
                  }
                  placeholder="2024"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giá (VNĐ) *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
                placeholder="150000"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nhiên liệu</Text>
              <View style={styles.radioGroup}>
                {["Petrol", "Diesel"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.radioOption}
                    onPress={() => setFormData({ ...formData, fuelType: type })}
                  >
                    <View
                      style={[
                        styles.radio,
                        formData.fuelType === type && styles.radioSelected,
                      ]}
                    >
                      {formData.fuelType === type && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hộp số</Text>
              <View style={styles.radioGroup}>
                {["Manual", "Automatic"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.radioOption}
                    onPress={() =>
                      setFormData({ ...formData, transmission: type })
                    }
                  >
                    <View
                      style={[
                        styles.radio,
                        formData.transmission === type && styles.radioSelected,
                      ]}
                    >
                      {formData.transmission === type && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioLabel}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Thêm Xe</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function MyCarScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push("/(onboarding)/(car)/(car-registration)/form");
  };

  const handleDelete = (id: number) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa xe này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => setVehicles(vehicles.filter((v) => v.id !== id)),
      },
    ]);
  };

  // Add vehicle flow now navigates to onboarding form screen

  const approvedCount = vehicles.filter((v) => v.status === "approved").length;
  const pendingCount = vehicles.filter((v) => v.status === "pending").length;
  const averagePrice =
    vehicles.length > 0
      ? Math.round(
          vehicles.reduce((s, v) => s + v.price, 0) / vehicles.length / 1000
        )
      : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[
            AppColors.primary,
            AppColors.gradientStart,
            AppColors.gradientEnd,
          ]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Quản Lý Xe Học Lái</Text>
              <Text style={styles.headerSubtitle}>
                Quản lý danh sách xe và theo dõi tình trạng kiểm duyệt
              </Text>
            </View>
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

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Tổng Xe</Text>
              <Text style={styles.statValue}>{vehicles.length}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardApproved]}>
              <Text style={[styles.statLabel, styles.statLabelApproved]}>
                Đã Duyệt
              </Text>
              <Text style={[styles.statValue, styles.statValueApproved]}>
                {approvedCount}
              </Text>
            </View>
            <View style={[styles.statCard, styles.statCardPending]}>
              <Text style={[styles.statLabel, styles.statLabelPending]}>
                Chờ Duyệt
              </Text>
              <Text style={[styles.statValue, styles.statValuePending]}>
                {pendingCount}
              </Text>
            </View>
            <View style={[styles.statCard, styles.statCardPrice]}>
              <Text style={[styles.statLabel, styles.statLabelPrice]}>
                Giá Trung Bình
              </Text>
              <Text style={[styles.statValue, styles.statValuePrice]}>
                {averagePrice.toLocaleString("vi-VN")}K VNĐ
              </Text>
            </View>
          </View>
        </LinearGradient>

        {vehicles.length === 0 ? (
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
            {vehicles.map((vehicle) => (
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
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    marginBottom: 20,
  },
  headerText: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
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
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statCardApproved: {
    backgroundColor: "#ffffff",
    borderColor: AppColors.success,
    borderWidth: 2,
  },
  statCardPending: {
    backgroundColor: "#ffffff",
    borderColor: AppColors.yellow,
    borderWidth: 2,
  },
  statCardPrice: {
    backgroundColor: "#ffffff",
    borderColor: AppColors.blue,
    borderWidth: 2,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.gray600,
    marginBottom: 4,
    fontWeight: "500",
  },
  statLabelApproved: {
    color: AppColors.success,
    fontWeight: "600",
  },
  statLabelPending: {
    color: AppColors.yellow,
    fontWeight: "600",
  },
  statLabelPrice: {
    color: AppColors.blue,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.textPrimary,
  },
  statValueApproved: {
    color: AppColors.success,
  },
  statValuePending: {
    color: AppColors.yellow,
  },
  statValuePrice: {
    color: AppColors.blue,
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
    paddingHorizontal: 16,
    paddingTop: 16,
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
