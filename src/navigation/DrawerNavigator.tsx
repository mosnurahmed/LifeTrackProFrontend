import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerParamList } from './types';
import { useTheme } from '../hooks/useTheme';
import CustomDrawer from './CustomDrawer';
import BottomTabNavigator from './BottomTabNavigator';
// import BudgetScreen from '../features/budget/screens/BudgetScreen';
// import SavingsScreen from '../features/savings/screens/SavingsScreen';
// import TasksScreen from '../features/tasks/screens/TasksScreen';
// import NotesScreen from '../features/notes/screens/NotesScreen';
// import ChatScreen from '../features/chat/screens/ChatScreen';
// import SettingsScreen from '../features/profile/screens/SettingsScreen';
import BudgetScreen from '../features/budget/screens/BudgetScreen';
import SavingsScreen from '../features/savings/screens/SavingsGoalsScreen';
import TasksScreen from '../features/tasks/screens/TasksScreen';
import NotesScreen from '../features/notes/screens/NotesScreen';
import ChatScreen from '../features/chat/screens/ChatScreen';
import SettingsScreen from '../features/profile/screens/SettingsScreen';
import CategoriesScreen from '../features/categories/screens/CategoriesScreen';

import BazarScreen from '../features/bazar/screens/BazarScreen';
import ExpensesScreen from '../features/expenses/screens/ExpensesScreen';

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: 280,
          backgroundColor: colors.background,
        },
      }}
    >
      <Drawer.Screen
        name="HomeTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          drawerLabel: 'Expenses',
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          drawerLabel: 'Categories',
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Bazar"
        component={BazarScreen}
        options={{
          drawerLabel: 'Bazar Lists',
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Savings"
        component={SavingsScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Notes"
        component={NotesScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
