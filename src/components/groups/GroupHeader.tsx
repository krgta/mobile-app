import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Group } from '@/types';

export function GroupHeader({
  group,
  membersCount,
  expensesCount,
  onAddMember,
  onAddExpense,
}: {
  group: Group;
  membersCount: number;
  expensesCount: number;
  onAddMember: () => void;
  onAddExpense: () => void;
}) {
  const router = useRouter();

  return (
    <View className="mb-6">
      <TouchableOpacity
        className="flex-row items-center gap-1.5 mb-4 self-start"
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={14} color="#8b8480" />
        <Text className="text-sm text-[#8b8480]">Groups</Text>
      </TouchableOpacity>

      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-2xl font-medium text-[#1a1816]">
            {group.name}
          </Text>
          <Text className="text-xs mt-1 text-[#8b8480]">
            {membersCount} member{membersCount !== 1 ? 's' : ''} ·{' '}
            {expensesCount} expense
            {expensesCount !== 1 ? 's' : ''}
          </Text>
        </View>

        <View className="flex-row gap-2 shrink-0">
          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8e5e0] bg-white"
            onPress={onAddMember}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={14} color="#1a1816" />
            <Text className="text-sm font-medium text-[#1a1816]">Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2d5a4f]"
            onPress={onAddExpense}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={14} color="#fff" />
            <Text className="text-sm font-medium text-white">Expense</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
