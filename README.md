# LifeTrack Mobile App

A comprehensive financial and life management mobile application built with React Native. LifeTrack helps users manage expenses, income, budgets, savings goals, investments, tasks, notes, shopping lists, loans, and more -- all from a single unified platform.

---

## Tech Stack

| Layer              | Technology                                          |
| ------------------ | --------------------------------------------------- |
| Framework          | React Native 0.82 + React 19                        |
| Language           | TypeScript 5.8                                       |
| Navigation         | React Navigation 7 (Native Stack, Drawer, Bottom Tabs) |
| Server State       | TanStack React Query 5                               |
| Client State       | Zustand 5                                            |
| Forms              | React Hook Form 7 + Yup                             |
| Push Notifications | Firebase Cloud Messaging + Notifee                   |
| Real-time          | Socket.IO Client                                     |
| Charts             | react-native-gifted-charts, react-native-chart-kit   |
| Animations         | Reanimated 4, Lottie, Animatable                     |
| UI Components      | Vector Icons (Ionicons), Bottom Sheet, Linear Gradient, SVG |
| HTTP Client        | Axios                                                |
| Date Utilities     | date-fns 4                                           |

---

## Features

### Dashboard
- Financial overview with monthly summary
- Quick action buttons for common operations
- At-a-glance totals for expenses, income, and savings

### Expenses
- Full CRUD with category assignment
- Recurring expense support
- Expense statistics with charts and breakdowns
- Category-wise and time-based filtering

### Income
- Full CRUD for income entries
- Income statistics and trend analysis
- Source tracking

### Budget
- Monthly budget creation and tracking
- Per-category budget allocation
- Alerts when approaching or exceeding limits

### Savings Goals
- Create and track savings goals
- Record contributions toward each goal
- Visual progress indicators and statistics

### Investments
- Support for multiple instrument types: FD, DPS, SIP, Sanchayapatra, Bond, Insurance, Custom
- Contribution tracking
- Maturity date and return calculations

### Tasks
- Full CRUD with subtask support
- Priority levels (low, medium, high)
- Reminder scheduling via push notifications
- Task statistics and completion tracking

### Notes
- Full CRUD with rich editing
- Tag-based organization
- Color coding and pin-to-top support

### Shopping Lists (Bazar)
- Create shopping lists with individual items
- Mark items as purchased
- Auto-sync purchased items to expenses
- Bazar spending statistics

### Loans
- Track loans given and loans taken
- Record payments against loans
- Deadline tracking with reminders

### Chat
- Real-time messaging with polling
- Conversation list with online status indicators
- Unread message count

### Notifications
- Push notifications via Firebase FCM
- In-app notification list
- Auto-alerts for budgets, tasks, loans, and more

### Categories
- Custom expense and income categories
- Configurable icons and colors

### Authentication
- Email-based registration with OTP verification
- Login with email and password
- Forgot password and reset password flows

### Profile
- Edit profile information and avatar
- Change password
- Dark mode toggle

### Guide System
- Step-by-step tooltip overlays on each screen
- Auto-show on first visit
- AsyncStorage-based completion tracking

### Skeleton Loading
- Custom shimmer placeholders on all list and detail screens
- Smooth loading experience throughout the app

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **React Native CLI** (not Expo)
- **Android Studio** with Android SDK (for Android builds)
- **Xcode** 15+ (for iOS builds, macOS only)
- **JDK 17**

### Clone and Install

```bash
git clone <repository-url>
cd LifeTrackApp
npm install
```

### Environment Setup

The API base URL and Socket URL are configured in `src/utils/constants.ts`:

```ts
export const API_BASE_URL = __DEV__
  ? 'https://your-dev-api.com/api'
  : 'https://your-production-api.com/api';

export const SOCKET_URL = __DEV__
  ? 'https://your-dev-api.com'
  : 'https://your-production-api.com';
```

