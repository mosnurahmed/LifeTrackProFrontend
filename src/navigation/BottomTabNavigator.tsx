import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomTabParamList } from './types';
import { useTheme } from '../hooks/useTheme';

import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import ExpensesScreen from '../features/expenses/screens/ExpensesScreen';
import BazarScreen from '../features/bazar/screens/BazarScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import { IncomeScreen } from '../features/income/screens';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator: React.FC = () => {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Expenses':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Income':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'Bazar':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          // ✅ Perfect height calculation
          height: Platform.select({
            ios: 84,
            android: 64 + insets.bottom, // Add bottom inset for Android
          }),
          paddingBottom: Platform.select({
            ios: insets.bottom,
            android: Math.max(insets.bottom, spacing.sm), // Minimum spacing or inset
          }),
          paddingTop: spacing.sm,
          position: 'absolute', // ✅ Make it float above content
          elevation: 8, // ✅ Add shadow on Android
          shadowColor: '#000', // ✅ Add shadow on iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ tabBarLabel: 'Expenses' }}
      />
      <Tab.Screen
        name="Income"
        component={IncomeScreen}
        options={{ tabBarLabel: 'Income' }}
      />
      <Tab.Screen
        name="Bazar"
        component={BazarScreen}
        options={{ tabBarLabel: 'Bazar' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
