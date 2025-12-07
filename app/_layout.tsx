import "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { useRouter } from "expo-router";
import { AuthViewModel } from "@/viewmodels/auth/AuthViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SignalRHubUrls } from "@/lib/signalr/signalRConfig";
import { useSignalR } from "@/lib/signalr/useSignalR";
import { ROUTES } from "@/constants/routes";
import { ActivityIndicator, Text, View } from "react-native";
import { AppColors } from "@/constants/Colors";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useSignalR({
    hubPath: SignalRHubUrls.NOTIFICATION,
    enabled: loaded,
  });
  useSignalR({
    hubPath: SignalRHubUrls.CHAT,
    enabled: loaded,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ErrorBoundary>
          <RootLayoutNav />
        </ErrorBoundary>
      </Provider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const authSelector = (state: RootState) => state.auth;
  const [authState, authViewModel] = useViewModel(AuthViewModel, authSelector);
  useEffect(() => {
    if (isMounted) {
      authViewModel.checkAuthStatus();
    }
  }, [isMounted]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    authViewModel.setNavigationCallback((route: string) => {
      router.replace(route as any);
    });
  }, [authViewModel, router]);

  useEffect(() => {
    if (!isMounted) return;
    if (!authState.hasCheckedAuth) return;

    if (!authState.isAuthenticated) {
      router.replace(ROUTES.INTRO);
    }
  }, [authState.isAuthenticated, authState.hasCheckedAuth, isMounted, router]);

  if (!isMounted || !authState.hasCheckedAuth) {
    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <ActivityIndicator size="large" color={AppColors.primary} />
      <Text style={{fontSize: 16, fontWeight: "bold", color: AppColors.primary}}>Đang tải dữ liệu...</Text>
    </View>
  }

  if (authState.isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
    </Stack>
  );
}
