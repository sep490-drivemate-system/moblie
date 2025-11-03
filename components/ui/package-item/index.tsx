import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Clock, Car, User, MapPin, Star, Zap } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";

const { width } = Dimensions.get("window");

interface Package {
  id: string;
  instructorId: string;
  instructorName: string;
  name: string;
  duration: number;
  basePrice: number;
  roadTypes: string[];
  skills: string[];
  hasVehicle: boolean;
  rating?: number;
  bookingCount?: number;
}

interface PackageItemProps {
  package: Package;
}

export default function PackageItem({ package: pkg }: PackageItemProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/(main)/(no-tabs)/instructor-detail",
      params: { instructorId: pkg.instructorId },
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        {pkg.hasVehicle ? (
          <View style={styles.badgeWithVehicle}>
            <Car size={12} color="#16a34a" strokeWidth={2} />
            <Text style={styles.badgeText}>Có xe</Text>
          </View>
        ) : (
          <View style={styles.badgeInstructor}>
            <User size={12} color="#92400e" strokeWidth={2} />
            <Text style={styles.badgeText}>Người hướng dẫn</Text>
          </View>
        )}
        {pkg.rating && (
          <View style={styles.rating}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
            <Text style={styles.ratingText}>{pkg.rating}</Text>
          </View>
        )}
      </View>

      {/* Package name */}
      <Text style={styles.packageName} numberOfLines={2}>
        {pkg.name}
      </Text>

      {/* Instructor */}
      <Text style={styles.instructorName} numberOfLines={1}>
        {pkg.instructorName}
      </Text>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Clock size={14} color="#64748b" strokeWidth={2} />
          <Text style={styles.detailText}>{pkg.duration} giờ</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={14} color="#64748b" strokeWidth={2} />
          <Text style={styles.detailText} numberOfLines={1}>
            {pkg.roadTypes.slice(0, 2).join(", ")}
            {pkg.roadTypes.length > 2 && " +"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Zap size={14} color="#64748b" strokeWidth={2} />
          <Text style={styles.detailText}>{pkg.skills.length} kỹ năng</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Giá từ</Text>
          <Text style={styles.price}>
            {pkg.basePrice.toLocaleString("vi-VN")} đ
          </Text>
        </View>
        {pkg.bookingCount && (
          <View style={styles.bookingCount}>
            <Text style={styles.bookingCountText}>
              {pkg.bookingCount}+ đặt
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.7,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeWithVehicle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  badgeInstructor: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  badgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1f2937",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
  },
  packageName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 6,
    minHeight: 40,
  },
  instructorName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
  },
  details: {
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.primary,
  },
  bookingCount: {
    backgroundColor: AppColors.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.primary,
  },
});

