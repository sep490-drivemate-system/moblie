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

type Props = {
  car: Car;
  variant?: "compact" | "full";
};

const CarItem: React.FC<Props> = ({ car, variant = "compact" }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/(main)/(no-tabs)/car-detail",
      params: { carId: car.id.toString() },
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: variant === "full" ? "100%" : 280 }]}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <Image
        style={[
          styles.carImage,
          variant === "full" ? styles.carImageFull : undefined,
        ]}
        source={{
          uri: car.imageUrl,
        }}
      />
      <View style={styles.information}>
        <Text style={styles.carName}>{car.name}</Text>
        <Text style={styles.price}>
          {car.price.toLocaleString("vi-VN")} đ /{" "}
          <Text style={{ fontWeight: "400" }}>giờ</Text>
        </Text>
      </View>
      <View style={styles.footer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideUser size={18} color={"#70E000"} />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            {car.seats} chỗ
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideAntenna
            color={"#70E000"}
            size={18}
            transform={[{ rotate: "180deg" }]}
          />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>{car.type}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideFuel size={18} color={"#70E000"} />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>{car.fuel}</Text>
        </View>
      </View>
      <View style={styles.banner}>
        <View style={styles.ratingContainer}>
          <LucideStar size={15} color={"#edb435"} fill={"#edb435"} />
          <Text style={styles.ratingText}>{car.rating}</Text>
        </View>
        <View style={styles.bookingContainer}>
          <Text style={styles.bookingText}>
            Đã thuê {car.totalRentalCount} lượt
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
    color: "#70E000",
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
    backgroundColor: "#4a827d",
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
    backgroundColor: "#026AA7",
    padding: 5,
    alignItems: "center",
  },
  bookingText: {
    color: "#FFF",
  },
});

export default CarItem;
