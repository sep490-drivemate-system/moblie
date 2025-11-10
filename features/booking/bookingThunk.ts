import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { IUserPackageAPI, IGetUserPackagesParams, BookingStatus } from "@/models/package/user-package";

const BOOKING_PATH = "booking";

// Get user packages with optional status filter
export const getUserPackages = createThunk<
  IUserPackageAPI[],
  IGetUserPackagesParams | undefined
>(
  HttpMethod.GET,
  "getUserPackages",
  `/${BOOKING_PATH}`,
  {
    buildUrl: (payload) => {
      const params = new URLSearchParams();
      
      // Nếu có bookingStatus và khác 0 (All), thêm vào query
      if (payload?.bookingStatus !== undefined && payload.bookingStatus !== BookingStatus.All) {
        params.append('bookingStatus', payload.bookingStatus.toString());
      }
      
      const queryString = params.toString();
      return `/${BOOKING_PATH}${queryString ? `?${queryString}` : ''}`;
    }
  }
);
