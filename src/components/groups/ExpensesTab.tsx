import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GroupExpense } from '@/types';
import { formatAmount, formatDate } from './group-detail-utils';
import type { UserNameFn } from './group-detail-shared';

export function ExpensesTab({
  expenses,
  currentUserId,
  isCreator,
  userName,
  onViewExpense,
  onEditExpense,
  onDeleteExpense,
}: {
  expenses: GroupExpense[];
  currentUserId?: string;
  isCreator: boolean;
  userName: UserNameFn;
  onViewExpense: (e: GroupExpense) => void;
  onEditExpense: (e: GroupExpense) => void;
  onDeleteExpense: (id: string) => void;
}) {
  if (expenses.length === 0) {
    return (
      <View className="rounded-2xl p-8 items-center border border-[#e8e5e0] bg-white">
        <Ionicons
          name="receipt-outline"
          size={20}
          color="#8b8480"
          style={{ marginBottom: 12 }}
        />
        <Text className="text-sm font-medium mb-1 text-[#1a1816]">
          No expenses yet
        </Text>
        <Text className="text-xs text-[#8b8480]">
          Log the first expense for this group.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={expenses}
      keyExtractor={(e) => e.id}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View className="h-2" />}
      contentContainerStyle={{ paddingBottom: 32 }}
      renderItem={({ item: exp }) => (
        <TouchableOpacity
          className="flex-row items-center gap-3 px-4 py-3.5 rounded-2xl border border-[#e8e5e0] bg-white"
          onPress={() => onViewExpense(exp)}
          activeOpacity={0.7}
        >
          <View
            className="w-9 h-9 rounded-xl items-center justify-center shrink-0"
            style={{ backgroundColor: '#e8dcc8' }}
          >
            <Ionicons name="receipt-outline" size={15} color="#2d5a4f" />
          </View>

          <View className="flex-1 min-w-0">
            <Text
              className="text-sm font-medium text-[#1a1816]"
              numberOfLines={1}
            >
              {exp.title}
            </Text>
            <Text className="text-xs mt-0.5 text-[#8b8480]" numberOfLines={1}>
              Paid by {userName(exp.paid_by)} · {formatDate(exp.created_at)} ·{' '}
              {exp.split_type}
            </Text>
          </View>

          <View className="flex-row items-center gap-2 shrink-0">
            <Text className="text-sm font-semibold text-[#1a1816]">
              {formatAmount(exp.amount)}
            </Text>

            {exp.paid_by === currentUserId && (
              <TouchableOpacity
                className="p-1.5 rounded-lg"
                onPress={() => onEditExpense(exp)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil-outline" size={13} color="#8b8480" />
              </TouchableOpacity>
            )}

            {(isCreator || exp.paid_by === currentUserId) && (
              <TouchableOpacity
                className="p-1.5 rounded-lg"
                onPress={() => onDeleteExpense(exp.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={13} color="#A32D2D" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
