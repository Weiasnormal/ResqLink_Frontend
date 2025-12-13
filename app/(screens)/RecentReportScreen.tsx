import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSlideIn } from '../_transitions/slideIn';
import ReportCard, { Report } from '../components/card_modal/ReportCard';
import { router } from 'expo-router';

// Import API hooks and utilities
import { useReports, useReportsByStatus } from '../_hooks/useApi';
import { Status, mapStatusToString, Category } from '../_api/reports';
import { formatApiError } from '../_utils/apiHelpers';
import { 
  filterReports, 
  sortReports, 
  SortOption,
  ReportStatus,
  ReportCategory,
  FilterOptions 
} from '../_utils/reportFilters';

interface RecentReportScreenProps {
  onBack: () => void;
}



type FilterType = 'All' | 'Submitted' | 'Under Review';

const RecentReportScreen: React.FC<RecentReportScreenProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // API hooks for different report states
  const { data: allReports, isLoading: loadingAll, error: errorAll } = useReports({ pageSize: 50, pageOffset: 1 });
  const { data: submittedReports, isLoading: loadingSubmitted, error: errorSubmitted } = useReportsByStatus(Status.Submitted, { pageSize: 50, pageOffset: 1 });
  const { data: reviewReports, isLoading: loadingReview, error: errorReview } = useReportsByStatus(Status.Under_Review, { pageSize: 50, pageOffset: 1 });
  
  const slideAnimation = useSlideIn({ 
    direction: 'right', 
    distance: 300, 
    duration: 300 
  });
  
  useEffect(() => {
    slideAnimation.slideIn();
  }, []);

  // Helper function to map category to icon
  const getCategoryIcon = (category: string): string => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('traffic') || categoryLower.includes('accident')) {
      return 'car-crash';
    }
    if (categoryLower.includes('fire')) {
      return 'flame';
    }
    if (categoryLower.includes('flood')) {
      return 'water';
    }
    if (categoryLower.includes('structural') || categoryLower.includes('damage')) {
      return 'home';
    }
    if (categoryLower.includes('medical') || categoryLower.includes('emergency')) {
      return 'medical';
    }
    return 'alert-circle'; // Other / General
  };

  // Get filtered reports based on active filter
  const getFilteredReports = (): Report[] => {
    let apiReports: any[] = [];
    
    switch (activeFilter) {
      case 'Submitted':
        apiReports = submittedReports || [];
        break;
      case 'Under Review':
        apiReports = reviewReports || [];
        break;
      default:
        apiReports = allReports || [];
    }

    // Transform API data to match ReportCard expected format
    return apiReports.map(report => {
      // Convert category enum to string
      const categoryString = typeof report.category === 'string' 
        ? report.category 
        : Object.keys(Category).find(key => Category[key as keyof typeof Category] === report.category) || 'Other';
      
      return {
        id: report.id,
        title: report.title || report.description || categoryString || 'Emergency Report',
        status: mapStatusToString(report.status),
        type: categoryString, // Use category as type
        typeIcon: getCategoryIcon(categoryString), // Map category to icon
        date: new Date(report.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        location: report.location.reverseGeoCode || 'Location not specified', // Use reverseGeoCode
        image: report.images && report.images.length > 0 ? report.images[0] : undefined, // Use first image only
      };
    });
  };

  const filteredReports = getFilteredReports();
  const isLoading = loadingAll || loadingSubmitted || loadingReview;
  const hasError = errorAll || errorSubmitted || errorReview;

  const handleBack = () => {
    if (isAnimatingOut) return;
    
    setIsAnimatingOut(true);
    slideAnimation.slideOut(() => {
      onBack();
    });
  };

  const handleFilterPress = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleReportPress = (report: Report) => {
    // Navigate to report details - backend ready
    router.push(`/ReportDetails/${report.id}`);
  };

  const renderFilterPill = (filter: FilterType) => {
    const isActive = activeFilter === filter;
    
    return (
      <TouchableOpacity
        key={filter}
        style={[
          styles.filterPill,
          isActive ? styles.activeFilterPill : styles.inactiveFilterPill
        ]}
        onPress={() => handleFilterPress(filter)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.filterText,
          isActive ? styles.activeFilterText : styles.inactiveFilterText
        ]}>
          {filter}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderReportCard = ({ item }: { item: Report }) => (
    <View style={styles.reportCardWrapper}>
      <ReportCard 
        report={item} 
        onPress={handleReportPress}
        fullWidth={true}
      />
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
        
        <Animated.View style={[
          styles.content,
          {
            transform: [
              { translateX: slideAnimation.translateX },
              { translateY: slideAnimation.translateY },
            ],
          },
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Recent Reports</Text>
            
            <View style={styles.headerSpacer} />
          </View>

          {/* Filter Pills */}
          <View style={styles.filtersContainer}>
            {(['All', 'Submitted', 'Under Review'] as FilterType[]).map(renderFilterPill)}
          </View>

          {/* Reports List */}
          <View style={styles.scrollContainer}>
            {/* Loading State */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF9427" />
                <Text style={styles.loadingText}>Loading reports...</Text>
              </View>
            )}

            {/* Error State */}
            {hasError && !isLoading && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
                <Text style={styles.errorTitle}>Failed to Load Reports</Text>
                <Text style={styles.errorText}>
                  {formatApiError(hasError?.message || 'Unable to fetch reports')}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => {
                    // Trigger refetch by changing activeFilter momentarily
                    const current = activeFilter;
                    setActiveFilter('All');
                    setTimeout(() => setActiveFilter(current), 100);
                  }}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Reports List */}
            {!isLoading && !hasError && (
              <FlatList
                data={filteredReports}
                renderItem={renderReportCard}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.reportsListContainer}
                ItemSeparatorComponent={() => <View style={styles.reportSeparator} />}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={48} color="#999" />
                    <Text style={styles.emptyText}>No reports found for "{activeFilter}"</Text>
                    <Text style={styles.emptySubtext}>
                      {activeFilter === 'All' 
                        ? 'You haven\'t submitted any reports yet' 
                        : `No reports with "${activeFilter}" status`}
                    </Text>
                  </View>
                }
                ListFooterComponent={() => <View style={styles.listFooter} />}
                style={styles.flatList}
              />
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    backgroundColor: '#F8F9FA',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeFilterPill: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  inactiveFilterPill: {
    backgroundColor: '#ffffffff',
    borderColor: '#e0e0e0',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
  },
  activeFilterText: {
    color: '#fff',
  },
  inactiveFilterText: {
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  flatList: {
    flex: 1,
  },
  reportsListContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  listFooter: {
    height: 70,
  },
  reportCardWrapper: {
    width: '100%',
  },
  reportSeparator: {
    height: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'OpenSans_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'OpenSans_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontFamily: 'OpenSans_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    color: '#FF4444',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'OpenSans_600SemiBold',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'OpenSans_400Regular',
  },
  retryButton: {
    backgroundColor: '#FF9427',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'OpenSans_600SemiBold',
  },
});

export default RecentReportScreen;

