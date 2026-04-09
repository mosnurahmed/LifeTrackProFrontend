/* eslint-disable react-native/no-inline-styles */
/**
 * Guide Modal — Professional step-by-step feature guide
 * Shows tooltips/walkthrough for each screen's features.
 *
 * Usage:
 *   const { GuideButton, GuideView } = useGuide('expenses');
 *   // Put <GuideButton /> in header, <GuideView /> at root
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Animated, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

const { width: SW } = Dimensions.get('window');

// ─── Guide Step Type ─────────────────────────────────────────────────────────

export interface GuideStep {
  icon: string;
  title: string;
  description: string;
  color?: string;
}

// ─── Guide Content for all screens ───────────────────────────────────────────

export const GUIDES: Record<string, { title: string; subtitle: string; steps: GuideStep[] }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Your financial overview at a glance',
    steps: [
      { icon: 'grid-outline', title: 'Quick Actions', description: 'Tap any icon to quickly navigate to features like adding expenses, income, budgets, and more.', color: '#10B981' },
      { icon: 'stats-chart-outline', title: 'Monthly Summary', description: 'See your total expenses, income, and net balance for the current month. Tap any card to see details.', color: '#3B82F6' },
      { icon: 'pie-chart-outline', title: 'Budget Overview', description: 'Track how much of your monthly budget you\'ve spent. The progress bar shows your spending percentage.', color: '#F59E0B' },
      { icon: 'checkmark-circle-outline', title: 'Task Summary', description: 'View pending, completed, and overdue tasks at a glance. Tap to go to your task list.', color: '#8B5CF6' },
      { icon: 'trending-up-outline', title: 'Top Spending', description: 'Your highest spending categories this month with percentage breakdown.', color: '#EF4444' },
      { icon: 'time-outline', title: 'Recent Activity', description: 'Last 5 transactions for a quick review. Tap any item to see full details.', color: '#06B6D4' },
    ],
  },

  expenses: {
    title: 'Expenses',
    subtitle: 'Track and manage your spending',
    steps: [
      { icon: 'add-circle-outline', title: 'Add Expense', description: 'Tap the + button to record a new expense. Enter amount, select category, add notes and date.', color: '#10B981' },
      { icon: 'funnel-outline', title: 'Filter & Search', description: 'Use filter chips to view expenses by time period — Today, This Week, This Month, or All.', color: '#3B82F6' },
      { icon: 'swap-vertical-outline', title: 'Expense List', description: 'Each card shows the category, amount, date, and notes. Tap to see full details. Long press to delete.', color: '#8B5CF6' },
      { icon: 'stats-chart-outline', title: 'Statistics', description: 'Tap the chart icon in the header to see spending analytics — charts, category breakdown, and trends.', color: '#F59E0B' },
      { icon: 'repeat-outline', title: 'Recurring Expenses', description: 'Recurring expenses auto-create every day/week/month/year. You\'ll get a phone notification when auto-recorded. View them in the list like regular expenses.', color: '#EF4444' },
    ],
  },

  income: {
    title: 'Income',
    subtitle: 'Track all your earnings',
    steps: [
      { icon: 'add-circle-outline', title: 'Add Income', description: 'Tap + to record income. Enter amount, select source category, add date and notes.', color: '#10B981' },
      { icon: 'wallet-outline', title: 'Income Sources', description: 'View income grouped by source — Salary, Business, Freelance, Investment, and more.', color: '#3B82F6' },
      { icon: 'stats-chart-outline', title: 'Statistics', description: 'Tap the chart icon to see income analytics, source distribution, and monthly trends.', color: '#F59E0B' },
      { icon: 'repeat-outline', title: 'Recurring Income', description: 'Set recurring income (like monthly salary) to auto-record every month. You\'ll get a notification when auto-recorded. No need to manually add each time.', color: '#8B5CF6' },
    ],
  },

  budget: {
    title: 'Budget',
    subtitle: 'Set limits and control spending',
    steps: [
      { icon: 'calculator-outline', title: 'Total Monthly Budget', description: 'Set your overall monthly budget from the top card. This is your total spending limit for the month.', color: '#10B981' },
      { icon: 'layers-outline', title: 'Category Budgets', description: 'Set individual budgets for each expense category. Tap any category row to set or edit its budget.', color: '#3B82F6' },
      { icon: 'alert-circle-outline', title: 'Budget Alerts', description: 'Categories turn yellow at 80% and red at 100% of budget. You\'ll get push notifications when approaching limits.', color: '#F59E0B' },
      { icon: 'calendar-outline', title: 'Month Navigation', description: 'Use the arrows at the top to view budget status for previous or future months.', color: '#8B5CF6' },
      { icon: 'bar-chart-outline', title: 'Progress Tracking', description: 'Each category shows a progress bar — green (safe), yellow (warning), red (exceeded).', color: '#EF4444' },
    ],
  },

  savings: {
    title: 'Savings Goals',
    subtitle: 'Save towards your goals',
    steps: [
      { icon: 'add-circle-outline', title: 'Create Goal', description: 'Tap + to create a savings goal. Set a target amount, deadline, icon, and color.', color: '#10B981' },
      { icon: 'trending-up-outline', title: 'Track Progress', description: 'Each goal card shows current savings, target amount, and progress percentage with a visual bar.', color: '#3B82F6' },
      { icon: 'cash-outline', title: 'Add Contribution', description: 'Open a goal and tap "Add Contribution" to record money saved towards that goal.', color: '#F59E0B' },
      { icon: 'trophy-outline', title: 'Milestones', description: 'Get notified when you reach 50%, 75%, and 100% of your savings target.', color: '#8B5CF6' },
      { icon: 'stats-chart-outline', title: 'Statistics', description: 'Tap the chart icon to see overall savings analytics and goal completion rates.', color: '#06B6D4' },
    ],
  },

  tasks: {
    title: 'Tasks',
    subtitle: 'Organize your to-dos',
    steps: [
      { icon: 'add-circle-outline', title: 'Create Task', description: 'Tap + to add a task. Set title, description, priority (low/medium/high), due date, and subtasks.', color: '#10B981' },
      { icon: 'checkmark-circle-outline', title: 'Quick Toggle', description: 'Tap the checkbox to instantly mark a task as complete or incomplete. Changes sync immediately.', color: '#3B82F6' },
      { icon: 'funnel-outline', title: 'Filter Tasks', description: 'Filter by status — All, To Do, In Progress, Completed, or Overdue using the chips at the top.', color: '#F59E0B' },
      { icon: 'list-outline', title: 'Subtasks', description: 'Open a task to see and manage subtasks. Check them off as you complete each step.', color: '#8B5CF6' },
      { icon: 'play-outline', title: 'Task Actions', description: 'In task details, use action buttons to Start, Complete, Reopen, or Cancel a task.', color: '#EF4444' },
    ],
  },

  bazar: {
    title: 'Shopping Lists',
    subtitle: 'Plan and track your shopping',
    steps: [
      { icon: 'add-circle-outline', title: 'Create List', description: 'Tap + to create a shopping list. Set a name, optional budget, and start adding items.', color: '#10B981' },
      { icon: 'cart-outline', title: 'Add Items', description: 'Add items with name, quantity, unit (kg, pcs, etc.), and price. The total updates automatically.', color: '#3B82F6' },
      { icon: 'checkmark-circle-outline', title: 'Mark Purchased', description: 'Tap the checkbox when you buy an item. This automatically creates an expense record for tracking.', color: '#F59E0B' },
      { icon: 'cash-outline', title: 'Budget Tracking', description: 'If you set a budget, the progress bar shows how much you\'ve spent vs your limit.', color: '#8B5CF6' },
      { icon: 'stats-chart-outline', title: 'Statistics', description: 'View shopping analytics — most purchased items, spending trends, and category breakdown.', color: '#06B6D4' },
    ],
  },

  notes: {
    title: 'Notes',
    subtitle: 'Capture ideas and thoughts',
    steps: [
      { icon: 'add-circle-outline', title: 'Create Note', description: 'Tap + to write a new note. Add a title, content, tags, and choose a color.', color: '#10B981' },
      { icon: 'pricetag-outline', title: 'Tags', description: 'Add tags to organize notes. Tap the tag icon in the editor toolbar to add or remove tags.', color: '#3B82F6' },
      { icon: 'color-palette-outline', title: 'Color Coding', description: 'Assign colors to notes for visual organization. Tap the palette icon in the toolbar.', color: '#F59E0B' },
      { icon: 'search-outline', title: 'Search', description: 'Use the search bar to find notes by title, content, or tags.', color: '#8B5CF6' },
      { icon: 'pin-outline', title: 'Pin Notes', description: 'Pin important notes to keep them at the top of your list.', color: '#EF4444' },
    ],
  },

  chat: {
    title: 'Chat',
    subtitle: 'Message other users',
    steps: [
      { icon: 'person-add-outline', title: 'Start Conversation', description: 'Tap the + button and enter a user\'s email to start a new conversation.', color: '#10B981' },
      { icon: 'chatbubbles-outline', title: 'Messaging', description: 'Send text messages in real-time. Messages auto-refresh every few seconds.', color: '#3B82F6' },
      { icon: 'ellipse', title: 'Online Status', description: 'Green dot means the user is online. Grey means offline. Status updates automatically.', color: '#F59E0B' },
      { icon: 'trash-outline', title: 'Delete Messages', description: 'Long press any message to delete it from the conversation.', color: '#EF4444' },
    ],
  },

  categories: {
    title: 'Categories',
    subtitle: 'Organize your transactions',
    steps: [
      { icon: 'add-circle-outline', title: 'Add Category', description: 'Tap + to create a new category. Choose a name, icon, color, and type (expense or income).', color: '#10B981' },
      { icon: 'swap-horizontal-outline', title: 'Switch Type', description: 'Use the tabs at top to switch between Expense and Income categories.', color: '#3B82F6' },
      { icon: 'create-outline', title: 'Edit Category', description: 'Tap any category to edit its name, icon, color, or default budget.', color: '#F59E0B' },
      { icon: 'trash-outline', title: 'Delete Category', description: 'Long press a category to delete it. Categories with existing transactions cannot be deleted.', color: '#EF4444' },
    ],
  },

  notifications: {
    title: 'Notifications',
    subtitle: 'Stay updated on your activity',
    steps: [
      { icon: 'notifications-outline', title: 'Activity Alerts', description: 'Get notified about budget warnings, task reminders, savings milestones, and more.', color: '#10B981' },
      { icon: 'checkmark-done-outline', title: 'Mark as Read', description: 'Tap a notification to mark it as read. Use the checkmark icon to mark all as read.', color: '#3B82F6' },
      { icon: 'trash-outline', title: 'Clear Notifications', description: 'Long press to delete individual notifications, or use the trash icon to clear all.', color: '#EF4444' },
    ],
  },

  profile: {
    title: 'Profile',
    subtitle: 'Manage your account',
    steps: [
      { icon: 'create-outline', title: 'Edit Profile', description: 'Tap Edit to update your name and phone number. Email cannot be changed.', color: '#10B981' },
      { icon: 'moon-outline', title: 'Dark Mode', description: 'Toggle dark mode for a comfortable viewing experience in low light.', color: '#8B5CF6' },
      { icon: 'key-outline', title: 'Change Password', description: 'Update your password from the General section. You\'ll need your current password.', color: '#F59E0B' },
      { icon: 'log-out-outline', title: 'Logout', description: 'Sign out of your account. Your data stays safe and synced.', color: '#EF4444' },
    ],
  },

  // ── Sub-screens ────────────────────────────────────────────────────────────

  addExpense: {
    title: 'Add Expense',
    subtitle: 'Record a new expense',
    steps: [
      { icon: 'cash-outline', title: 'Amount', description: 'Enter the expense amount at the top. This is the total you spent.', color: '#EF4444' },
      { icon: 'layers-outline', title: 'Category', description: 'Select a category to organize your expense. You can also create new categories.', color: '#3B82F6' },
      { icon: 'calendar-outline', title: 'Date', description: 'Pick the date of the expense. Defaults to today. Recurring expenses will auto-create on this day every month.', color: '#F59E0B' },
      { icon: 'document-text-outline', title: 'Notes', description: 'Add optional notes to remember what the expense was for.', color: '#8B5CF6' },
      { icon: 'repeat-outline', title: 'Make Recurring', description: 'Tap "Make Recurring" to auto-repeat this expense. Choose how often — Daily, Weekly, Monthly, or Yearly. A new expense will be created automatically on the same day. Set an optional end date to stop after a certain time. Example: House Rent ৳15,000 Monthly — every month on the same date, a new expense entry is auto-recorded and you\'ll get a notification.', color: '#10B981' },
      { icon: 'image-outline', title: 'Receipt', description: 'Attach a photo of your receipt for reference.', color: '#06B6D4' },
    ],
  },

  expenseDetails: {
    title: 'Expense Details',
    subtitle: 'View and manage expense',
    steps: [
      { icon: 'cash-outline', title: 'Amount & Category', description: 'The top section shows the expense amount with its category icon and color.', color: '#EF4444' },
      { icon: 'information-circle-outline', title: 'Details', description: 'See full details — date, category, notes, and any attached receipt.', color: '#3B82F6' },
      { icon: 'create-outline', title: 'Edit', description: 'Tap the edit button to modify the expense amount, category, date, or notes.', color: '#10B981' },
      { icon: 'trash-outline', title: 'Delete', description: 'Tap delete at the bottom to permanently remove this expense.', color: '#EF4444' },
    ],
  },

  expenseStats: {
    title: 'Expense Statistics',
    subtitle: 'Analyze your spending',
    steps: [
      { icon: 'pie-chart-outline', title: 'Overview', description: 'See total spending, average per transaction, and comparison with previous month.', color: '#3B82F6' },
      { icon: 'bar-chart-outline', title: 'Chart', description: 'Visual chart showing spending distribution across categories.', color: '#8B5CF6' },
      { icon: 'layers-outline', title: 'Category Breakdown', description: 'Detailed list of how much you spent in each category with percentages.', color: '#F59E0B' },
      { icon: 'trending-up-outline', title: 'Trends', description: 'Daily spending pattern to identify your peak spending days.', color: '#10B981' },
    ],
  },

  addIncome: {
    title: 'Add Income',
    subtitle: 'Record a new income',
    steps: [
      { icon: 'cash-outline', title: 'Amount', description: 'Enter the income amount. This adds to your total earnings.', color: '#10B981' },
      { icon: 'layers-outline', title: 'Source', description: 'Select income source — Salary, Business, Freelance, Investment, etc.', color: '#3B82F6' },
      { icon: 'calendar-outline', title: 'Date', description: 'Pick the date you received the income. Recurring incomes will auto-create on this day.', color: '#F59E0B' },
      { icon: 'document-text-outline', title: 'Notes', description: 'Add notes like invoice number or payment details.', color: '#8B5CF6' },
      { icon: 'repeat-outline', title: 'Make Recurring', description: 'Tap "Make Recurring" to auto-repeat this income. Choose frequency — Daily, Weekly, Monthly, or Yearly. A new income entry is auto-recorded on the same day and you\'ll get a phone notification. Example: Salary ৳25,000 Monthly — every month auto-recorded. Set end date to stop after a certain period.', color: '#10B981' },
    ],
  },

  incomeDetails: {
    title: 'Income Details',
    subtitle: 'View and manage income',
    steps: [
      { icon: 'cash-outline', title: 'Amount & Source', description: 'See the income amount with its source category at the top.', color: '#10B981' },
      { icon: 'create-outline', title: 'Edit', description: 'Modify the income amount, source, date, or notes.', color: '#3B82F6' },
      { icon: 'trash-outline', title: 'Delete', description: 'Remove this income record permanently.', color: '#EF4444' },
    ],
  },

  incomeStats: {
    title: 'Income Statistics',
    subtitle: 'Analyze your earnings',
    steps: [
      { icon: 'pie-chart-outline', title: 'Overview', description: 'Total income, average per entry, and month-over-month comparison.', color: '#10B981' },
      { icon: 'bar-chart-outline', title: 'Source Distribution', description: 'See which income sources contribute the most to your earnings.', color: '#3B82F6' },
      { icon: 'trending-up-outline', title: 'Trends', description: 'Daily income pattern and trends over the month.', color: '#F59E0B' },
    ],
  },

  addSavingsGoal: {
    title: 'Add Savings Goal',
    subtitle: 'Create a new savings target',
    steps: [
      { icon: 'flag-outline', title: 'Goal Name', description: 'Give your goal a clear name like "Emergency Fund" or "Vacation Trip".', color: '#10B981' },
      { icon: 'cash-outline', title: 'Target Amount', description: 'Set how much money you want to save for this goal.', color: '#3B82F6' },
      { icon: 'calendar-outline', title: 'Target Date', description: 'Set a deadline to stay motivated and track progress.', color: '#F59E0B' },
      { icon: 'color-palette-outline', title: 'Icon & Color', description: 'Choose an icon and color to personalize your goal card.', color: '#8B5CF6' },
    ],
  },

  savingsGoalDetails: {
    title: 'Goal Details',
    subtitle: 'Track your savings progress',
    steps: [
      { icon: 'trending-up-outline', title: 'Progress', description: 'See how much you\'ve saved, remaining amount, and progress percentage.', color: '#10B981' },
      { icon: 'add-circle-outline', title: 'Add Contribution', description: 'Tap the button at the bottom to add money towards this goal.', color: '#3B82F6' },
      { icon: 'time-outline', title: 'History', description: 'View all contributions with dates and amounts.', color: '#F59E0B' },
      { icon: 'create-outline', title: 'Edit Goal', description: 'Modify the goal name, target amount, or deadline.', color: '#8B5CF6' },
      { icon: 'trash-outline', title: 'Delete Goal', description: 'Remove this goal. Contributions will be kept in your savings account.', color: '#EF4444' },
    ],
  },

  savingsStats: {
    title: 'Savings Statistics',
    subtitle: 'Overview of all savings',
    steps: [
      { icon: 'wallet-outline', title: 'Total Saved', description: 'Your total savings across all goals combined.', color: '#10B981' },
      { icon: 'pie-chart-outline', title: 'Goal Distribution', description: 'Visual breakdown of how savings are distributed across goals.', color: '#3B82F6' },
      { icon: 'flag-outline', title: 'Goal Progress', description: 'See completion percentage for each active goal.', color: '#F59E0B' },
    ],
  },

  addTask: {
    title: 'Add Task',
    subtitle: 'Create a new task',
    steps: [
      { icon: 'create-outline', title: 'Title & Description', description: 'Enter a clear task title and optional description with details.', color: '#10B981' },
      { icon: 'flag-outline', title: 'Priority', description: 'Set priority — Low, Medium, or High. High priority tasks appear first.', color: '#EF4444' },
      { icon: 'calendar-outline', title: 'Due Date & Reminder', description: 'Set a due date and optional reminder to get notified before the deadline.', color: '#F59E0B' },
      { icon: 'list-outline', title: 'Subtasks', description: 'Break down the task into smaller steps. Check them off as you complete.', color: '#3B82F6' },
      { icon: 'pricetag-outline', title: 'Tags', description: 'Add tags to organize and filter tasks by project, context, or type.', color: '#8B5CF6' },
    ],
  },

  taskDetails: {
    title: 'Task Details',
    subtitle: 'Manage your task',
    steps: [
      { icon: 'checkmark-circle-outline', title: 'Status', description: 'See current status and use action buttons to Start, Complete, or Cancel the task.', color: '#10B981' },
      { icon: 'list-outline', title: 'Subtasks', description: 'Check off subtasks as you complete each step. Progress updates automatically.', color: '#3B82F6' },
      { icon: 'play-outline', title: 'Actions', description: 'Start → In Progress, Complete → Done, Reopen → Back to Todo, Cancel → Cancelled.', color: '#F59E0B' },
      { icon: 'create-outline', title: 'Edit', description: 'Modify title, description, priority, due date, or subtasks.', color: '#8B5CF6' },
      { icon: 'trash-outline', title: 'Delete', description: 'Permanently delete this task from the bottom of the screen.', color: '#EF4444' },
    ],
  },

  taskStats: {
    title: 'Task Statistics',
    subtitle: 'Productivity overview',
    steps: [
      { icon: 'pie-chart-outline', title: 'Status Distribution', description: 'See how many tasks are in each status — Todo, In Progress, Completed, Cancelled.', color: '#3B82F6' },
      { icon: 'trending-up-outline', title: 'Completion Rate', description: 'Your overall task completion percentage and trends.', color: '#10B981' },
      { icon: 'alert-circle-outline', title: 'Overdue Tasks', description: 'Number of tasks past their due date that need attention.', color: '#EF4444' },
    ],
  },

  bazarListDetails: {
    title: 'Shopping List',
    subtitle: 'Manage list items',
    steps: [
      { icon: 'checkmark-circle-outline', title: 'Mark Purchased', description: 'Tap the checkbox when you buy an item. This auto-creates an expense entry.', color: '#10B981' },
      { icon: 'add-circle-outline', title: 'Add Items', description: 'Tap the + button to add items with name, quantity, unit, and price.', color: '#3B82F6' },
      { icon: 'cash-outline', title: 'Budget & Spent', description: 'Track total spent vs budget at the top. Progress bar shows spending.', color: '#F59E0B' },
      { icon: 'create-outline', title: 'Edit Items', description: 'Tap any item to edit its details — name, price, quantity.', color: '#8B5CF6' },
      { icon: 'trash-outline', title: 'Delete Items', description: 'Long press an item to delete it from the list.', color: '#EF4444' },
    ],
  },

  addBazarItem: {
    title: 'Add Item',
    subtitle: 'Add item to shopping list',
    steps: [
      { icon: 'text-outline', title: 'Item Name', description: 'Enter the name of the item you want to buy.', color: '#10B981' },
      { icon: 'resize-outline', title: 'Quantity & Unit', description: 'Set quantity and unit — pcs, kg, g, liter, ml, dozen, etc.', color: '#3B82F6' },
      { icon: 'cash-outline', title: 'Price', description: 'Enter the total price for this item. This is used for expense tracking when purchased.', color: '#F59E0B' },
      { icon: 'layers-outline', title: 'Category', description: 'Optionally categorize the item for better organization.', color: '#8B5CF6' },
    ],
  },

  addBazarList: {
    title: 'Create Shopping List',
    subtitle: 'Start a new shopping list',
    steps: [
      { icon: 'text-outline', title: 'List Name', description: 'Give your list a name like "Weekly Groceries" or "Home Supplies".', color: '#10B981' },
      { icon: 'cash-outline', title: 'Budget', description: 'Set an optional budget to limit spending on this shopping trip.', color: '#F59E0B' },
    ],
  },

  bazarStats: {
    title: 'Shopping Statistics',
    subtitle: 'Shopping insights',
    steps: [
      { icon: 'pie-chart-outline', title: 'Spending Overview', description: 'Total spent across all shopping lists with budget comparison.', color: '#3B82F6' },
      { icon: 'cart-outline', title: 'Most Purchased', description: 'Items you buy most frequently across all lists.', color: '#10B981' },
      { icon: 'layers-outline', title: 'Category Breakdown', description: 'How your shopping spending is distributed across categories.', color: '#F59E0B' },
    ],
  },

  noteEditor: {
    title: 'Note Editor',
    subtitle: 'Write and edit notes',
    steps: [
      { icon: 'text-outline', title: 'Title', description: 'Add a title at the top. Keep it short and descriptive.', color: '#10B981' },
      { icon: 'document-text-outline', title: 'Content', description: 'Write your note content in the main area. It auto-saves when you go back.', color: '#3B82F6' },
      { icon: 'pricetag-outline', title: 'Tags', description: 'Tap the tag icon in the toolbar to add searchable tags to your note.', color: '#F59E0B' },
      { icon: 'color-palette-outline', title: 'Color', description: 'Tap the palette icon to change the note\'s background color for visual organization.', color: '#8B5CF6' },
      { icon: 'pin-outline', title: 'Pin', description: 'Tap the pin icon to keep this note at the top of your notes list.', color: '#EF4444' },
    ],
  },

  chatScreen: {
    title: 'Chat',
    subtitle: 'Message conversation',
    steps: [
      { icon: 'chatbubble-outline', title: 'Send Message', description: 'Type your message at the bottom and tap send. Messages appear instantly.', color: '#10B981' },
      { icon: 'ellipse', title: 'Online Status', description: 'The header shows if the other person is online (green) or when they were last seen.', color: '#3B82F6' },
      { icon: 'trash-outline', title: 'Delete Message', description: 'Long press any of your messages to delete it.', color: '#EF4444' },
    ],
  },

  addCategory: {
    title: 'Add Category',
    subtitle: 'Create a new category',
    steps: [
      { icon: 'text-outline', title: 'Name', description: 'Enter a category name like "Food", "Transport", or "Salary".', color: '#10B981' },
      { icon: 'apps-outline', title: 'Icon', description: 'Choose an icon that represents this category from the icon picker.', color: '#3B82F6' },
      { icon: 'color-palette-outline', title: 'Color', description: 'Pick a color for the category. Used in charts and list items.', color: '#F59E0B' },
      { icon: 'swap-horizontal-outline', title: 'Type', description: 'Select Expense or Income to specify where this category appears.', color: '#8B5CF6' },
    ],
  },

  editProfile: {
    title: 'Edit Profile',
    subtitle: 'Update your information',
    steps: [
      { icon: 'person-outline', title: 'Name', description: 'Update your display name. This appears across the app and in chats.', color: '#10B981' },
      { icon: 'mail-outline', title: 'Email', description: 'Your email address cannot be changed. It\'s used for login and verification.', color: '#3B82F6' },
      { icon: 'call-outline', title: 'Phone', description: 'Add or update your phone number for account recovery.', color: '#F59E0B' },
    ],
  },

  changePassword: {
    title: 'Change Password',
    subtitle: 'Update your password',
    steps: [
      { icon: 'lock-closed-outline', title: 'Current Password', description: 'Enter your current password to verify your identity.', color: '#F59E0B' },
      { icon: 'key-outline', title: 'New Password', description: 'Enter your new password. Must be at least 6 characters.', color: '#10B981' },
      { icon: 'checkmark-circle-outline', title: 'Confirm', description: 'Re-enter the new password to make sure it matches. Green checkmark means they match.', color: '#3B82F6' },
    ],
  },

  transfers: {
    title: 'Fund Transfers',
    subtitle: 'Move money between payment methods',
    steps: [
      { icon: 'swap-horizontal-outline', title: 'Transfer Funds', description: 'Move money between Cash, Card, Mobile Banking, or Bank. This is NOT an expense — just moving your own money from one place to another.', color: '#10B981' },
      { icon: 'wallet-outline', title: 'Wallet Balances', description: 'See how much money you have in each payment method. Balance = Income received - Expenses spent + Transfers in - Transfers out.', color: '#3B82F6' },
      { icon: 'cash-outline', title: 'Example', description: 'You withdrew ৳5,000 from Card to Cash? Create a transfer: Card → Cash ৳5,000. Your total savings stays the same, but Cash goes up and Card goes down.', color: '#F59E0B' },
      { icon: 'trash-outline', title: 'Delete', description: 'Long press any transfer to delete it. The balances will auto-update.', color: '#EF4444' },
    ],
  },

  loans: {
    title: 'Loans',
    subtitle: 'Track money lent and borrowed',
    steps: [
      { icon: 'arrow-up-circle-outline', title: 'Money Given', description: 'Track money you\'ve lent to others. Green cards show given loans with remaining balance.', color: '#10B981' },
      { icon: 'arrow-down-circle-outline', title: 'Money Taken', description: 'Track money you\'ve borrowed. Red cards show taken loans with remaining debt.', color: '#EF4444' },
      { icon: 'funnel-outline', title: 'Filter', description: 'Use filter chips to view All, Given, Taken, or Settled loans.', color: '#3B82F6' },
      { icon: 'cash-outline', title: 'Payments', description: 'Record partial payments as they happen. Progress bar shows how much is paid.', color: '#F59E0B' },
      { icon: 'notifications-outline', title: 'Reminders', description: 'Set deadlines to get notified when payment is due.', color: '#8B5CF6' },
    ],
  },

  addLoan: {
    title: 'Add Loan',
    subtitle: 'Record a new loan',
    steps: [
      { icon: 'swap-vertical-outline', title: 'Type', description: 'Select "I Gave" if you lent money, or "I Took" if you borrowed.', color: '#10B981' },
      { icon: 'person-outline', title: 'Person', description: 'Enter the name and optional phone number of the person.', color: '#3B82F6' },
      { icon: 'cash-outline', title: 'Amount', description: 'Enter the total loan amount.', color: '#F59E0B' },
      { icon: 'calendar-outline', title: 'Deadline', description: 'Set an optional deadline for repayment. You\'ll get reminders.', color: '#EF4444' },
    ],
  },

  loanDetails: {
    title: 'Loan Details',
    subtitle: 'Manage loan and payments',
    steps: [
      { icon: 'bar-chart-outline', title: 'Progress', description: 'See how much has been paid and remaining balance with progress bar.', color: '#10B981' },
      { icon: 'add-circle-outline', title: 'Add Payment', description: 'Record partial or full payments as they happen.', color: '#3B82F6' },
      { icon: 'checkmark-circle-outline', title: 'Mark Settled', description: 'Mark the loan as fully settled when all money is returned.', color: '#F59E0B' },
      { icon: 'time-outline', title: 'Payment History', description: 'View all recorded payments with dates and amounts.', color: '#8B5CF6' },
    ],
  },

  investments: {
    title: 'Investments',
    subtitle: 'Track your deposits and investments',
    steps: [
      { icon: 'add-circle-outline', title: 'Add Investment', description: 'Create FD, DPS, SIP, Sanchayapatra, Bond, Insurance or custom investment plans.', color: '#10B981' },
      { icon: 'trending-up-outline', title: 'Track Growth', description: 'See total deposited, expected maturity amount, and interest earned.', color: '#3B82F6' },
      { icon: 'cash-outline', title: 'Contributions', description: 'For recurring plans (DPS/SIP), add monthly contributions. Each creates an expense record.', color: '#F59E0B' },
      { icon: 'flag-outline', title: 'Maturity', description: 'Close investments when they mature. Track your total returns.', color: '#8B5CF6' },
    ],
  },

  addInvestment: {
    title: 'Add Investment',
    subtitle: 'Create a new investment plan',
    steps: [
      { icon: 'apps-outline', title: 'Type', description: 'Select the type — FD (one-time deposit), DPS (monthly deposit), SIP (monthly investment), Sanchayapatra, Bond, Insurance, or Custom.', color: '#10B981' },
      { icon: 'cash-outline', title: 'Amount', description: 'For FD/Bond/Sanchayapatra: total deposit amount (one-time). For DPS/SIP/Insurance: monthly installment amount that you pay every month.', color: '#3B82F6' },
      { icon: 'calculator-outline', title: 'Interest & Tenure', description: 'Annual interest rate (%) and tenure in months. Maturity amount auto-calculates showing how much you\'ll get at the end including interest. Example: ৳5,000/month × 60 months at 10% = maturity ৳3,87,500.', color: '#F59E0B' },
      { icon: 'calendar-outline', title: 'Schedule & Recurring', description: 'Set start date and monthly payment day (1-28) for DPS/SIP. You\'ll get a phone reminder notification on that day each month to add your contribution. Each contribution auto-creates an expense entry.', color: '#8B5CF6' },
      { icon: 'time-outline', title: 'Already Paid', description: 'If you started this investment before using the app, enter how many installments you\'ve already paid. This adjusts your total deposited and progress correctly without creating expense entries for past payments.', color: '#06B6D4' },
    ],
  },

  investmentDetails: {
    title: 'Investment Details',
    subtitle: 'Manage your investment',
    steps: [
      { icon: 'bar-chart-outline', title: 'Progress', description: 'See total deposited vs maturity amount with visual progress bar.', color: '#10B981' },
      { icon: 'add-circle-outline', title: 'Add Contribution', description: 'Record monthly installments. Each contribution auto-creates an expense entry.', color: '#3B82F6' },
      { icon: 'checkmark-circle-outline', title: 'Close', description: 'Mark as matured when the tenure is complete.', color: '#F59E0B' },
      { icon: 'time-outline', title: 'History', description: 'View all contributions with dates and linked expense records.', color: '#8B5CF6' },
    ],
  },
};

// ─── Guide Step Card ─────────────────────────────────────────────────────────

const StepCard = ({ step, index, total, isDark }: {
  step: GuideStep; index: number; total: number; isDark: boolean;
}) => {
  const color = step.color || '#10B981';
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';

  return (
    <View style={[styles.stepCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#F1F5F9' }]}>
      <View style={styles.stepLeft}>
        <View style={[styles.stepIcon, { backgroundColor: `${color}15` }]}>
          <Icon name={step.icon} size={20} color={color} />
        </View>
        <View style={[styles.stepLine, index === total - 1 && { backgroundColor: 'transparent' }, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Text style={[styles.stepTitle, { color: textPri }]}>{step.title}</Text>
          <Text style={[styles.stepNum, { color: textSec }]}>{index + 1}/{total}</Text>
        </View>
        <Text style={[styles.stepDesc, { color: textSec }]}>{step.description}</Text>
      </View>
    </View>
  );
};

// ─── Guide Modal Component — Transparent Overlay, Step-by-Step ───────────────

export const GuideModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  screenKey: string;
}> = ({ visible, onClose, screenKey }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const guide = GUIDES[screenKey];

  // Reset step when opening
  React.useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!guide) return null;

  const step = guide.steps[currentStep];
  const isLast = currentStep === guide.steps.length - 1;
  const isFirst = currentStep === 0;
  const color = step.color || colors.primary;

  const animateStep = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: next > currentStep ? -20 : 20, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setCurrentStep(next);
      slideAnim.setValue(next > currentStep ? 30 : -30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (isLast) { onClose(); return; }
    animateStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (!isFirst) animateStep(currentStep - 1);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.transparentOverlay}>
        {/* Tap background to skip */}
        <TouchableOpacity style={styles.bgTap} activeOpacity={1} onPress={onClose} />

        {/* Card positioned center */}
        <Animated.View style={[
          styles.card,
          {
            backgroundColor: isDark ? '#1E293BF5' : '#FFFFFFF5',
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
          {/* Skip button */}
          <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
            <Text style={[styles.skipText, { color: isDark ? '#64748B' : '#94A3B8' }]}>Skip</Text>
          </TouchableOpacity>

          {/* Step indicator dots */}
          <View style={styles.dots}>
            {guide.steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === currentStep ? color : (isDark ? '#334155' : '#E2E8F0') },
                  i === currentStep && { width: 20 },
                ]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={[styles.cardIcon, { backgroundColor: `${color}15` }]}>
            <Icon name={step.icon} size={28} color={color} />
          </View>

          {/* Content */}
          <Text style={[styles.cardTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
            {step.title}
          </Text>
          <Text style={[styles.cardDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {step.description}
          </Text>

          {/* Step counter */}
          <Text style={[styles.stepCounter, { color: isDark ? '#475569' : '#CBD5E1' }]}>
            {currentStep + 1} of {guide.steps.length}
          </Text>

          {/* Navigation */}
          <View style={styles.navRow}>
            {!isFirst ? (
              <TouchableOpacity style={[styles.navBtn, { borderColor: isDark ? '#334155' : '#E2E8F0' }]} onPress={handlePrev}>
                <Icon name="chevron-back" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                <Text style={[styles.navBtnText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Back</Text>
              </TouchableOpacity>
            ) : <View style={{ flex: 1 }} />}

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: isLast ? color : color }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>{isLast ? 'Got it!' : 'Next'}</Text>
              {!isLast && <Icon name="chevron-forward" size={16} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── useGuide Hook ───────────────────────────────────────────────────────────

const GUIDE_SEEN_PREFIX = '@guide_seen_';

export const useGuide = (screenKey: string) => {
  const [visible, setVisible] = useState(false);

  // Auto-show on first visit
  useEffect(() => {
    const key = `${GUIDE_SEEN_PREFIX}${screenKey}`;
    AsyncStorage.getItem(key).then(seen => {
      if (!seen) {
        // Small delay so screen renders first
        setTimeout(() => setVisible(true), 600);
      }
    });
  }, [screenKey]);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => {
    setVisible(false);
    // Mark as seen
    AsyncStorage.setItem(`${GUIDE_SEEN_PREFIX}${screenKey}`, 'true').catch(() => {});
  }, [screenKey]);

  const GuideButton: React.FC<{ color?: string; size?: number }> = ({ color, size = 20 }) => (
    <TouchableOpacity style={styles.guideBtn} onPress={show} activeOpacity={0.7}>
      <Icon name="help-circle-outline" size={size} color={color || '#94A3B8'} />
    </TouchableOpacity>
  );

  const GuideView: React.FC = () => (
    <GuideModal visible={visible} onClose={hide} screenKey={screenKey} />
  );

  return { GuideButton, GuideView, showGuide: show, hideGuide: hide };
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Transparent overlay
  transparentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgTap: {
    ...StyleSheet.absoluteFillObject,
  },

  // Card
  card: {
    width: SW - 48,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },

  // Skip
  skipBtn: { position: 'absolute', top: 14, right: 18, zIndex: 1 },
  skipText: { fontSize: 13, fontWeight: '600' },

  // Dots
  dots: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  dot: { height: 6, width: 6, borderRadius: 3 },

  // Icon
  cardIcon: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
  },

  // Content
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  cardDesc: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 12, paddingHorizontal: 4 },
  stepCounter: { fontSize: 11, fontWeight: '600', marginBottom: 20 },

  // Navigation
  navRow: { flexDirection: 'row', gap: 10, width: '100%' },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, height: 44, borderRadius: 12, borderWidth: 1,
  },
  navBtnText: { fontSize: 14, fontWeight: '600' },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, height: 44, borderRadius: 12,
  },
  nextBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  // Old StepCard styles (kept for reference, not used in overlay mode)
  stepCard: { flexDirection: 'row', marginBottom: 4 },
  stepLeft: { alignItems: 'center', width: 44 },
  stepIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepLine: { width: 2, flex: 1, marginVertical: 4 },
  stepContent: { flex: 1, paddingBottom: 20, paddingLeft: 12 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  stepTitle: { fontSize: 14, fontWeight: '700' },
  stepNum: { fontSize: 11 },
  stepDesc: { fontSize: 13, lineHeight: 20 },

  guideBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
});
