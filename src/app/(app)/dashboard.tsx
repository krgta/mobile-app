import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { getCategoryMeta } from '@/constants/categories';

function formatAmount(amount: string | number, currency = '₹') {
  const n = Number(amount);
  return `${currency}${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const GROUP_COLORS = [
  { bg: '#EEEDFE', text: '#534AB7' },
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#FAECE7', text: '#993C1D' },
  { bg: '#FBEAF0', text: '#993556' },
  { bg: '#E6F1FB', text: '#185FA5' },
];

type DashboardData = {
  analytics: {
    total_spent: number;
    expense_count: number;
    spending_by_category: Record<string, number>;
  } | null;
  groups: Array<{
    id: string;
    name: string;
    created_by: string;
    created_at: string;
  }>;
  personalExpenses: Array<{
    id: string;
    title: string;
    amount: string;
    category: string | null;
    created_at: string;
  }>;
  loading: boolean;
  error: string | null;
};

function Skeleton({ className }: { className?: string }) {
  return <View className={`rounded-lg bg-zinc-100 ${className ?? ''}`} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [data, setData] = useState<DashboardData>({
    analytics: null,
    groups: [],
    personalExpenses: [],
    loading: true,
    error: null,
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'group'>('personal');

  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.allSettled([
      api.get('/expenses/personal-data').then((r) => r.data),
      api.get('/groups/').then((r) => r.data),
      api.get('/expenses/').then((r) => r.data),
    ]).then(([analyticsRes, groupsRes, expensesRes]) => {
      setData({
        analytics:
          analyticsRes.status === 'fulfilled' && analyticsRes.value?.data
            ? analyticsRes.value.data
            : null,
        groups:
          groupsRes.status === 'fulfilled' &&
          Array.isArray(groupsRes.value?.data)
            ? groupsRes.value.data
            : [],
        personalExpenses:
          expensesRes.status === 'fulfilled' &&
          Array.isArray(expensesRes.value?.data)
            ? expensesRes.value.data.slice(0, 5)
            : [],
        loading: false,
        error: null,
      });
    });
  }, [isAuthenticated]);

  const { analytics, groups, personalExpenses, loading } = data;

  const categoryEntries = analytics?.spending_by_category
    ? Object.entries(analytics.spending_by_category)
        .filter(([k]) => k !== '__total__')
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 5)
    : [];

  const maxCategory =
    categoryEntries.length > 0 ? Number(categoryEntries[0][1]) : 1;

  const QUICK_ACTIONS = [
    {
      label: 'Log expense',
      route: '/expenses/new',
      icon: 'add-circle-outline',
    },
    { label: 'New group', route: '/(app)/groups/', icon: 'people-outline' },
    {
      label: 'Check balances',
      route: '/groups',
      icon: 'swap-horizontal-outline',
    },
    { label: 'View profile', route: '/profile', icon: 'person-circle-outline' },
  ] as const;

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="px-4 py-8 gap-3 max-w-2xl w-full self-center"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View className="mb-5">
        <Text className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Overview
        </Text>
        <Text className="text-2xl font-medium text-zinc-950">
          {greeting()},{' '}
          <Text style={{ fontStyle: 'italic' }}>
            {user?.name?.split(' ')[0] ?? 'there'}
          </Text>
        </Text>
      </View>

      {/* ── Metric cards ─────────────────────────────────────────────── */}
      <View className="flex-row gap-3 mb-3">
        {[
          {
            label: 'Total spent',
            value: analytics ? formatAmount(analytics.total_spent) : '—',
            sub: `${analytics?.expense_count ?? 0} expenses`,
          },
          {
            label: 'Groups',
            value: loading ? '—' : String(groups.length),
            sub: 'active groups',
          },
          {
            label: 'Top category',
            value: categoryEntries.length > 0 ? categoryEntries[0][0] : '—',
            sub:
              categoryEntries.length > 0
                ? formatAmount(categoryEntries[0][1])
                : 'no data yet',
          },
        ].map((m) => (
          <View key={m.label} className="flex-1 rounded-xl bg-zinc-100 p-3">
            <Text className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
              {m.label}
            </Text>
            <Text className="text-base font-medium leading-none text-zinc-950">
              {m.value}
            </Text>
            <Text className="mt-1 text-[10px] text-zinc-500">{m.sub}</Text>
          </View>
        ))}
      </View>

      {/* ── Groups + Category breakdown ───────────────────────────────── */}
      <View className="flex-row gap-3">
        {/* Groups panel */}
        <View className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-zinc-950">
              Your groups
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/groups')}
              activeOpacity={0.7}
            >
              <Text className="text-xs text-zinc-500">All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </View>
          ) : groups.length === 0 ? (
            <View className="py-6 items-center">
              <Text className="text-sm text-zinc-500">No groups yet. </Text>
              <TouchableOpacity
                onPress={() => router.push('/groups')}
                activeOpacity={0.7}
              >
                <Text className="text-sm text-zinc-500 underline">
                  Create one
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {groups.slice(0, 4).map((g, i) => {
                const color = GROUP_COLORS[i % GROUP_COLORS.length];
                return (
                  <TouchableOpacity
                    key={g.id}
                    className="flex-row items-center gap-2.5 py-2 border-b border-zinc-100 last:border-0"
                    onPress={() => router.push(`/groups/${g.id}`)}
                    activeOpacity={0.7}
                  >
                    <View
                      className="size-8 shrink-0 rounded-full items-center justify-center"
                      style={{ backgroundColor: color.bg }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: color.text }}
                      >
                        {getInitials(g.name)}
                      </Text>
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text
                        className="text-sm text-zinc-950 truncate"
                        numberOfLines={1}
                      >
                        {g.name}
                      </Text>
                      <Text className="text-xs text-zinc-500">
                        {new Date(g.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Category breakdown */}
        <View className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4">
          <Text className="mb-4 text-sm font-medium text-zinc-950">
            By category
          </Text>

          {loading ? (
            <View className="gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </View>
          ) : categoryEntries.length === 0 ? (
            <Text className="py-6 text-center text-sm text-zinc-500">
              Log expenses to see a breakdown
            </Text>
          ) : (
            <View className="gap-3">
              {categoryEntries.map(([cat, amt]) => {
                const pct = Math.round((Number(amt) / maxCategory) * 100);
                const barColor = getCategoryMeta(cat).text;
                return (
                  <View key={cat} className="flex-row items-center gap-2">
                    <Text className="w-16 shrink-0 text-[10px] text-zinc-500 truncate">
                      {cat}
                    </Text>
                    <View
                      className="flex-1 overflow-hidden rounded-full bg-zinc-100"
                      style={{ height: 5 }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </View>
                    <Text className="min-w-10 shrink-0 text-right text-[10px] font-medium text-zinc-950">
                      {formatAmount(amt)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* ── Recent expenses ───────────────────────────────────────────── */}
      <View className="rounded-2xl border border-zinc-200 bg-white p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-zinc-950">
            Recent expenses
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/expenses')}
            activeOpacity={0.7}
          >
            <Text className="text-xs text-zinc-500">All →</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="mb-4 flex-row gap-1">
          {(['personal', 'group'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: activeTab === tab ? '#F4F4F5' : 'transparent',
                borderWidth: 0.5,
                borderColor: activeTab === tab ? '#E4E4E7' : 'transparent',
              }}
              activeOpacity={0.7}
            >
              <Text
                className="text-xs capitalize"
                style={{
                  color: activeTab === tab ? '#09090B' : '#71717A',
                  fontWeight: activeTab === tab ? '500' : '400',
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'personal' && (
          <>
            {loading ? (
              <View className="gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </View>
            ) : personalExpenses.length === 0 ? (
              <View className="py-6 items-center">
                <Text className="text-sm text-zinc-500">
                  No personal expenses yet.{' '}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/expenses')}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm text-zinc-500 underline">
                    Add one
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {personalExpenses.map((exp) => {
                  const catMeta = getCategoryMeta(exp.category);
                  return (
                    <View
                      key={exp.id}
                      className="flex-row items-center gap-3 py-2 border-b border-zinc-100 last:border-0"
                    >
                      <View
                        className="size-8 shrink-0 rounded-lg items-center justify-center"
                        style={{ backgroundColor: catMeta.bg }}
                      >
                        {/* Replace with <catMeta.Icon size={16} /> via lucide-react-native */}
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: catMeta.text }}
                        >
                          {catMeta.label[0]}
                        </Text>
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text
                          className="text-sm text-zinc-950 truncate"
                          numberOfLines={1}
                        >
                          {exp.title}
                        </Text>
                        <Text className="text-xs text-zinc-500">
                          {exp.category ? catMeta.label : 'Uncategorised'} ·{' '}
                          {formatDate(exp.created_at)}
                        </Text>
                      </View>
                      <Text
                        className="shrink-0 text-sm font-medium"
                        style={{ color: '#A32D2D' }}
                      >
                        −{formatAmount(exp.amount)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {activeTab === 'group' && (
          <View className="py-8 items-center">
            <Text className="text-sm text-zinc-500">
              Open a group to see its expenses →{' '}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/groups')}
              activeOpacity={0.7}
            >
              <Text className="text-sm text-zinc-500 underline">My groups</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Quick actions ─────────────────────────────────────────────── */}
      <View className="rounded-2xl border border-zinc-200 bg-white p-4">
        <Text className="mb-3 text-sm font-medium text-zinc-950">
          Quick actions
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              className="flex-row items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2.5"
              style={{ width: '48%' }}
              onPress={() => router.push(action.route)}
              activeOpacity={0.7}
            >
              <Ionicons name={action.icon} size={16} color="#71717A" />
              <Text className="text-sm text-zinc-950">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
