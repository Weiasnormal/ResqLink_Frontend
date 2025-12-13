import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  authApi, 
  userApi, 
  reportsApi,
  RegisterRequest,
  GenerateOtpRequest,
  VerifyOtpRequest,
  UpdateInformationRequest,
  CreateReportRequest,
  Status,
  GetReportsRequest
} from '../_api';

// Query Keys
export const queryKeys = {
  user: (id?: string) => ['user', id],
  reports: {
    all: (params?: GetReportsRequest) => ['reports', 'all', params],
    byStatus: (status: Status, params?: GetReportsRequest) => ['reports', 'status', status, params],
    byId: (id: string) => ['reports', 'detail', id],
  },
} as const;

// Auth hooks
export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }
    },
  });
};

export const useGenerateOtp = () => {
  return useMutation({
    mutationFn: (data: GenerateOtpRequest) => authApi.generateOtp(data),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'OTP generation failed');
      }
    },
  });
};

export const useGenerateLoginOtp = () => {
  return useMutation({
    mutationFn: (data: GenerateOtpRequest) => authApi.generateLoginOtp(data),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Login OTP generation failed');
      }
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authApi.verifyOtp(data),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'OTP verification failed');
      }
    },
  });
};

// User hooks
export const useUser = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => userApi.getById(userId!),
    enabled: !!userId,
  });
};

export const useUpdateUserInformation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateInformationRequest) => userApi.updateInformation(data),
    onSuccess: (response, variables) => {
      if (!response.success) {
        throw new Error(response.error || 'Update failed');
      }
      
      // Invalidate user queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useUpdatePhoneNumber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newMobileNumber: string) => userApi.updatePhoneNumber({ newMobileNumber }),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Phone update failed');
      }
      
      // Invalidate user queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Account deletion failed');
      }
      
      // Logout user after successful deletion
      authApi.logout();
    },
  });
};

// Reports hooks
export const useReports = (params?: GetReportsRequest) => {
  return useQuery({
    queryKey: queryKeys.reports.all(params),
    queryFn: () => reportsApi.getAll(params),
    select: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch reports');
      }
      return response.data || [];
    },
  });
};

export const useReportsByStatus = (status: Status, params?: GetReportsRequest) => {
  return useQuery({
    queryKey: queryKeys.reports.byStatus(status, params),
    queryFn: () => reportsApi.getByStatus(status, params),
    select: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch reports');
      }
      return response.data || [];
    },
  });
};

export const useReport = (reportId?: string) => {
  return useQuery({
    queryKey: queryKeys.reports.byId(reportId!),
    queryFn: () => reportsApi.getById(reportId!),
    enabled: !!reportId,
    select: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch report');
      }
      return response.data;
    },
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReportRequest) => reportsApi.create(data),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Report creation failed');
      }
      
      // Invalidate all reports queries to show the new report
      // This will refetch useReports, useReportsByStatus, etc.
      queryClient.invalidateQueries({ 
        queryKey: ['reports'],
        exact: false // Match any query key that starts with 'reports'
      });
    },
  });
};

export const useCompleteReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reportId: string) => reportsApi.complete(reportId),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Report completion failed');
      }
      
      // Invalidate reports queries to show updated status
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reportId: string) => reportsApi.delete(reportId),
    onSuccess: (response) => {
      if (!response.success) {
        throw new Error(response.error || 'Report deletion failed');
      }
      
      // Invalidate reports queries to remove deleted report
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};