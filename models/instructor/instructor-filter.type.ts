export enum ExperienceLevel {
  All = 'ALL',
  OneToThree = '1-3',
  ThreeToFive = '3-5',
  FiveToTen = '5-10',
  TenPlus = '10+',
}

export enum MinimumRating {
  All = 'ALL',
  ThreePlus = '3+',
  FourPlus = '4+',
  FourPointFivePlus = '4.5+',
  Five = '5',
}

export enum FilterType {
  All = 'all',
  Available = 'available',
  Busy = 'busy',
}

export enum DistanceFilter {
  All = 'all',
  Within5km = '5km',
  Within10km = '10km',
  Within20km = '20km',
  Within50km = '50km',
}

export enum SortType {
  None = 'none',
  Experience = 'experience',
  Rating = 'rating',
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export interface FilterState {
  availability: FilterType;
  distance: DistanceFilter;
  experience: ExperienceLevel;
  priceRange: [number, number];
  minRating: MinimumRating;
}
