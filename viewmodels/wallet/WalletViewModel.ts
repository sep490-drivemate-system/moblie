import { RootState } from "@/lib/redux/store";
import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { getWallet } from "@/features/wallet/walletThunk";

export class WalletViewModel extends BaseViewModel<RootState["wallet"]> {
    getWalletBalance = async (): Promise<number> => {
        return (await this.executeAsync<number>(
            async () => {
                const response = await this.dispatch(getWallet()).unwrap();
                return response?.value as number;
            }
        )) ?? 0;
    }

}

