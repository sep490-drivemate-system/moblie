export const ROUTES = {
  MAIN: '/(main)',
  NO_TABS: '/(no-tabs)',
  DEPOSIT: '/deposit',


  SIGNIN: '/(auth)/signin',
  SIGNUP: '/(auth)/signup',
  OTP: '/(onboarding)/otp',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
  HOME: '/(main)/(tabs)/home',
  OVERVIEW: '/(main)/(tabs)/overview',
  PROFILE: '/(main)/(tabs)/profile',
  DRIVING_SESSION_DETAIL: '/(main)/(no-tabs)/driving-session-detail',
  MY_PACKAGES: '/(main)/(no-tabs)/my-packages',
  MY_PACKAGE_DETAIL: '/(main)/(no-tabs)/my-package-detail',
  BOOKING: '/(main)/(no-tabs)/booking',
  RESCHEDULE_SESSION: '/(main)/(no-tabs)/reschedule-session',

  MAIN_NO_TABS_DEPOSIT: '/(main)/(no-tabs)/deposit',
  MAIN_NO_TABS_WITHDRAW: '/(main)/(no-tabs)/withdraw',
  MAIN_NO_TABS_SERVICE_PACKAGE_SERVICE_PACKAGE_MANAGEMENT: `/(main)/(no-tabs)/(service-package)/service-package-management`,
  MAIN_NO_TABS_MY_PACKAGES: `/(main)/(no-tabs)/my-packages`,
  MAIN_NO_TABS_INTRO: `/(onboarding)`,
  CHAT: `/(main)/(no-tabs)/chat`,
} as const;