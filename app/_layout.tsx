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
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {

  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

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
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // SETUP NAVIGATION CALLBACK
  useEffect(() => {
    authViewModel.setNavigationCallback((route: string) => {
      router.replace(route as any);
    });
  }, [authViewModel, router]);


  useEffect(() => {
    if (
      isMounted &&
      !authState.isLoading &&
      !authState.isAuthenticated
    ) {
      authViewModel.checkAuthStatus();
    }
  }, [isMounted]);

 

  if (authState.isLoading || !isMounted) {
    return <LoadingSpinner message="DriveMate..." />;
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
