import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "@/models/generic/baseState";
import { getPaymentCallback, getWallet } from "./walletThunk";

interface PaymentCallback {
    url: string;
    params: Record<string, string>;
    timestamp: number;
}

interface WalletState extends BaseState {
    balance: number;
    paymentCallback: PaymentCallback | null;
}

const initialState: WalletState = {
    balance: 0,
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
    paymentCallback: null,
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
        setPaymentCallback: (state, action: PayloadAction<PaymentCallback>) => {
            state.paymentCallback = action.payload;
        },
        clearPaymentCallback: (state) => {
            state.paymentCallback = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getWallet.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.errorMessage = null;
            })
            .addCase(getPaymentCallback.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.errorMessage = null;
                state.balance = (action.payload?.value ?? 0) + state.balance;
            })
            .addCase(getPaymentCallback.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.error.message || "Không thể xử lý callback thanh toán";
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
    setPaymentCallback,
    clearPaymentCallback,
} = walletSlice.actions;

export default walletSlice.reducer;