Update these values to point to your backend server. For local development, you can use your machine's local IP address (e.g., `http://192.168.1.x:5000`).

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
cd ios && pod install && cd ..
npm run ios
```

---

## Project Structure

```
src/
├── api/            -- Axios client instance, API endpoint definitions
├── components/     -- Reusable UI components
│   ├── AppHeader
│   ├── Button
│   ├── Input
│   ├── ConfirmModal
│   ├── GuideModal
│   └── Skeleton
├── config/         -- React Query client configuration
├── features/       -- Feature modules (each contains screens/, components/, etc.)
│   ├── auth/
│   ├── dashboard/
│   ├── expenses/
│   ├── income/
│   ├── budget/
│   ├── savings/
│   ├── tasks/
│   ├── notes/
│   ├── bazar/
│   ├── loans/
│   ├── chat/
│   ├── categories/
│   ├── notifications/
│   └── profile/
├── hooks/          -- Shared API hooks (useExpenses, useIncome, useBudget, etc.)
├── navigation/     -- RootNavigator, DrawerNavigator, BottomTabNavigator, AuthNavigator
├── services/       -- Push notification service (Firebase + Notifee)
├── store/          -- Zustand auth store (token, user, isAuthenticated)
├── theme/          -- Color palettes, typography scales, spacing tokens
└── utils/          -- Constants, formatters, validators
```

---

## Navigation Structure

```
RootNavigator (Native Stack)
│
├── AuthNavigator (unauthenticated)
│   ├── Splash
│   ├── Login
│   ├── Register
│   ├── VerifyOTP
│   ├── ForgotPassword
│   └── ResetPassword
│
├── DrawerNavigator (authenticated)
│   │
│   ├── BottomTabNavigator (HomeTabs)
│   │   ├── Home (Dashboard)
│   │   ├── Expenses
│   │   ├── Income
│   │   ├── Bazar
│   │   └── Profile
│   │
│   ├── Expenses
│   ├── Categories
│   ├── Budget
│   ├── Bazar
│   ├── Savings
│   ├── Tasks
│   ├── Notes
│   ├── Chat (Conversations)
│   ├── Loans
│   └── Settings
│
└── Modal / Detail Screens
    ├── Add:       AddExpense, AddIncome, AddTask, AddSavingsGoal,
    │              AddInvestment, AddBazarList, AddBazarItem, AddLoan, AddCategory
    ├── Editor:    NoteEditor
    ├── Details:   ExpenseDetails, IncomeDetails, TaskDetails,
    │              SavingsGoalDetails, InvestmentDetails,
    │              BazarListDetails, LoanDetails
    ├── Stats:     ExpenseStats, IncomeStats, TaskStats, SavingsGoalsStats, BazarStats
    ├── Chat:      Conversations, ChatScreen
    ├── Notifications: NotificationsList, NotificationSettings
    └── Profile:   EditProfile, ChangePassword
