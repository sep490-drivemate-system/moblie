import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React from "react";
import {
  Antenna as LucideAntenna,
  Fuel as LucideFuel,
  MapPin as LucideMapPin,
  User as LucideUser,
  Star as LucideStar,
  ShieldCheck as LucideShieldCheck,
} from "lucide-react-native";
import { Car } from "@/models/car/car";

// type Props = {
//   id: number;
//   name: string;
//   imageUrl: string;
//   pricing: {
//     halfDay: {
//       price: number;
//       duration: number;
//     };
//     fullDay: {
//       price: number;
//       duration: number;
//     };
//   };
//   instructor: {
//     experience: string;
//   };
//   location: string;
//   rating: {
//     score: number;
//     totalStudents: number;
//   };
//   carDetails: {
//     seats: number;
//     transmission: string;
//     fuel: string;
//   };
//   variant?: "compact" | "full";
// };

type Props = {
  car: Car;
  variant?: "compact" | "full";
};

const CarItem: React.FC<Props> = ({ car, variant = "compact" }) => {
  return (
    <TouchableOpacity
      style={{ width: variant === "full" ? "100%" : 280 }}
      activeOpacity={0.9}
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
        <View>
          <Text style={styles.carName}>{car.name}</Text>
        </View>
        <View>
          <Text style={styles.halfDayPricing}>
            {car.pricing.halfDay.price.toLocaleString("vi-VN")}đ/{" "}
            {car.pricing.halfDay.duration} tiếng
          </Text>
          <Text style={styles.fullDayPricing}>
            {car.pricing.fullDay.price.toLocaleString("vi-VN")}đ/{" "}
            {car.pricing.fullDay.duration} tiếng
          </Text>
        </View>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <LucideShieldCheck width={15} height={15} color={"#026AA7"} />
            <Text>{car.instructor.experience}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <LucideMapPin width={15} height={15} color={"#026AA7"} />
            <Text>{car.location}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <View
            style={{
              paddingVertical: 5,
              paddingHorizontal: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#FFF68F",
              borderRadius: 5,
            }}
          >
            <LucideStar width={15} height={15} fill={"#EEC10A"} />
            <Text>{car.rating.score}</Text>
          </View>
          <Text>Đã học {car.rating.totalStudents} lượt</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideUser width={15} height={15} />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            {car.seats} chỗ
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideAntenna
            width={15}
            height={15}
            transform={[{ rotate: "180deg" }]}
          />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>{car.type}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideFuel width={15} height={15} />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>{car.fuel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  carImage: {
    width: 280,
    height: 180,
    resizeMode: "cover",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  carImageFull: {
    width: "100%",
  },
  information: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#026AA7",
    padding: 10,
    gap: 5,
  },
  carName: {
    fontSize: 16,
    fontWeight: "600",
  },
  halfDayPricing: {
    fontSize: 20,
    fontWeight: "600",
    color: "#026AA7",
  },
  fullDayPricing: {
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  footer: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#026AA7",
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
});

export default CarItem;
