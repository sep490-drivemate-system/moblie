import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "@/models/generic/baseState";
import { IBookingSession } from "@/models/booking/booking";
import { SessionStatus } from "@/models/session/session.enum";

export interface SessionState extends BaseState {
}

const initialState: SessionState = {
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.errorMessage = action.payload;
            if (action.payload) {
                state.isLoading = false;
            }
        },
        setSuccess: (state, action: PayloadAction<boolean>) => {
            state.isSuccess = action.payload;
        },
    }
});

export const {
    setLoading,
    setError,
    setSuccess,
} = userSlice.actions;

export default userSlice.reducer;

