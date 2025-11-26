import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "@/models/generic/baseState";
import { getWallet } from "./walletThunk";

interface WalletState extends BaseState {
    balance: number;
}

const initialState: WalletState = {
    balance: 0,
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
};

const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        setWalletBalance: (state, action: PayloadAction<number>) => {
            state.balance = action.payload;
        },
        adjustWalletBalance: (state, action: PayloadAction<number>) => {
            state.balance += action.payload;
        },
        resetWalletState: () => initialState,
        clearWalletError: (state) => {
            state.errorMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getWallet.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.errorMessage = null;
            })
            .addCase(getWallet.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const response = action.payload;
                const balance = typeof response?.value === "number" ? response.value : 0;
                state.balance = balance;
            })
            .addCase(getWallet.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage =
                    (action.payload as string) ||
                    action.error.message ||
                    "Không thể tải số dư ví";
            });
    },
});

export const {
    setWalletBalance,
    adjustWalletBalance,
    resetWalletState,
    clearWalletError,
} = walletSlice.actions;

export default walletSlice.reducer;
