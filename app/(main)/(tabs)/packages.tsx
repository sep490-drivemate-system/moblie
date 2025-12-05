import { AppColors } from "@/constants/Colors";
import { popularPackages } from "@/data/home_data";
import { instructorsData } from "@/data/instructors_data";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import HeaderList from "@/components/Commons/HeaderList";
import { PackageFilterOption } from "@/models/package/package.enum";
import PackageFilterList from "@/components/Package/PackageFilterList";

// Road types list
const roadTypes = [
  "Đường khu dân cư",
  "Đường đô thị",
  "Quốc lộ",
  "Đường cao tốc",
  "Đường đèo",
  "Đường trường",
  "Đường qua khu đông dân cư",
  "Đường đang thi công",
  "Đường trơn trượt",
];


const filterOptions = [
  {
    id: PackageFilterOption.All,
    label: "Tất cả",
    value: null as boolean | null,
    type: "vehicle" as const,
  },
  {
    id: PackageFilterOption.HasVehicle,
    label: "Có xe",
    value: true as boolean,
    type: "vehicle" as const,
  },
  {
    id: PackageFilterOption.InstructorOnly,
    label: "Chỉ hướng dẫn",
    value: false as boolean,
    type: "vehicle" as const,
  },
  {
    id: PackageFilterOption.RoadType,
    label: "Loại đường",
    value: null,
    type: "roadType" as const,
  },
];



export default function PackagesScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const handlePackagePress = (pkg: (typeof popularPackages)[0]) => {
    router.push({
      pathname: "/(main)/(no-tabs)/instructor-detail",
      params: { instructorId: pkg.instructorId },
    });
  };

  const getInstructorAvatar = (instructorId: string) => {
    const instructor = instructorsData.find((i) => i.id === instructorId);
    return instructor?.avatar || "https://i.pravatar.cc/150?img=1";
  };

  return (
    <View style={styles.container}>
      <HeaderList title="Danh sách gói thuê" />
      <PackageFilterList
        packages={popularPackages}
        roadTypes={roadTypes}
        filterOptions={filterOptions}
        onPackagePress={handlePackagePress}
        getInstructorAvatar={getInstructorAvatar}
        bottomPadding={tabBarHeight + 20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  headerStats: {
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  headerCurve: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
});
