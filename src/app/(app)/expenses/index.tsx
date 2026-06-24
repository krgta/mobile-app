import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Edit3, Plus, Receipt, Search, Trash2 } from 'lucide-react-native';
import {
  deletePersonalExpense,
  getPersonalExpenses,
} from '@/services/expenses';
import type { PersonalExpense } from '@/types';
import { EXPENSE_CATEGORIES, getCategoryMeta } from '@/constants/categories';

function formatAmount(amount: string) {
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatDate(expense: PersonalExpense) {
  return new Date(expense.date ?? expense.created_at).toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

export default function ExpensesPage() {
  const router = useRouter();

  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    let active = true;

    getPersonalExpenses()
      .then((data) => {
        if (active) setExpenses(data);
      })
      .catch(() => {
        if (active) setError('Could not load your expenses.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredExpenses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesQuery =
        !normalizedQuery ||
        [expense.title, expense.category, expense.notes]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));

      const matchesCategory =
        categoryFilter === 'all' ||
        (expense.category ?? '').toLowerCase() === categoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [expenses, query, categoryFilter]);

  const total = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const handleDelete = (expense: PersonalExpense) => {
    Alert.alert('Delete expense', `Delete "${expense.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(expense.id);
          try {
            await deletePersonalExpense(expense.id);
            setExpenses((current) =>
              current.filter((item) => item.id !== expense.id),
            );
          } catch {
            setError('Could not delete that expense.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const ListHeader = (
    <View>
      <View className="mb-7 flex-row items-start justify-between gap-4">
        <View>
          <Text className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Personal ledger
          </Text>
          <Text className="text-2xl font-medium text-zinc-950">Expenses</Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5"
          onPress={() => router.push('/expenses/new')}
          activeOpacity={0.8}
        >
          <Plus size={15} color="#FAFAFA" />
          <Text className="text-sm font-medium text-zinc-50">Add expense</Text>
        </TouchableOpacity>
      </View>

      {/* Search + Total */}
      <View className="mb-3 gap-3">
        <View className="relative flex-row items-center">
          <Search
            size={15}
            color="#A1A1AA"
            style={{ position: 'absolute', left: 14, zIndex: 1 }}
          />
          <TextInput
            className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-950"
            value={query}
            onChangeText={setQuery}
            placeholder="Search expenses"
            placeholderTextColor="#A1A1AA"
          />
        </View>
        <View className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5">
          <Text className="text-sm">
            <Text className="text-zinc-500">Total </Text>
            <Text className="font-semibold text-zinc-950">
              {formatAmount(String(total))}
            </Text>
          </Text>
        </View>
      </View>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-5"
        contentContainerClassName="gap-2 pr-4"
      >
        <TouchableOpacity
          onPress={() => setCategoryFilter('all')}
          className="rounded-full px-3 py-1.5"
          style={{
            backgroundColor: categoryFilter === 'all' ? '#18181B' : '#F9F9FB',
          }}
          activeOpacity={0.7}
        >
          <Text
            className="text-xs font-medium"
            style={{
              color: categoryFilter === 'all' ? '#FAFAFA' : '#71717A',
            }}
          >
            All
          </Text>
        </TouchableOpacity>

        {EXPENSE_CATEGORIES.map((cat) => {
          const selected = categoryFilter === cat.value;
          // Swap cat.icon for lucide-react-native or @expo/vector-icons
          return (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setCategoryFilter(cat.value)}
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: selected ? cat.bg : '#F9F9FB' }}
              activeOpacity={0.7}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: selected ? cat.text : '#71717A' }}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Error banner */}
      {!!error && (
        <View className="mb-4 rounded-xl bg-red-50 p-4">
          <Text className="text-sm text-red-500">{error}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" color="#18181B" />
      </View>
    );
  }

  const renderExpense = ({ item: expense }: { item: PersonalExpense }) => {
    const categoryMeta = getCategoryMeta(expense.category);
    // Swap categoryMeta.icon for lucide-react-native or @expo/vector-icons
    const isDeleting = deletingId === expense.id;

    return (
      <View className="mb-2 flex-row items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5">
        {/* Category icon */}
        <View
          className="size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: categoryMeta.bg }}
        >
          <Text className="text-base">{categoryMeta.label[0]}</Text>
          {/* ↑ Replace with <CategoryIcon size={16} /> once using RN icon lib */}
        </View>

        {/* Title + meta */}
        <View className="min-w-0 flex-1">
          <Text
            className="truncate text-sm font-medium text-zinc-950"
            numberOfLines={1}
          >
            {expense.title}
          </Text>
          <Text className="mt-0.5 text-xs text-zinc-500" numberOfLines={1}>
            {categoryMeta.label} · {formatDate(expense)}
          </Text>
        </View>

        {/* Amount */}
        <Text className="shrink-0 text-sm font-semibold text-zinc-950">
          {formatAmount(expense.amount)}
        </Text>

        {/* Edit */}
        <TouchableOpacity
          className="rounded-lg p-2"
          onPress={() => router.push(`/(app)/expenses/${expense.id}/edit`)}
          activeOpacity={0.7}
        >
          <Edit3 size={14} color="#A1A1AA" />
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          className={`rounded-lg p-2 ${isDeleting ? 'opacity-50' : ''}`}
          onPress={() => handleDelete(expense)}
          disabled={isDeleting}
          activeOpacity={0.7}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Trash2 size={14} color="#A1A1AA" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      className="flex-1 bg-white"
      contentContainerClassName="px-4 py-8"
      data={filteredExpenses}
      keyExtractor={(item) => item.id}
      renderItem={renderExpense}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <View className="items-center rounded-2xl border border-zinc-200 bg-white p-10">
          <Receipt size={24} color="#A1A1AA" />
          <Text className="mb-1 mt-3 text-sm font-medium text-zinc-950">
            {expenses.length === 0
              ? 'No personal expenses yet'
              : 'No matching expenses'}
          </Text>
          <Text className="mb-5 text-center text-sm text-zinc-500">
            {expenses.length === 0
              ? 'Log your first expense to start tracking your spending.'
              : 'Try a different search term.'}
          </Text>
          {expenses.length === 0 && (
            <TouchableOpacity
              className="flex-row items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5"
              onPress={() => router.push('/expenses/new')}
              activeOpacity={0.8}
            >
              <Plus size={15} color="#FAFAFA" />
              <Text className="text-sm font-medium text-zinc-50">
                Add expense
              </Text>
            </TouchableOpacity>
          )}
        </View>
      }
    />
  );
}
