import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import homeReducer from "@/features/home/homeSlice";
import mapReducer from "@/features/map/mapSlice";
import listCarReducer from "@/features/listCar/listCarSlice";
import instructorReducer from "@/features/instructor/instructorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    home: homeReducer,
    map: mapReducer,
    listCar: listCarReducer,
    instructor: instructorReducer,
    // Thêm các reducers khác ở đây khi cần
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
