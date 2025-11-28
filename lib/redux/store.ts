import { configureStore } from "@reduxjs/toolkit";
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

export const store = configureStore({
  reducer: {
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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
