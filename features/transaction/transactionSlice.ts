import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "@/models/generic/baseState";
import { Transaction } from "@/models/transaction/transaction";
import { getUserTransactions } from "./transactionThunk";

export interface TransactionState extends BaseState {
    transactions: Transaction[];
}

const initialState: TransactionState = {
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
    transactions: [],
};

const transactionSlice = createSlice({
    name: "transaction",
    initialState,
    reducers: {
        clearError: (state) => {
            state.errorMessage = null;
        },
        clearSuccess: (state) => {
            state.isSuccess = false;
        },
        clearTransactions: (state) => {
            state.transactions = [];
        },
    },
    extraReducers: (builder) => {
        // Get User Transactions
        builder
            .addCase(getUserTransactions.pending, (state) => {
                state.isLoading = true;
                state.errorMessage = null;
            })
            .addCase(getUserTransactions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Handle GenericResponse with pagination structure
                // Response structure: { value: { pageContent: [...], currentPage, pageSize, totalCount }, isSuccess, message, errorCode }
                const response = action.payload as any;
                
                let transactions: any[] = [];
                
                if (Array.isArray(response)) {
                    transactions = response;
                } else if (response?.value?.pageContent && Array.isArray(response.value.pageContent)) {
                    transactions = response.value.pageContent;
                } else if (Array.isArray(response?.value)) {
                    transactions = response.value;
                }
                
                // Keep dates as strings (ISO format) for Redux serialization
                // The ViewModel will handle Date conversion when needed
                state.transactions = transactions.map((transaction: any) => ({
                    ...transaction,
                    date: transaction.date instanceof Date 
                        ? transaction.date.toISOString()
                        : transaction.date, // Keep as string if already a string
                }));
            })
            .addCase(getUserTransactions.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.errorMessage = action.payload || action.error.message || 'Không thể tải danh sách giao dịch';
            });
    },
});

export const {
    clearError,
    clearSuccess,
    clearTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;

