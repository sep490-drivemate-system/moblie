import { IInstructors } from "@/models/instructor/instructor.type";
import { LinearGradient } from "expo-linear-gradient";
import { LucideStar, ShieldCheck } from "lucide-react-native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppColors } from "@/constants/Colors";

type Props = {
  instructor: IInstructors;
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
        colors={[AppColors.primary, "#9EF01A", "#CFFF8D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.banner}>
          <View style={styles.bookingContainer}>            
            <Text style={styles.bookingText}>
              Đã thuê {instructor.bookingCount} lượt
            </Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.body}>
        <Image source={{ uri: instructor.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.intructorName}>{instructor.fullName}</Text>
          <View style={styles.experienceContainer}>
            <ShieldCheck size={20} color={AppColors.primary} />
            <Text style={styles.experienceText}>
              {instructor.experienceYear} năm kinh nghiệm
            </Text>
          </View>
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
    backgroundColor: AppColors.primary,
    padding: 5,
    borderBottomLeftRadius: 10,
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
    color: AppColors.primary,
  },
});

export default InstructorItem;
