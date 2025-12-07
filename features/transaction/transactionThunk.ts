import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { Transaction } from "@/models/transaction/transaction";

export const TRANSACTION_PATH = "transaction";

/**
 * Get user transactions
 * GET /transaction/user
 */
export const getUserTransactions = createThunk<Transaction[], void>(
    HttpMethod.GET,
    "getUserTransactions",
    `/${TRANSACTION_PATH}/user`
);

