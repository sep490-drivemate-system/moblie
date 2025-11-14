import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, MoreVertical } from "lucide-react-native";

export default function AddCarScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleAddCar = async () => {
    // Mark that user added car
    await AsyncStorage.setItem("car_added", "true");
    router.push("/(onboarding)/(car)/(car-registration)/form");
  };

  const handleSkip = async () => {
    // Mark that user skipped adding car
    await AsyncStorage.setItem("car_added", "false");
    router.push("/(onboarding)/commitment");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}></View>

        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        {/* Background Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("@/assets/images/background_1.png")}
            style={styles.backgroundImage}
          />
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Bạn có muốn thêm xe không ?</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addCarButton} onPress={handleAddCar}>
            <Text style={styles.addCarButtonText}>Thêm xe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Bỏ qua</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: StatusBar.currentHeight,
  },
  content: {
    flex: 1,
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  notificationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginHorizontal: 20,
  },
  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#70E000",
    borderRadius: 2,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backgroundImage: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
  },
  questionContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 15,
    paddingBottom: 20,
  },
  addCarButton: {
    backgroundColor: "#70E000",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  addCarButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  skipButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
});
