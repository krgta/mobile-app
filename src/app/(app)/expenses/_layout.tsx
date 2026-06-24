import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function ExpensesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerBackTitle: 'Expenses',
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Expenses', headerShown: false }}
      />

      <Stack.Screen
        name="new"
        options={{
          title: 'Add Expense',
          presentation: 'modal',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="[expense_id]/edit"
        options={{
          title: 'Edit Expense',
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
