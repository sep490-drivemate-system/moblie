import { BankType } from "./bank-type.enum";
import { ClientPlatform } from "./client-platform.enum";

export interface IDeposit {
    amount: number;
    paymentMethod: BankType;
    platform: ClientPlatform;
}

