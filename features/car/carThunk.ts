import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { IBrandCar, ICar, PaginatedCarsResponse } from "@/models/car/car";
import { GetCarsParams } from "@/models/car/car";

export const CAR_PATH = "car";

export const registerCar = createThunk<void, FormData>(
  HttpMethod.POST,
  "registerCar",
  `${CAR_PATH}`,
  {
    config: () => ({
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  }
);

export const getCarsForInstructor = createThunk<ICar[], { id: string }>(
  HttpMethod.GET,
  "getCarsForInstructor",
  `/${CAR_PATH}/instructor/:id/cars`,
  {
    buildUrl: (payload) => `/${CAR_PATH}/instructors/${payload.id}/cars`,
  }
);

export const getCarById = createThunk<ICar, { id: string }>(
  HttpMethod.GET,
  "getCarById",
  `/${CAR_PATH}/:id`,
  {
    buildUrl: (payload) => `/${CAR_PATH}/${payload.id}`,
  }
);

export const deleteCar = createThunk<void, { id: string }>(
  HttpMethod.DELETE,
  "deleteCar",
  `/${CAR_PATH}/:id`,
  {
    buildUrl: (payload) => `/${CAR_PATH}/${payload.id}`,
  }
);

export const getManufacturers = createThunk<IBrandCar[], void>(
  HttpMethod.GET,
  "getManufacturers",
  `manufacturers`
);

export const getCars = createThunk<PaginatedCarsResponse, GetCarsParams>(
  HttpMethod.GET,
  "getCars",
  `${CAR_PATH}`,
  {
    buildUrl: (payload) => {
      const baseUrl = `/${CAR_PATH}`;
      const params = new URLSearchParams();

      if (payload.page) {
        params.append("page", payload.page.toString());
      }
      if (payload.size) {
        params.append("size", payload.size.toString());
      }
      if (payload.seats) {
        params.append("seats", payload.seats.toString());
      }
      if (payload.brand) {
        params.append("brand", payload.brand);
      }
      if (payload.fuel) {
        params.append("fuel", payload.fuel);
      }

      const queryString = params.toString();
      const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      console.log("[Car Filter] Built URL:", fullUrl);

      return fullUrl;
    },
  }
);

export const getRecommendedCars = createThunk<ICar[], void>(
  HttpMethod.GET,
  "getRecommendedCars",
  `/${CAR_PATH}/recommendation`
);
