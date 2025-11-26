import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";

const WALLET_PATH = "wallet";
export const getWallet = createThunk<
    number,
    void
>(
    HttpMethod.GET,
    "getWallet",
    `${WALLET_PATH}`,
);