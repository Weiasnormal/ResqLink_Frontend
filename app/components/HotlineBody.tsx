import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HotlineModal from './HotlineModal';
import { EMERGENCY_DEPARTMENTS, Department, DepartmentCategory } from '../data/emergencyDepartments';

const HotlineBody: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DepartmentCategory | ''>('');

  // Dynamic categories with counts based on actual data
  const hotlineCategories = [
    {
      id: 'hospitals' as DepartmentCategory,
      title: 'Hospitals',
      subtitle: `See all ${EMERGENCY_DEPARTMENTS.hospitals.length} departments`,
      icon: 'medical',
      iconColor: '#FF6B6B',
      backgroundColor: '#FFE5E5',
    },
    {
      id: 'fire' as DepartmentCategory,
      title: 'Fire Departments',
      subtitle: `See all ${EMERGENCY_DEPARTMENTS.fire.length} departments`,
      icon: 'flame',
      iconColor: '#FF8C42',
      backgroundColor: '#FFF2E5',
    },
    {
      id: 'police' as DepartmentCategory,
      title: 'Police Stations',
      subtitle: `See all ${EMERGENCY_DEPARTMENTS.police.length} departments`,
      icon: 'shield-checkmark',
      iconColor: '#4ECDC4',
      backgroundColor: '#E5F9F6',
    },
    {
      id: 'power' as DepartmentCategory,
      title: 'Power',
      subtitle: `See all ${EMERGENCY_DEPARTMENTS.power.length} departments`,
      icon: 'flash',
      iconColor: '#FFD93D',
      backgroundColor: '#FFF9E5',
    },
    {
      id: 'disaster' as DepartmentCategory,
      title: 'Disaster Response',
      subtitle: `See all ${EMERGENCY_DEPARTMENTS.disaster.length} departments`,
      icon: 'car',
      iconColor: '#6BCF7F',
      backgroundColor: '#E8F5E8',
    },
  ];

  const handleCategoryPress = (categoryId: DepartmentCategory) => {
    setSelectedCategory(categoryId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCategory('');
  };

  const getSelectedCategoryTitle = () => {
    const category = hotlineCategories.find(cat => cat.id === selectedCategory);
    return category ? category.title : '';
  };

  const getSelectedDepartments = (): Department[] => {
    if (!selectedCategory) return [];
    return EMERGENCY_DEPARTMENTS[selectedCategory] || [];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Emergency Hotlines Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Hotlines</Text>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Connect instantly with emergency responders.
          </Text>
        </View>

        {/* Hotline Categories */}
        <View style={styles.categoriesContainer}>
          {hotlineCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryContent}>
                <View style={[styles.iconContainer, { backgroundColor: category.backgroundColor }]}>
                  <Ionicons 
                    name={category.icon as any} 
                    size={24} 
                    color={category.iconColor} 
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
      </View>

      <HotlineModal
        visible={modalVisible}
        onClose={handleCloseModal}
        categoryTitle={getSelectedCategoryTitle()}
        departments={getSelectedDepartments()}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  infoButton: {
    padding: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
});

export default HotlineBody;