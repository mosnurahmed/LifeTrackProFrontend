/**
 * Notification Service
 * 
 * Purpose: Handle Firebase Cloud Messaging and Local Notifications
 */

import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';
import apiClient from '../api/client';
import { NotificationType } from '../types/notification.types';

class NotificationService {
  private isInitialized = false;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permission
      await this.requestPermission();

      // Create notification channels
      await this.createChannels();

      // Get FCM token
      await this.registerDevice();

      // Setup listeners
      this.setupForegroundListener();
      this.setupBackgroundListener();
      this.setupNotificationOpenedListener();

      this.isInitialized = true;
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Notification service error:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    // Android 13+ (API 33) requires explicit POST_NOTIFICATIONS runtime permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'LifeTrack needs permission to send you notifications for expenses, tasks, budgets, and savings goals.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      if (status !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('❌ Notification permission denied (Android 13+)');
        return false;
      }
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permission granted');
    } else {
      console.log('❌ Notification permission denied');
    }

    return enabled;
  }

  /**
   * Get FCM token and register device
   */
  async registerDevice(): Promise<void> {
    try {
      const token = await messaging().getToken();
      
      if (token) {
        // Save to backend
        await apiClient.post('/auth/device-token', { token });
        
        // Save locally
        await AsyncStorage.setItem('fcm_token', token);
        
        console.log('✅ Device registered:', token);
      }
    } catch (error) {
      console.error('❌ Device registration error:', error);
    }
  }

  /**
   * Unregister device
   */
  async unregisterDevice(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('fcm_token');
      
      if (token) {
        await apiClient.delete('/auth/device-token', { data: { token } });
        await AsyncStorage.removeItem('fcm_token');
        console.log('✅ Device unregistered');
      }
    } catch (error) {
      console.error('❌ Device unregister error:', error);
    }
  }

  /**
   * Setup foreground notification listener
   */
  setupForegroundListener(): void {
    messaging().onMessage(async (remoteMessage) => {
      console.log('📨 Foreground notification:', remoteMessage);

      const data = remoteMessage.data as any;
      const title = remoteMessage.notification?.title || data?.title || 'Notification';
      const body = remoteMessage.notification?.body || data?.body || '';

      await this.displayNotification(title, body, data);

      // Refresh notification list & badge count instantly
      const { queryClient } = require('../config/queryClient');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
  }

  /**
   * Setup background notification listener
   */
  setupBackgroundListener(): void {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('📨 Background notification:', remoteMessage);
      // notification payload is auto-displayed by OS in background — no action needed
    });
  }

  /**
   * Setup notification opened listener
   */
  setupNotificationOpenedListener(): void {
    // App opened from background
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📱 Notification opened app:', remoteMessage);
      this.handleNotificationPress(remoteMessage.data as any);
    });

    // App opened from quit state (FCM)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('📱 Notification opened app from quit:', remoteMessage);
          setTimeout(() => this.handleNotificationPress(remoteMessage.data as any), 1000);
        }
      });

    // App opened from killed state via Notifee (background event stored intent)
    AsyncStorage.getItem('pending_notification').then(raw => {
      if (raw) {
        AsyncStorage.removeItem('pending_notification');
        setTimeout(() => this.handleNotificationPress(JSON.parse(raw)), 1000);
      }
    });

    // Notifee notification pressed
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('📱 Notifee notification pressed:', detail);
        this.handleNotificationPress(detail.notification?.data as any);
      }
    });
  }

  /**
   * Resolve channel ID by notification type
   */
  private getChannelIdForType(type?: string): string {
    switch (type) {
      case 'chat_message':    return 'chat';
      case 'task_reminder':
      case 'task_due_today':  return 'tasks';
      case 'budget_warning':
      case 'budget_exceeded': return 'budget';
      case 'savings_milestone':
      case 'savings_completed': return 'savings';
      case 'expense_added':   return 'expenses';
      default:                return 'default';
    }
  }

  /**
   * Ensure all notification channels exist (call once on init)
   */
  async createChannels(): Promise<void> {
    const channels = [
      { id: 'default',   name: 'General' },
      { id: 'chat',      name: 'Chat Messages' },
      { id: 'tasks',     name: 'Task Reminders' },
      { id: 'budget',    name: 'Budget Alerts' },
      { id: 'savings',   name: 'Savings Goals' },
      { id: 'expenses',  name: 'Expense Alerts' },
    ];
    for (const ch of channels) {
      await notifee.createChannel({ ...ch, importance: AndroidImportance.HIGH, sound: 'default', vibration: true });
    }
  }

  /**
   * Display notification using Notifee
   */
  async displayNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const channelId = this.getChannelIdForType(data?.type);

      await notifee.displayNotification({
        title,
        body,
        data,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: { id: 'default' },
        },
        ios: { sound: 'default' },
      });
    } catch (error) {
      console.error('❌ Display notification error:', error);
    }
  }

  /**
   * Handle notification press — navigate to the relevant screen
   */
  handleNotificationPress(data?: Record<string, any>): void {
    // Lazy require to avoid circular dependency
    const { navigate } = require('../navigation/navigationRef');

    // All notification taps go to NotificationsList screen
    navigate('NotificationsList');
  }

  /**
   * Schedule local notification (for task reminders)
   */
  async scheduleLocalNotification(
    id: string,
    title: string,
    body: string,
    triggerDate: Date,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const channelId = await notifee.createChannel({
        id: 'task-reminders',
        name: 'Task Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true
      });

      const trigger = {
        type: 1, // TimestampTrigger
        timestamp: triggerDate.getTime()
      };

      await notifee.createTriggerNotification(
        {
          id,
          title,
          body,
          data,
          android: {
            channelId,
            pressAction: {
              id: 'default'
            }
          }
        },
        trigger as any
      );

      console.log('✅ Local notification scheduled:', id);
    } catch (error) {
      console.error('❌ Schedule notification error:', error);
    }
  }

  /**
   * Cancel local notification
   */
  async cancelLocalNotification(id: string): Promise<void> {
    try {
      await notifee.cancelNotification(id);
      console.log('✅ Notification cancelled:', id);
    } catch (error) {
      console.error('❌ Cancel notification error:', error);
    }
  }

  /**
   * Cancel all local notifications
   */
  async cancelAllLocalNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('✅ All notifications cancelled');
    } catch (error) {
      console.error('❌ Cancel all notifications error:', error);
    }
  }

  /**
   * Get notification permission status
   */
  async checkPermission(): Promise<boolean> {
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }
}

export default new NotificationService();