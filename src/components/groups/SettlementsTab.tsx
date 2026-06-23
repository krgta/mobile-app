import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GroupDebtBreakdown, Settlement } from '@/types';
import { formatAmount } from './group-detail-utils';
import { invertMatrix, matrixToRows } from './group-detail-breakdown-utils';
import type { UserNameFn } from './group-detail-shared';

type SettlementsSubTab = 'past' | 'final' | 'receivables' | 'breakdown';

const SUB_TABS: { key: SettlementsSubTab; label: string; icon: string }[] = [
  { key: 'past', label: 'Past', icon: 'checkmark-circle-outline' },
  { key: 'final', label: 'Final', icon: 'swap-horizontal-outline' },
  { key: 'receivables', label: 'Receivables', icon: 'git-branch-outline' },
  { key: 'breakdown', label: 'Breakdown', icon: 'receipt-outline' },
];

function EmptyState({
  title,
  description,
  icon = 'checkmark-circle-outline',
}: {
  title: string;
  description: string;
  icon?: string;
}) {
  return (
    <View className="rounded-2xl border border-[#e8e5e0] bg-white px-4 py-6 items-center">
      <View className="w-9 h-9 rounded-full bg-[#f5f3f0] items-center justify-center mb-2">
        <Ionicons name={icon as any} size={16} color="#8b8480" />
      </View>
      <Text className="text-sm font-medium text-[#1a1816]">{title}</Text>
      <Text className="text-xs mt-1 text-[#8b8480] text-center">
        {description}
      </Text>
    </View>
  );
}

