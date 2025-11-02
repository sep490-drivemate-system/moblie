import { IInstructor } from "@/models/instructor/instructor.type";
import { LinearGradient } from "expo-linear-gradient";
import { LucideStar, ShieldCheck } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  instructor: IInstructor;
  variant?: "compact" | "full";
};
const InstructorItem: React.FC<Props> = ({
  instructor,
  variant = "compact",
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { width: variant === "full" ? "100%" : 280 }]}
    >
      <LinearGradient
        colors={["#70E000", "#9EF01A", "#CFFF8D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.banner}>
          <View style={styles.ratingContainer}>
            <LucideStar size={15} color={"#edb435"} fill={"#edb435"} />
            <Text style={styles.ratingText}>{instructor.rating}</Text>
          </View>
          <View style={styles.bookingContainer}>
            <Text style={styles.bookingText}>
              Đã thuê {instructor.totalBookings} lượt
            </Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.body}>
        <Image source={{ uri: instructor.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.intructorName}>{instructor.name}</Text>
          <View style={styles.experienceContainer}>
            <ShieldCheck size={20} color={"#70E000"} />
            <Text style={styles.experienceText}>{instructor.experience}</Text>
          </View>
          <Text style={styles.price}>
            {instructor.price ? instructor.price.toLocaleString("vi-VN") : "Liên hệ"} GF /{" "}
            <Text style={{ fontWeight: "400" }}>giờ</Text>
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
  },
  header: {
    height: 100,
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
  body: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    marginTop: -55,
    borderRadius: 50,
  },
  info: {
    flex: 1,
    gap: 5,
    padding: 5,
  },
  intructorName: {
    fontSize: 20,
    fontWeight: 500,
  },
  experienceContainer: {
    flexDirection: "row",
    gap: 5,
  },
  experienceText: {
    fontSize: 15,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#70E000",
  },
});

export default InstructorItem;
