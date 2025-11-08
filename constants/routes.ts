export const ROUTES = {
  MAIN: '/(main)',
  NO_TABS: '/(no-tabs)',
  DEPOSIT: '/deposit',
  

  SIGNIN: '/(auth)/signin',
  SIGNUP: '/(auth)/signup',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
  HOME: '/(main)/(tabs)/home',
  OVERVIEW: '/(main)/(tabs)/overview',
  PROFILE: '/(main)/(tabs)/profile',
    
  MAIN_NO_TABS_DEPOSIT: '/(main)/(no-tabs)/deposit',
  MAIN_NO_TABS_WITHDRAW: '/(main)/(no-tabs)/withdraw',
  MAIN_NO_TABS_SERVICE_PACKAGE_SERVICE_PACKAGE_MANAGEMENT: `/(main)/(no-tabs)/(service-package)/service-package-management`,
  MAIN_NO_TABS_MY_PACKAGES: `/(main)/(no-tabs)/my-packages`,
  MAIN_NO_TABS_INTRO: `/(onboarding)`,
} as const;