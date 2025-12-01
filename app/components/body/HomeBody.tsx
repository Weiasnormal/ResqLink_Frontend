import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image,
  Linking,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import HotlineModal from '../card_modal/HotlineModal';
import ReportCard, { Report } from '../card_modal/ReportCard';
import { EMERGENCY_DEPARTMENTS, DepartmentCategory } from '../../data/emergencyDepartments';
import HospitalIcon from '../../../assets/EmergencyIcons/hospital.svg';
import FireIcon from '../../../assets/EmergencyIcons/fire.svg';
import PoliceIcon from '../../../assets/EmergencyIcons/police.svg';

interface HomeBodyProps {
  onTabPress?: (tab: string) => void;
}

const HomeBody: React.FC<HomeBodyProps> = ({ onTabPress }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DepartmentCategory | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  // Helper function to truncate title for 2 rows
  const truncateTitle = (title: string, maxChars: number = 35) => {
    if (title.length <= maxChars) return title;
    return title.substring(0, maxChars).trim() + '...';
  };


  // Top Action Boxes
  const topActionBoxes = [
    {
      id: 'report',
      title: 'Report',
      iconSource: require('../../../assets/Home/table-report.png'),
      backgroundColor: '#E6F3FF',
      onPress: () => onTabPress?.('report')
    },
    {
      id: 'hotline',
      title: 'Hotline',
      iconSource: require('../../../assets/Home/hotline.png'),
      backgroundColor: '#FFE6E6',
      onPress: () => onTabPress?.('hotline')
    },
    {
      id: 'history',
      title: 'History',
      iconSource: require('../../../assets/Home/history.png'),
      backgroundColor: '#FFEDE6',
      onPress: () => Alert.alert('Coming Soon', 'History feature is under development.')
    }
  ];

  // Emergency Hotlines Categories (same as HotlineBody)
  const hotlineCategories = [
    {
      id: 'hospitals' as DepartmentCategory,
      title: 'Hospitals',
      subtitle: `See all ${EMERGENCY_DEPARTMENTS.hospitals.length} departments`,
      IconComponent: HospitalIcon,
    },
    {
      id: 'fire' as DepartmentCategory,
      title: 'Fire Departments',
      subtitle: `See all ${EMERGENCY_DEPARTMENTS.fire.length} departments`,
      IconComponent: FireIcon,
    },
    {
      id: 'police' as DepartmentCategory,
      title: 'Police Stations',
      subtitle: `See all ${EMERGENCY_DEPARTMENTS.police.length} departments`,
      IconComponent: PoliceIcon,
    },
  ];

  // Safety Tips
  const safetyTips = [
    {
      id: 1,
      icon: 'thunderstorm',
      title: 'What to do when there\'s a storm',
      url: 'https://www.civildefence.govt.nz/resources/what-to-do-during-a-storm',
      hasLink: true
    },
    {
      id: 2,
      icon: 'battery-charging-full',
      title: 'Charge your devices before storms',
      url: '', // Placeholder
      hasLink: false
    },
    {
      id: 3,
      icon: 'local-fire-department',
      title: 'Avoid overloaded sockets',
      url: '', // Placeholder
      hasLink: false
    },
    {
      id: 4,
      icon: 'house',
      title: 'Know the nearest evacuation site',
      url: '', // Placeholder
      hasLink: false
    }
  ];

  const handleHotlinePress = (categoryId: DepartmentCategory) => {
    setSelectedCategory(categoryId);
    setModalVisible(true);
  };

  const getSelectedCategoryData = () => {
    if (!selectedCategory) return { title: '', departments: [] };
    
    const categoryData = hotlineCategories.find(cat => cat.id === selectedCategory);
    return {
      title: categoryData?.title || '',
      departments: EMERGENCY_DEPARTMENTS[selectedCategory] || []
    };
  };

  const handleSafetyTipPress = (tip: typeof safetyTips[0]) => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (tip.hasLink && tip.url) {
      Linking.openURL(tip.url).catch(() => {
        Alert.alert('Error', 'Could not open the link');
      });
    } else {
      Alert.alert('Coming Soon', 'This safety tip link will be available soon.');
    }
  };

  const sampleRecentReports: Report[] = [
    {
      id: 1,
      title: 'Restaurant Fire near the Sampaloc Market',
      status: 'Submitted',
      type: 'Fire',
      typeIcon: 'flame-outline',
      date: 'Nov 30, 2025',
      location: 'San Rafael'
    },
    {
      id: 2,
      title: 'Traffic Accident on Main Street',
      status: 'Under Review',
      type: 'Accident',
      typeIcon: 'car-outline',
      date: 'Nov 29, 2025',
      location: 'San Pablo City'
    },
    {
      id: 3,
      title: 'Medical Emergency at Plaza',
      status: 'Resolved',
      type: 'Medical',
      typeIcon: 'medical-outline',
      date: 'Nov 28, 2025',
      location: 'City Center'
    }
  ];

  const handleReportPress = (report: Report) => {
    Alert.alert('Report Details', `Viewing details for: ${report.title}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Action Boxes */}
      <View style={styles.topActionsContainer}>
        {topActionBoxes.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionBox, { backgroundColor: action.backgroundColor }]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <Image 
              source={action.iconSource} 
              style={styles.actionBoxIcon}
              resizeMode="contain"
            />
            <Text style={styles.actionBoxTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Emergency Hotlines Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Hotlines</Text>
        <Text style={styles.sectionSubtitle}>Tap to connect instantly with local responders</Text>
        
        <View style={styles.categoriesContainer}>
          {hotlineCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleHotlinePress(category.id)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryContent}>
                <View style={styles.iconContainer}>
                  <category.IconComponent 
                    width={42}
                    height={42}
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.seeAllButton}
          onPress={() => onTabPress?.('hotline')}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllButtonText}>See All Hotlines</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Reports Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Recent Reports</Text>
          <TouchableOpacity 
            onPress={() => Alert.alert('Coming Soon', 'See all reports feature is under development.')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>Track your ongoing emergencies</Text>

        {/* Recent Report Cards - Horizontal Scroll */}
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.reportsScrollView}
          contentContainerStyle={styles.reportsScrollContent}
        >
          {sampleRecentReports.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report} 
              onPress={handleReportPress}
            />
          ))}
        </ScrollView>
      </View>

      {/* Safety Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        
        <View style={styles.safetyTipsGrid}>
          {safetyTips.map((tip) => (
            <Animated.View 
              key={tip.id} 
              style={[styles.safetyTipWrapper, { transform: [{ scale: scaleAnim }] }]}
            >
              <TouchableOpacity
                style={styles.safetyTipButton}
                onPress={() => handleSafetyTipPress(tip)}
                activeOpacity={0.8}
              >
                <MaterialIcons name={tip.icon as any} size={32} color="#000000ff" />
                <Text style={styles.safetyTipText}>{tip.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* HotlineModal */}
      <HotlineModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        categoryTitle={getSelectedCategoryData().title}
        departments={getSelectedCategoryData().departments}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F6',
  },
  topActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 27,
    backgroundColor: '#fff',
  },
  actionBox: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  actionBoxIcon: {
    width: 28,
    height: 28,
  },
  section: {
    backgroundColor: '#F2F4F6',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  bottomSection: {
    backgroundColor: '#F2F4F6', 
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF8C42',
    fontWeight: '600',
  },
  categoriesContainer: {
    flex: 1,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  seeAllButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  seeAllButtonText: {
    fontSize: 16,
    color: '#FF8C42',
    fontWeight: '600',
  },
  reportsScrollView: {
    marginHorizontal: -16,
  },
  reportsScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 2,
  },

  safetyTipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  safetyTipWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  safetyTipButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 120,
  },
  safetyTipText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  categoryIcon: {
    width:40,
    height:40,
  },
});

export default HomeBody;