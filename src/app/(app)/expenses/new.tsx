import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { createPersonalExpense } from '@/services/expenses';

export default function NewExpensePage() {
  const router = useRouter();

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
            Add expense
          </Text>
        </View>

        {/* Card */}
        <View className="rounded-2xl border border-zinc-200 bg-white p-5">
          <ExpenseForm
            submitLabel="Add expense"
            onSubmit={async (expense) => {
              await createPersonalExpense(expense);
              router.push('/expenses');
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
