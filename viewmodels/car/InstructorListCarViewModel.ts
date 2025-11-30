import { getCarsForInstructor } from "@/features/car/carThunk";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { ICar } from "@/models/car/car";
import { BaseViewModel } from "../shared/BaseViewModel";

export class InstructorListCarViewModel extends BaseViewModel<
  RootState["car"]
> {
  constructor(dispatch: AppDispatch, getCurrentState: () => RootState["car"]) {
    super(dispatch, getCurrentState);
  }

  async getCarsForInstructor(
    instructorId: string
  ): Promise<ICar[]> {
    return (
      (await this.executeAsync(
        async () => {
          const result = await this.dispatch(
            getCarsForInstructor({ id: instructorId })
          ).unwrap();
          return result.value || [];
        },
        () => {
          console.log("Cars for instructor loaded successfully");
        }
      )) ?? []
    );
  }
}
