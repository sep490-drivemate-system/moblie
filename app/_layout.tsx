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

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <RootLayoutNav />
      </ErrorBoundary>
    </Provider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const authSelector = (state: RootState) => state.auth;
  const [authState, authViewModel] = useViewModel(AuthViewModel, authSelector);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      console.log("RootLayoutNav mounted and ready for navigation");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // SETUP NAVIGATION CALLBACK
  useEffect(() => {
    authViewModel.setNavigationCallback((route: string) => {
      router.replace(route as any);
    });
  }, [authViewModel, router]);

  // AUTH STATUS CHECK - CHỈ CHẠY MỘT LẦN
  useEffect(() => {
    console.log("🔍 Auth check conditions:", {
      isMounted,
      isLoading: authState.isLoading,
      hasUser: !!authState.user,
      isAuthenticated: authState.isAuthenticated,
    });

    if (
      isMounted &&
      !authState.isLoading &&
      !authState.user &&
      !authState.isAuthenticated
    ) {
      authViewModel.checkAuthStatus();
    }
  }, [isMounted]);

  console.log("Conditional rendering - Current state:", {
    isMounted,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    hasUser: !!authState.user,
    userEmail: authState.user?.email,
    renderDecision:
      authState.isLoading || !isMounted
        ? "Loading"
        : authState.isAuthenticated
        ? "Tabs"
        : "Login",
  });

  if (authState.isLoading || !isMounted) {
    return <LoadingSpinner message="Initializing app..." />;
  }

  if (authState.isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
      </Stack>
    );
  } else {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
      </Stack>
    );
  }
}
