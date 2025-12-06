import { BankType } from "./bank-type.enum";
import { ClientPlatform } from "./client-platform.enum";

export interface IDeposit {
    amount: string;
    paymentMethod: BankType;
    clientPlatform: ClientPlatform;
}