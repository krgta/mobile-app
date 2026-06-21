import { api } from '@/lib/api';
import type {
      ApiResponse,
      PersonalExpense,
      PersonalExpenseCreate,
      PersonalExpenseUpdate,
} from '@/types';

export async function getPersonalExpenses(): Promise<PersonalExpense[]> {
  const response = await api.get<ApiResponse<PersonalExpense[]>>('/expenses/');
  return response.data.data;
}

export async function getPersonalExpense(
  expenseId: string,
): Promise<PersonalExpense> {
  const response = await api.get<ApiResponse<PersonalExpense>>(
    `/expenses/${expenseId}`,
  );
  return response.data.data;
}

export async function createPersonalExpense(
  expense: PersonalExpenseCreate,
): Promise<PersonalExpense> {
  const response = await api.post<ApiResponse<PersonalExpense>>(
    '/expenses/',
    expense,
  );
  return response.data.data;
}

export async function updatePersonalExpense(
  expenseId: string,
  expense: PersonalExpenseUpdate,
): Promise<PersonalExpense> {
  const response = await api.put<ApiResponse<PersonalExpense>>(
    `/expenses/${expenseId}`,
    expense,
  );
  return response.data.data;
}

export async function deletePersonalExpense(expenseId: string): Promise<void> {
  await api.delete(`/expenses/${expenseId}`);
}
