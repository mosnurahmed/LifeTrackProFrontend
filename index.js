/**
 * @format
 **/

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// ─── FCM Background Handler (app killed / background) ─────────────────────────
// MUST be registered before AppRegistry.registerComponent

messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (!remoteMessage.notification) return;

  // Resolve channel from data type
  const type = remoteMessage.data?.type ?? 'default';
  const channelMap = {
    chat_message: 'chat',
    task_reminder: 'tasks',
    task_due_today: 'tasks',
    budget_warning: 'budget',
    budget_exceeded: 'budget',
    savings_milestone: 'savings',
    savings_completed: 'savings',
    expense_added: 'expenses',
  };
  const channelId = channelMap[type] ?? 'default';

  // Ensure channel exists
  await notifee.createChannel({
    id: channelId,
    name: channelId.charAt(0).toUpperCase() + channelId.slice(1),
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  await notifee.displayNotification({
    title: remoteMessage.notification.title ?? 'LifeTrack',
    body: remoteMessage.notification.body ?? '',
    data: remoteMessage.data,
    android: {
      channelId,
      smallIcon: 'ic_notification',
      pressAction: { id: 'default' },
    },
    ios: { sound: 'default' },
  });
});

// ─── Notifee Background Event Handler ─────────────────────────────────────────
// Handles notification press events when app is in background/killed

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    const notifData = detail.notification?.data;
    if (!notifData || !notifData.type) return;

    // Navigation handled when app resumes via getInitialNotification
    // Store the pending navigation intent
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('pending_notification', JSON.stringify(notifData));
  }
});

// ─── Disable yellow box warnings ──────────────────────────────────────────────

if (__DEV__) {
  const ignoreWarns = [
    'ViewPropTypes will be removed',
    'ColorPropType will be removed',
  ];
  const warn = console.warn;
  console.warn = (...arg) => {
    for (const warning of ignoreWarns) {
      if (arg[0]?.startsWith(warning)) return;
    }
    warn(...arg);
  };
}

AppRegistry.registerComponent(appName, () => App);
