import { MaterialIcons } from "@expo/vector-icons";
import { ArrowLeft, MoreVertical, Car } from "lucide-react-native";
import {
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getInstructorApplicant } from "@/features/instructor/instructorThunk";
import { AppColors } from "@/constants/Colors";
import { ROUTES } from "@/constants/routes";

export default function WaitingConfirmScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<number | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [isTermsCompleted, setIsTermsCompleted] = useState(false);

  const isReviewApproved = applicationStatus === 2;
  const isReviewRejected = applicationStatus === 3;
  const isReviewPending = !isReviewApproved && !isReviewRejected;

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

        "registered_instructor_id",
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

  const fetchApplicantStatus = useCallback(async () => {
    if (!instructorId) return null;
    try {
      const response = await dispatch(
        getInstructorApplicant({ instructorId })
      ).unwrap();
      const status = response.value?.applicationStatus ?? null;
      setApplicationStatus(status);
      return status;
    } catch (error) {
      console.log("Failed to fetch instructor applicant:", error);
      return null;
    }
  }, [dispatch, instructorId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchApplicantStatus();
    setRefreshing(false);
  }, [fetchApplicantStatus]);

  useEffect(() => {
    let isMounted = true;
    const getRegisteredInstructorId = async () => {
      const registeredInstructorId = await AsyncStorage.getItem(
        "registered_instructor_id"
      );
      if (isMounted) {
        setInstructorId(registeredInstructorId);
      }
    };
    getRegisteredInstructorId();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (instructorId) {
      fetchApplicantStatus();
    }
  }, [instructorId, fetchApplicantStatus]);

  useFocusEffect(
    useCallback(() => {
      const checkTermsCompleted = async () => {
        const data = await AsyncStorage.getItem("terms_and_conditions_data");
        setIsTermsCompleted(!!data);
      };

      checkTermsCompleted();

      if (instructorId) {
        fetchApplicantStatus();
      }
    }, [fetchApplicantStatus, instructorId])
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
            <View
              style={[
                styles.circle,
                styles.circleCompleted,
                isReviewRejected && styles.circleRejected,
              ]}
            >
              <MaterialIcons name="check" size={14} color="#fff" />
            </View>
            <View
              style={[
                styles.lineBottomActive,
                isReviewRejected && styles.lineBottomRejected,
              ]}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.titleCompleted}>Nộp hồ sơ</Text>
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View
              style={[
                styles.circle,
                isReviewApproved
                  ? styles.circleCompleted
                  : isReviewRejected
                  ? styles.circleRejected
                  : styles.circleActive,
              ]}
            >
              {isReviewApproved && (
                <MaterialIcons name="check" size={14} color="#fff" />
              )}
              {isReviewRejected && (
                <MaterialIcons name="close" size={14} color="#fff" />
              )}
            </View>
            <View
              style={[
                isReviewRejected
                  ? styles.lineBottomRejected
                  : isReviewApproved
                  ? styles.lineBottomActive
                  : styles.lineBottom,
              ]}
            />
          </View>

          <View style={styles.textContainer}>
            <Text
              style={
                isReviewRejected
                  ? styles.titleRejected
                  : isReviewApproved
                  ? styles.titleCompleted
                  : styles.titleActive
              }
            >
              Xét duyệt hồ sơ
            </Text>
            {isReviewPending && (
              <Text style={styles.description}>
                Chúng tôi sẽ liên hệ lại với bạn trong vòng 1-2 ngày làm việc
                qua ứng dụng và email.
              </Text>
            )}
            {isReviewApproved && (
              <Text style={styles.description}>
                Hồ sơ đã được xét duyệt. Vui lòng tiếp tục hoàn tất các bước
                tiếp theo.
              </Text>
            )}
            {isReviewRejected && (
              <Text style={[styles.description, styles.descriptionRejected]}>
                Hồ sơ bị từ chối. Vui lòng kiểm tra email để biết thêm chi tiết.
              </Text>
            )}
          </View>
        </View>

        {/* Step 3 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View
              style={[
                styles.circle,
                isReviewApproved
                  ? styles.circleActive
                  : isReviewRejected
                  ? styles.circleRejected
                  : styles.circleInactive,
              ]}
            >
              {isTermsCompleted && (
                <MaterialIcons name="check" size={14} color="#fff" />
              )}
              {isReviewRejected && (
                <MaterialIcons name="close" size={14} color="#fff" />
              )}
            </View>
            <View
              style={[
                isReviewRejected
                  ? styles.lineBottomRejected
                  : isReviewApproved
                  ? styles.lineBottomActive
                  : styles.lineBottom,
              ]}
            />
          </View>

          <View style={styles.textContainer}>
            <Text
              style={
                isReviewApproved ? styles.titleActive : styles.titleInactive
              }
            >
              Ký hợp đồng online
            </Text>
            {isReviewApproved && !isTermsCompleted && (
              <TouchableOpacity
                onPress={() => {
                  router.push("/(onboarding)/terms-and-conditions");
                }}
              >
                <Text style={styles.link}>Nhấn tại đây</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Step 4 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View
              style={[
                styles.circle,
                isTermsCompleted
                  ? styles.circleActive
                  : isReviewRejected
                  ? styles.circleRejected
                  : styles.circleInactive,
              ]}
            >
              {isTermsCompleted && (
                <MaterialIcons name="check" size={14} color="#fff" />
              )}
              {isReviewRejected && (
                <MaterialIcons name="close" size={14} color="#fff" />
              )}
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.titleInactive}>
              Chào mừng bạn đã trở thành một phần của{" "}
              <Text style={styles.drivemateText}>Drivemate</Text>
            </Text>
            {isReviewApproved && isTermsCompleted && (
              <TouchableOpacity
                onPress={() => {
                  resetOnboardingData();
                  router.replace(ROUTES.SIGNIN);
                }}
              >
                <Text style={styles.link}>
                  Nhấn tại đây để đăng nhập vô hệ thống
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: AppColors.primary,
  },
  circleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
  },
  circleInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D3D3D3",
  },
  circleRejected: {
    backgroundColor: "#FF3B30",
  },
  lineBottom: {
    flex: 1,
    backgroundColor: "#D3D3D3",
    width: 2,
  },
  lineBottomActive: {
    flex: 1,
    backgroundColor: AppColors.primary,
    width: 2,
  },
  lineBottomRejected: {
    flex: 1,
    backgroundColor: "#FF3B30",
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
  titleRejected: {
    fontWeight: "600",
    color: "#FF3B30",
    marginTop: 2,
  },
  description: {
    color: "#888",
    fontSize: 13,
    marginTop: 4,
  },
  descriptionRejected: {
    color: "#FF3B30",
  },
  link: {
    color: AppColors.primary,
    marginTop: 4,
    fontSize: 14,
  },
  drivemateText: {
    color: AppColors.primary,
    fontWeight: "600",
  },
});
