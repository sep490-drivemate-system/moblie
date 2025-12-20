import { AppColors } from "@/constants/Colors";
import { ICarDetail } from "@/models/car/car";
import { CarViewModel } from "@/viewmodels/car/CarViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MapPin, Star } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CarDetailScreen() {
  const router = useRouter();
  const { carId } = useLocalSearchParams();
  const [car, setCar] = useState<ICarDetail | null>(null);
  const [, viewModel] = useViewModel(CarViewModel, (state) => state.car);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (carId) {
      const fetchCar = async () => {
        const car = await viewModel.getCarById(carId as string);
        if (car) {
          setCar(car);
        }
      };
      fetchCar();
    }
  }, [carId, viewModel]);

  // Filter images by position
  const carImages = useMemo(() => {
    if (!car?.images) return {};

    const images: Record<string, string> = {};
    car.images.forEach((img) => {
      const lowerImg = img.toLowerCase();
      if (lowerImg.includes("front")) images.front = img;
      else if (lowerImg.includes("back")) images.back = img;
      else if (lowerImg.includes("left")) images.left = img;
      else if (lowerImg.includes("right")) images.right = img;
      else if (lowerImg.includes("interior")) images.interior = img;
    });
    return images;
  }, [car?.images]);

  // Create array of all gallery images in order with their labels
  const galleryImages = useMemo(() => {
    const images: string[] = [];
    if (carImages.front) images.push(carImages.front);
    if (carImages.back) images.push(carImages.back);
    if (carImages.left) images.push(carImages.left);
    if (carImages.right) images.push(carImages.right);
    if (carImages.interior) images.push(carImages.interior);
    return images;
  }, [carImages]);

  const getImageIndex = (imageUri: string | undefined): number => {
    if (!imageUri) return 0;
    const index = galleryImages.indexOf(imageUri);
    return index >= 0 ? index : 0;
  };

  const openImageViewer = (imageUri: string | undefined) => {
    const index = getImageIndex(imageUri);
    setImageViewerIndex(index);
    setImageViewerVisible(true);
  };

  if (!car) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#92929D" }}>
          Đang tải thông tin xe...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.75}
          >
            <ChevronLeft size={18} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Chi tiết xe</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Car Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: car.thumbnailUrl }} style={styles.mainImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            style={styles.imageGradient}
          />
        </View>

        {/* Car Info */}
        <View style={styles.infoCard}>
          <Text style={styles.carName}>{car.modelName}</Text>

          <View style={styles.row}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: AppColors.textSecondary,
              }}
            >
              Biển kiểm soát:{" "}
            </Text>
            <Text style={styles.location}>{car.license_plate}</Text>
          </View>

          {car.dsescription && (
            <Text style={styles.description}>{car.dsescription}</Text>
          )}
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceContent}>
            <View>
              <Text style={styles.priceLabel}>Giá thuê</Text>
              <Text style={styles.priceValue}>
                {car.price?.toLocaleString("vi-VN")}đ
                <Text style={styles.priceUnit}>/giờ</Text>
              </Text>
            </View>
            {car.average_rating > 0 && (
              <View style={styles.ratingContainer}>
                <Star size={20} color="#FFB800" fill="#FFB800" />
                <Text style={styles.ratingText}>
                  {car.average_rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hãng xe:</Text>
            <Text style={styles.detailValue}>{car.brand}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Loại xe:</Text>
            <Text style={styles.detailValue}>{car.vehicleType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số ghế:</Text>
            <Text style={styles.detailValue}>{car.seatCounts} chỗ</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nhiên liệu:</Text>
            <Text style={styles.detailValue}>{car.fuel}</Text>
          </View>
          {car.booking_count > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số lượt thuê:</Text>
              <Text style={styles.detailValue}>{car.booking_count}</Text>
            </View>
          )}
        </View>

        {/* Car Images Gallery */}
        {(carImages.front ||
          carImages.back ||
          carImages.left ||
          carImages.right ||
          carImages.interior) && (
            <View style={styles.galleryCard}>
              <Text style={styles.sectionTitle}>Hình ảnh xe</Text>

              {/* Main grid layout - 2 columns */}
              <View style={styles.imageGrid}>
                {carImages.front && (
                  <TouchableOpacity
                    style={styles.imageItem}
                    onPress={() => openImageViewer(carImages.front)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: carImages.front }}
                      style={styles.galleryImage}
                    />
                    <Text style={styles.imageLabel}>Mặt trước</Text>
                  </TouchableOpacity>
                )}
                {carImages.back && (
                  <TouchableOpacity
                    style={styles.imageItem}
                    onPress={() => openImageViewer(carImages.back)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: carImages.back }}
                      style={styles.galleryImage}
                    />
                    <Text style={styles.imageLabel}>Mặt sau</Text>
                  </TouchableOpacity>
                )}
                {carImages.left && (
                  <TouchableOpacity
                    style={styles.imageItem}
                    onPress={() => openImageViewer(carImages.left)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: carImages.left }}
                      style={styles.galleryImage}
                    />
                    <Text style={styles.imageLabel}>Bên trái</Text>
                  </TouchableOpacity>
                )}
                {carImages.right && (
                  <TouchableOpacity
                    style={styles.imageItem}
                    onPress={() => openImageViewer(carImages.right)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: carImages.right }}
                      style={styles.galleryImage}
                    />
                    <Text style={styles.imageLabel}>Bên phải</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Interior image - full width */}
              {carImages.interior && (
                <TouchableOpacity
                  style={styles.interiorContainer}
                  onPress={() => openImageViewer(carImages.interior)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: carImages.interior }}
                    style={styles.interiorImage}
                  />
                  <Text style={styles.imageLabel}>Nội thất</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={imageViewerVisible}
        images={galleryImages}
        initialIndex={imageViewerIndex}
        onClose={() => setImageViewerVisible(false)}
      />

      {/* Bottom Button */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(main)/(no-tabs)/instructor-detail",
              params: {
                instructorId: car.instructor_id,
              },
            })
          }
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[
              AppColors.primary,
              AppColors.gradientStart,
              AppColors.gradientEnd,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButton}
          >
            <Text style={styles.bookButtonText}>Đặt lịch thuê xe</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingVertical: StatusBar.currentHeight,
    paddingHorizontal: 20,
    position: "relative",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  imageContainer: {
    width: "100%",
    height: 280,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    backgroundColor: AppColors.gray200,
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  infoCard: {
    backgroundColor: AppColors.white,
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  carName: {
    fontSize: 24,
    fontWeight: "800",
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
    marginTop: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: AppColors.gray50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: AppColors.gray50,
    borderRadius: 12,
    gap: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  priceCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  priceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "800",
    color: AppColors.primary,
  },
  priceUnit: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  galleryCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  imageItem: {
    width: "48%",
    marginBottom: 16,
  },
  galleryImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: AppColors.gray200,
    marginBottom: 8,
  },
  interiorContainer: {
    marginTop: 4,
  },
  interiorImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: AppColors.gray200,
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
  detailsCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  bookButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  bookButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
