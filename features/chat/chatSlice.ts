import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IChatSession } from "@/models/chat/chat";
import { BaseState } from "@/models/generic/baseState";
import { getChatSessions, getChatSessionById } from "./chatThunk";

interface ChatState extends BaseState {
    sessions: IChatSession[];
    currentSession: IChatSession | null;
    selectedSessionId: string | null;
}

const initialState: ChatState = {
    sessions: [],
    currentSession: null,
    selectedSessionId: null,
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setSessions: (state, action: PayloadAction<IChatSession[]>) => {
            state.sessions = action.payload;
        },
        addSession: (state, action: PayloadAction<IChatSession>) => {
            const existingIndex = state.sessions.findIndex(
                (s) => s.id === action.payload.id
            );
            if (existingIndex >= 0) {
                state.sessions[existingIndex] = action.payload;
            } else {
                state.sessions.unshift(action.payload);
            }
        },
        updateSession: (state, action: PayloadAction<IChatSession>) => {
            const index = state.sessions.findIndex(
                (s) => s.id === action.payload.id
            );
            if (index >= 0) {
                state.sessions[index] = action.payload;
            }
            if (state.currentSession?.id === action.payload.id) {
                state.currentSession = action.payload;
            }
        },
        setCurrentSession: (state, action: PayloadAction<IChatSession | null>) => {
            state.currentSession = action.payload;
            state.selectedSessionId = action.payload?.id || null;
        },
        setSelectedSessionId: (state, action: PayloadAction<string | null>) => {
            state.selectedSessionId = action.payload;
        },
        clearChat: (state) => {
            state.sessions = [];
            state.currentSession = null;
            state.selectedSessionId = null;
        },
    },
    extraReducers: (builder) => {
        // getChatSessions
        builder
            .addCase(getChatSessions.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
                state.isSuccess = false;
            })
            .addCase(getChatSessions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                if (action.payload?.value) {
                    state.sessions = action.payload.value;
                }
            })
            .addCase(getChatSessions.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.payload as string || "Không thể tải danh sách chat";
            });

        // getChatSessionById
        builder
            .addCase(getChatSessionById.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getChatSessionById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                if (action.payload?.value) {
                    state.currentSession = action.payload.value;
                    state.selectedSessionId = action.payload.value.id;
                }
            })
            .addCase(getChatSessionById.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.payload as string || "Không thể tải thông tin chat";
            });
    },
});

export const {
    setSessions,
    addSession,
    updateSession,
    setCurrentSession,
    setSelectedSessionId,
    clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;













