import { apiClient, handleApiResponse, handleApiError, ApiResponse } from './config';


export enum Category {
  Other = 32,
  TrafficAccident = 4,
  FireIncident = 3,
  Flooding = 8,
  StructuralDamage = 9,
  MedicalEmergency = 2,
}

export enum Status {
  Submitted = 'Submitted',
  Under_Review = 'Under_Review',
  In_Progress = 'In_Progress',
  Resolved = 'Resolved',
  Rejected = 'Rejected',
}

export interface Location {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  altitudeAccuracy: number;
  reverseGeoCode?: string; // Reverse geocoded address for readable location
}

export interface CreateReportRequest {
  // title: string; 
  images: string[]; // array of base64 encoded images (max 5)
  category: Category;
  description?: string;
  location: Location;
}

export interface ReportResponse {
  id: string;
  images: string[]; 
  category: Category;
  // title: string; 
  description?: string;
  location: Location;
  createdAt: string;
  status: Status;
}

export interface GetReportsRequest {
  sort?: string;
  pageSize?: number;
  pageOffset?: number;
}

// Reports API functions
export const reportsApi = {
  // Create new report
  create: async (data: CreateReportRequest): Promise<ApiResponse<string>> => {
    try {
      console.log('📤 Creating report with data:', {
        imageCount: data.images?.length || 0,
        category: data.category,
        hasDescription: !!data.description,
        location: data.location,
      });
      
      const response = await apiClient.post('/reports', {
        Images: data.images || [], // Backend expects 'Image' not 'Images'
        Category: data.category,
        Description: data.description,
        Location: {
          Latitude: data.location.latitude,
          Longitude: data.location.longitude,
          Altitude: data.location.altitude,
          Accuracy: Math.round(data.location.accuracy), 
          AltitudeAccuracy: Math.round(data.location.altitudeAccuracy),
          ReverseGeoCode: data.location.reverseGeoCode || '', // Reverse geocoded address
        },
      });
      
      console.log('✅ Report created successfully:', response.data);
      return handleApiResponse<string>(response);
    } catch (error: any) {
      console.error('❌ Report creation failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      return handleApiError(error);
    }
  },

  // Get all reports with pagination
  getAll: async (params: GetReportsRequest = {}): Promise<ApiResponse<ReportResponse[]>> => {
    try {
      // Backend requires all parameters, provide defaults (pageoffset is 1-based)
      const sort = params.sort || 'CreatedAt';
      const pageSize = params.pageSize ?? 50;
      const pageOffset = params.pageOffset ?? 1;
      
      const queryParams = new URLSearchParams({
        sort: sort,
        pageSize: pageSize.toString(),
        pageoffset: pageOffset.toString(),
      });

      const url = `/reports?${queryParams.toString()}`;
      console.log('📥 Fetching reports from:', url);
      
      const response = await apiClient.get(url);
      console.log('✅ Reports fetched successfully, count:', response.data?.length || 0);
      if (response.data?.length > 0) {
        console.log('📍 Sample report reverseGeoCode:', response.data[0].location?.reverseGeoCode || 'No address');
      }
      
      // Backend should return base64 strings directly
      return handleApiResponse<ReportResponse[]>(response);
    } catch (error: any) {
      console.error('❌ Failed to fetch reports:', error.message);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      return handleApiError(error);
    }
  },

  // Get reports by status
  getByStatus: async (status: Status, params: GetReportsRequest = {}): Promise<ApiResponse<ReportResponse[]>> => {
    try {
      const allReportsResponse = await reportsApi.getAll(params);
      
      if (allReportsResponse.success && allReportsResponse.data) {
        const filteredReports = allReportsResponse.data.filter(report => report.status === status);
        return {
          data: filteredReports,
          success: true,
        };
      }
      
      return allReportsResponse;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get report by ID
  getById: async (reportId: string): Promise<ApiResponse<ReportResponse>> => {
    try {
      const response = await apiClient.get(`/reports/${reportId}`);
      
      // Backend should return base64 string directly
      return handleApiResponse<ReportResponse>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Complete/resolve report (admin function)
  complete: async (reportId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.patch(`/reports/${reportId}/complete`);
      return handleApiResponse<null>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete report
  delete: async (reportId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/reports/${reportId}`);
      return handleApiResponse<null>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Convenience functions for easier usage in screens
export const createReport = reportsApi.create;
export const getAllReports = reportsApi.getAll;
export const getReportsByStatus = reportsApi.getByStatus;
export const getReportById = reportsApi.getById;
export const completeReport = reportsApi.complete;
export const deleteReport = reportsApi.delete;

// Helper function to convert frontend category strings to backend enum
export const mapCategoryToEnum = (categoryString: string): Category => {
  switch (categoryString.toLowerCase()) {
    case 'traffic':
    case 'accident':
    case 'traffic accident':
      return Category.TrafficAccident;
    case 'fire':
    case 'fire incident':
      return Category.FireIncident;
    case 'flood':
    case 'flooding':
      return Category.Flooding;
    case 'structural':
    case 'damage':
    case 'structural damage':
      return Category.StructuralDamage;
    case 'medical':
    case 'emergency':
    case 'medical emergency':
      return Category.MedicalEmergency;
    case 'other':
    case 'general':
    default:
      return Category.Other;
  }
};

// Helper function to convert backend status enum to frontend string
export const mapStatusToString = (status: Status): string => {
  switch (status) {
    case Status.Submitted:
      return 'Submitted';
    case Status.Under_Review:
      return 'Under Review';
    case Status.In_Progress:
      return 'In Progress';
    case Status.Resolved:
      return 'Resolved';
    case Status.Rejected:
      return 'Rejected';
    default:
      return 'Unknown';
  }
};