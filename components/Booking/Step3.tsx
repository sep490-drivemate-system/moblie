import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MapPin, CheckCircle } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";

interface Step3Props {
  selectedLocationId: string | null;
  pickupLocation: string;
  onLocationSelect: (locationId: string, locationName: string) => void;
}

const pickupLocations = [
  {
    id: "fpt_hcm",
    name: "FPT University Hồ Chí Minh",
    address: "Khu Công nghệ cao, Quận 9, TP.HCM",
  },
  {
    id: "fpt_hanoi",
    name: "FPT University Hà Nội",
    address: "Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội",
  },
  {
    id: "fpt_danang",
    name: "FPT University Đà Nẵng",
    address: "Khu Công nghệ cao, Quận Liên Chiểu, Đà Nẵng",
  },
  {
    id: "fpt_cantho",
    name: "FPT University Cần Thơ",
    address: "Khu Công nghệ cao, Quận Ninh Kiều, Cần Thơ",
  },
  {
    id: "fpt_quynhon",
    name: "FPT University Quy Nhơn",
    address: "Khu Công nghệ cao, Quận Bình Định, Quy Nhơn",
  },
  {
    id: "fpt_hoian",
    name: "FPT University Hội An",
    address: "Khu Công nghệ cao, Quận Hội An, Quảng Nam",
  },
];

export default function Step3({
  selectedLocationId,
  pickupLocation,
  onLocationSelect,
}: Step3Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Chọn địa điểm đón</Text>

      <View style={styles.locationNote}>
        <Text style={styles.locationNoteText}>
          💡 Lưu ý: Điểm đón cũng chính là điểm thả. Bạn sẽ được đón và trả tại
          cùng một địa điểm đã chọn.
        </Text>
      </View>

      <View style={styles.locationList}>
        {pickupLocations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={[
              styles.locationItem,
              selectedLocationId === location.id && styles.locationItemSelected,
            ]}
            onPress={() => onLocationSelect(location.id, location.name)}
          >
            <Text
              style={[
                styles.locationItemText,
                selectedLocationId === location.id &&
                styles.locationItemTextSelected,
              ]}
            >
              {location.name}
            </Text>
            {selectedLocationId === location.id && (
              <CheckCircle size={18} color={AppColors.primary} strokeWidth={2} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {pickupLocation && (
        <View style={styles.locationPreview}>
          <MapPin size={16} color="#10b981" strokeWidth={2} />
          <Text style={styles.locationPreviewText}>
            Đã chọn: {pickupLocation}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
  },
  locationNote: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  locationNoteText: {
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "600",
    lineHeight: 18,
  },
  locationList: {
    gap: 8,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  locationItemSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + "10",
  },
  locationItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  locationItemTextSelected: {
    color: AppColors.primary,
    fontWeight: "700",
  },
  locationPreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f0fdf4",
    marginTop: 12,
    gap: 8,
  },
  locationPreviewText: {
    flex: 1,
    fontSize: 14,
    color: "#15803d",
    fontWeight: "600",
  },
});
