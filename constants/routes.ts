export const ROUTES = {
  MAIN: '/(main)',
  NO_TABS: '/(no-tabs)',
  DEPOSIT: '/deposit',
  BACK: '',


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
  INSTRUCTOR_DETAIL: '/(main)/(no-tabs)/instructor-detail',
  SCHEDULE_DETAIL: '/(main)/(no-tabs)/schedule-detail',
  IDENTIFICATION_DOCUMENT_MANAGEMENT_INSTRUCTOR:
    '/(main)/(no-tabs)/identification-document-management-instructor',
  TRANSACTION_SUCCESS: '/(main)/(no-tabs)/transaction-success',
  PAYMENT_SUCCESS: '/(main)/(no-tabs)/payment-success',
  NOTIFICATIONS: '/(main)/(tabs)/notifications',
  PACKAGES: '/(main)/(tabs)/packages',
  INTRO: '/(onboarding)/intro',
  MAIN_NO_TABS_WALLET: '/(main)/(no-tabs)/wallet',
  MAIN_NO_TABS_HISTORY: '/(main)/(no-tabs)/(transaction)/transaction',
  MAIN_NO_TABS_NOTIFICATIONS: '/(main)/(no-tabs)/notifications',
  MAIN_NO_TABS_CHATS: '/(main)/(no-tabs)/chats',

  MAIN_NO_TABS_CAR_DETAIL: '/(main)/(no-tabs)/car-detail',
  MAIN_NO_TABS_DEPOSIT: '/(main)/(no-tabs)/deposit',
  MAIN_NO_TABS_WITHDRAW: '/(main)/(no-tabs)/withdraw',
  MAIN_NO_TABS_SERVICE_PACKAGE_SERVICE_PACKAGE_MANAGEMENT: `/(main)/(no-tabs)/(service-package)/service-package-management`,
  MAIN_NO_TABS_MY_PACKAGES: `/(main)/(no-tabs)/my-packages`,
  MAIN_NO_TABS_INTRO: `/(onboarding)`,
  MAIN_NO_TABS_CHAT: `/(main)/(no-tabs)/chat`,
  MAIN_NO_TABS_INSTRUCTOR_ROUTES: `/(main)/(no-tabs)/instructor-routes`,


} as const;