export function SettlementsTab({
  settlements,
  debtBreakdown,
  breakdownError,
  userName,
  onReloadBreakdown,
}: {
  settlements: Settlement[];
  debtBreakdown: GroupDebtBreakdown | null;
  breakdownError: string | null;
  userName: UserNameFn;
  onReloadBreakdown: () => void;
}) {
  const [subTab, setSubTab] = useState<SettlementsSubTab>('past');

  const finalSettlements = matrixToRows(debtBreakdown?.simplified ?? null);
  const receivableView = matrixToRows(
    invertMatrix(debtBreakdown?.simplified ?? null),
  );

  const detailedBreakdown = (() => {
    if (!debtBreakdown?.breakdown) return [];
    return Object.entries(debtBreakdown.breakdown)
      .map(([debtorId, creditors]) => {
        const creditorEntries = Object.entries(creditors)
          .map(([creditorId, items]) => {
            const sorted = [...items].sort(
              (a, b) => Number(b.amount) - Number(a.amount),
            );
            return {
              creditorId,
              items: sorted,
              total: sorted.reduce((s, i) => s + Number(i.amount), 0),
            };
          })
          .filter(({ items }) => items.length > 0)
          .sort((a, b) => b.total - a.total);
        return {
          debtorId,
          creditors: creditorEntries,
          total: creditorEntries.reduce((s, e) => s + e.total, 0),
        };
      })
      .filter(({ creditors }) => creditors.length > 0)
      .sort((a, b) => b.total - a.total);
  })();

  return (
    <View className="flex-1">
      <View className="mb-4 rounded-2xl border border-[#e8e5e0] bg-white p-1">
        <View className="flex-row flex-wrap gap-1">
          {SUB_TABS.map(({ key, label, icon }) => {
            const active = subTab === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSubTab(key)}
                className={`flex-row items-center justify-center gap-1.5 rounded-xl px-3 py-2 flex-1 ${
                  active ? 'bg-[#f5f3f0]' : 'bg-transparent'
                }`}
                style={
                  active
                    ? {
                        shadowColor: '#000',
                        shadowOpacity: 0.06,
                        shadowRadius: 3,
                        elevation: 1,
                      }
                    : undefined
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name={icon as any}
                  size={12}
                  color={active ? '#1a1816' : '#8b8480'}
                />
                <Text
                  className={`text-xs font-medium ${active ? 'text-[#1a1816]' : 'text-[#8b8480]'}`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {subTab === 'past' &&
        (settlements.length > 0 ? (
          <FlatList
            data={settlements}
            keyExtractor={(s) => s.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-2" />}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item: s }) => (
              <View className="flex-row items-center gap-3 px-4 py-3 rounded-2xl border border-[#e8e5e0] bg-white">
                <Ionicons name="checkmark-circle" size={15} color="#0F6E56" />
                <Text className="text-sm flex-1 text-[#1a1816]">
                  <Text className="font-medium">{userName(s.payer_id)}</Text>
                  {' paid '}
                  <Text className="font-medium">{userName(s.receiver_id)}</Text>
                </Text>
                <Text className="text-sm font-semibold text-[#0F6E56]">
                  {formatAmount(s.amount)}
                </Text>
              </View>
            )}
          />
        ) : (
          <EmptyState
            title="No past settlements"
            description="Settlements you record will show up here."
          />
        ))}

      {subTab === 'final' &&
        (finalSettlements.length > 0 ? (
          <FlatList
            data={finalSettlements}
            keyExtractor={(r) => r.sourceId}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-3" />}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item: { sourceId, entries, total } }) => (
              <View className="rounded-2xl border border-[#e8e5e0] bg-white p-4">
                <View className="flex-row items-start justify-between gap-3 mb-3">
                  <View>
                    <Text className="text-sm font-semibold text-[#1a1816]">
                      {userName(sourceId)}
                    </Text>
                    <Text className="text-xs mt-0.5 text-[#8b8480]">
                      Pays {entries.length} member
                      {entries.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-full bg-[#f5f3f0]">
                    <Text className="text-xs font-medium text-[#8b8480]">
                      {formatAmount(total)}
                    </Text>
                  </View>
                </View>
                <View className="gap-2">
                  {entries.map(({ targetId, amount }) => (
                    <View
                      key={targetId}
                      className="flex-row items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-[#f5f3f0]"
                    >
                      <Text className="text-sm text-[#1a1816]">
                        <Text className="font-medium">
                          {userName(sourceId)}
                        </Text>
                        {' pays '}
                        <Text className="font-medium">
                          {userName(targetId)}
                        </Text>
                      </Text>
                      <Text className="text-sm font-semibold shrink-0 text-[#1a1816]">
                        {formatAmount(amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          />
        ) : (
          <EmptyState
            title="No final settlements"
            description="Once debt is simplified, the payment map appears here."
          />
        ))}

      {subTab === 'receivables' &&
        (receivableView.length > 0 ? (
          <FlatList
            data={receivableView}
            keyExtractor={(r) => r.sourceId}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-3" />}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item: { sourceId, entries, total } }) => (
              <View className="rounded-2xl border border-[#e8e5e0] bg-white p-4">
                <View className="flex-row items-start justify-between gap-3 mb-3">
                  <View>
                    <Text className="text-sm font-semibold text-[#1a1816]">
                      {userName(sourceId)}
                    </Text>
                    <Text className="text-xs mt-0.5 text-[#8b8480]">
                      Gets from {entries.length} member
                      {entries.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-full bg-[#f5f3f0]">
                    <Text className="text-xs font-medium text-[#8b8480]">
                      {formatAmount(total)}
                    </Text>
                  </View>
                </View>
                <View className="gap-2">
                  {entries.map(({ targetId, amount }) => (
                    <View
                      key={targetId}
                      className="flex-row items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-[#f5f3f0]"
                    >
                      <Text className="text-sm text-[#1a1816]">
                        <Text className="font-medium">
                          {userName(targetId)}
                        </Text>
                        {' pays '}
                        <Text className="font-medium">
                          {userName(sourceId)}
                        </Text>
                      </Text>
                      <Text className="text-sm font-semibold shrink-0 text-[#1a1816]">
                        {formatAmount(amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          />
        ) : (
          <EmptyState
            title="No receivables"
            description="This view mirrors the final settlement map in reverse."
          />
        ))}

      {subTab === 'breakdown' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold uppercase tracking-widest text-[#8b8480]">
              Expense breakdown
            </Text>
            <TouchableOpacity
              className="px-3 py-1.5 rounded-lg border border-[#e8e5e0] bg-white"
              onPress={onReloadBreakdown}
              activeOpacity={0.8}
            >
              <Text className="text-xs font-medium text-[#1a1816]">Reload</Text>
            </TouchableOpacity>
          </View>

          {breakdownError ? (
            <View className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
              <Text className="text-sm text-[#B91C1C]">{breakdownError}</Text>
            </View>
          ) : detailedBreakdown.length === 0 ? (
            <EmptyState
              title="No breakdown to show"
              description="Add a few expenses and their splits to see who owes whom."
              icon="receipt-outline"
            />
          ) : (
            <View className="gap-3">
              {detailedBreakdown.map(({ debtorId, creditors }) => (
                <View
                  key={debtorId}
                  className="rounded-2xl border border-[#e8e5e0] bg-white p-4"
                >
                  <View className="flex-row items-start justify-between gap-3 mb-3">
                    <View>
                      <Text className="text-sm font-semibold text-[#1a1816]">
                        {userName(debtorId)}
                      </Text>
                      <Text className="text-xs mt-0.5 text-[#8b8480]">
                        Owes across {creditors.length} creditor
                        {creditors.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View className="px-2.5 py-1 rounded-full bg-[#f5f3f0]">
                      <Text className="text-xs font-medium text-[#8b8480]">
                        {formatAmount(
                          creditors.reduce((s, e) => s + e.total, 0),
                        )}
                      </Text>
                    </View>
                  </View>
                  <View className="gap-2">
                    {creditors.map(({ creditorId, items, total }) => (
                      <View
                        key={creditorId}
                        className="rounded-xl p-3 bg-[#f5f3f0]"
                      >
                        <View className="flex-row items-center justify-between gap-2 mb-2">
                          <Text className="text-xs font-semibold uppercase tracking-widest text-[#8b8480]">
                            To {userName(creditorId)}
                          </Text>
                          <Text className="text-xs font-medium text-[#1a1816]">
                            {formatAmount(total)}
                          </Text>
                        </View>
                        <View className="gap-2">
                          {items.map((item) => (
                            <View
                              key={item.expense_id}
                              className="flex-row items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
                            >
                              <View className="min-w-0 flex-1">
                                <Text
                                  className="text-sm font-medium text-[#1a1816]"
                                  numberOfLines={1}
                                >
                                  {item.title}
                                </Text>
                                <Text className="text-xs mt-0.5 text-[#8b8480]">
                                  Expense split
                                </Text>
                              </View>
                              <Text className="text-sm font-semibold shrink-0 text-[#1a1816]">
                                {formatAmount(item.amount)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
