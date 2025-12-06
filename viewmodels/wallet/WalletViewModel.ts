import { RootState } from "@/lib/redux/store";
import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { createDeposit, getStatisticOverviewPriceInstructor, getStatisticsInstructor, getWallet, IInstructorStatisticFilter } from "@/features/wallet/walletThunk";
import { IInstructorStatistic, IStatisticsInstructor } from "@/models/instructor/instructor.type";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";
import { IDeposit } from "@/models/wallet/deposit.type";

export class WalletViewModel extends BaseViewModel<RootState["wallet"]> {
    getWalletBalance = async (): Promise<number> => {
        return (await this.executeAsync<number>(
            async () => {
                const response = await this.dispatch(getWallet()).unwrap();
                return response?.value as number;
            }
        )) ?? 0;
    }

    getStatisticOverviewPriceInstructor = async (): Promise<IStatisticsInstructor | null> => {
        return (await this.executeAsync<IStatisticsInstructor | null>(
            async () => {
                var userId = await getUserIdFromToken();
                const response = await this.dispatch(getStatisticOverviewPriceInstructor({ instructorId: userId })).unwrap();
                return response?.value as IStatisticsInstructor;
            }
        )) ?? null;
    }

    getStatisticsInstructor = async (filter?: IInstructorStatisticFilter): Promise<IInstructorStatistic | null> => {
        return (await this.executeAsync<IInstructorStatistic | null>(
            async () => {
                const response = await this.dispatch(getStatisticsInstructor(filter)).unwrap();
                return response?.value as IInstructorStatistic;
            }
        )) ?? null;
    }

    deposit = async (payload: IDeposit): Promise<string | null> => {
        return (await this.executeAsync<string | null>(
            async () => {
                const response = await this.dispatch(createDeposit(payload)).unwrap();
                return response?.value as string;
            }
        )) ?? null;
    }
}

