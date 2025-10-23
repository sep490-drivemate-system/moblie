import { MaterialIcons } from "@expo/vector-icons";
import { ArrowLeft, MoreVertical } from "lucide-react-native";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WaitingConfirmScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton}>
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Cần hỗ trợ ?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationDot} />
            <MoreVertical color="#000" size={24} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>
          Chúng tôi đã nhận được đơn đăng ký của bạn
        </Text>
        <Image
          style={styles.titleImage}
          source={require("@/assets/images/image_confirm_page.png")}
        />
      </View>
      <View style={styles.contentContainer}>
        {/* Step 1 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View style={styles.lineTop} />
            <View style={[styles.circle, styles.circleCompleted]}>
              <MaterialIcons name="check" size={14} color="#fff" />
            </View>
            <View style={styles.lineBottomActive} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.titleCompleted}>Nộp hồ sơ</Text>
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View style={styles.circleActive} />
            <View style={styles.lineBottom} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.titleActive}>Xét duyệt hồ sơ</Text>
            <Text style={styles.description}>
              Chúng tôi sẽ liên hệ lại với bạn trong vòng 1-2 ngày làm việc qua
              ứng dụng và email.
            </Text>
          </View>
        </View>

        {/* Step 3 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View style={styles.circleInactive} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.titleInactive}>Ký hợp đồng online</Text>
            <TouchableOpacity>
              <Text style={styles.link}>Nhấn tại đây</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: "#92929D",
    borderWidth: 1,
    marginRight: 10,
  },
  helpButtonText: {
    fontSize: 14,
    color: "#000",
  },
  notificationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: "#FF0000",
    borderRadius: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 25,
    fontWeight: "bold",
    flex: 1,
    flexShrink: 1,
  },
  titleImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    flex: 3,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconColumn: {
    alignItems: "center",
    width: 30,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  circleCompleted: {
    backgroundColor: "#0078D7",
  },
  circleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0078D7",
  },
  circleInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D3D3D3",
  },
  lineTop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  lineBottom: {
    flex: 1,
    backgroundColor: "#D3D3D3",
    width: 2,
  },
  lineBottomActive: {
    flex: 1,
    backgroundColor: "#0078D7",
    width: 2,
  },
  textContainer: {
    flex: 1,
    marginBottom: 24,
  },
  titleCompleted: {
    fontWeight: "600",
    color: "#000",
    marginTop: 2,
  },
  titleActive: {
    fontWeight: "600",
    color: "#000",
    marginTop: 2,
  },
  titleInactive: {
    fontWeight: "500",
    color: "#555",
    marginTop: 2,
  },
  description: {
    color: "#888",
    fontSize: 13,
    marginTop: 4,
  },
  link: {
    color: "#0078D7",
    marginTop: 4,
    fontSize: 14,
  },
});
