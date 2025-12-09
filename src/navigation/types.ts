import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
};

// Bottom Tab
export type BottomTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Bazar: undefined;
  Profile: undefined;
};

// Drawer
export type DrawerParamList = {
  HomeTabs: undefined;
  Budget: undefined;
  Savings: undefined;
  Tasks: undefined;
  Notes: undefined;
  Chat: undefined;
  Settings: undefined;
};

// Modal Stack
export type ModalStackParamList = {
  AddExpense: { expenseId?: string; mode: 'create' | 'edit' };
  AddCategory: { categoryId?: string; mode: 'create' | 'edit' };
  AddTask: { taskId?: string; mode: 'create' | 'edit' };
  AddNote: { noteId?: string; mode: 'create' | 'edit' };
  AddBazar: { bazarId?: string; mode: 'create' | 'edit' };
  AddSavingsGoal: { goalId?: string; mode: 'create' | 'edit' };
  FilterExpenses: undefined;
  GlobalSearch: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
} & ModalStackParamList;

// Screen Props
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

export type BottomTabScreenPropsType<
  T extends keyof BottomTabParamList
> = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, T>,
  DrawerScreenProps<DrawerParamList>
>;

export type DrawerScreenPropsType<
  T extends keyof DrawerParamList
> = DrawerScreenProps<DrawerParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
