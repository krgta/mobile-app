import { View, Text, TouchableOpacity } from 'react-native';
import type { GroupBalances } from '@/types';
import { formatAmount } from './group-detail-utils';
import type { SettleFn, UserNameFn } from './group-detail-shared';

export function BalanceSummary({
  balances,
  currentUserId,
  payableDebts,
  userName,
  onSettle,
}: {
  balances: GroupBalances;
  currentUserId?: string;
  payableDebts: Record<string, number>;
  userName: UserNameFn;
  onSettle: SettleFn;
}) {
  const myBalances = Object.entries(balances).filter(
    ([uid]) => uid !== currentUserId,
  );
  if (myBalances.length === 0) return null;

  return (
    <View className="rounded-2xl p-4 mb-5 border border-[#e8e5e0] bg-white">
      <Text className="text-xs font-semibold uppercase tracking-widest mb-3 text-[#8b8480]">
        Your balances
      </Text>

      <View className="gap-2">
        {Object.entries(balances)
          .filter(([uid]) => uid !== currentUserId)
          .map(([uid, bal]) => {
            const n = parseFloat(bal);
            const payableAmount = payableDebts[uid] ?? 0;
            const youOwe = payableAmount > 0;
            return (
              <View key={uid} className="flex-row items-center justify-between">
                <Text className="text-sm text-[#1a1816]">{userName(uid)}</Text>

                <View className="flex-row items-center gap-3">
                  <Text
                    className="text-sm font-medium"
                    style={{ color: youOwe ? '#A32D2D' : '#0F6E56' }}
                  >
                    {youOwe
                      ? `you owe ${formatAmount(payableAmount)}`
                      : `owes you ${formatAmount(Math.abs(n))}`}
                  </Text>
                  {youOwe && (
                    <TouchableOpacity
                      className="px-2.5 py-1 rounded-lg bg-[#2d5a4f]"
                      onPress={() => onSettle(uid, payableAmount)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-xs font-medium text-white">
                        Settle
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
      </View>
    </View>
  );
}
