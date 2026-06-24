import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ExpenseForm,
  type ExpenseFormValues,
} from '@/components/expenses/ExpenseForm';
import { getPersonalExpense, updatePersonalExpense } from '@/services/expenses';

export default function EditExpensePage() {
  const { expense_id } = useLocalSearchParams<{ expense_id: string }>();
  const router = useRouter();

  const [initialValues, setInitialValues] = useState<ExpenseFormValues | null>(
    null,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    getPersonalExpense(expense_id)
      .then((expense) => {
        setInitialValues({
          title: expense.title,
          amount: expense.amount,
          category: expense.category ?? '',
          date: expense.date ? expense.date.slice(0, 10) : '',
          notes: expense.notes ?? '',
        });
      })
      .catch(() => setError('Could not load this expense.'));
  }, [expense_id]);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="px-4 py-8"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mx-auto w-full max-w-xl">
        {/* Back link */}
        <TouchableOpacity
          className="mb-5 flex-row items-center gap-1.5"
          onPress={() => router.push('/expenses')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={14} color="#71717A" />
          <Text className="text-sm text-zinc-500">Expenses</Text>
        </TouchableOpacity>

        {/* Page heading */}
        <View className="mb-6">
          <Text className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Personal ledger
          </Text>
          <Text className="text-2xl font-medium text-zinc-950">
            Edit expense
          </Text>
        </View>

        {/* States: error / loading / form */}
        {error ? (
          <View className="rounded-xl bg-red-50 p-4">
            <Text className="text-sm text-red-500">{error}</Text>
          </View>
        ) : !initialValues ? (
          <View className="h-48 items-center justify-center">
            <ActivityIndicator size="small" color="#18181B" />
          </View>
        ) : (
          <View className="rounded-2xl border border-zinc-200 bg-white p-5">
            <ExpenseForm
              initialValues={initialValues}
              submitLabel="Save changes"
              onSubmit={async (expense) => {
                await updatePersonalExpense(expense_id, expense);
                router.push('/expenses');
              }}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
