import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "@/models/generic/baseState";
import { IBookingSession } from "@/models/booking/booking";
import { SessionStatus } from "@/models/session/session.enum";
import { ISessionDetailDTO } from "@/models/session/session.type";
import { getSessionDetail } from "./sessionThunk";

export interface SessionState extends BaseState {
    sessions: IBookingSession[];
    selectedStatus: SessionStatus | "";
    isRefreshing: boolean;
    statusCounts: Record<SessionStatus | "", number>;
    sessionDetail: ISessionDetailDTO | null;
}

const initialState: SessionState = {
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
    sessions: [],
    selectedStatus: "",
    isRefreshing: false,
    statusCounts: {
        "": 0,
        [SessionStatus.Planning]: 0,
        [SessionStatus.Upcoming]: 0,
        [SessionStatus.InProgress]: 0,
        [SessionStatus.Completed]: 0,
        [SessionStatus.Reschedule]: 0,
        [SessionStatus.Cancelled]: 0,
    },
    sessionDetail: null,
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
        setSelectedStatus: (state, action: PayloadAction<SessionStatus | "">) => {
            state.selectedStatus = action.payload;
        },
        setStatusCount: (state, action: PayloadAction<{ status: SessionStatus | ""; count: number }>) => {
            state.statusCounts[action.payload.status as SessionStatus | ""] = action.payload.count;
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

        setSessionDetail: (state, action: PayloadAction<ISessionDetailDTO | null>) => {
            state.sessionDetail = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSessionDetail.fulfilled, (state, action) => {
                state.sessionDetail = action.payload.value ?? null;
            })
    },
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
    setSessionDetail,
} = sessionSlice.actions;

export default sessionSlice.reducer;

