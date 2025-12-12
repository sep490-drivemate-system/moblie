import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Clock, MapPin, Zap } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { Package } from "@/models/package/package";

interface PackageProps {
  pkg: Package;
}

export default function PackageItem({ pkg }: PackageProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/(main)/(no-tabs)/instructor-detail",
      params: { instructorId: pkg.instructorId },
    });
  };

  return (
    <TouchableOpacity
      style={styles.packageCard}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.packageHeader}>
        <Text style={styles.packageName} numberOfLines={2}>
          {pkg.name}
        </Text>
        {pkg.bookingCount && (
          <View style={styles.bookingCountBadge}>
            <Text style={styles.bookingCountBadgeText}>
              {pkg.bookingCount} lượt mua
            </Text>
          </View>
        )}
      </View>

      {/* Instructor + badge */}
      <View style={styles.cardHeader}>
        <View style={styles.instructorRow}>
          <View style={styles.instructorAvatar}>
            <Text style={styles.instructorAvatarText}>
              {pkg.instructorName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{pkg.instructorName}</Text>
            {pkg.carCount > 0 ? (
              <View style={styles.badgeWithVehicle}>
                <Text style={styles.badgeText}>Người hướng dẫn và xe</Text>
              </View>
            ) : (
              <View style={styles.badgeInstructor}>
                <Text style={styles.badgeText}>Chỉ người hướng dẫn</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Clock size={16} color="#64748b" strokeWidth={2} />
          <Text style={styles.detailText}>{pkg.duration} giờ</Text>
        </View>
        <View style={styles.detailItem}>
          <MapPin size={16} color="#64748b" strokeWidth={2} />
          <Text style={styles.detailText} numberOfLines={1}>
            {pkg.roadTypes.length} loại đường
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Zap size={16} color="#64748b" strokeWidth={2} />
          <Text style={styles.detailText}>{pkg.skills.length} kỹ năng</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {pkg.price.toLocaleString("vi-VN")} đ
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={handlePress}
          >
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={handlePress}
          >
            <Text style={styles.buyButtonText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  packageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 5,
    marginLeft: 2,
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: 22,
    flex: 1,
  },
  bookingCountBadge: {
    backgroundColor: AppColors.primary + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.primary + "40",
  },
  bookingCountBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.primary,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  instructorAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.primary,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  badgeWithVehicle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#86efac",
    alignSelf: "flex-start",
  },
  badgeInstructor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fcd34d",
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1f2937",
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: "30%",
  },
  detailText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.primary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  detailButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: AppColors.primary,
    backgroundColor: "#ffffff",
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.primary,
  },
  buyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
  },
  buyButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});

