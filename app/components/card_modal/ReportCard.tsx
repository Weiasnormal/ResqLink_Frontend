import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Report {
  id: number;
  title: string;
  status: string;
  type: string;
  typeIcon: string;
  date: string;
  location: string;
  image?: any;
}

interface ReportCardProps {
  report: Report;
  onPress?: (report: Report) => void;
  fullWidth?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onPress, fullWidth = false }) => {
  // Helper function to truncate title for 2 rows
  const truncateTitle = (title: string, maxChars: number = 35) => {
    if (title.length <= maxChars) return title;
    return title.substring(0, maxChars).trim() + '...';
  };

  // Helper function to truncate status text
  const truncateStatus = (status: string, maxChars: number = 10) => {
    if (status.length <= maxChars) return status;
    return status.substring(0, maxChars).trim() + '.';
  };

  const handlePress = () => {
    if (onPress) {
      onPress(report);
    } else {
      Alert.alert('Coming Soon', 'View details feature is under development.');
    }
  };

  return (
    <View style={[styles.reportCard, fullWidth ? styles.reportCardFullWidth : styles.reportCardFixed]}>
      <View style={styles.reportMainContent}>
        <View style={styles.reportImageContainer}>
          <Image 
            source={report.image ? { uri: `data:image/jpeg;base64,${report.image}` } : require('../../../assets/defaultimage.png')} 
            style={styles.reportImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.reportDetails}>
          <View style={styles.reportHeaderRow}>
            <Text style={styles.reportTitle} numberOfLines={2} ellipsizeMode="tail">
              {truncateTitle(report.title, 35)}
            </Text>
            <View style={[
              styles.reportStatusContainer, 
              report.status === 'Submitted' && styles.submittedStatusContainer,
              report.status === 'Under Review' && styles.reviewStatusContainer,
              report.status === 'Dispatched' && styles.dispatchedStatusContainer,
              report.status === 'Resolved' && styles.resolvedStatusContainer
            ]}>
              <Text style={[
                styles.reportStatus,
                report.status === 'Submitted' && styles.submittedStatusText,
                report.status === 'Under Review' && styles.reviewStatusText,
                report.status === 'Dispatched' && styles.dispatchedStatusText,
                report.status === 'Resolved' && styles.resolvedStatusText
              ]}>{truncateStatus(report.status, 15)}</Text>
            </View>
          </View>
          <View style={styles.reportMetaRow}>
            <View style={styles.reportTypeContainer}>
              <Ionicons 
                name={report.typeIcon as any} 
                size={12} 
                color="#FF8C42" 
              />
              <Text style={styles.reportType}>{report.type}</Text>
            </View>
            <View style={styles.reportLocationContainer}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.reportLocation}>{report.location}</Text>
            </View>
          </View>
          <Text style={styles.reportDate}>📅 {report.date}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.viewDetailsButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportCardFullWidth: {
    width: '100%',
  },
  reportCardFixed: {
    width: 300,
    marginRight: 16,
  },
  reportMainContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  reportImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  reportImage: {
    width: '100%',
    height: '100%',
  },
  reportDetails: {
    flex: 1,
  },
  reportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    minHeight: 40,
  },
  reportTitle: {
    fontSize: 15,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#000',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
    maxHeight: 40,
  },
  reportStatusContainer: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reportStatus: {
    fontSize: 10,
    color: '#2E7D32',
    fontFamily: 'OpenSans_600SemiBold',
    textAlign: 'center',
  },
  submittedStatusContainer: {
    backgroundColor: '#f5f5f5',
  },
  reviewStatusContainer: {
    backgroundColor: '#E3F2FD',
  },
  dispatchedStatusContainer: {
    backgroundColor: '#FFF3E0',
  },
  resolvedStatusContainer: {
    backgroundColor: '#E8F5E8',
  },
  submittedStatusText: {
    color: '#666',
  },
  reviewStatusText: {
    color: '#1976D2',
  },
  dispatchedStatusText: {
    color: '#F57C00',
  },
  resolvedStatusText: {
    color: '#2E7D32',
  },
  reportMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  reportType: {
    fontSize: 12,
    color: '#FF8C42',
    fontFamily: 'OpenSans_600SemiBold',
    marginLeft: 4,
  },
  reportLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
  },
  viewDetailsButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'OpenSans_600SemiBold',
  },
});

export default ReportCard;