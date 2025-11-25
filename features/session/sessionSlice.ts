import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "@/models/generic/baseState";
import { IBookingSession } from "@/models/booking/booking";
import { SessionStatus } from "@/models/session/session.enum";

export interface SessionState extends BaseState {
    sessions: IBookingSession[];
    selectedStatus: SessionStatus | "all";
    isRefreshing: boolean;
    statusCounts: Record<SessionStatus | "all", number>;
}

const initialState: SessionState = {
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
    sessions: [],
    selectedStatus: "all",
    isRefreshing: false,
    statusCounts: {
        all: 0,
        [SessionStatus.Planning]: 0,
        [SessionStatus.Upcoming]: 0,
        [SessionStatus.InProgress]: 0,
        [SessionStatus.Completed]: 0,
        [SessionStatus.Reschedule]: 0,
        [SessionStatus.Cancelled]: 0,
    },
};

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setSessions: (state, action: PayloadAction<IBookingSession[]>) => {
            state.sessions = action.payload;
        },
        clearSessions: (state) => {
            state.sessions = [];
        },
        setSelectedStatus: (state, action: PayloadAction<SessionStatus | "all">) => {
            state.selectedStatus = action.payload;
        },
        setStatusCount: (state, action: PayloadAction<{ status: SessionStatus | "all"; count: number }>) => {
            state.statusCounts[action.payload.status] = action.payload.count;
        },
        setIsRefreshing: (state, action: PayloadAction<boolean>) => {
            state.isRefreshing = action.payload;
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
        setSuccess: (state, action: PayloadAction<boolean>) => {
            state.isSuccess = action.payload;
        },
    }
});

export const {
    setSessions,
    clearSessions,
    setSelectedStatus,
    setIsRefreshing,
    setLoading,
    setError,
    setSuccess,
    setStatusCount,
} = sessionSlice.actions;

export default sessionSlice.reducer;

