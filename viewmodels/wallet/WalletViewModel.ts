import { RootState } from "@/lib/redux/store";
import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import {
  createDeposit,
  getPaymentCallback,
  getStatisticOverviewPriceInstructor,
  getStatisticsInstructor,
  getWallet,
  IInstructorStatisticFilter,
} from "@/features/wallet/walletThunk";
import {
  IInstructorStatistic,
  IStatisticsInstructor,
} from "@/models/instructor/instructor.type";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";
import { IDeposit } from "@/models/wallet/deposit.type";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { setPaymentCallback } from "@/features/wallet/walletSlice";

export class WalletViewModel extends BaseViewModel<RootState["wallet"]> {
  getWalletBalance = async (): Promise<number> => {
    return (
      (await this.executeAsync<number>(async () => {
        const response = await this.dispatch(getWallet()).unwrap();
        return response?.value as number;
      })) ?? 0
    );
  };

  getStatisticOverviewPriceInstructor =
    async (): Promise<IStatisticsInstructor | null> => {
      return (
        (await this.executeAsync<IStatisticsInstructor | null>(async () => {
          var userId = await getUserIdFromToken();
          const response = await this.dispatch(
            getStatisticOverviewPriceInstructor({ instructorId: userId })
          ).unwrap();
          return response?.value as IStatisticsInstructor;
        })) ?? null
      );
    };

  getStatisticsInstructor = async (
    filter?: IInstructorStatisticFilter
  ): Promise<IInstructorStatistic | null> => {
    return (
      (await this.executeAsync<IInstructorStatistic | null>(async () => {
        const response = await this.dispatch(
          getStatisticsInstructor(filter)
        ).unwrap();
        return response?.value as IInstructorStatistic;
      })) ?? null
    );
  };

  deposit = async (payload: IDeposit): Promise<boolean> => {
    return (
      (await this.executeAsync<boolean>(async () => {
        const response = await this.dispatch(createDeposit(payload)).unwrap();
        const paymentUrl = response?.value as string;
        const returnUrl = 'exp://192.168.110.147:8081/(main)/(no-tabs)/payment-success';
        const result = await WebBrowser.openAuthSessionAsync(
          paymentUrl,
          returnUrl,
          {
            showInRecents: false,
          }
        );

        if (result.type === 'success' && result.url) {
          const parsed = Linking.parse(result.url);
          const params = parsed.queryParams || {};
          const callbackUrl = result.url;
          this.dispatch(setPaymentCallback({
            url: callbackUrl,
            params: params as Record<string, string>,
            timestamp: Date.now(),
          }));
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
        }
        return true;
      })) ?? false
    );
  };

  handlePaymentCallback = async (params: string): Promise<number | null> => {
    return (
      (await this.executeAsync<number>(async () => {
        const response = await this.dispatch(getPaymentCallback({ url: params })).unwrap();
        return response?.value as number;
      })) ?? 0
    );
  };
}
