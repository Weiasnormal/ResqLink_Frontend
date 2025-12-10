import { Alert } from 'react-native';

/**
 * Domain Event Types matching backend events
 */
export enum DomainEventType {
  UserRegistered = 'UserRegisteredDomainEvent',
  PhoneNumberChanged = 'PhoneNumberChangedDomainEvent',
  PhoneNumberVerified = 'PhoneNumberVerifiedDomainEvent',
  ReportSubmitted = 'ReportSubmittedDomainEvent',
  ReportApproved = 'ReportApprovedDomainEvent',
  ReportRejected = 'ReportRejectedDomainEvent',
  ReportInProgress = 'ReportInProgressDomainEvent',
  ReportResolved = 'ReportResolvedDomainEvent',
  AccountDeleted = 'AccountDeletedDomainEvent',
  // Local events (not from backend)
  UserLoggedIn = 'UserLoggedInEvent',
  UserLoggedOut = 'UserLoggedOutEvent',
  GuestModeActivated = 'GuestModeActivatedEvent',
}

/**
 * Domain Event Interface
 */
export interface DomainEvent {
  eventId: string;
  eventType: DomainEventType;
  aggregateId: string;
  aggregateType: string;
  timestamp: string;
  data: Record<string, any>;
  correlationId: string;
}

/**
 * Notification Manager
 * Handles domain events and displays appropriate notifications to users
 */
class NotificationManager {
  private listeners: Map<DomainEventType, Set<Function>> = new Map();

  /**
   * Subscribe to domain event
   */
  subscribe(eventType: DomainEventType, callback: (event: DomainEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Emit domain event
   */
  emit(event: DomainEvent): void {
    const callbacks = this.listeners.get(event.eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.warn('Error handling domain event:', error);
        }
      });
    }
  }

  /**
   * Handle and display notification for domain event
   */
  async handleDomainEvent(event: DomainEvent): Promise<void> {
    try {
      switch (event.eventType) {
        case DomainEventType.UserRegistered:
          this.showSuccessNotification('Account Created', 'Your account has been successfully created!');
          break;

        case DomainEventType.PhoneNumberVerified:
          this.showSuccessNotification('Phone Verified', 'Your phone number has been verified.');
          break;

        case DomainEventType.ReportSubmitted:
          this.showSuccessNotification(
            'Report Submitted',
            'Your emergency report has been submitted successfully.'
          );
          break;

        case DomainEventType.ReportApproved:
          this.showInfoNotification(
            'Report Approved',
            'Your report has been approved and is under review.'
          );
          break;

        case DomainEventType.ReportInProgress:
          this.showInfoNotification(
            'Report In Progress',
            'Emergency responders are currently addressing your report.'
          );
          break;

        case DomainEventType.ReportResolved:
          this.showSuccessNotification(
            'Report Resolved',
            'Your emergency report has been resolved.'
          );
          break;

        case DomainEventType.ReportRejected:
          this.showErrorNotification(
            'Report Rejected',
            'Your report was rejected. Please contact support for more information.'
          );
          break;

        case DomainEventType.AccountDeleted:
          this.showInfoNotification(
            'Account Deleted',
            'Your account has been successfully deleted.'
          );
          break;

        case DomainEventType.PhoneNumberChanged:
          this.showInfoNotification(
            'Phone Number Changed',
            'Your phone number has been updated.'
          );
          break;

        case DomainEventType.UserLoggedIn:
          this.showSuccessNotification(
            'Welcome Back!',
            'You have successfully logged in.'
          );
          break;

        case DomainEventType.UserLoggedOut:
          this.showInfoNotification(
            'Logged Out',
            'You have been logged out successfully.'
          );
          break;

        case DomainEventType.GuestModeActivated:
          this.showInfoNotification(
            'Guest Mode',
            'You are using ResqLink as a guest. Some features may be limited. Sign up for full access.'
          );
          break;
      }

      // Emit event for listeners
      this.emit(event);
    } catch (error) {
      console.warn('Failed to handle domain event:', error);
    }
  }

  /**
   * Show success notification
   */
  private showSuccessNotification(title: string, message: string): void {
    Alert.alert(title, message, [{ text: 'OK', onPress: () => {} }]);
  }

  /**
   * Show error notification
   */
  private showErrorNotification(title: string, message: string): void {
    Alert.alert(title, message, [{ text: 'OK', onPress: () => {} }]);
  }

  /**
   * Show info notification
   */
  private showInfoNotification(title: string, message: string): void {
    Alert.alert(title, message, [{ text: 'OK', onPress: () => {} }]);
  }

  /**
   * Send push notification (for background events)
   * Note: Requires expo-notifications to be installed
   */
  async sendPushNotification(title: string, body: string, data?: Record<string, any>): Promise<void> {
    try {
      // This method requires expo-notifications to be installed
      // For now, we log to console
      console.log('Push Notification:', { title, body, data });
      
      // Once expo-notifications is installed, uncomment and use:
      // import * as Notifications from 'expo-notifications';
      // await Notifications.scheduleNotificationAsync({
      //   content: { title, body, data: data || {} },
      //   trigger: null, // Send immediately
      // });
    } catch (error) {
      console.warn('Failed to send push notification:', error);
    }
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }
}

export const notificationManager = new NotificationManager();
