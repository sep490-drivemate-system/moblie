import { RootState } from "@/lib/redux/store";
import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import {
  createDeposit,
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
        console.log(
          "[WalletViewModel] Gọi API createDeposit với payload:",
          payload
        );
        const response = await this.dispatch(createDeposit(payload)).unwrap();
        const paymentUrl = response?.value as string;
        console.log("[WalletViewModel] API response:", response);
        console.log("[WalletViewModel] Payment URL:", paymentUrl);

        // Kiểm tra paymentUrl có hợp lệ không
        if (
          !paymentUrl ||
          typeof paymentUrl !== "string" ||
          paymentUrl.trim() === ""
        ) {
          throw new Error("Không nhận được URL thanh toán từ server");
        }

        // Kiểm tra URL có thể mở được không
        const canOpen = await Linking.canOpenURL(paymentUrl);
        if (!canOpen) {
          throw new Error("Không thể mở URL thanh toán. URL không hợp lệ.");
        }

        // Mở payment URL trong browser/webview
        // Payment gateway sẽ redirect về backend sau khi thanh toán
        // Backend sẽ verify và redirect về deep link của app (moblie://)
        return true;
      })) ?? false
    );
  };
}
