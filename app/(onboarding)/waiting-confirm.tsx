import { MaterialIcons } from "@expo/vector-icons";
import { ArrowLeft, MoreVertical, Car } from "lucide-react-native";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WaitingConfirmScreen() {
  // Reset tất cả dữ liệu onboarding khi vào trang này
  useEffect(() => {
    const resetOnboardingData = async () => {
      try {
        // Danh sách tất cả các keys cần xóa trong quá trình onboarding
        const keysToRemove = [
          // Role và onboarding status
          "user_role",
          "onboarding_completed",
          "quiz_completed",
          "car_added",
          "otp_verified",
          
          // Form data
          "terms_and_conditions_data",
          "emergency_contact_data",
          "commitment_data",
          
          // Personal Identification - Avatar
          "temp_user_avatar",
          "user_avatar",
          
          // Personal Identification - ID Card
          "temp_id_front",
          "temp_id_back",
          "id_front",
          "id_back",
          "id_card_data",
          
          // Personal Identification - License
          "temp_license_front",
          "temp_license_back",
          "license_front",
          "license_back",
          "license_data",
          
          // Personal Identification - Professional License/Certificate
          "temp_certificate",
          "certificate",
          "certificate_data",
          
          // Personal Identification - Healthcare Certificate
          "temp_healthcare_certificate",
          "healthcare_certificate",
          "healthcare_certificate_data",
          
          // Personal Identification - Criminal Record
          "temp_criminal_record",
          "criminal_record",
          "criminal_record_data",
          
          // Car - Registration
          "temp_car_registration_front",
          "temp_car_registration_back",
          "car_registration_front",
          "car_registration_back",
          "car_registration_data",
          
          // Car - Insurance
          "temp_car_insurance_front",
          "temp_car_insurance_back",
          "car_insurance_front",
          "car_insurance_back",
          "car_insurance_data",
          
          // Car - Inspection Certificate
          "temp_car_inspection_certificate_front",
          "temp_car_inspection_certificate_back",
          "car_inspection_certificate_front",
          "car_inspection_certificate_back",
          "car_inspection_certificate_data",
          
          // Car - Verification Images
          "temp_car_verification_front",
          "temp_car_verification_back",
          "temp_car_verification_side",
          "temp_car_verification_interior",
        ];

        // Xóa tất cả các keys
        await Promise.all(
          keysToRemove.map((key) => AsyncStorage.removeItem(key))
        );

        console.log("Onboarding data has been reset successfully");
      } catch (error) {
        console.error("Error resetting onboarding data:", error);
      }
    };

    resetOnboardingData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo_drivemate_green.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>
          Chúng tôi đã nhận được đơn đăng ký của bạn
        </Text>
        <Image
          style={styles.titleImage}
          source={require("@/assets/images/icon3.png")}
        />
      </View>
      <View style={styles.contentContainer}>
        {/* Step 1 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
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
            <View style={styles.lineBottom} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.titleInactive}>Ký hợp đồng online</Text>
            <TouchableOpacity>
              <Text style={styles.link}>Nhấn tại đây</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Step 4 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View style={styles.circleInactive} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.titleInactive}>
              Chào mừng bạn đã trở thành một phần của{" "}
              <Text style={styles.drivemateText}>Drivemate</Text>
            </Text>
            <TouchableOpacity>
              <Text style={styles.link}>
                Nhấn tại đây để thiết kế gói thuê của bạn
              </Text>
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
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButtons: {
    flexDirection: "row",
  },
  logo: {
    width: 150,
    height: 40,
    resizeMode: "cover",
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
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
    width: 200,
    height: 200,
    resizeMode: "contain",
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
    backgroundColor: "#70E000",
  },
  circleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#70E000",
  },
  circleInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D3D3D3",
  },
  lineBottom: {
    flex: 1,
    backgroundColor: "#D3D3D3",
    width: 2,
  },
  lineBottomActive: {
    flex: 1,
    backgroundColor: "#70E000",
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
    color: "#70E000",
    marginTop: 4,
    fontSize: 14,
  },
  drivemateText: {
    color: "#70E000",
    fontWeight: "600",
  },
});
