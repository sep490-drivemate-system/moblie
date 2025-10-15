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
  imageUrl: any; // For require() images
  title: string;
  description: string;
}
