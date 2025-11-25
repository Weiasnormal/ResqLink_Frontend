import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  Animated, 
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import HotlineCard from './HotlineCard';
import { Department } from '../data/emergencyDepartments';

const { height: screenHeight } = Dimensions.get('window');

interface HotlineModalProps {
  visible: boolean;
  onClose: () => void;
  categoryTitle: string;
  departments: Department[];
}

const HotlineModal: React.FC<HotlineModalProps> = ({ 
  visible, 
  onClose, 
  categoryTitle, 
  departments 
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const currentValue = useRef(screenHeight);

  useEffect(() => {
    if (visible) {
      currentValue.current = 0;
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      currentValue.current = screenHeight;
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const headerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        slideAnim.setOffset(currentValue.current);
        slideAnim.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          currentValue.current = gestureState.dy;
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        slideAnim.flattenOffset();
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          currentValue.current = screenHeight;
          onClose();
        } else {
          currentValue.current = 0;
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <SafeAreaView style={styles.safeArea}>
                {/* Modal Header */}
                <View style={styles.header} {...headerPanResponder.panHandlers}>
                  <View style={styles.dragIndicator} />
                  <View style={styles.headerContent}>
                    <Text style={styles.modalTitle}>{categoryTitle} Near You</Text>
                  </View>
                </View>

                {/* Scrollable Content */}
                <ScrollView 
                  style={styles.scrollContainer}
                  contentContainerStyle={styles.scrollContentContainer}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                  scrollEnabled={true}
                  keyboardShouldPersistTaps="always"
                  scrollEventThrottle={1}
                  removeClippedSubviews={false}
                  overScrollMode="always"
                >
                  <View style={styles.content} pointerEvents="box-none">
                    {departments.map((department, index) => (
                      <HotlineCard 
                        key={index} 
                        department={department} 
                      />
                    ))}
                    {departments.length === 0 && (
                      <View style={styles.emptyState}>
                        <Ionicons name="information-circle-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No departments available</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </SafeAreaView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: screenHeight * 0.85,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    maxHeight: screenHeight * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    zIndex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#000000ff',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default HotlineModal;