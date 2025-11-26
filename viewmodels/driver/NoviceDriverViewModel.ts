import { AppDispatch, RootState } from "@/lib/redux/store";
import { BaseViewModel } from "../shared/BaseViewModel";
import { getLicenseValidity, getUserById } from "@/features/user/userThunk";
import { LicenseTier } from "@/models/car/car";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";

const LICENSE_TIER_PRIORITY: LicenseTier[] = [
    LicenseTier.B,
    LicenseTier.C1,
    LicenseTier.C,
    LicenseTier.D1,
    LicenseTier.D2,
    LicenseTier.D,
    LicenseTier.BE,
    LicenseTier.C1E,
    LicenseTier.CE,
    LicenseTier.D1E,
    LicenseTier.D2E,
    LicenseTier.DE,
];

const getTierRank = (tier: LicenseTier): number => {
    if (typeof tier === "number") {
        return tier;
    }
    return LICENSE_TIER_PRIORITY.indexOf(tier);
};

const isLicenseTierSufficient = (driverTier: LicenseTier, requiredTier: LicenseTier): boolean => {
    const driverRank = getTierRank(driverTier);
    const requiredRank = getTierRank(requiredTier);

    console.log('driverRank', driverRank);
    console.log('requiredRank', requiredRank);
    if (driverRank < 0 || requiredRank < 0) {
        return false;
    }

    return driverRank >= requiredRank;
};

export class NoviceDriverViewModel extends BaseViewModel<RootState["user"]> {
    constructor(dispatch: AppDispatch, getCurrentState: () => RootState["user"]) {
        super(dispatch, getCurrentState);
    }

    async getLicenseValidity(): Promise<boolean> {
        return (
            (await this.executeAsync(async () => {
                const response = await this.dispatch(getLicenseValidity()).unwrap();
                return response?.value as boolean;
            })) ?? false
        );
    }

    async getDrivingLicenseTier(): Promise<LicenseTier | null> {
        const userId = await getUserIdFromToken();
        return (
            (await this.executeAsync(async () => {
                const response = await this.dispatch(getUserById({ id: userId as unknown as string })).unwrap();
                return response?.value?.licenseTier as LicenseTier;
            })) ?? null
        );
    }

    async canDriveVehicle(requiredTier: LicenseTier): Promise<boolean> {
        const driverTier = await this.getDrivingLicenseTier();
        if (!driverTier) return false;
        return isLicenseTierSufficient(driverTier, requiredTier);
    }
}