import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { IBrandCar, ICar } from "@/models/car/car";

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
    buildUrl: (payload) => `/${CAR_PATH}/instructor/${payload.id}/cars`,
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
