import "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, UnknownInputParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { useRouter, useSegments, usePathname } from "expo-router";
import { AuthViewModel } from "@/viewmodels/auth/AuthViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SignalRProvider } from "@/lib/signalr/SignalRContext";
import { ROUTES } from "@/constants/routes";
import { ActivityIndicator, Text, View } from "react-native";
import { AppColors } from "@/constants/Colors";
import * as Linking from "expo-linking";

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
        <SignalRProvider enabled={loaded}>
          <ErrorBoundary>
            <RootLayoutNav />
          </ErrorBoundary>
        </SignalRProvider>
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


  const pathname = usePathname();

  useEffect(() => {
    if (!isMounted || !authState.isAuthenticated) return;

    let isHandlingPayment = false;
    let lastHandledUrl = '';

    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      const isPaymentCallback = url.includes('payment-success');

      if (isPaymentCallback) {
        if (isHandlingPayment) {
          return;
        }
        isHandlingPayment = true;
        lastHandledUrl = url;

        const parsed = Linking.parse(url);
        const params = parsed.queryParams || {};

        setTimeout(() => {
          const currentPath = pathname || '';
          if (!currentPath.includes('payment-success')) {
            router.push({
              pathname: ROUTES.PAYMENT_SUCCESS,
              params: params as unknown as UnknownInputParams,
            } as any);
          } else {
            router.replace({
              pathname: ROUTES.PAYMENT_SUCCESS,
              params: params as unknown as UnknownInputParams,
            } as any);
          }
          setTimeout(() => {
            isHandlingPayment = false;
            lastHandledUrl = '';
          }, 2000);
        }, 300);
        return;
      }

      const parsed = Linking.parse(url);
      const isMoblieScheme = parsed.scheme === "moblie" || parsed.hostname === "moblie";
      const isExpScheme = parsed.scheme === "exp" || url.startsWith("exp://");

      if (!isPaymentCallback && isMoblieScheme) {
        const params = parsed.queryParams;
        setTimeout(() => {
          router.push({
            pathname: ROUTES.MAIN_NO_TABS_WALLET,
            params: params as unknown as UnknownInputParams,
          } as any);
        }, 100);
      } else if (!isPaymentCallback && isExpScheme) {
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url && (url.includes('payment-success') || url.includes('payment-return') || url.includes('payment-callback'))) {
        setTimeout(() => {
          handleDeepLink({ url });
        }, 1000);
      }
    });

    return () => {
      subscription.remove();
      isHandlingPayment = false;
    };
  }, [router, isMounted, authState.isAuthenticated, pathname]);

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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={AppColors.primary} />
      <Text style={{ fontSize: 16, fontWeight: "bold", color: AppColors.primary }}>Đang tải dữ liệu...</Text>
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
