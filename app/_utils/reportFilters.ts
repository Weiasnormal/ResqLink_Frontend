/**
 * Advanced Filtering and Sorting for Reports
 */

export enum ReportCategory {
  TrafficAccident = 'Traffic Accident',
  FireIncident = 'Fire Incident',
  Flooding = 'Flooding',
  StructuralDamage = 'Structural Damage',
  MedicalEmergency = 'Medical Emergency',
  Other = 'Other',
}

export enum ReportStatus {
  Submitted = 'Submitted',
  Under_Review = 'Under_Review',
  In_Progress = 'In_Progress',
  Resolved = 'Resolved',
  Rejected = 'Rejected',
}

export enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  DISTANCE = 'distance',
  URGENCY = 'urgency',
}

export interface FilterOptions {
  statuses?: ReportStatus[];
  categories?: ReportCategory[];
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  searchQuery?: string;
}

export interface Report {
  id: string;
  userId: string;
  category: ReportCategory;
  title: string;
  description: string;
  status: ReportStatus;
  location: string;
  latitude: number;
  longitude: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Filter reports by criteria
 */
export const filterReports = (
  reports: Report[],
  filters: FilterOptions
): Report[] => {
  return reports.filter(report => {
    // Filter by status
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(report.status)) {
        return false;
      }
    }

    // Filter by category
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(report.category)) {
        return false;
      }
    }

    // Filter by date range
    if (filters.dateRange) {
      const reportDate = new Date(report.createdAt).getTime();
      
      if (filters.dateRange.startDate) {
        const startDate = new Date(filters.dateRange.startDate).getTime();
        if (reportDate < startDate) {
          return false;
        }
      }

      if (filters.dateRange.endDate) {
        const endDate = new Date(filters.dateRange.endDate).getTime();
        if (reportDate > endDate) {
          return false;
        }
      }
    }

    // Filter by location distance
    if (filters.location) {
      const distance = calculateDistance(
        filters.location.latitude,
        filters.location.longitude,
        report.latitude,
        report.longitude
      );

      if (distance > filters.location.radiusKm) {
        return false;
      }
    }

    // Filter by search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const matches =
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query) ||
        report.location.toLowerCase().includes(query);

      if (!matches) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Sort reports by given criteria
 */
export const sortReports = (
  reports: Report[],
  sortOption: SortOption,
  userLocation?: { latitude: number; longitude: number }
): Report[] => {
  const sorted = [...reports];

  switch (sortOption) {
    case SortOption.NEWEST:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case SortOption.OLDEST:
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    case SortOption.DISTANCE:
      if (!userLocation) return sorted;
      
      return sorted.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );

        const distanceB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );

        return distanceA - distanceB;
      });

    case SortOption.URGENCY:
      // Urgency based on status
      const statusPriority: Record<ReportStatus, number> = {
        [ReportStatus.In_Progress]: 0,
        [ReportStatus.Under_Review]: 1,
        [ReportStatus.Submitted]: 2,
        [ReportStatus.Resolved]: 3,
        [ReportStatus.Rejected]: 4,
      };

      return sorted.sort((a, b) => {
        const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
        if (priorityDiff !== 0) return priorityDiff;

        // If same priority, sort by newest first
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

    default:
      return sorted;
  }
};

/**
 * Calculate distance between two coordinates in kilometers
 * Using Haversine formula
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Get status color for UI display
 */
export const getStatusColor = (status: ReportStatus): string => {
  switch (status) {
    case ReportStatus.Submitted:
      return '#FFA500'; // Orange
    case ReportStatus.Under_Review:
      return '#4169E1'; // Royal Blue
    case ReportStatus.In_Progress:
      return '#FF6347'; // Tomato
    case ReportStatus.Resolved:
      return '#32CD32'; // Lime Green
    case ReportStatus.Rejected:
      return '#DC143C'; // Crimson
    default:
      return '#999999';
  }
};

/**
 * Get status label for UI display
 */
export const getStatusLabel = (status: ReportStatus): string => {
  return status.replace('_', ' ');
};
