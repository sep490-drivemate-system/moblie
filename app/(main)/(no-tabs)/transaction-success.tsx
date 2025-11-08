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

export default function TransactionSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    instructorId: string;
    packageId: string;
    vehicleId?: string;
  }>();

  const handleBookNow = () => {
    router.push({
      pathname: "/(main)/(no-tabs)/my-packages",
    });
  };

  const handleBackToInstructor = () => {
    router.push({
      pathname: "/(main)/(tabs)/instructors",
      params: {
        instructorId: params.instructorId,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

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
            Bạn đã mua gói thuê thành công
          </Text>
        </View>


        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>Bước tiếp theo</Text>
          <View style={styles.stepItem}>
            <Calendar size={20} color={AppColors.primary} strokeWidth={2} />
            <Text style={styles.stepText}>
              Đặt lịch thuê ngay để bắt đầu sử dụng gói thuê của bạn
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
          style={styles.backButtonBottom}
          onPress={handleBackToInstructor}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color={AppColors.primary} strokeWidth={2} />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.9}
        >

          <Text style={styles.bookButtonText}>Gói đã mua</Text>
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
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  backButtonBottom: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.borderLight,
    backgroundColor: "#ffffff",
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.primary,
  },
  bookButton: {
    flex: 2,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
});

