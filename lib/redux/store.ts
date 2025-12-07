import { AnyAction, combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import homeReducer from "@/features/home/homeSlice";
import mapReducer from "@/features/map/mapSlice";
import listCarReducer from "@/features/listCar/listCarSlice";
import instructorReducer from "@/features/instructor/instructorSlice";
import bookingReducer from "@/features/booking/bookingSlice";
import walletReducer from "@/features/wallet/walletSlice";
import userReducer from "@/features/user/userSlice";
import packageReducer from "@/features/package/packageSlice";
import sessionReducer from "@/features/session/sessionSlice";
import chatReducer from "@/features/chat/chatSlice";
import notificationReducer from "@/features/notification/notificationSlice";
import carReducer from "@/features/car/carSlice";
import documentReducer from "@/features/document/documentSlice";
import { logout } from "@/features/auth/authSlice";

const appReducer = combineReducers({
  auth: authReducer,
  home: homeReducer,
  map: mapReducer,
  listCar: listCarReducer,
  instructor: instructorReducer,
  booking: bookingReducer,
  wallet: walletReducer,
  user: userReducer,
  package: packageReducer,
  session: sessionReducer,
  chat: chatReducer,
  notification: notificationReducer,
  car: carReducer,
  document: documentReducer,
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction
) => {
  if (action.type === logout.type) {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
