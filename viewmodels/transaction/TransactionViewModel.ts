import { RootState } from "@/lib/redux/store";
import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { getUserTransactions } from "@/features/transaction/transactionThunk";
import {
    Transaction,
    StatusFilterOption,
    FilterState,
    MonthOption,
} from "@/models/transaction/transaction";
import { TransactionStatus } from "@/models/enum/transactionStatus";

export class TransactionViewModel extends BaseViewModel<RootState["transaction"]> {
    // Local state for filters
    private searchText: string = "";
    private selectedFilter: TransactionStatus | "all" = "all";
    private appliedFilters: FilterState = {
        timeRange: "all",
        amount: "",
        status: "all",
    };
    private amountInput: string = "";

    /**
     * Fetch user transactions from API
     * @returns Array of transactions or empty array if error
     */
    async fetchTransactions(): Promise<Transaction[]> {
        return (await this.executeAsync<Transaction[]>(
            async () => {
                const response = await this.dispatch(getUserTransactions()).unwrap();
                // Handle GenericResponse with pagination structure
                // Response structure: { value: { pageContent: [...], currentPage, pageSize, totalCount }, isSuccess, message, errorCode }
                const result = response as any;
                
                let transactions: any[] = [];
                
                // Check if result is directly an array
                if (Array.isArray(result)) {
                    transactions = result;
                } 
                // Check if result has value.pageContent (pagination structure)
                else if (result?.value?.pageContent && Array.isArray(result.value.pageContent)) {
                    transactions = result.value.pageContent;
                }
                // Check if result.value is directly an array (fallback)
                else if (Array.isArray(result?.value)) {
                    transactions = result.value;
                }
                
                // Ensure transactions is always an array before mapping
                if (!Array.isArray(transactions)) {
                    return [];
                }
                
                // Convert date strings to Date objects if needed
                return transactions.map((transaction: any) => ({
                    ...transaction,
                    date: transaction.date instanceof Date 
                        ? transaction.date 
                        : new Date(transaction.date),
                }));
            }
        )) ?? [];
    }

    /**
     * Get transactions from current state
     */
    getTransactions(): Transaction[] {
        const transactions = this.getCurrentState().transactions;
        return Array.isArray(transactions) ? transactions : [];
    }

    /**
     * Get filtered transactions based on provided filters
     */
    getFilteredTransactions(
        selectedFilter?: TransactionStatus | "all",
        appliedFilters?: FilterState
    ): Transaction[] {
        const transactions = this.getTransactions();
        const filter = selectedFilter !== undefined ? selectedFilter : this.selectedFilter;
        const filters = appliedFilters !== undefined ? appliedFilters : this.appliedFilters;
        
        return transactions.filter((transaction) => {
            return (
                this.matchesSearch(transaction, this.searchText) &&
                this.matchesTimeRange(transaction, filters.timeRange) &&
                this.matchesAmount(transaction, filters.amount) &&
                this.matchesStatus(transaction, filter)
            );
        });
    }

    /**
     * Check if transactions are loading
     */
    isLoading(): boolean {
        return this.getCurrentState().isLoading;
    }

    /**
     * Get error message if any
     */
    getError(): string | null {
        return this.getCurrentState().errorMessage;
    }

    /**
     * Get status filter options for the filter bar
     * @returns Array of status filter options with labels
     */
    getStatusFilterOptions(): StatusFilterOption[] {
        return [
            { key: "all" as const, label: "Tất cả" },
            { key: TransactionStatus.Pending, label: "Chờ xử lý" },
            { key: TransactionStatus.Processing, label: "Đang xử lý" },
            { key: TransactionStatus.Completed, label: "Hoàn thành" },
            { key: TransactionStatus.Fail, label: "Thất bại" },
            { key: TransactionStatus.Cancelled, label: "Đã hủy" },
            { key: TransactionStatus.Refunded, label: "Đã hoàn tiền" },
            { key: TransactionStatus.Deposit, label: "Nạp tiền" },
        ];
    }

