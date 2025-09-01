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

type Props = {
  id: number;
  name: string;
  imageUrl: string;
  pricing: {
    halfDay: {
      price: number;
      duration: number;
    };
    fullDay: {
      price: number;
      duration: number;
    };
  };
  instructor: {
    experience: string;
  };
  location: string;
  rating: {
    score: number;
    totalStudents: number;
  };
  carDetails: {
    seats: number;
    transmission: string;
    fuel: string;
  };
};

const CarItem: React.FC<Props> = ({
  id,
  name,
  imageUrl,
  pricing,
  instructor,
  location,
  rating,
  carDetails,
}) => {
  return (
    <TouchableOpacity>
      <Image
        style={styles.carImage}
        source={{
          uri: imageUrl,
        }}
      />
      <View style={styles.information}>
        <View>
          <Text style={styles.carName}>{name}</Text>
        </View>
        <View>
          <Text style={styles.halfDayPricing}>
            {pricing.halfDay.price.toLocaleString("vi-VN")}đ/{" "}
            {pricing.halfDay.duration} tiếng
          </Text>
          <Text style={styles.fullDayPricing}>
            {pricing.fullDay.price.toLocaleString("vi-VN")}đ/{" "}
            {pricing.fullDay.duration} tiếng
          </Text>
        </View>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <LucideShieldCheck width={15} height={15} color={"#026AA7"} />
            <Text>{instructor.experience}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <LucideMapPin width={15} height={15} color={"#026AA7"} />
            <Text>{location}</Text>
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
            <Text>{rating.score}</Text>
          </View>
          <Text>Đã học {rating.totalStudents} lượt</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideUser width={15} height={15} />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            {carDetails.seats} chỗ
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideAntenna
            width={15}
            height={15}
            transform={[{ rotate: "180deg" }]}
          />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            {carDetails.transmission}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <LucideFuel width={15} height={15} />
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            {carDetails.fuel}
          </Text>
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
