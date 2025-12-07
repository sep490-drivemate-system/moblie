import { TransactionStatus } from "../enum/transactionStatus";

export interface Transaction {
    title: string,
    value: number,
    date: Date | string, // Allow both Date and string (string for Redux serialization)
    status: TransactionStatus,
    statusText: string,
}

export interface StatusFilterOption {
    key: TransactionStatus | "all";
    label: string;
}

export interface FilterState {
    timeRange: string;
    amount: string;
    status: string;
}

export interface MonthOption {
    id: string;
    label: string;
    value: string; // Format: "MM/YYYY"
}

export interface AmountOption {
    id: string;
    label: string;
    value: number;
}

