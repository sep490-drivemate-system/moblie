import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";

const DUMMY_SERVICE_PACKAGES = [
  {
    id: 1,
    title: "Gói miền Tây",
    skills: ["Lùi xe", "Đỗ xe", "Quan sát"],
    roadTypes: ["Đường trơn trượt", "Đường đông dân cư"],
    duration: "1:30",
    carOption: "Có thể đi xe của khách hàng hoặc của tôi",
    price: 150000,
  },
];

const formatCurrencyVND = (value: number | string) => {
  const digitsOnly = String(value).replace(/\D/g, "");
  if (!digitsOnly) return "0";
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

function ServicePackageManagementScreen() {
  const router = useRouter();
  const [packages, setPackages] = useState(DUMMY_SERVICE_PACKAGES);

  const handleAdd = () => {
    router.push({
      pathname: "/(main)/(no-tabs)/(service-package)/service-package-detail",
      params: { mode: "create" },
    });
  };

  const handleDelete = (itemId: number) => {
    setPackages(packages.filter((item) => item.id !== itemId));
  };

  const handleDetail = (item: any) => {
    router.push("/(main)/(no-tabs)/(service-package)/service-package-detail");
  };

  return (
    <View style={styles.container}>
      {/* Modern Header with Gradient */}
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
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Danh sách gói dịch vụ</Text>
            <Text style={styles.headerSubtitle}>
              Quản lý các gói dịch vụ của bạn
            </Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{packages.length}</Text>
              <Text style={styles.statLabel}>Gói</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Button Section */}
        <View style={styles.addButtonSection}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.addButton}
            onPress={handleAdd}
          >
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientStart]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.solidButton}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Thêm gói mới</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {packages.length === 0 && (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="cube-outline"
                size={64}
                color={AppColors.primary}
              />
            </View>
            <Text style={styles.emptyText}>Chưa có gói dịch vụ nào</Text>
            <Text style={styles.emptySubtext}>
              Bắt đầu bằng cách thêm gói dịch vụ đầu tiên của bạn
            </Text>
          </View>
        )}

        <View style={styles.packagesList}>
          {packages.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.titleSection}>
                  <View style={styles.titleDot} />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Giá</Text>
                <Text style={styles.cardPrice}>
                  {formatCurrencyVND((item as any).price)} VNĐ
                </Text>
              </View>
              <View style={styles.cardInfoSection}>
                <View style={styles.infoBlock}>
                  <View style={styles.infoLabelRow}>
                    <View style={styles.infoDot} />
                    <Text style={styles.infoLabel}>Thời lượng</Text>
                  </View>
                  <Text style={styles.infoValue}>{item.duration}h</Text>
                </View>
                <View style={styles.infoBlock}>
                  <View style={styles.infoLabelRow}>
                    <View style={styles.infoDot} />
                    <Text style={styles.infoLabel}>Kỹ năng</Text>
                  </View>
                  <Text style={styles.infoValue}>{item.skills.join(", ")}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <View style={styles.infoLabelRow}>
                    <View style={styles.infoDot} />
                    <Text style={styles.infoLabel}>Loại đường</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {item.roadTypes.join(", ")}
                  </Text>
                </View>
                <View style={styles.infoBlockFull}>
                  <View style={styles.infoLabelRow}>
                    <View style={styles.infoDot} />
                    <Text style={styles.infoLabel}>Xe</Text>
                  </View>
                  <Text style={styles.infoValue}>{item.carOption}</Text>
                </View>
              </View>
              <View style={styles.cardActionRow}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.detailButtonWrapper}
                  onPress={() => handleDetail(item)}
                >
                  <View style={styles.detailButton}>
                    <Text style={styles.detailButtonText}>Chi tiết</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  headerStats: {
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  headerCurve: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 32,
    backgroundColor: "#ffffff",
  },
  addButtonSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 30,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${AppColors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: AppColors.gray600,
    textAlign: "center",
    lineHeight: 20,
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  solidButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  packagesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  cardBorderAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: AppColors.primary,
    opacity: 0.6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  titleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.primary,
  },
  cardTitle: {
    color: AppColors.textPrimary,
    fontWeight: "800",
    fontSize: 20,
    letterSpacing: 0.3,
  },
  priceContainer: {
    backgroundColor: `${AppColors.primary}10`,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primary,
    marginVertical: 8,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.gray600,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardPrice: {
    color: AppColors.primary,
    fontWeight: "800",
    fontSize: 24,
    letterSpacing: 0.5,
  },
  durationBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDuration: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cardInfoSection: {
    gap: 12,
    marginBottom: 4,
  },
  infoBlock: {
    backgroundColor: `${AppColors.primary}08`,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primary,
    marginBottom: 8,
  },
  infoBlockFull: {
    backgroundColor: `${AppColors.primary}08`,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.primary,
    marginBottom: 8,
  },
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: AppColors.primary,
  },
  infoLabel: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  infoValue: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
  },
  cardActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  detailButtonWrapper: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  detailButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  detailButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  deleteButton: {
    borderWidth: 2,
    borderColor: AppColors.error,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: AppColors.error,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },
});

export default ServicePackageManagementScreen;
