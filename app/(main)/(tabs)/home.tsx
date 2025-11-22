import CarItem from "@/components/ui/car-item";
import InstructorItem from "@/components/ui/instructor-item";
import PackageItem from "@/components/ui/package-item";
import { drivingLicenses, headerItems, listCar, popularPackages } from "@/data/home_data";
import { instructorsData } from "@/data/instructors_data";
import { LicenseType } from "@/models/license/license";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ChevronRight } from "lucide-react-native";
import {
  FlatList,
  ListRenderItemInfo,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { getUserIdFromToken, decodeToken } from "@/lib/jwt/tokenUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // Lấy thông tin user từ token
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const id = await getUserIdFromToken();
        setUserId(id);

        // Lấy username từ token
        const token = await AsyncStorage.getItem(
          process.env.EXPO_PUBLIC_STORAGE_TOKEN || "@token"
        );
        if (token) {
          const decoded = decodeToken(token);
          if (decoded) {
            setUserName(decoded.username || "User");
          }
        }
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    };

    loadUserInfo();
  }, []);

  // Handler khi click vào header item
  const handleHeaderItemPress = async (itemId: string) => {
    if (itemId === "3") {
      router.push({
        pathname: ROUTES.CHAT,
        params: {
          userId: userId,
          userName: userName,
        },
      });
    }
  };

  const renderDrivingLicense = ({ item }: ListRenderItemInfo<LicenseType>) => (
    <TouchableOpacity key={item.id} style={styles.drivingLicenseItem}>
      <Text style={styles.drivingLicenseItemText}>{item.name}</Text>
    </TouchableOpacity>
  );
  return (
    <ScrollView
      style={[styles.container, { paddingBottom: tabBarHeight + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.floatingContainer}>
          {headerItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.headerItem,
                index !== headerItems.length - 1 && {
                  borderRightWidth: 1,
                  borderColor: "#CCC",
                },
              ]}
              onPress={() => handleHeaderItemPress(item.id)}
            >
              <item.icon
                size={27}
                color={"#70E000"}
                style={index !== 0 && { marginLeft: 2 }}
              />
              <View>
                <Text style={styles.headerItemLabel}>{item.label}</Text>
                <Text style={styles.headerItemValue}>
                  {item.value} {item.label === "Ví DriveMate" && "đ"}
                </Text>
              </View>
              <View style={{ justifyContent: "flex-end" }}>
                <ChevronRight size={20} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.listItemContainer}>
          <Text style={styles.listLabel}>
            Loại giấy phép lái xe bạn quan tâm
          </Text>
          <FlatList
            data={drivingLicenses}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={renderDrivingLicense}
            contentContainerStyle={styles.listItem}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View style={styles.listItemContainer}>
          <Text style={styles.listLabel}>Gói được thuê thường xuyên</Text>
          <FlatList
            data={popularPackages}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.listItem}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <PackageItem package={item} key={item.id} />}
          />
        </View>
        <View style={styles.listItemContainer}>
          <Text style={styles.listLabel}>Người hướng dẫn nổi bật</Text>
          <FlatList
            data={instructorsData}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.listItem}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <InstructorItem instructor={item} />}
          />
        </View>
        <View style={styles.listItemContainer}>
          <Text style={styles.listLabel}>Xe nổi bật</Text>
          <FlatList
            data={listCar}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.listItem}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <CarItem car={item} key={item.id} />}
          />
        </View>


      </View>
    </ScrollView>
  );
}

//   container: { flex: 1, backgroundColor: "#FAFAFA" },
//   carouselContainer: {
//     width: width,
//     height: 200,
//     position: "relative",
//   },
//   carouseItem: {
//     width: width,
//     height: 200,
//   },
//   carouselDotContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: 10,
//     position: "absolute",
//     left: 0,
//     width: "100%",
//     bottom: 10,
//   },
//   carouselDot: {
//     width: 10,
//     height: 10,
//     borderRadius: "50%",
//     backgroundColor: "red",
//   },
//   contenContainer: {
//     flex: 1,
//   },
//   voucherContainer: {
//     marginVertical: 20,
//     marginHorizontal: 20,
//     padding: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: "#026AA7",
//     borderRadius: 10,
//   },
//   voucherContent: {
//     flex: 1,
//   },
//   voucherTitle: {
//     fontSize: 16,
//     color: "#026AA7",
//     fontWeight: 600,
//     marginBottom: 10,
//   },
//   voucherDes: {
//     fontSize: 14,
//     color: "#333",
//   },
//   voucherIcon: {
//     width: 80,
//     height: 80,
//   },
//   licenseContainer: {
//     paddingHorizontal: 10,
//   },
//   label: {
//     fontSize: 20,
//     fontWeight: 600,
//     color: "#026AA7",
//   },
//   licenseItem: {
//     width: 80,
//     height: 80,
//     backgroundColor: "#ffffff",
//     borderWidth: 1,
//     borderColor: "#026AA7",
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   licenseItemText: {
//     fontSize: 16,
//     fontWeight: 600,
//     color: "#026AA7",
//   },
//   listCarContainer: {
//     paddingHorizontal: 10,
//   },
//   listContainer: {
//     marginVertical: 10,
//     padding: 5,
//   },
// });
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F5",
  },
  header: {
    backgroundColor: "#70E000",
    paddingTop: StatusBar.currentHeight,
    alignItems: "center",
    position: "relative",
    height: 80,
  },
  floatingContainer: {
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 5,
    position: "absolute",
    top: 50,
    elevation: 4,
  },
  headerItem: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  headerItemLabel: {
    fontSize: 12,
    color: "#92929D",
  },
  headerItemValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  body: {
    alignItems: "center",
    marginTop: 50,
    gap: 20,
  },
  listItemContainer: {
    width: "95%",
    backgroundColor: "#FFF",
    paddingVertical: 15,
    paddingLeft: 20,
    borderRadius: 5,
    elevation: 3,
  },
  listLabel: {
    fontSize: 16,
    fontWeight: 500,
    color: "#70E000",
    marginBottom: 15,
  },
  listItem: {
    gap: 10,
  },
  drivingLicenseItem: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: "#70E000",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  drivingLicenseItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#70E000",
  },
});
