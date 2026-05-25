npm install -g react-native-cli

# Evenup — Mobile Client

React Native app for tracking personal and group expenses.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Native (Expo) |
| Language | TypeScript |
| State | Zustand |
| API Client | Axios + React Query |
| Navigation | React Navigation v6 |
| Storage | AsyncStorage (auth tokens) |
| UI | NativeWind (Tailwind for RN) |

---

## Project Structure

```
evenup-mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── dashboard.tsx
│   │   ├── groups/
│   │   │   ├── index.tsx               # /groups
│   │   │   ├── create.tsx              # /groups/create
│   │   │   ├── [groupId]/
│   │   │   │   ├── index.tsx           # group detail
│   │   │   │   └── add-expense.tsx
│   │   ├── personal/
│   │   │   ├── index.tsx
│   │   │   └── add-expense.tsx
│   │   ├── balances.tsx
│   │   └── profile.tsx
├── components/
│   ├── ExpenseCard.tsx
│   ├── GroupCard.tsx
│   ├── BalanceCard.tsx
│   ├── ExpenseForm.tsx
│   ├── GroupForm.tsx
│   └── SettlementModal.tsx
├── services/
│   └── api.ts                          # Axios instance + endpoints
├── stores/
│   ├── authStore.ts
│   ├── groupStore.ts
│   └── expenseStore.ts
├── hooks/
│   ├── useGroups.ts
│   ├── useExpenses.ts
│   └── useBalances.ts
└── types/
    └── index.ts
```

---

## Screens

| Screen | Route / Stack |
|--------|--------------|
| Login | `(auth)/login` |
| Register | `(auth)/register` |
| Dashboard | `(tabs)/dashboard` |
| Personal Expenses | `(tabs)/personal` |
| Add Personal Expense | `personal/add-expense` |
| Groups List | `(tabs)/groups` |
| Create Group | `groups/create` |
| Group Detail | `groups/[groupId]` |
| Add Group Expense | `groups/[groupId]/add-expense` |
| Balances | `(tabs)/balances` |
| Profile | `(tabs)/profile` |

---

## Core Components

| Component | Purpose |
|-----------|---------|
| `ExpenseCard` | Renders a single expense row with amount, category, date |
| `GroupCard` | Group summary with member count and total balance |
| `BalanceCard` | Shows net owed/owe amount for a user |
| `ExpenseForm` | Shared form for add/edit expense (personal + group) |
| `GroupForm` | Create / edit group with member invite |
| `SettlementModal` | Bottom sheet to record a payment between two users |

---

## Auth Flow

Tokens are stored in `AsyncStorage`. On app launch, `authStore` checks for a valid access token and attempts a silent refresh via `POST /auth/refresh` before routing to the dashboard or login screen.

```
App Start
  └─ Token in AsyncStorage?
       ├─ Yes → /auth/refresh → Dashboard
       └─ No  → Login screen
```

---

## API Integration

All requests go through a shared Axios instance:

```ts
// services/api.ts
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

// Attach access token to every request
api.interceptors.request.use(attachToken);

// Auto-refresh on 401
api.interceptors.response.use(null, handle401);
```

React Query is used for caching and background refetching. Mutations (add expense, settle debt) invalidate the relevant query keys.

---

## Environment Variables

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

---

## Future

- Push notifications for new expenses / settlement requests
- Offline queue with background sync (mirrors the backend SyncEngine)
- Split type selector (equal / exact / percentage) in ExpenseForm
- Deep links for group invites