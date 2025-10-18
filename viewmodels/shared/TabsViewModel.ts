import { UserRole } from '@/models/enum/UserRole.enum';

export type TabKey =
    | 'home'
    | 'cars'
    | 'instructors'
    | 'bookings'
    | 'profile'
    | 'rental'
    | 'overview'
    | 'schedule'
    | 'mycar'
    | 'notifications'
    | 'map';

export interface TabConfigItem {
    key: TabKey;
    routeName: string;
    title: string;
    icon: string;
}

export class TabsViewModel {
    private readonly allTabs: Record<TabKey, TabConfigItem> = {
        home: { key: 'home', routeName: 'home', title: 'Home', icon: 'home' },
        cars: { key: 'cars', routeName: 'cars', title: 'Cars', icon: 'car' },
        instructors: { key: 'instructors', routeName: 'instructors', title: 'Instructors', icon: 'users' },
        bookings: { key: 'bookings', routeName: 'bookings', title: 'Bookings', icon: 'bookmark' },
        rental: { key: 'rental', routeName: 'rental', title: 'Rental', icon: 'clipboardPlus' },
        profile: { key: 'profile', routeName: 'profile', title: 'Profile', icon: 'user' },
        overview: { key: 'overview', routeName: 'overview', title: 'Overview', icon: 'gauge' },
        schedule: { key: 'schedule', routeName: 'schedule', title: 'Schedule', icon: 'calendarDays' },
        mycar: { key: 'mycar', routeName: 'mycar', title: 'My Car', icon: 'car' },
        notifications: { key: 'notifications', routeName: 'notifications', title: 'Notifications', icon: 'bell' },
        map: { key: 'map', routeName: 'map', title: 'Map', icon: 'map' },
    };

    private normalizeRole(role?: UserRole | null): UserRole {
        return role ?? UserRole.NoviceDriver;
    }

    getTabsForRole(role?: UserRole | null): TabConfigItem[] {
        const normalizedRole = this.normalizeRole(role);
        if (normalizedRole === UserRole.NoviceDriver) {
            return [
                this.allTabs.home,
                this.allTabs.cars,
                this.allTabs.instructors,
                this.allTabs.rental,
                this.allTabs.profile,
            ];
        }

        if (normalizedRole === UserRole.Instructor) {
            return [
                this.allTabs.overview,
                this.allTabs.schedule,
                this.allTabs.mycar,
                this.allTabs.profile,
            ];
        }

        // Default/fallback: show a compact set
        return [
            this.allTabs.home,
            this.allTabs.map,
            this.allTabs.profile,
        ];
    }

    getInitialRouteName(role?: UserRole | null): string {
        const tabs = this.getTabsForRole(role);
        return tabs[0]?.routeName ?? 'home';
    }

    getIndexRedirectHref(role: UserRole | null): string {
        const effectiveRole = role ?? UserRole.NoviceDriver;
        if (effectiveRole === UserRole.Instructor) {
            return '/(main)/(tabs)/overview';
        }
        return '/(main)/(tabs)/home';
    }
    // getRole(role: UserRole | null): string {
    //     const effectiveRole = role ?? UserRole.NoviceDriver;
    //     if (effectiveRole === UserRole.Instructor) {
    //         return '/(main)/(tabs)/overview';
    //     }
    //     return '/(main)/(tabs)/home';
    // } 


}

export default TabsViewModel;
