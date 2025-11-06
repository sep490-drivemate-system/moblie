import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import axios from "axios";

const { width, height } = Dimensions.get("window");

export default function IntroScreen() {
  const router = useRouter();

  const handletest = async () => {
    try {
      console.log('process.env.EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/skills`);
      console.log('Skills data:', response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSignUp = () => {
    router.push("/(auth)/signup");
  };

  const handleSignIn = () => {
    router.push("/(auth)/signin");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Video
        source={require("@/assets/videos/background_intro.mp4")}
        style={styles.backgroundVideo}
        shouldPlay
        isLooping
        isMuted
        resizeMode={ResizeMode.COVER}
      />
      <View style={styles.overlay}>
        {/* Slogan */}
        <View style={styles.sloganContainer}>
          <Text style={styles.sloganLine1}>
            VỚI <Text style={styles.appNameHighlight} onPress={handletest}>DRIVEMATE</Text>,
          </Text>
          <Text style={styles.sloganLine2}>
            mỗi chiếc xe, một người hướng dẫn –
          </Text>
          <Text style={styles.sloganLine3}>
            mỗi hành trình, một bước trưởng thành.
          </Text>
        </View>

        {/* Sign in section */}
        <View style={styles.signInContainer}>
          <View style={styles.signInDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.signInText}>Chọn phương thức đăng nhập</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Đăng ký</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  sloganContainer: {
    alignItems: "flex-start",
    marginTop: 200,
  },
  sloganLine1: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
  },
  appNameHighlight: {
    color: "#70E000",
    fontWeight: "bold",
  },
  sloganLine2: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 4,
  },
  sloganLine3: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
  signInContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  signInDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  signInText: {
    color: "white",
    fontSize: 16,
    marginHorizontal: 15,
    fontWeight: "500",
  },
  signUpButton: {
    backgroundColor: "#70E000",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    maxWidth: 300,
    marginBottom: 12,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signInButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    maxWidth: 300,
  },
  signInButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
