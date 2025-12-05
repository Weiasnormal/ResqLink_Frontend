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
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSlideIn } from '../_transitions/slideIn';
import ReportCard, { Report } from '../components/card_modal/ReportCard';
import { router } from 'expo-router';
import { getAllRecentReports, getFilteredRecentReports } from '../_data/recentReportsData';

interface RecentReportScreenProps {
  onBack: () => void;
}



type FilterType = 'All' | 'Submitted' | 'Under Review';

const RecentReportScreen: React.FC<RecentReportScreenProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [filteredReports, setFilteredReports] = useState<Report[]>(getAllRecentReports());
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  const slideAnimation = useSlideIn({ 
    direction: 'right', 
    distance: 300, 
    duration: 300 
  });
  
  useEffect(() => {
    slideAnimation.slideIn();
  }, []);

  useEffect(() => {
    // Filter reports based on active filter using shared data
    setFilteredReports(getFilteredRecentReports(activeFilter));
  }, [activeFilter]);

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
            <FlatList
              data={filteredReports}
              renderItem={renderReportCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.reportsListContainer}
              ItemSeparatorComponent={() => <View style={styles.reportSeparator} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No reports found for this filter</Text>
                </View>
              }
              ListFooterComponent={() => <View style={styles.listFooter} />}
              style={styles.flatList}
            />
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
  },
});

export default RecentReportScreen;

