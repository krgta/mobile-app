import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import type { PersonalExpenseCreate } from '@/types';
import { EXPENSE_CATEGORIES } from '@/constants/categories';

export interface ExpenseFormValues {
  title: string;
  amount: string;
  category: string;
  date: string;
  notes: string;
}

interface ExpenseFormProps {
  initialValues?: ExpenseFormValues;
  submitLabel: string;
  onSubmit: (expense: PersonalExpenseCreate) => Promise<void>;
}

const DEFAULT_VALUES: ExpenseFormValues = {
  title: '',
  amount: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

export function ExpenseForm({
  initialValues = DEFAULT_VALUES,
  submitLabel,
  onSubmit,
}: ExpenseFormProps) {
  const [values, setValues] = useState<ExpenseFormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateValue = (field: keyof ExpenseFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    const amount = Number(values.amount);

    if (!values.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError('Enter a title and an amount greater than zero.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSubmit({
        title: values.title.trim(),
        amount,
        category: values.category.trim() || undefined,
        date: values.date
          ? new Date(`${values.date}T00:00:00`).toISOString()
          : undefined,
        notes: values.notes.trim() || undefined,
      });
    } catch {
      setError('Could not save this expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-4 gap-5"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1.5">
        <Text className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Title
        </Text>
        <TextInput
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-950"
          value={values.title}
          onChangeText={(v) => updateValue('title', v)}
          placeholder="Lunch, rent, train ticket..."
          placeholderTextColor="#A1A1AA"
          returnKeyType="next"
        />
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 gap-1.5">
          <Text className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Amount
          </Text>
          <TextInput
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-950"
            value={values.amount}
            onChangeText={(v) => updateValue('amount', v)}
            placeholder="0.00"
            placeholderTextColor="#A1A1AA"
            keyboardType="decimal-pad"
            returnKeyType="next"
          />
        </View>

        <View className="flex-1 gap-1.5">
          <Text className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Date
          </Text>
          
          <TextInput
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-950"
            value={values.date}
            onChangeText={(v) => updateValue('date', v)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A1A1AA"
            keyboardType={
              Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'
            }
          />
        </View>
      </View>

      <View className="gap-1.5">
        <Text className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Category
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const selected = values.category === cat.value;
            // cat.icon is a lucide-react SVG — swap for lucide-react-native
            // or @expo/vector-icons in a real project.
            return (
              <TouchableOpacity
                key={cat.value}
                activeOpacity={0.7}
                onPress={() =>
                  updateValue('category', selected ? '' : cat.value)
                }
                className="rounded-full border px-3 py-1.5"
                style={{
                  backgroundColor: selected ? cat.bg : '#F9F9FB',
                  borderColor: selected ? cat.bg : '#E4E4E7',
                }}
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
        </View>
      </View>

      <View className="gap-1.5">
        <Text className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Notes
        </Text>
        <TextInput
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-950"
          value={values.notes}
          onChangeText={(v) => updateValue('notes', v)}
          placeholder="Optional details"
          placeholderTextColor="#A1A1AA"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 96 }}
        />
      </View>

      {!!error && <Text className="text-sm text-red-500">{error}</Text>}

      <TouchableOpacity
        className={`mt-1 flex-row items-center justify-center gap-2 rounded-xl bg-zinc-950 py-3.5 ${saving ? 'opacity-50' : ''}`}
        onPress={handleSubmit}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving && <ActivityIndicator color="#FAFAFA" size="small" />}
        <Text className="text-sm font-medium text-zinc-50">
          {saving ? 'Saving...' : submitLabel}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
