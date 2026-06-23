import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GroupBalances } from '@/types';
import { formatAmount, getInitials, COLORS } from './group-detail-utils';
import type { SettleFn, UserNameFn } from './group-detail-shared';

export function BalancesTab({
  balances,
  currentUserId,
  payableDebts,
  members,
  userName,
  onSettle,
}: {
  balances: GroupBalances;
  currentUserId?: string;
  payableDebts: Record<string, number>;
  members: { user_id: string }[];
  userName: UserNameFn;
  onSettle: SettleFn;
}) {
  const colorFor = (uid: string) => {
    const idx = members.findIndex((m) => m.user_id === uid) % COLORS.length;
    return COLORS[Math.max(0, idx)];
  };

  const entries = Object.entries(balances);

  if (entries.length === 0) {
    return (
      <View className="rounded-2xl p-8 items-center border border-[#e8e5e0] bg-white">
        <Ionicons
          name="scale-outline"
          size={20}
          color="#8b8480"
          style={{ marginBottom: 12 }}
        />
        <Text className="text-sm font-medium mb-1 text-[#1a1816]">
          All settled up
        </Text>
        <Text className="text-xs text-[#8b8480]">
          No outstanding balances in this group.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={([uid]) => uid}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View className="h-2" />}
      contentContainerStyle={{ paddingBottom: 32 }}
      renderItem={({ item: [uid, bal] }) => {
        const n = parseFloat(bal);
        const isMe = uid === currentUserId;
        const payableAmount = payableDebts[uid] ?? 0;
        const youOwe = payableAmount > 0;
        const isPos = !youOwe && n > 0;
        const color = colorFor(uid);

        return (
          <View className="flex-row items-center gap-3 px-4 py-3.5 rounded-2xl border border-[#e8e5e0] bg-white">
            <View
              className="w-9 h-9 rounded-full items-center justify-center shrink-0"
              style={{ backgroundColor: color.bg }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: color.text }}
              >
                {getInitials(userName(uid))}
              </Text>
            </View>

            <View className="flex-1 min-w-0">
              <Text className="text-sm font-medium text-[#1a1816]">
                {userName(uid)}
                {isMe ? ' (you)' : ''}
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{
                  color: youOwe ? '#A32D2D' : isPos ? '#0F6E56' : '#A32D2D',
                }}
              >
                {n === 0 && !youOwe
                  ? 'settled'
                  : youOwe
                    ? `you owe ${formatAmount(payableAmount)}`
                    : isPos
                      ? `gets back ${formatAmount(Math.abs(n))}`
                      : `owes ${formatAmount(Math.abs(n))}`}
              </Text>
            </View>

            {!isMe && youOwe && (
              <TouchableOpacity
                className="px-3 py-1.5 rounded-lg bg-[#2d5a4f] shrink-0"
                onPress={() => onSettle(uid, payableAmount)}
                activeOpacity={0.8}
              >
                <Text className="text-xs font-medium text-white">Settle</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }}
    />
  );
}
