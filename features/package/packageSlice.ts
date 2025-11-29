import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "@/models/generic/baseState";
import { IInstructorPackages } from "@/models/instructor/instructor.type";
import {
  CreatePackageForm,
  DrivingSkill,
  RoadType,
} from "@/models/package/package";

export interface PackageState extends BaseState {
  packages: IInstructorPackages[];
  isRefreshing: boolean;
  drivingSkills: DrivingSkill[];
  roadTypes: RoadType[];
  createPackageForm: CreatePackageForm;
}

const initialState: PackageState = {
  isLoading: false,
  errorMessage: null,
  isSuccess: false,
  packages: [],
  isRefreshing: false,
  drivingSkills: [],
  roadTypes: [],
  createPackageForm: {
    name: "",
    description: "",
    duration: 0,
    roadTypes: [],
    drivingSkills: [],
    price: 0,
    allowNoviceCar: false,
    packageCars: [],
  },
};

const packageSlice = createSlice({
  name: "package",
  initialState,
  reducers: {
    setPackages: (state, action: PayloadAction<IInstructorPackages[]>) => {
      state.packages = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.errorMessage = action.payload;
      if (action.payload) {
        state.isLoading = false;
      }
    },
    setIsRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.isSuccess = action.payload;
    },
    setDrivingSkills: (state, action: PayloadAction<DrivingSkill[]>) => {
      state.drivingSkills = action.payload;
    },
    setCreatePackageForm: (state, action: PayloadAction<CreatePackageForm>) => {
      state.createPackageForm = action.payload;
    },
  },
});

export const {
  setPackages,
  setLoading,
  setError,
  setSuccess,
  setIsRefreshing,
} = packageSlice.actions;

export default packageSlice.reducer;
