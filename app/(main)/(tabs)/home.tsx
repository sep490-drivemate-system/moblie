import CarItem from "@/components/ui/car-item";
import {
  carousels,
  drivingLicenses,
  listCar,
  listInstructorOptions,
} from "@/mock_data/home_data";
import { useRouter } from "expo-router";
import { ChevronRight as LucideChevronRight } from "lucide-react-native";
import {
  Button,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.carouselContainer}>
        <FlatList
          data={carousels}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image style={styles.carouseItem} source={{ uri: item.image }} />
          )}
        />
        <View style={styles.carouselDotContainer}>
          <View style={styles.carouselDot}></View>
          <View style={styles.carouselDot}></View>
          <View style={styles.carouselDot}></View>
        </View>
      </View>
      <View style={styles.contenContainer}>
        {/* tag voucher */}
        <View style={styles.voucherContainer}>
          <View style={styles.voucherContent}>
            <Text style={styles.voucherTitle}>
              Đăng nhập ngay để nhận ưu đãi
            </Text>
            <Text style={styles.voucherDes}>
              Đăng nhập ngay để{" "}
              <Text style={{ color: "#026AA7" }}>tiết kiệm đến 30%</Text> và dễ
              dàng tìm kiếm được người bạn đồng hành phù hợp với bạn.
            </Text>
          </View>
          <Image
            style={styles.voucherIcon}
            source={require("@/assets/images/party-popper-icon.png")}
          />
        </View>
        {/* driving license */}
        <View style={styles.licenseContainer}>
          <Text style={styles.label}>Chọn xe theo giấy phép lái xe</Text>
          <View style={styles.listContainer}>
            <FlatList
              data={drivingLicenses}
              keyExtractor={(item, index) => item + index}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.licenseItem}>
                  <Text style={styles.licenseItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
        {/* list car */}
        <View style={styles.listCarContainer}>
          <Text style={styles.label}>Có thể bạn sẽ quan tâm</Text>
          <View style={styles.listContainer}>
            <FlatList
              data={listCar}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 20 }}
              renderItem={({ item }) => <CarItem {...item} />}
              ListFooterComponent={() => (
                <View
                  style={{
                    width: "100%",
                    height: 450,
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: 100,
                      height: 100,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 10,
                    }}
                  >
                    <Text>Xem thêm</Text>
                    <LucideChevronRight />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
        {/* instructor */}
        <View style={{ paddingHorizontal: 10 }}>
          <Text style={[styles.label, { fontSize: 19 }]}>
            Chọn người hướng dẫn theo kinh nghiệm
          </Text>
          <View style={styles.listContainer}>
            <FlatList
              data={listInstructorOptions}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 20 }}
              renderItem={({ item }) => (
                <View>
                  <Image
                    source={item.imageUrl}
                    style={{
                      width: "100%",
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                    }}
                  />
                  <View
                    style={{
                      borderRightWidth: 1,
                      borderLeftWidth: 1,
                      borderBottomWidth: 1,
                      borderColor: "#026AA7",
                      borderBottomLeftRadius: 10,
                      borderBottomRightRadius: 10,
                      padding: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      {item.title}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 20,
                      }}
                    >
                      <Text>{item.description}</Text>
                      <TouchableOpacity
                        style={{
                          borderWidth: 2,
                          borderColor: "#026AA7",
                          borderRadius: 5,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                        }}
                      >
                        <Text style={{ fontWeight: "600", color: "#026AA7" }}>
                          Xem
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
        <Button
          title="go to reset on boarding"
          onPress={() => {
            router.navigate("/(onboarding)/reset-onboarding");
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  carouselContainer: {
    width: width,
    height: 200,
    position: "relative",
  },
  carouseItem: {
    width: width,
    height: 200,
  },
  carouselDotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    position: "absolute",
    left: 0,
    width: "100%",
    bottom: 10,
  },
  carouselDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "red",
  },
  contenContainer: {
    flex: 1,
  },
  voucherContainer: {
    marginVertical: 20,
    marginHorizontal: 20,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#026AA7",
    borderRadius: 10,
  },
  voucherContent: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 16,
    color: "#026AA7",
    fontWeight: 600,
    marginBottom: 10,
  },
  voucherDes: {
    fontSize: 14,
    color: "#333",
  },
  voucherIcon: {
    width: 80,
    height: 80,
  },
  licenseContainer: {
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: 600,
    color: "#026AA7",
  },
  licenseItem: {
    width: 80,
    height: 80,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#026AA7",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  licenseItemText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#026AA7",
  },
  listCarContainer: {
    paddingHorizontal: 10,
  },
  listContainer: {
    marginVertical: 10,
    padding: 5,
  },
});
