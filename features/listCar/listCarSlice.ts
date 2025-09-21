import { listCar } from "@/mock_data/home_data";
import { Car } from "@/models/car/car";
import { BaseState } from "@/models/generic/baseState";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Filter {
  seats: number[];
  brand: string[];
  type: string[];
  fuel: string[];
}

interface CarState extends BaseState {
  cars: Car[];
  filters: Filter;
  filteredCars: Car[];
}

const initialState: CarState = {
  cars: listCar,
  filters: {
    seats: [],
    brand: [],
    fuel: [],
    type: [],
  },
  filteredCars: listCar,
  isLoading: false,
  errorMessage: null,
  isSuccess: false,
};

// Helper function to apply filters
const applyFilters = (cars: Car[], filters: Filter): Car[] => {
  return cars.filter((car) => {
    // Check seats filter
    if (filters.seats.length > 0 && !filters.seats.includes(car.seats)) {
      return false;
    }
    
    // Check brand filter
    if (filters.brand.length > 0 && !filters.brand.includes(car.brand)) {
      return false;
    }
    
    // Check type filter
    if (filters.type.length > 0 && !filters.type.includes(car.type)) {
      return false;
    }
    
    // Check fuel filter
    if (filters.fuel.length > 0 && !filters.fuel.includes(car.fuel)) {
      return false;
    }
    
    return true;
  });
};

const listCarSlice = createSlice({
  name: "listCar",
  initialState,
  reducers: {
    setCars: (state, action: PayloadAction<Car[]>) => {
      state.cars = action.payload;
      state.filteredCars = applyFilters(action.payload, state.filters);
    },
    setFilter: (state, action: PayloadAction<Partial<Filter>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredCars = applyFilters(state.cars, state.filters);
    },
    updateFilter: (
      state,
      action: PayloadAction<{ key: keyof Filter; value: string | number; checked: boolean }>
    ) => {
      const { key, value, checked } = action.payload;

      switch (key) {
        case "seats": {
          const current = state.filters.seats;
          const v = value as number;
          state.filters.seats = checked
            ? (current.includes(v) ? current : [...current, v])
            : current.filter((item) => item !== v);
          break;
        }
        case "brand": {
          const current = state.filters.brand;
          const v = value as string;
          state.filters.brand = checked
            ? (current.includes(v) ? current : [...current, v])
            : current.filter((item) => item !== v);
          break;
        }
        case "type": {
          const current = state.filters.type;
          const v = value as string;
          state.filters.type = checked
            ? (current.includes(v) ? current : [...current, v])
            : current.filter((item) => item !== v);
          break;
        }
        case "fuel": {
          const current = state.filters.fuel;
          const v = value as string;
          state.filters.fuel = checked
            ? (current.includes(v) ? current : [...current, v])
            : current.filter((item) => item !== v);
          break;
        }
      }

      state.filteredCars = applyFilters(state.cars, state.filters);
    },
    cleanFilter: (state) => {
      state.filters = {
        seats: [],
        brand: [],
        fuel: [],
        type: [],
      };
      state.filteredCars = state.cars;
    },
  },
});

export const { setFilter, updateFilter, cleanFilter } = listCarSlice.actions;
export default listCarSlice.reducer;
