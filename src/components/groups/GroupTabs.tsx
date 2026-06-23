import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Tab = 'expenses' | 'balances' | 'settlements' | 'members';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'expenses', label: 'Expenses', icon: 'receipt-outline' },
  { key: 'balances', label: 'Balances', icon: 'scale-outline' },
  { key: 'settlements', label: 'Settlements', icon: 'swap-horizontal-outline' },
  { key: 'members', label: 'Members', icon: 'people-outline' },
];

export function GroupTabs({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <View className="mb-5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="rounded-xl bg-[#f5f3f0] p-1"
        contentContainerStyle={{ gap: 4 }}
      >
        {TABS.map(({ key, label, icon }) => {
          const active = tab === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onChange(key)}
              activeOpacity={0.7}
              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-lg ${
                active ? 'bg-white' : 'bg-transparent'
              }`}
              style={
                active
                  ? {
                      shadowColor: '#000',
                      shadowOpacity: 0.08,
                      shadowRadius: 3,
                      elevation: 2,
                    }
                  : undefined
              }
            >
              <Ionicons
                name={icon as any}
                size={12}
                color={active ? '#1a1816' : '#8b8480'}
              />
              <Text
                className={`text-xs font-medium capitalize ${
                  active ? 'text-[#1a1816]' : 'text-[#8b8480]'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
