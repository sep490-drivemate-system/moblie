import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React from "react";
import {
  Antenna as LucideAntenna,
  Fuel as LucideFuel,
  MapPin as LucideMapPin,
  User as LucideUser,
  Star as LucideStar,
} from "lucide-react-native";
import { Car } from "@/models/car/car";
import { useRouter } from "expo-router";
import { AppColors } from "@/constants/Colors";
import VNDCurrency from "@/components/Commons/VNDCurrency ";
import { ICar } from "@/models/car/car";
import { ROUTES } from "@/constants/routes";

type Props = {
  car: ICar;
};

const CarItem: React.FC<Props> = ({ car }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: ROUTES.MAIN_NO_TABS_CAR_DETAIL,
      params: { carId: car.id.toString() },
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <Image
        style={[
          styles.carImage,
        ]}
        source={{
          uri: car.thumbnailUrl,
        }}
      />
      <View style={styles.information}>
        <Text style={styles.carName}>{car.modelName}</Text>
        <Text style={styles.price}>
          <VNDCurrency amount={car.price} />
        </Text>
      </View>
      <View style={styles.footer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideUser size={18} color={AppColors.primary} />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            {car.seatCounts} chỗ
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideAntenna
            color={AppColors.primary}
            size={18}
            transform={[{ rotate: "180deg" }]}
          />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>{car.vehicleType}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideFuel size={18} color={AppColors.primary} />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>{car.fuel}</Text>
        </View>
      </View>
      <View style={styles.banner}>
        <View style={styles.ratingContainer}>
          <LucideStar size={15} color={"#edb435"} fill={"#edb435"} />
          <Text style={styles.ratingText}>{car.average_rating}</Text>
          <Text style={{ fontSize: 14, fontWeight: "500", color: AppColors.textSecondary }}>|</Text>
        </View>
        <View style={styles.bookingContainer}>
          <Text style={styles.bookingText}>
            Đã thuê {car.booking_count} lượt
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    elevation: 2,
    overflow: "hidden",
    borderRadius: 10,
    marginBottom: 5,
    marginLeft: 2,
    position: "relative",
  },
  carImage: {
    width: 280,
    height: 150,
    resizeMode: "cover",
  },
  carImageFull: {
    width: "100%",
  },
  information: {
    padding: 10,
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  carName: {
    fontSize: 20,
    fontWeight: "600",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationText: {
    fontSize: 18,
  },
  price: {
    fontSize: 20,
    color: AppColors.primary,
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  banner: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    gap: 0,
    backgroundColor: AppColors.primary,
    borderBottomLeftRadius: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    padding: 5,
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    color: "#edb435",
  },
  bookingContainer: {
    backgroundColor: AppColors.primary,
    padding: 5,
    alignItems: "center",
  },
  bookingText: {
    color: "#FFF",
  },
});

export default CarItem;