    /**
     * Handle status filter selection
     * @param selectedStatus The selected status filter
     * @returns The selected status filter value
     */
    handleStatusFilterSelection(selectedStatus: TransactionStatus | "all"): TransactionStatus | "all" {
        this.selectedFilter = selectedStatus;
        this.appliedFilters.status = selectedStatus === "all" ? "all" : selectedStatus.toString();
        return selectedStatus;
    }

    /**
     * Get current selected filter
     */
    getSelectedFilter(): TransactionStatus | "all" {
        return this.selectedFilter;
    }

    /**
     * Set search text
     */
    setSearchText(text: string): void {
        this.searchText = text;
    }

    /**
     * Get search text
     */
    getSearchText(): string {
        return this.searchText;
    }

    /**
     * Set applied filters
     */
    setAppliedFilters(filters: FilterState): void {
        this.appliedFilters = filters;
    }

    /**
     * Get applied filters
     */
    getAppliedFilters(): FilterState {
        return this.appliedFilters;
    }

    /**
     * Clear all applied filters
     */
    clearAllFilters(): void {
        this.appliedFilters = {
            timeRange: "all",
            amount: "",
            status: "all",
        };
        this.selectedFilter = "all";
    }

    /**
     * Check if any filters are applied
     */
    hasActiveFilters(): boolean {
        return (
            this.appliedFilters.timeRange !== "all" ||
            this.appliedFilters.amount !== "" ||
            this.appliedFilters.status !== "all"
        );
    }

    // Helper functions
    /**
     * Get transaction type (deposit, withdraw, receive)
     */
    getTransactionType(transaction: Transaction): "deposit" | "withdraw" | "receive" {
        if (
            transaction.title.toLowerCase().includes("rút") ||
            transaction.title.toLowerCase().includes("withdraw")
        ) {
            return "withdraw";
        } else if (
            transaction.title.toLowerCase().includes("nhận") ||
            transaction.title.toLowerCase().includes("receive")
        ) {
            return "receive";
        } else if (transaction.status === TransactionStatus.Deposit) {
            return "deposit";
        }
        return "deposit";
    }

