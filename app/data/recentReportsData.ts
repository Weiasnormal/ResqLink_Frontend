import { Report } from '../components/card_modal/ReportCard';

// Shared recent reports data - will be replaced with backend API calls
export const RECENT_REPORTS_DATA: Report[] = [
  {
    id: 1,
    title: 'Restaurant Fire near the Sampaloc Area',
    status: 'Dispatched',
    type: 'Fire',
    typeIcon: 'flame-outline',
    date: 'Nov 30, 2025',
    location: 'San Rafael',
    image: null,
  },
  {
    id: 2,
    title: 'Car Accident in BRGY 2-A',
    status: 'Under Review',
    type: 'Police',
    typeIcon: 'shield-outline',
    date: 'Nov 30, 2025',
    location: 'Brgy 2-A',
    image: null,
  },
  {
    id: 3,
    title: 'Restaurant Fire near the Sampaloc Area',
    status: 'Submitted',
    type: 'Fire',
    typeIcon: 'flame-outline',
    date: 'Nov 30, 2025',
    location: 'San Rafael',
    image: null,
  },
  {
    id: 4,
    title: 'Medical Emergency at Plaza',
    status: 'Resolved',
    type: 'Medical',
    typeIcon: 'medical-outline',
    date: 'Nov 29, 2025',
    location: 'City Plaza',
    image: null,
  },
  {
    id: 5,
    title: 'Traffic Accident on Highway',
    status: 'Submitted',
    type: 'Police',
    typeIcon: 'shield-outline',
    date: 'Nov 28, 2025',
    location: 'National Highway',
    image: null,
  },
  {
    id: 6,
    title: 'Building Fire at Downtown Mall',
    status: 'Under Review',
    type: 'Fire',
    typeIcon: 'flame-outline',
    date: 'Nov 27, 2025',
    location: 'Downtown',
    image: null,
  },
  {
    id: 7,
    title: 'Robbery Incident at Bank',
    status: 'Resolved',
    type: 'Police',
    typeIcon: 'shield-outline',
    date: 'Nov 26, 2025',
    location: 'Financial District',
    image: null,
  },
  {
    id: 8,
    title: 'Heart Attack Emergency',
    status: 'Dispatched',
    type: 'Medical',
    typeIcon: 'medical-outline',
    date: 'Nov 25, 2025',
    location: 'Residential Area',
    image: null,
  },
];

/**
 * Get all recent reports
 */
export const getAllRecentReports = (): Report[] => {
  return RECENT_REPORTS_DATA;
};

/**
 * Get limited recent reports for HomeBody display (max 5)
 */
export const getLimitedRecentReports = (limit: number = 5): Report[] => {
  return RECENT_REPORTS_DATA.slice(0, limit);
};

/**
 * Get recent reports filtered by status
 */
export const getFilteredRecentReports = (status?: string): Report[] => {
  if (!status || status === 'All') {
    return RECENT_REPORTS_DATA;
  }
  return RECENT_REPORTS_DATA.filter(report => report.status === status);
};