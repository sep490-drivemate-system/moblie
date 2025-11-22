import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import homeReducer from "@/features/home/homeSlice";
import mapReducer from "@/features/map/mapSlice";
import listCarReducer from "@/features/listCar/listCarSlice";
import instructorReducer from "@/features/instructor/instructorSlice";
import bookingReducer from "@/features/booking/bookingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    home: homeReducer,
    map: mapReducer,
    listCar: listCarReducer,
    instructor: instructorReducer,
    booking: bookingReducer,
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
