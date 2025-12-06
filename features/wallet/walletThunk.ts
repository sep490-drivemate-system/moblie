import { IInstructorStatistic, IStatisticsInstructor } from "@/models/instructor/instructor.type";
import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { StatisticTimeType } from "@/models/enum/StatisticTimeType.enum";
import { IDeposit } from "@/models/wallet/deposit.type";

const WALLET_PATH = "wallet";

export interface IInstructorStatisticFilter {
    year?: number;
    month?: number;
    week?: number;
    type?: StatisticTimeType;
}

export const getWallet = createThunk<
    number,
    void
>(
    HttpMethod.GET,
    "getWallet",
    `${WALLET_PATH}`,
);


export const getStatisticOverviewPriceInstructor = createThunk<
    IStatisticsInstructor,
    { instructorId: string }
>(
    HttpMethod.GET,
    "getWallet",
    `${WALLET_PATH}/instructor/:id/statistics`,
    {
        buildUrl: (payload) => `${WALLET_PATH}/users/${payload.instructorId}/statistic`,
    }
);

export const getStatisticsInstructor = createThunk<
    IInstructorStatistic,
    IInstructorStatisticFilter | void
>(
    HttpMethod.GET,
    "getStatisticsInstructor",
    `booking/instructor-statistic`,
    {
        buildUrl: (payload) => {
            const baseUrl = `booking/instructor-statistic`;
            if (!payload || typeof payload !== "object") {
                return baseUrl;
            }

            const params = new URLSearchParams();
            if (payload.year !== undefined && payload.year !== null && payload.year !== 0) {
                params.append("year", payload.year.toString());
            }
            if (payload.month !== undefined && payload.month !== null && payload.month !== 0) {
                params.append("month", payload.month.toString());
            }
            if (payload.week !== undefined && payload.week !== null && payload.week !== 0) {
                params.append("week", payload.week.toString());
            }
            if (payload.type !== undefined && payload.type !== null && payload.type !== StatisticTimeType.Weekly) {
                params.append("type", payload.type.toString());
            }

            const queryString = params.toString();
            return queryString ? `${baseUrl}?${queryString}` : baseUrl;
        },
    }
);

export const createDeposit = createThunk<
    string,
    IDeposit
>(
    HttpMethod.POST,
    "createDeposit",
    `${WALLET_PATH}/deposit`,
);