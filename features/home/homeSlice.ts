import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseState } from '@/models/generic/baseState';

interface HomeState extends BaseState {
    welcomeMessage: string;
    userInfo: {
        name: string;
        email: string;
    } | null;
}

const initialState: HomeState = {
    welcomeMessage: 'Welcome to the app!',
    userInfo: null,
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
};

const homeSlice = createSlice({
    name: 'home',
    initialState,
    reducers: {
        setWelcomeMessage: (state, action: PayloadAction<string>) => {
            state.welcomeMessage = action.payload;
        },
        setUserInfo: (state, action: PayloadAction<{ name: string; email: string }>) => {
            state.userInfo = action.payload;
        },
        clearUserInfo: (state) => {
            state.userInfo = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.errorMessage = action.payload;
        },
        setSuccess: (state, action: PayloadAction<boolean>) => {
            state.isSuccess = action.payload;
        },
    },
});

export const {
    setWelcomeMessage,
    setUserInfo,
    clearUserInfo,
    setLoading,
    setError,
    setSuccess,
} = homeSlice.actions;

export default homeSlice.reducer; 