import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import AddExpenseModal from '../features/expenses/screens/AddExpenseModal';
import AddCategoryModal from '../features/categories/screens/AddCategoryModal';
import ExpenseDetailsScreen from '../features/expenses/screens/ExpenseDetailsScreen';
import AddBazarListModal from '../features/bazar/screens/AddBazarListModal';
import BazarListDetailsScreen from '../features/bazar/screens/BazarListDetailsScreen';
import AddBazarItemModal from '../features/bazar/screens/AddBazarItemModal';
import BazarStatsScreen from '../features/bazar/screens/BazarStatsScreen';
import ExpenseStatsScreen from '../features/expenses/screens/ExpenseStatsScreen';
import SavingsGoalsStatsScreen from '../features/savings/screens/SavingsGoalsStatsScreen';
import {
  AddSavingsGoalModal,
  SavingsGoalDetailsScreen,
} from '../features/savings/screens';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  // const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={DrawerNavigator}
              options={{ headerShown: false }}
            />

            {/* Modal Screens */}
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen
                name="AddExpense"
                component={AddExpenseModal}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddCategory"
                component={AddCategoryModal}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ExpenseDetails"
                component={ExpenseDetailsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddBazarList"
                component={AddBazarListModal}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="BazarListDetails"
                component={BazarListDetailsScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="AddBazarItem"
                component={AddBazarItemModal}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="BazarStats"
                component={BazarStatsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ExpenseStats"
                component={ExpenseStatsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddSavingsGoal"
                component={AddSavingsGoalModal}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="SavingsGoalDetails"
                component={SavingsGoalDetailsScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="SavingsGoalsStats"
                component={SavingsGoalsStatsScreen}
                options={{ headerShown: false }}
              />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
