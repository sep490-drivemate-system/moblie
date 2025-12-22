import { AppDispatch, RootState } from "@/lib/redux/store";
import { BaseViewModel } from "../shared/BaseViewModel";
import {
  clearCarRegistrationForm,
  updateCarRegistrationFormField,
} from "@/features/car/carSlice";
import { IBrandCar, ICarRegistrationRequest } from "@/models/car/car";
import { getManufacturers, registerCar } from "@/features/car/carThunk";

export interface CarRegistrationFormData {
  ownerName: string;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  carColor: string;
  seatCount: string;
  issueDate: string;
  fuelType: string;
  carType: string;
  licenseTier: string;
  year: string;
  brandId: string;
  hourlyPrice: string;
  description: string;
}

export interface CarInsuranceFormData {
  issueDate: string;
  expiryDate: string;
}

export interface CarInspectionFormData {
  issueDate: string;
  expiryDate: string;
}

export interface CarImages {
  registrationFront?: string | null;
  registrationBack?: string | null;
  insuranceFront?: string | null;
  insuranceBack?: string | null;
  verificationFront?: string | null;
  verificationBack?: string | null;
  verificationSide?: string | null;
  verificationInterior?: string | null;
}

export class AddCarViewModel extends BaseViewModel<RootState["car"]> {
  constructor(dispatch: AppDispatch, getCurrentState: () => RootState["car"]) {
    super(dispatch, getCurrentState);
  }

  // Update car registration form field in Redux
  updateCarRegistrationFormField(
    field: keyof ICarRegistrationRequest,
    value: string | number | boolean | File | null
  ): void {
    // Convert string numbers to numbers for numeric fields
    let processedValue: any = value;
    if (typeof value === "string" && value.trim() !== "") {
      if (field === "Year" || field === "Seats") {
        const numValue = parseInt(value);
        processedValue = isNaN(numValue) ? 0 : numValue;
      } else if (field === "HourlyPrice") {
        const numValue = parseFloat(value);
        processedValue = isNaN(numValue) ? 0 : numValue;
      }
    }
    this.dispatch(
      updateCarRegistrationFormField({ field, value: processedValue })
    );
    console.log(this.getCurrentState().carRegistrationForm);
  }

  async getManufacturers(): Promise<IBrandCar[]> {
    return (
      (await this.executeAsync<IBrandCar[]>(async () => {
        const response = await this.dispatch(getManufacturers()).unwrap();
        return response.value || [];
      })) ?? []
    );
  }

