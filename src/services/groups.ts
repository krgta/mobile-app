import { api } from '@/lib/api';
import {
      ApiResponse,
      ExpenseSplit,
      Group,
      GroupBalances,
      GroupDebtBreakdown,
      GroupExpense,
      GroupExpenseCreate,
      GroupExpenseUpdate,
      GroupMember,
      Settlement,
      SettlementCreate,
} from '@/types';

export async function getGroups(): Promise<Group[]> {
  const response = await api.get<ApiResponse<Group[]>>('/groups/');
  return response.data.data;
}

export async function getGroup(groupId: string): Promise<Group> {
  const response = await api.get<ApiResponse<Group>>(`/groups/${groupId}`);
  return response.data.data;
}

export async function createGroup(name: string): Promise<Group> {
  const response = await api.post<ApiResponse<Group>>('/groups/', { name });
  return response.data.data;
}

export async function updateGroup(
  groupId: string,
  name: string,
): Promise<Group> {
  const response = await api.put<ApiResponse<Group>>('/groups/', {
    groupId,
    name,
  });
  return response.data.data;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await api.delete(`/groups/${groupId}`);
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const response = await api.get<ApiResponse<GroupMember[]>>(
    `/groups/${groupId}/members`,
  );
  return response.data.data;
}

export async function addGroupMember(
  groupId: string,
  userCode: string,
): Promise<GroupMember> {
  const response = await api.post<ApiResponse<GroupMember>>(
    `/groups/${groupId}/members`,
    { userCode },
  );
  return response.data.data;
}

export async function removeGroupMember(
  groupId: string,
  userId: string,
): Promise<void> {
  await api.delete(`/groups/${groupId}/members/${userId}`);
}

export async function getGroupExpenses(
  groupId: string,
): Promise<GroupExpense[]> {
  const response = await api.get<ApiResponse<GroupExpense[]>>(
    `/groups/${groupId}/expenses`,
  );
  return response.data.data;
}

export async function createGroupExpenses(
  groupId: string,
  expenseData: GroupExpenseCreate,
): Promise<GroupExpense> {
  const response = await api.post<ApiResponse<GroupExpense>>(
    `/groups/${groupId}/expenses`,
    { expenseData },
  );
  return response.data.data;
}

export async function updateGroupExpenses(
  groupId: string,
  expenseId: string,
  expenseData: GroupExpenseUpdate,
): Promise<GroupExpense> {
  const response = await api.put<ApiResponse<GroupExpense>>(
    `/groups/${groupId}/expenses/${expenseId}`,
    { expenseData },
  );
  return response.data.data;
}

export async function deleteGroupExpenses(
  groupId: string,
  expenseId: string,
): Promise<void> {
  await api.delete(`/groups/${groupId}/expenses/${expenseId}`);
}

export async function getGroupExpenseWithSplits(
  groupId: string,
  expenseId: string,
): Promise<{ expense: GroupExpense; splits: ExpenseSplit[] }> {
  const response = await api.get<
    ApiResponse<{ expense: GroupExpense; splits: ExpenseSplit[] }>
  >(`/groups/${groupId}/expenses/${expenseId}`);
  return response.data.data;
}

export async function getGroupBalances(
  groupId: string,
): Promise<GroupBalances> {
  const response = await api.get<ApiResponse<GroupBalances>>(
    `/groups/${groupId}/balances`,
  );
  return response.data.data;
}

export async function getUserBalanceInGroup(
  groupId: string,
  userId: string,
): Promise<GroupBalances> {
  const response = await api.get<ApiResponse<GroupBalances>>(
    `/groups/${groupId}/balances/${userId}`,
  );
  return response.data.data;
}

export async function getGroupDebtBreakdown(
  groupId: string,
): Promise<GroupDebtBreakdown> {
  const response = await api.get<ApiResponse<GroupDebtBreakdown>>(
    `/groups/${groupId}/debt-breakdown`,
  );
  return response.data.data;
}

export async function getGroupSettlements(
  groupId: string,
): Promise<Settlement[]> {
  const response = await api.get(`/groups/${groupId}/settlements`);
  const payload = response.data.data ?? response.data;
  return payload?.settlements ?? [];
}

export async function createSettlement(
  groupId: string,
  data: SettlementCreate,
): Promise<Settlement> {
  const response = await api.post<ApiResponse<Settlement>>(
    `/groups/${groupId}/settlements`,
    null,
    { params: { receiver_id: data.receiver_id, amount: data.amount } },
  );
  return response.data.data;
}