    /**
     * Format date to Vietnamese locale
     */
    getFormattedDate(date: Date | string): string {
        const transactionDate = date instanceof Date ? date : new Date(date);
        if (isNaN(transactionDate.getTime())) {
            return new Date().toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
        return transactionDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    /**
     * Format time to Vietnamese locale
     */
    getFormattedTime(date: Date | string): string {
        const transactionDate = date instanceof Date ? date : new Date(date);
        if (isNaN(transactionDate.getTime())) {
            return new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        return transactionDate.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    /**
     * Get Vietnamese label for transaction status
     */
    getStatusLabel(status: TransactionStatus): string {
        const statusOption = this.getStatusFilterOptions().find(
            (option) => option.key === status
        );
        return statusOption?.label || "N/A";
    }

    /**
     * Get color for transaction status
     */
    getStatusColor(status: TransactionStatus): string {
        switch (status) {
            case TransactionStatus.Completed:
                return "#10B981"; // Green for success
            case TransactionStatus.Processing:
            case TransactionStatus.Pending:
                return "#F59E0B"; // Amber/Orange for processing
            case TransactionStatus.Fail:
            case TransactionStatus.Cancelled:
                return "#EF4444"; // Red for error
            case TransactionStatus.Refunded:
                return "#6366F1"; // Indigo for refunded
            case TransactionStatus.Deposit:
                return "#10B981"; // Green for deposit
            default:
                return "#6B7280"; // Gray for unknown
        }
    }

    /**
     * Check if transaction matches time range filter
     */
    private matchesTimeRange(transaction: Transaction, timeRange: string): boolean {
        if (timeRange === "all") return true;

        const transactionDate =
            transaction.date instanceof Date
                ? transaction.date
                : new Date(transaction.date);

        if (isNaN(transactionDate.getTime())) return false;

        const [month, year] = timeRange.split("/").map(Number);
        return (
            transactionDate.getMonth() + 1 === month &&
            transactionDate.getFullYear() === year
        );
    }

    /**
     * Check if transaction matches amount filter
     */
    private matchesAmount(transaction: Transaction, amount: string): boolean {
        if (!amount || amount === "" || amount === "0") return true;
        const filterAmount = parseInt(amount);
        if (isNaN(filterAmount)) return true;
        return transaction.value >= filterAmount;
    }

    /**
     * Check if transaction matches status filter
     */
    private matchesStatus(
        transaction: Transaction,
        status: TransactionStatus | "all"
    ): boolean {
        if (status === "all") return true;
        return transaction.status === status;
    }

    /**
     * Check if transaction matches search text (title)
     */
    private matchesSearch(transaction: Transaction, searchText: string): boolean {
        if (!searchText || searchText.trim() === "") return true;
        const searchLower = searchText.toLowerCase().trim();
        return transaction.title.toLowerCase().includes(searchLower);
    }

    getMonthOptions(): MonthOption[] {
        const months: MonthOption[] = [];
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentYear = now.getFullYear();
        const lastYear = currentYear - 1;
        
        // Add months from current month of current year backwards to January of current year
        // Example: If current is December 2025, this gives: 12/2025, 11/2025, ..., 1/2025
        for (let month = currentMonth; month >= 1; month--) {
            const monthStr = month.toString().padStart(2, "0");
            const value = `${monthStr}/${currentYear}`;
            const label = `Tháng ${month}/${currentYear}`;
            months.push({
                id: value,
                label,
                value,
            });
        }
        
        // Add months from January of last year to December of last year
        // This gives: 1/2024, 2/2024, ..., 12/2024
        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, "0");
            const value = `${monthStr}/${lastYear}`;
            const label = `Tháng ${month}/${lastYear}`;
            months.push({
                id: value,
                label,
                value,
            });
        }
        
        return months;
    }

    /**
     * Handle amount input change - validates and sets numeric input only
     */
    handleAmountInputChange(text: string): void {
        // Only allow numbers
        const numericValue = text.replace(/[^0-9]/g, "");
        this.amountInput = numericValue;
    }

    /**
     * Get current amount input value
     */
    getAmountInput(): string {
        return this.amountInput;
    }

    /**
     * Set amount input value
     */
    setAmountInput(value: string): void {
        this.amountInput = value;
    }

    /**
     * Apply amount filter - sets the filter based on current input
     */
    applyAmountFilter(): void {
        if (this.amountInput === "" || this.amountInput === "0") {
            this.appliedFilters.amount = "";
        } else {
            this.appliedFilters.amount = this.amountInput;
        }
    }

    /**
     * Get formatted amount label for display
     */
    getAmountLabel(): string {
        const amount = this.getSelectedAmount();
        if (amount && amount !== "" && amount !== "0") {
            return `Trên ${parseInt(amount).toLocaleString()} VNĐ`;
        }
        return "Số tiền";
    }

    /**
     * Initialize amount input from current filter value
     */
    initializeAmountInput(): void {
        const currentAmount = this.getSelectedAmount();
        this.amountInput = currentAmount === "" || currentAmount === "0" ? "" : currentAmount;
    }

    /**
     * Set selected month filter
     */
    setSelectedMonth(monthValue: string): void {
        this.appliedFilters.timeRange = monthValue;
    }

    /**
     * Get selected month filter
     */
    getSelectedMonth(): string {
        return this.appliedFilters.timeRange;
    }

    /**
     * Set selected amount filter
     */
    setSelectedAmount(amountValue: string): void {
        if (amountValue === "0" || amountValue === "") {
            this.appliedFilters.amount = "";
        } else {
            this.appliedFilters.amount = amountValue;
        }
    }

    /**
     * Get selected amount filter
     */
    getSelectedAmount(): string {
        return this.appliedFilters.amount;
    }

    /**
     * Clear month filter
     */
    clearMonthFilter(): void {
        this.appliedFilters.timeRange = "all";
    }

    /**
     * Clear amount filter
     */
    clearAmountFilter(): void {
        this.appliedFilters.amount = "";
        this.amountInput = "";
    }
}