  // Convert car registration form to FormData
  convertFormToFormData(form: ICarRegistrationRequest): FormData {
    const formData = new FormData();

    // Append required string fields (always append, even if empty)
    formData.append("InstructorId", form.InstructorId || "");
    formData.append("LicenseTier", form.LicenseTier || "");
    formData.append("LicensePlate", form.LicensePlate || "");
    formData.append("Model", form.Model || "");
    formData.append("CarType", form.CarType || "");
    formData.append("Color", form.Color || "");
    formData.append("FuelType", form.FuelType || "");

    // Append optional string fields
    if (form.Description) {
      formData.append("Description", form.Description);
    }
    if (form.BrandId) {
      formData.append("BrandId", form.BrandId);
    }
    if (form.InsuranceEndTime) {
      formData.append("InsuranceEndTime", form.InsuranceEndTime);
    }

    // Append required number fields (always append, even if 0)
    formData.append("HourlyPrice", (form.HourlyPrice ?? 0).toString());
    formData.append("Year", (form.Year ?? 0).toString());
    formData.append("Seats", (form.Seats ?? 0).toString());

    // Append file fields (only if they exist)
    if (form.ThumbnailImage) {
      formData.append("ThumbnailImage", form.ThumbnailImage as any);
    }
    if (form.CarFrontImage) {
      formData.append("CarFrontImage", form.CarFrontImage as any);
    }
    if (form.CarBackImage) {
      formData.append("CarBackImage", form.CarBackImage as any);
    }
    if (form.CarLeftImage) {
      formData.append("CarLeftImage", form.CarLeftImage as any);
    }
    if (form.CarRightImage) {
      formData.append("CarRightImage", form.CarRightImage as any);
    }
    if (form.InteriorImage) {
      formData.append("InteriorImage", form.InteriorImage as any);
    }
    if (form.RegistrationFront) {
      formData.append("RegistrationFront", form.RegistrationFront as any);
    }
    if (form.RegistrationBack) {
      formData.append("RegistrationBack", form.RegistrationBack as any);
    }
    if (form.InsuranceFront) {
      formData.append("InsuranceFront", form.InsuranceFront as any);
    }
    if (form.InsuranceBack) {
      formData.append("InsuranceBack", form.InsuranceBack as any);
    }

    // Log form data for debugging
    console.log("FormData being sent:", {
      InstructorId: form.InstructorId,
      LicenseTier: form.LicenseTier,
      LicensePlate: form.LicensePlate,
      Model: form.Model,
      CarType: form.CarType,
      Color: form.Color,
      FuelType: form.FuelType,
      HourlyPrice: form.HourlyPrice,
      Year: form.Year,
      Seats: form.Seats,
      BrandId: form.BrandId,
      Description: form.Description,
      InsuranceEndTime: form.InsuranceEndTime,
      ThumbnailImage: form.ThumbnailImage,
      CarFrontImage: form.CarFrontImage,
      CarBackImage: form.CarBackImage,
      CarLeftImage: form.CarLeftImage,
      CarRightImage: form.CarRightImage,
      InteriorImage: form.InteriorImage,
      RegistrationFront: form.RegistrationFront,
      RegistrationBack: form.RegistrationBack,
      InsuranceFront: form.InsuranceFront,
      InsuranceBack: form.InsuranceBack,
    });

    return formData;
  }

  // Register car using FormData
  async registerCar() {
    const form = this.getCurrentState().carRegistrationForm;

    // Validate required fields before converting
    const missingFields: string[] = [];
    if (!form.InstructorId || form.InstructorId.trim() === "") {
      missingFields.push("InstructorId");
    }
    if (!form.LicensePlate || form.LicensePlate.trim() === "") {
      missingFields.push("LicensePlate");
    }
    if (!form.Model || form.Model.trim() === "") {
      missingFields.push("Model");
    }
    if (!form.CarType || form.CarType.trim() === "") {
      missingFields.push("CarType");
    }
    if (!form.Color || form.Color.trim() === "") {
      missingFields.push("Color");
    }
    if (!form.FuelType || form.FuelType.trim() === "") {
      missingFields.push("FuelType");
    }
    if (!form.LicenseTier || form.LicenseTier.trim() === "") {
      missingFields.push("LicenseTier");
    }
    if (
      form.HourlyPrice === undefined ||
      form.HourlyPrice === null ||
      form.HourlyPrice <= 0
    ) {
      missingFields.push("HourlyPrice");
    }
    if (form.Year === undefined || form.Year === null || form.Year <= 0) {
      missingFields.push("Year");
    }
    if (form.Seats === undefined || form.Seats === null || form.Seats <= 0) {
      missingFields.push("Seats");
    }

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(", ")}`);
    }

    const formData = this.convertFormToFormData(form);
    await this.executeAsync(
      async () => {
        try {
          await this.dispatch(registerCar(formData)).unwrap();
          return "success"; // Return value to ensure onSuccess is called
        } catch (error: any) {
          console.error("Error registering car:", error);
          const errorMessage =
            typeof error === "string"
              ? error
              : error?.message ||
                error?.data?.message ||
                "Không thể đăng ký xe";
          throw new Error(errorMessage);
        }
      },
      () => {
        this.dispatch(clearCarRegistrationForm());
        this.navigate("/(main)/(tabs)/mycar");
      }
    );
  }
}