```

---

## Data Flow

LifeTrack uses **TanStack React Query** for all server state management.

### Hook Pattern

API hooks use the `select` option to transform and unwrap response data before it reaches components:

```ts
const { data: expenses } = useExpenses({ month, year });
// `expenses` is already the unwrapped array -- do NOT destructure again
```

> **Important:** When a hook uses `select`, the returned `data` is already extracted. Never double-extract (e.g., `data.data` or `data.expenses`). The `select` function has already done the unwrapping.

### Mutation Invalidation

Mutations automatically invalidate related queries to keep the UI in sync:

- Creating an expense invalidates expense list, expense stats, budget, and dashboard queries
- Updating a savings goal invalidates savings list and dashboard queries
- Cross-feature invalidations ensure financial totals are always accurate

### Optimistic Updates

Select operations use optimistic updates for instant UI feedback:

- **Task toggle** -- completion status updates immediately, rolls back on error
- **Bazar item toggle** -- purchased status updates immediately, rolls back on error

### Polling Intervals

Real-time data uses polling at configurable intervals:

| Query                | Interval |
| -------------------- | -------- |
| Chat messages        | 3s       |
| Conversation list    | 5s       |
| Unread message count | 30s      |

---

## Accounting Sync

Financial data stays consistent across features through automatic cross-posting:

| Trigger                          | Auto-created Record   | Queries Invalidated         |
| -------------------------------- | --------------------- | --------------------------- |
| Bazar item marked as purchased   | Expense entry created | Expenses, Budget, Dashboard |
| Investment contribution recorded | Expense entry created | Expenses, Budget, Dashboard |
| Investment reaches maturity      | Income entry created  | Income, Dashboard           |

All cross-posted records reference their source, ensuring traceability and preventing duplicates.

---

## Notification System

### Architecture

1. **Firebase Cloud Messaging (FCM)** handles device token registration and remote message delivery
2. **Notifee** manages local notification display, channels, and user interaction handling
3. A **foreground listener** intercepts incoming notifications while the app is active and displays them as local notifications via Notifee

### Notification Types

| Type                  | Trigger                                        |
| --------------------- | ---------------------------------------------- |
| Budget alerts         | Spending approaches or exceeds budget limits   |
| Task reminders        | User-configured time before task deadline       |
| Loan deadlines        | Upcoming payment due dates                     |
| Chat messages         | New message received while app is backgrounded |
| Investment maturity   | Investment reaches its maturity date            |

### Firebase Setup

Firebase configuration files are required:

- **Android:** place `google-services.json` in `android/app/`
- **iOS:** place `GoogleService-Info.plist` in `ios/LifeTrackApp/`

---

## Theme System

LifeTrack supports **light and dark modes** with a consistent design token system.

### Color Tokens

The theme provides semantic color tokens used throughout the app:

| Token                 | Purpose                           |
| --------------------- | --------------------------------- |
| `colors.primary`      | Brand accent color                |
| `colors.background`   | Screen background                 |
| `colors.surface`      | Card and container backgrounds    |
| `colors.text.primary` | Primary text                      |
| `colors.text.secondary` | Secondary / muted text          |
| `colors.border`       | Dividers and outlines             |
| `colors.success`      | Positive status (income, savings) |
| `colors.warning`      | Warning status (budget alerts)    |
| `colors.error`        | Error status (over budget, overdue) |

### Switching Themes

Users toggle dark mode from the Profile or Settings screen. The preference is persisted via AsyncStorage and applied globally on app restart.

---

## Guide System

LifeTrack includes a built-in guided tour system that introduces users to each screen's functionality.

### How It Works

1. **First visit detection** -- each screen checks AsyncStorage for a `guide_seen_{screenName}` flag
2. **Auto-show** -- if the flag is not set, the guide overlay displays automatically on first visit
3. **Step-by-step tooltips** -- a `GuideModal` component highlights UI elements with explanatory text
4. **Completion tracking** -- once dismissed, the flag is written to AsyncStorage so the guide does not show again
5. **Manual replay** -- users can re-trigger guides from a help button where available

---

## Build and Release

### Android

Generate a release APK:

```bash
cd android && ./gradlew assembleRelease
```

Generate a release AAB (for Google Play Store):

```bash
cd android && ./gradlew bundleRelease
```

Output locations:

- **APK:** `android/app/build/outputs/apk/release/app-release.apk`
- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`

### iOS

1. Open `ios/LifeTrackApp.xcworkspace` in Xcode
2. Select a release scheme and target device
3. Product > Archive

### Production Configuration

Before building for production, update the API URLs in `src/utils/constants.ts` to point to your production backend:

```ts
export const API_BASE_URL = 'https://your-production-api.com/api';
export const SOCKET_URL = 'https://your-production-api.com';
```

---

## Scripts Reference

| Command                    | Description                    |
| -------------------------- | ------------------------------ |
| `npm run android`          | Run on Android device/emulator |
| `npm run ios`              | Run on iOS simulator           |
| `npm start`               | Start Metro bundler            |
| `npm run lint`             | Run ESLint                     |
| `npm test`                 | Run Jest tests                 |
| `npm run android:debug`   | Build Android debug APK        |
| `npm run android:release` | Build Android release APK      |
| `npm run android:bundle`  | Build Android release AAB      |
| `npm run clean:android`   | Clean Android build artifacts  |
| `npm run clean:ios`       | Clean iOS build artifacts      |
