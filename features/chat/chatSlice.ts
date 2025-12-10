import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IChatSession } from "@/models/chat/chat.type";
import { BaseState } from "@/models/generic/baseState";

interface ChatState extends BaseState {
    sessions: IChatSession[];
    currentSession: IChatSession | null;
    selectedSessionId: string | null;
    unreadMessageCount: number;
}

const initialState: ChatState = {
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
    sessions: [],
    currentSession: null,
    selectedSessionId: null,
    unreadMessageCount: 0,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setUnreadMessageCount: (state, action: PayloadAction<number>) => {
            state.unreadMessageCount = action.payload;
        },
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
});

export const {
    setSessions,
    addSession,
    updateSession,
    setCurrentSession,
    setSelectedSessionId,
    clearChat,
    setUnreadMessageCount,
} = chatSlice.actions;

export default chatSlice.reducer;














