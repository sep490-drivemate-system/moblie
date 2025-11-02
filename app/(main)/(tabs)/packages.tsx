import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Package, Clock, User, ChevronRight, Calendar } from "lucide-react-native";
import { userPackagesData } from "@/data/user_packages_data";
import { AppColors } from "@/constants/Colors";

export default function PackagesScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return AppColors.primary;
      case "completed":
        return "#64748b";
      case "expired":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "completed":
        return "Đã hoàn thành";
      case "expired":
        return "Đã hết hạn";
      default:
        return status;
    }
  };

  const handlePackagePress = (packageId: string) => {
    router.push({
      pathname: "/(main)/(no-tabs)/package-detail",
      params: { packageId },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gói Của Tôi</Text>
        <Text style={styles.headerSubtitle}>
          Quản lý các gói đã mua
        </Text>
      </View>

      {/* Packages List */}
      <View style={styles.body}>
        {userPackagesData.map((pkg) => (
          <TouchableOpacity 
            key={pkg.id} 
            style={styles.packageCard}
            onPress={() => handlePackagePress(pkg.id)}
          >
            {/* Instructor Info */}
            <View style={styles.instructorSection}>
              <Image 
                source={{ uri: pkg.instructorAvatar }}
                style={styles.instructorAvatar}
              />
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorName}>{pkg.instructorName}</Text>
                <View style={styles.statusBadge} style={[styles.statusBadge, { backgroundColor: getStatusColor(pkg.status) + '20', borderColor: getStatusColor(pkg.status) }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(pkg.status) }]}>
                    {getStatusText(pkg.status)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Package Name */}
            <Text style={styles.packageName}>{pkg.packageName}</Text>

            {/* Hours Progress */}
            <View style={styles.hoursSection}>
              <View style={styles.hoursHeader}>
                <Clock size={16} color={AppColors.primary} strokeWidth={2} />
                <Text style={styles.hoursSectionTitle}>Thời lượng gói</Text>
              </View>
              
              <View style={styles.hoursProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(pkg.usedHours / pkg.totalHours) * 100}%`,
                        backgroundColor: pkg.status === 'completed' ? '#64748b' : AppColors.primary 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {pkg.usedHours}h / {pkg.totalHours}h
                </Text>
              </View>

              <View style={styles.hoursStats}>
                <View style={styles.hoursStat}>
                  <Text style={styles.hoursStatLabel}>Đã dùng</Text>
                  <Text style={styles.hoursStatValue}>{pkg.usedHours}h</Text>
                </View>
                <View style={styles.hoursStatDivider} />
                <View style={styles.hoursStat}>
                  <Text style={styles.hoursStatLabel}>Còn lại</Text>
                  <Text style={[styles.hoursStatValue, { color: pkg.remainingHours > 0 ? AppColors.primary : '#ef4444' }]}>
                    {pkg.remainingHours}h
                  </Text>
                </View>
              </View>
            </View>

            {/* Sessions Count */}
            <View style={styles.sessionsInfo}>
              <Calendar size={16} color="#64748b" strokeWidth={2} />
              <Text style={styles.sessionsText}>
                {pkg.sessions.length} buổi học đã đặt
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.packageFooter}>
              <View>
                <Text style={styles.purchaseDateLabel}>Ngày mua</Text>
                <Text style={styles.purchaseDateValue}>
                  {new Date(pkg.purchaseDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
              <View style={styles.viewDetailButton}>
                <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                <ChevronRight size={18} color={AppColors.primary} strokeWidth={2} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Empty State */}
      {userPackagesData.length === 0 && (
        <View style={styles.emptyState}>
          <Package size={64} color="#cbd5e1" strokeWidth={1.5} />
          <Text style={styles.emptyText}>Bạn chưa có gói nào</Text>
          <Text style={styles.emptySubtext}>
            Khám phá và chọn gói phù hợp với bạn
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F5",
  },
  header: {
    backgroundColor: AppColors.primary,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: AppColors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: AppColors.white,
    opacity: 0.9,
  },
  body: {
    paddingHorizontal: 15,
    paddingTop: 20,
    gap: 16,
  },
  packageCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  instructorSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  instructorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e2e8f0",
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  packageName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
  },
  hoursSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  hoursHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  hoursSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  hoursProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    textAlign: "right",
  },
  hoursStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  hoursStat: {
    alignItems: "center",
  },
  hoursStatLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  hoursStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  hoursStatDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  sessionsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sessionsText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  packageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  purchaseDateLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  purchaseDateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  viewDetailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewDetailText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#475569",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
});

