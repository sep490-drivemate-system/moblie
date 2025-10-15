export type NotificationType = 'booking' | 'route' | 'payment' | 'system';

export interface IBookingNotification {
  id: string;
  type: 'booking';
  studentName: string;
  instructorName: string;
  date: string;
  time: string;
  location: string;
  packageType: string;
  selectedRoadTypes: string[];
  selectedSkills: string[];
  status: string;
  cost: number;
  createdAt: string;
}

export interface IRouteNotification {
  id: string;
  type: 'route';
  studentName: string;
  instructorName: string;
  routeName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}
