export interface IRentalPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
}

export interface IInstructorOption {
  id: number;
  imageUrl: any;
  title: string;
  description: string;
}

export interface IBuyPackageRequest {
  durationWhenBought: number; 
  priceAtBuyingTime: number;
  carId: string | null;
  packageId: string;
  instructorId: string;
  driverId: string;
}

export interface IBuyPackageResponse {
  id:string
}
