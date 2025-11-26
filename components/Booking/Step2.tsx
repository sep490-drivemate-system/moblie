import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from "react-native";
import { MapPin, CheckCircle } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import MapPickerModal from "./MapPickerModal";

interface INoviceDriverAddress {
  id: string;
  addressString: string;
  latitude: number;
  longitude: number;
}

type LocationOption = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

interface Step3Props {
  selectedPickupId: string | null;
  selectedDropoffId: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  onPickupSelect: (location: LocationOption) => void;
  onDropoffSelect: (location: LocationOption) => void;
  isSameDropoff: boolean;
  onToggleSameDropoff: (value: boolean) => void;
  addresses?: INoviceDriverAddress[];
  isLoading?: boolean;
}

export default function Step3({
  selectedPickupId,
  selectedDropoffId,
  pickupLocation,
  dropoffLocation,
  onPickupSelect,
  onDropoffSelect,
  isSameDropoff,
  onToggleSameDropoff,
  addresses = [],
  isLoading = false,
}: Step3Props) {
  const displayLocations: LocationOption[] =
    addresses.length > 0
      ? addresses.map((addr) => ({
        id: addr.id,
        name: addr.addressString,
        address: addr.addressString,
        latitude: addr.latitude,
        longitude: addr.longitude,
      }))
      : [];

  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [mapSelectionType, setMapSelectionType] = useState<"pickup" | "dropoff">(
    "pickup"
  );
  const [mapInitialCoordinate, setMapInitialCoordinate] = useState<
    { latitude: number; longitude: number } | undefined
  >(undefined);

  const findLocationById = useMemo(
    () => (locationId: string | null) =>
      displayLocations.find((location) => location.id === locationId),
    [displayLocations]
  );

  const openMapPicker = (type: "pickup" | "dropoff") => {
    const selectedLocation =
      type === "pickup"
        ? findLocationById(selectedPickupId)
        : findLocationById(selectedDropoffId);

    if (selectedLocation) {
      setMapInitialCoordinate({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
    } else {
      setMapInitialCoordinate(undefined);
    }

    setMapSelectionType(type);
    setMapPickerVisible(true);
  };

  const handleMapConfirm = (result: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    const newLocation: LocationOption = {
      id: `map_${Date.now()}`,
      name: result.address,
      address: result.address,
      latitude: result.latitude,
      longitude: result.longitude,
    };

    if (mapSelectionType === "pickup") {
      onPickupSelect(newLocation);
    } else {
      onDropoffSelect(newLocation);
    }

    setMapPickerVisible(false);
  };

  const renderLocationList = (
    selectedId: string | null,
    onSelect: (location: typeof displayLocations[number]) => void
  ) => (
    <View style={styles.locationList}>
      {displayLocations.map((location) => (
        <TouchableOpacity
          key={location.id}
          style={[
            styles.locationItem,
            selectedId === location.id && styles.locationItemSelected,
          ]}
          onPress={() => onSelect(location)}
        >
          <View style={styles.locationItemContent}>
            <MapPin
              size={20}
              color={
                selectedId === location.id ? AppColors.primary : "#64748b"
              }
              strokeWidth={2}
            />
            <Text
              style={[
                styles.locationItemText,
                selectedId === location.id && styles.locationItemTextSelected,
              ]}
            >
              {location.name}
            </Text>
          </View>
          {selectedId === location.id && (
            <CheckCircle size={18} color={AppColors.primary} strokeWidth={2} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chọn địa điểm đón</Text>
        {isLoading && (
          <ActivityIndicator size="small" color={AppColors.primary} style={{ marginLeft: 8 }} />
        )}
      </View>

      <View style={styles.sameLocationCard}>
        <Text style={styles.sameLocationLabel}>
          Điểm trả giống điểm đón
        </Text>
        <Switch
          value={isSameDropoff}
          onValueChange={onToggleSameDropoff}
          trackColor={{ false: "#e2e8f0", true: AppColors.primary + "55" }}
          thumbColor={isSameDropoff ? AppColors.primary : "#fff"}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Đang tải địa chỉ...</Text>
        </View>
      ) : (
        <>
          <View style={styles.locationSection}>
            <View style={styles.locationHeaderRow}>
              <Text style={styles.locationSectionTitle}>Điểm đón</Text>
              <TouchableOpacity
                onPress={() => openMapPicker("pickup")}
                style={styles.mapButton}
              >
                <Text style={styles.mapButtonText}>Chọn trên bản đồ</Text>
              </TouchableOpacity>
            </View>
            {renderLocationList(selectedPickupId, (location) =>
              onPickupSelect(location)
            )}
          </View>

          {!isSameDropoff && (
            <View style={styles.locationSection}>
              <View style={styles.locationHeaderRow}>
                <Text style={styles.locationSectionTitle}>Điểm trả</Text>
                <TouchableOpacity
                  onPress={() => openMapPicker("dropoff")}
                  style={styles.mapButton}
                >
                  <Text style={styles.mapButtonText}>Chọn trên bản đồ</Text>
                </TouchableOpacity>
              </View>
              {renderLocationList(selectedDropoffId, (location) =>
                onDropoffSelect(location)
              )}
            </View>
          )}
        </>
      )}

      {(pickupLocation || dropoffLocation) && (
        <View style={styles.locationPreviewContainer}>
          {pickupLocation ? (
            <View style={styles.locationPreview}>
              <MapPin size={16} color="#10b981" strokeWidth={2} />
              <Text style={styles.locationPreviewText}>
                Đón: {pickupLocation}
              </Text>
            </View>
          ) : null}
          {dropoffLocation ? (
            <View style={styles.locationPreview}>
              <MapPin size={16} color="#f97316" strokeWidth={2} />
              <Text style={styles.locationPreviewText}>
                Trả: {dropoffLocation}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <MapPickerModal
        visible={mapPickerVisible}
        selectionType={mapSelectionType}
        initialCoordinate={mapInitialCoordinate}
        onClose={() => setMapPickerVisible(false)}
        onConfirm={handleMapConfirm}
      />
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  locationItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
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
  locationSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  locationHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  locationSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  mapButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: AppColors.primary + "10",
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.primary,
  },
  locationPreviewContainer: {
    marginTop: 8,
    gap: 8,
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
  sameLocationCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  sameLocationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  locationPreviewText: {
    flex: 1,
    fontSize: 14,
    color: "#15803d",
    fontWeight: "600",
  },
});
