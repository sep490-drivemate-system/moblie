import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CheckCircle, Calendar, ArrowLeft, Package } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { instructorsData } from "@/data/instructors_data";
import { popularPackages } from "@/data/home_data";

export default function TransactionSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    instructorId: string;
    packageId: string;
  }>();

  const instructor = instructorsData.find((i) => i.id === params.instructorId);
  const pkg = popularPackages.find((p) => p.id === params.packageId) ||
    instructor?.packages?.find((p) => p.id === params.packageId);

  const handleBookNow = () => {
    router.push({
      pathname: "/(main)/(no-tabs)/booking",
      params: {
        instructorId: params.instructorId,
        packageId: params.packageId,
        vehicleId: "",
      },
    });
  };

  const handleBackToPackages = () => {
    router.replace("/(main)/(no-tabs)/my-packages");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Gradient */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToPackages}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIconCircle}>
            <CheckCircle size={80} color={AppColors.primary} strokeWidth={2} />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.successTitle}>Giao dịch thành công!</Text>
          <Text style={styles.successSubtitle}>
            Bạn đã mua gói học thành công
          </Text>
        </View>

        {/* Transaction Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Package size={24} color={AppColors.primary} strokeWidth={2} />
            <Text style={styles.cardTitle}>Chi tiết gói học</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giảng viên:</Text>
            <View style={styles.instructorRow}>
              <Image
                source={{ uri: instructor?.avatar || "https://i.pravatar.cc/150?img=1" }}
                style={styles.instructorAvatar}
              />
              <Text style={styles.detailValue}>{instructor?.name || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gói học:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {pkg?.name || "N/A"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời lượng:</Text>
            <Text style={styles.detailValue}>
              {pkg?.duration || "N/A"} giờ
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giá:</Text>
            <Text style={styles.priceValue}>
              {pkg?.basePrice ? pkg.basePrice.toLocaleString("vi-VN") : "N/A"} đ
            </Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>Bước tiếp theo</Text>
          <View style={styles.stepItem}>
            <Calendar size={20} color={AppColors.primary} strokeWidth={2} />
            <Text style={styles.stepText}>
              Đặt lịch học ngay để bắt đầu sử dụng gói học của bạn
            </Text>
          </View>
          <View style={styles.stepItem}>
            <Package size={20} color={AppColors.primary} strokeWidth={2} />
            <Text style={styles.stepText}>
              Quản lý gói học của bạn tại màn hình "Gói của tôi"
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.9}
        >
          <Calendar size={20} color="#ffffff" strokeWidth={2} />
          <Text style={styles.bookButtonText}>Đặt lịch ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButtonBottom}
          onPress={handleBackToPackages}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color={AppColors.primary} strokeWidth={2} />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: AppColors.primary,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  successIconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: AppColors.primary,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#f1f5f9",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "700",
    flex: 2,
    textAlign: "right",
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 2,
    justifyContent: "flex-end",
  },
  instructorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  priceValue: {
    fontSize: 18,
    color: AppColors.primary,
    fontWeight: "800",
    flex: 2,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  nextStepsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  stepText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
    lineHeight: 20,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bookButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  backButtonBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.primary,
  },
});

