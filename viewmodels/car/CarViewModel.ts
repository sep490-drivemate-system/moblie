import { getCarById, getCars, getCarsForInstructor } from "@/features/car/carThunk";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { ICar, PaginatedCarsResponse, GetCarsParams } from "@/models/car/car";
import { BaseViewModel } from "../shared/BaseViewModel";

export class CarViewModel extends BaseViewModel<
    RootState["car"]
> {
    constructor(dispatch: AppDispatch, getCurrentState: () => RootState["car"]) {
        super(dispatch, getCurrentState);
    }

    async getCarById(
        carId: string
    ): Promise<ICar | null> {
        return (
            (await this.executeAsync(
                async () => {
                    const result = await this.dispatch(
                        getCarById({ id: carId })
                    ).unwrap();
                    return result.value || null;
                },
                () => {
                    console.log("Car loaded successfully");
                }
            )) ?? null
        );
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
