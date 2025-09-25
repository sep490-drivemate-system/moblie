import { RootState } from "@/lib/redux/store";
import { BaseViewModel } from "../shared/BaseViewModel";
import { cleanFilter, Filter } from "@/features/listCar/listCarSlice";

type ListCarState = RootState["listCar"];

export class ListCarViewModel extends BaseViewModel<ListCarState> {
  get state() {
    return this.getCurrentState();
  }

  get cars() {
    return this.state.cars;
  }

  get filteredCars() {
    return this.state.filteredCars;
  }

  get filters() {
    return this.state.filters;
  }

  get hasActiveFilters() {
    const { seats, brand, type, fuel } = this.state.filters;
    return (
      seats.length > 0 || brand.length > 0 || type.length > 0 || fuel.length > 0
    );
  }

  getFilterCount(filterType: keyof Filter) {
    return this.state.filters[filterType].length;
  }

  getFilterDisplayText(filterType: keyof Filter, defaultText: string) {
    const count = this.getFilterCount(filterType);
    return count > 0 ? `${defaultText} (${count})` : defaultText;
  }

  cleanFilter() {
    this.dispatch(cleanFilter());
  }
}
