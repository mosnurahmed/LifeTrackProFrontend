/**
 * Notification Types
 */

export enum NotificationType {
  BUDGET_WARNING = 'budget_warning',
  BUDGET_EXCEEDED = 'budget_exceeded',
  TASK_REMINDER = 'task_reminder',
  TASK_DUE_TODAY = 'task_due_today',
  SAVINGS_MILESTONE = 'savings_milestone',
  SAVINGS_COMPLETED = 'savings_completed',
  CHAT_MESSAGE = 'chat_message',
  EXPENSE_ADDED = 'expense_added',
  INCOME_ADDED = 'income_added',
}

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  receivedAt: string;
  isRead: boolean;
}

export interface NotificationPreferences {
  budgetAlerts: {
    enabled: boolean;
    threshold80: boolean;
    threshold100: boolean;
    exceeded: boolean;
  };
  taskReminders: {
    enabled: boolean;
    beforeDue: number;
    onDue: boolean;
    overdue: boolean;
  };
  savingsGoals: {
    enabled: boolean;
    milestones: boolean;
    completed: boolean;
  };
  expenseAlerts: {
    enabled: boolean;
    largeExpenseThreshold: number;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}