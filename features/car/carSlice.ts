import { ICar, ICarRegistrationRequest } from "@/models/car/car";
import { BaseState } from "@/models/generic/baseState";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  deleteCar,
  getCarById,
  getCarsForInstructor,
  registerCar,
} from "./carThunk";

interface CarState extends BaseState {
  cars: ICar[];
  currentCar: ICar | null;
  carRegistrationForm: ICarRegistrationRequest;
}

const initialState: CarState = {
  cars: [],
  currentCar: null,
  carRegistrationForm: {
    InstructorId: "",
    Description: "",
    HourlyPrice: 0,
    ThumbnailImage: null,
    CarFrontImage: null,
    CarBackImage: null,
    CarLeftImage: null,
    CarRightImage: null,
    InteriorImage: null,
    RegistrationFront: null,
    RegistrationBack: null,
    LicenseTier: "",
    LicensePlate: "",
    BrandId: "",
    Model: "",
    CarType: "",
    Year: 0,
    Color: "",
    Seats: 0,
    FuelType: "",
    InsuranceFront: null,
    InsuranceBack: null,
    InsuranceEndTime: "",
  },
  isLoading: false,
  errorMessage: null,
  isSuccess: false,
};

const carSlice = createSlice({
  name: "car",
  initialState,
  reducers: {
    clearCurrentCar: (state) => {
      state.currentCar = null;
    },
    clearCars: (state) => {
      state.cars = [];
    },
    updateCarRegistrationForm: (
      state,
      action: PayloadAction<Partial<ICarRegistrationRequest>>
    ) => {
      state.carRegistrationForm = {
        ...state.carRegistrationForm,
        ...action.payload,
      };
    },
    updateCarRegistrationFormField: (
      state,
      action: PayloadAction<{
        field: keyof ICarRegistrationRequest;
        value: any;
      }>
    ) => {
      (state.carRegistrationForm as any)[action.payload.field] =
        action.payload.value;
    },
    clearCarRegistrationForm: (state) => {
      state.carRegistrationForm = initialState.carRegistrationForm;
    },
    setCarRegistrationForm: (
      state,
      action: PayloadAction<ICarRegistrationRequest>
    ) => {
      state.carRegistrationForm = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Register Car
    builder
      .addCase(registerCar.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
        state.isSuccess = false;
      })
      .addCase(registerCar.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(registerCar.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.errorMessage = action.payload || "Không thể đăng ký xe";
      });

    // Get My Cars
    builder
      .addCase(getCarsForInstructor.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(getCarsForInstructor.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.value) {
          state.cars = action.payload.value;
        }
      })
      .addCase(getCarsForInstructor.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || "Không thể tải danh sách xe";
      });

    // Get Car By Id
    builder
      .addCase(getCarById.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(getCarById.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.value) {
          state.currentCar = action.payload.value;
        }
      })
      .addCase(getCarById.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || "Không thể tải thông tin xe";
      });

    // Delete Car
    builder
      .addCase(deleteCar.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Remove car from list
        const carId = action.meta.arg.id;
        state.cars = state.cars.filter((car) => car.id !== carId);
        if (state.currentCar?.id === carId) {
          state.currentCar = null;
        }
      })
      .addCase(deleteCar.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || "Không thể xóa xe";
      });
  },
});

export const {
  clearCurrentCar,
  clearCars,
  updateCarRegistrationForm,
  updateCarRegistrationFormField,
  clearCarRegistrationForm,
  setCarRegistrationForm,
} = carSlice.actions;
export default carSlice.reducer;
