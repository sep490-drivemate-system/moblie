import { getCarById, getCarsForInstructor } from "@/features/car/carThunk";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { ICar } from "@/models/car/car";
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
}
