import { getCarById, getCars, getRecommendedCars } from "@/features/car/carThunk";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { ICarDetail, PaginatedCarsResponse, GetCarsParams, ICar } from "@/models/car/car";
import { BaseViewModel } from "../shared/BaseViewModel";

export class CarViewModel extends BaseViewModel<
    RootState["car"]
> {
    constructor(dispatch: AppDispatch, getCurrentState: () => RootState["car"]) {
        super(dispatch, getCurrentState);
    }

    async getCarById(
        carId: string
    ): Promise<ICarDetail | null> {
        return (
            (await this.executeAsync(
                async () => {
                    const result = await this.dispatch(
                        getCarById({ id: carId })
                    ).unwrap();
                    return result.value as ICarDetail || null;
                },
                () => {
                    console.log("Car loaded successfully");
                }
            )) ?? null
        );
    }

    async getRecommendedCars(): Promise<ICar[]> {
        return (await this.executeAsync(async () => {
            const result = await this.dispatch(getRecommendedCars()).unwrap();
            return result.value || [];
        })) ?? [];
    }
    async getCars(params?: GetCarsParams): Promise<PaginatedCarsResponse> {
        return (await this.executeAsync(async () => {
            const result = await this.dispatch(getCars(params || {})).unwrap();
            return result.value || {
                currentPage: 1,
                pageSize: 4,
                totalCount: 0,
                pageContent: [],
            };
        })) ?? {
            currentPage: 1,
            pageSize: 4,
            totalCount: 0,
            pageContent: [],
        };
    }
}
