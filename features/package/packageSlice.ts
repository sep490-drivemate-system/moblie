import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "@/models/generic/baseState";
import { IInstructorPackages } from "@/models/instructor/instructor.type";

export interface PackageState extends BaseState {
    packages: IInstructorPackages[];
    isRefreshing: boolean;
}

const initialState: PackageState = {
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
    packages: [],
    isRefreshing: false,
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
    }
});

export const {
    setPackages,
    setLoading,
    setError,
    setSuccess,
    setIsRefreshing,
} = packageSlice.actions;

export default packageSlice.reducer;

