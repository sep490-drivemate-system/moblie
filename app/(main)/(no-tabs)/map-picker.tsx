import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapPicker from "@/components/Booking/MapPicker";

const MAP_SELECTION_KEY = "map_selection_result";

export default function MapPickerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const type = (params.type as "pickup" | "dropoff") || "pickup";
  const initialLocation = params.initialLat && params.initialLng
    ? {
        latitude: parseFloat(params.initialLat as string),
        longitude: parseFloat(params.initialLng as string),
      }
    : undefined;

  const handleLocationSelect = async (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    // Store selection in AsyncStorage
    await AsyncStorage.setItem(
      MAP_SELECTION_KEY,
      JSON.stringify({
        type,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      })
    );
    router.back();
  };

  return (
    <MapPicker
      type={type}
      onLocationSelect={handleLocationSelect}
      initialLocation={initialLocation}
    />
  );
}

