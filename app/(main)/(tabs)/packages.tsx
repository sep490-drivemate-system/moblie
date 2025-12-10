import { AppColors } from "@/constants/Colors";
import { popularPackages } from "@/data/home_data";
import { instructorsData } from "@/data/instructors_data";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import HeaderList from "@/components/Commons/HeaderList";
import { PackageFilterOption } from "@/models/package/package.enum";
import PackageFilterList from "@/components/Package/PackageFilterList";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { PackageViewModel } from "@/viewmodels/package/PackageViewModel";
import { RootState } from "@/lib/redux/store";
import { useCallback, useEffect, useState } from "react";
import {
  DrivingSkill,
  GetPackagesParams,
  Package,
  RoadType,
} from "@/models/package/package";
import { ROUTES } from "@/constants/routes";

// Road types list
const roadTypes = [
  "Đường khu dân cư",
  "Đường đô thị",
  "Quốc lộ",
  "Đường cao tốc",
  "Đường đèo",
  "Đường trường",
  "Đường qua khu đông dân cư",
  "Đường đang thi công",
  "Đường trơn trượt",
];

const filterOptions = [
  {
    id: PackageFilterOption.All,
    label: "Tất cả",
    value: null as boolean | null,
    type: "vehicle" as const,
  },
  {
    id: PackageFilterOption.HasVehicle,
    label: "Có thể đi xe cá nhân",
    value: true as boolean,
    type: "vehicle" as const,
  },
  {
    id: PackageFilterOption.InstructorOnly,
    label: "Chỉ hướng dẫn",
    value: false as boolean,
    type: "vehicle" as const,
  },
  {
    id: PackageFilterOption.RoadType,
    label: "Loại đường",
    value: null,
    type: "roadType" as const,
  },
  {
    id: PackageFilterOption.DrivingSkills,
    label: "Kỹ năng lái xe",
    value: null,
    type: "drivingSkills" as const,
  },
];

const PAGE_SIZE = 4;

export default function PackagesScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [packageState, packageViewModel] = useViewModel<
    RootState["package"],
    PackageViewModel
  >(PackageViewModel, (state) => state.package);
  const [packages, setPackages] = useState<Package[]>([]);
  const [roadTypes, setRoadTypes] = useState<RoadType[]>([]);
  const [drivingSkills, setDrivingSkills] = useState<DrivingSkill[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterHasVehicle, setFilterHasVehicle] = useState<boolean | null>(
    null
  );
  const [selectedRoadTypes, setSelectedRoadTypes] = useState<string[]>([]);
  const [selectedDrivingSkills, setSelectedDrivingSkills] = useState<string[]>(
    []
  );

  const handlePackagePress = (pkg: Package) => {
    router.push({
      pathname: ROUTES.INSTRUCTOR_DETAIL,
      params: { instructorId: pkg.instructorId },
    });
  };

  const loadPackages = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        const params: GetPackagesParams = {
          pageNumber: page,
          pageSize: PAGE_SIZE,
        };

        if (debouncedSearchQuery) {
          params.searchKey = debouncedSearchQuery;
        }

        if (filterHasVehicle !== null) {
          params.allowSelfCar = filterHasVehicle;
        }

        if (selectedRoadTypes.length > 0) {
          params.roadTypes = selectedRoadTypes;
        }

        if (selectedDrivingSkills.length > 0) {
          params.drivingSkills = selectedDrivingSkills;
        }

        const response = await packageViewModel.getPackages(params);

        if (append) {
          setPackages((prev) => [...prev, ...(response.pageContent ?? [])]);
        } else {
          setPackages(response.pageContent ?? []);
        }

        setTotalCount(response.totalCount ?? 0);
        setCurrentPage(response.currentPage ?? page);
      } catch (error) {
        console.error("Error loading packages:", error);
      }
    },
    [
      packageViewModel,
      debouncedSearchQuery,
      filterHasVehicle,
      selectedRoadTypes,
      selectedDrivingSkills,
    ]
  );

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || packages.length >= totalCount) {
      return;
    }
    setIsLoadingMore(true);
    try {
      await loadPackages(currentPage + 1, true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, isLoadingMore, packages.length, totalCount, loadPackages]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    try {
      await loadPackages(1, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPackages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    const getRoadTypes = async () => {
      const result = await packageViewModel.getRoadTypes();
      setRoadTypes(result);
    };
    getRoadTypes();
  }, [packageViewModel]);

  useEffect(() => {
    const getDrivingSkills = async () => {
      const result = await packageViewModel.getDrivingSkills();
      setDrivingSkills(result);
    };
    getDrivingSkills();
  }, [packageViewModel]);

  useEffect(() => {
    setCurrentPage(1);
    loadPackages(1, false);
  }, [debouncedSearchQuery, filterHasVehicle, selectedRoadTypes, selectedDrivingSkills]);

  if (
    packages.length === 0 ||
    roadTypes.length === 0 ||
    drivingSkills.length === 0
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderList title="Danh sách gói thuê" />
      <PackageFilterList
        packages={packages}
        roadTypes={roadTypes}
        drivingSkills={drivingSkills}
        filterOptions={filterOptions}
        onPackagePress={handlePackagePress}
        bottomPadding={tabBarHeight + 20}
        totalCount={totalCount}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        isRefreshing={isRefreshing}
        isLoadingMore={isLoadingMore}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterHasVehicle={filterHasVehicle}
        onFilterHasVehicleChange={setFilterHasVehicle}
        selectedRoadTypes={selectedRoadTypes}
        onSelectedRoadTypesChange={setSelectedRoadTypes}
        selectedDrivingSkills={selectedDrivingSkills}
        onSelectedDrivingSkillsChange={setSelectedDrivingSkills}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  headerStats: {
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  headerCurve: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.primary,
  },
});
