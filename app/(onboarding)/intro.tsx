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

const { width, height } = Dimensions.get("window");

export default function IntroScreen() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      // Simulate Google sign in
      // In a real app, you would implement Google OAuth here
      console.log("Google sign in initiated");

      // For now, just proceed to the next step
      router.push("/(onboarding)/register");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
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
            VỚI <Text style={styles.appNameHighlight}>DRIVEMATE</Text>,
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
            <Text style={styles.signInText}>Đăng ký hoặc đăng nhập bằng</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <Image
              source={require("@/assets/images/gg_icon.png")}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Đăng nhập bằng Google</Text>
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
    color: "#026AA7",
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
  googleButton: {
    backgroundColor: "#026AA7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    maxWidth: 300,
    gap: 12,
  },
  googleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  googleIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});
