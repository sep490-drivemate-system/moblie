import { IUserProfile } from "@/models/user/profile.types";
import { IPerformance } from "@/models/performance/performance";

export const mockUserProfile: IUserProfile = {
    name: 'Lê Minh Trí',
    email: 'leminhtri@gmail.com',
    phone: '0901 234 567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    walletBalance: 1000000
};

export const mockPerformance: IPerformance = {
    accuracy: 70,
    accuracyChange: 5,
    avgTime: 30,
    avgTimeChange: 0.2,
    attempted: 100,
    correct: 70,
    incorrect: 30
};