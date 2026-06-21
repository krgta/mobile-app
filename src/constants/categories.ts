import type { ComponentProps } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface ExpenseCategory {
  value: string;
  label: string;
  icon: IconName;
  bg: string;
  text: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    value: 'food',
    label: 'Food',
    icon: 'silverware-fork-knife',
    bg: '#FAEEDA',
    text: '#854F0B',
  },
  {
    value: 'travel',
    label: 'Travel',
    icon: 'airplane',
    bg: '#E6F1FB',
    text: '#185FA5',
  },
  {
    value: 'home',
    label: 'Home',
    icon: 'home',
    bg: '#EAF3DE',
    text: '#3B6D11',
  },
  {
    value: 'entertainment',
    label: 'Entertainment',
    icon: 'movie-open',
    bg: '#FBEAF0',
    text: '#993556',
  },
  {
    value: 'utilities',
    label: 'Utilities',
    icon: 'lightbulb-outline',
    bg: '#FEF6E0',
    text: '#8A6C0A',
  },
  {
    value: 'shopping',
    label: 'Shopping',
    icon: 'shopping',
    bg: '#EEEDFE',
    text: '#534AB7',
  },
  {
    value: 'health',
    label: 'Health',
    icon: 'heart-pulse',
    bg: '#E1F5EE',
    text: '#0F6E56',
  },
  {
    value: 'other',
    label: 'Other',
    icon: 'dots-horizontal-circle-outline',
    bg: '#EEEDFE',
    text: '#534AB7',
  },
];

const FALLBACK = EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];

export function getCategoryMeta(category?: string | null): ExpenseCategory {
  if (!category) return FALLBACK;

  return (
    EXPENSE_CATEGORIES.find((c) => c.value === category.toLowerCase()) ??
    FALLBACK
  );
}
