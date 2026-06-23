import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import {
  getGroup,
  getGroupMembers,
  getGroupExpenses,
  getGroupBalances,
  getGroupDebtBreakdown,
  createGroupExpense,
  updateGroupExpense,
  deleteGroupExpense,
  addGroupMember,
  removeGroupMember,
  getGroupSettlements,
  createSettlement,
  getGroupExpenseWithSplits,
} from '@/services/groups';

import { GroupHeader } from '@/components/groups/GroupHeader';
import { SectionWarning } from '@/components/groups/SectionWarning';
import { BalanceSummary } from '@/components/groups/BalanceSummary';
import { GroupTabs } from '@/components/groups/GroupTabs';
import { ExpensesTab } from '@/components/groups/ExpensesTab';
import { BalancesTab } from '@/components/groups/BalancesTab';
import { SettlementsTab } from '@/components/groups/SettlementsTab';
import { MembersTab } from '@/components/groups/MembersTab';
import {
  AddMemberModal,
  ExpenseDetailsModal,
  ExpenseEditorModal,
  ConfirmRemoveMemberModal,
  SettleModal,
} from '@/components/groups/GroupDetailModals';

import {
  formatAmount,
  splitEvenly,
} from '@/components/groups/group-detail-utils';

import type {
  Group,
  GroupMember,
  GroupExpense,
  GroupBalances,
  GroupDebtBreakdown,
  Settlement,
  ExpenseSplit,
  GroupExpenseCreate,
} from '@/types';

type Tab = 'expenses' | 'balances' | 'settlements' | 'members';
type SplitType = 'equal' | 'exact' | 'percentage';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
function getApiErrorMessage(error: unknown, fallback: string) {
  const response = isRecord(error) ? error.response : undefined;
  const data = isRecord(response) ? response.data : undefined;
  if (isRecord(data)) {
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.message === 'string') return data.message;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id;

  const [tab, setTab] = useState<Tab>('expenses');
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [balances, setBalances] = useState<GroupBalances>({});
  const [debtBreakdown, setDebtBreakdown] = useState<GroupDebtBreakdown | null>(
    null,
  );
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<GroupExpense | null>(
    null,
  );
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expSplitType, setExpSplitType] = useState<SplitType>('equal');
  const [expCategory, setExpCategory] = useState('');
  const [splitInputs, setSplitInputs] = useState<Record<string, string>>({});
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [savingExp, setSavingExp] = useState(false);
  const [expError, setExpError] = useState('');
  const [detailExpense, setDetailExpense] = useState<GroupExpense | null>(null);
  const [detailSplits, setDetailSplits] = useState<ExpenseSplit[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState('');

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberCode, setMemberCode] = useState('');
  const [savingMember, setSavingMember] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(
    null,
  );

  const [showSettle, setShowSettle] = useState(false);
  const [settleReceiver, setSettleReceiver] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [savingSettle, setSavingSettle] = useState(false);
  const [settleError, setSettleError] = useState('');

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    setSectionError(null);
    setBreakdownError(null);
    try {
      const g = await getGroup(groupId);
      setGroup(g);

      const [membersR, expensesR, balancesR, settlementsR, breakdownR] =
        await Promise.allSettled([
          getGroupMembers(groupId),
          getGroupExpenses(groupId),
          getGroupBalances(groupId),
          getGroupSettlements(groupId),
          getGroupDebtBreakdown(groupId),
        ]);

      if (membersR.status === 'fulfilled') setMembers(membersR.value);
      setExpenses(expensesR.status === 'fulfilled' ? expensesR.value : []);
      setBalances(balancesR.status === 'fulfilled' ? balancesR.value : {});
      setSettlements(
        settlementsR.status === 'fulfilled' ? settlementsR.value : [],
      );
      setDebtBreakdown(
        breakdownR.status === 'fulfilled' ? breakdownR.value : null,
      );

      const detailErrors = [
        membersR.status === 'rejected'
          ? getApiErrorMessage(membersR.reason, 'Members could not be loaded.')
          : null,
        expensesR.status === 'rejected'
          ? getApiErrorMessage(
              expensesR.reason,
              'Expenses could not be loaded.',
            )
          : null,
        balancesR.status === 'rejected'
          ? getApiErrorMessage(
              balancesR.reason,
              'Balances could not be loaded.',
            )
          : null,
        settlementsR.status === 'rejected'
          ? getApiErrorMessage(
              settlementsR.reason,
              'Settlements could not be loaded.',
            )
          : null,
      ].filter(Boolean);

      if (detailErrors.length > 0) setSectionError(detailErrors.join(' '));
      if (breakdownR.status === 'rejected')
        setBreakdownError(
          getApiErrorMessage(
            breakdownR.reason,
            'Expense breakdown could not be loaded.',
          ),
        );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load group.'));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    const id = setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);

  const resetExpenseForm = () => {
    setEditingExpense(null);
    setExpTitle('');
    setExpAmount('');
    setExpSplitType('equal');
    setSelectedParticipants([]);
    setExpCategory('');
    setSplitInputs({});
    setExpError('');
  };

  const splitParticipantIds = (() => {
    const ids = new Set<string>();
    members.forEach((m) => ids.add(m.user_id));
    if (currentUserId) ids.add(currentUserId);
    Object.keys(balances).forEach((id) => ids.add(id));
    expenses.forEach((e) => ids.add(e.paid_by));
    settlements.forEach((s) => {
      ids.add(s.payer_id);
      ids.add(s.receiver_id);
    });
    return [...ids];
  })();

  const openAddExpense = () => {
    resetExpenseForm();
    setSelectedParticipants(splitParticipantIds);
    setShowExpenseModal(true);
  };

  const memberNames = useMemo(
    () =>
      Object.fromEntries(
        members.map((m) => [
          m.user_id,
          m.name?.trim() || m.user_id.slice(0, 8),
        ]),
      ),
    [members],
  );

  const userName = (id: string) => {
    if (id === currentUserId) return currentUser?.name ?? id.slice(0, 8);
    return memberNames[id] ?? id.slice(0, 8);
  };

  const payableDebts = (() => {
    if (!currentUserId || !debtBreakdown?.simplified?.[currentUserId])
      return {};
    return Object.fromEntries(
      Object.entries(debtBreakdown.simplified[currentUserId])
        .map(([uid, amt]): [string, number] => [uid, Number(amt)])
        .filter(([, amt]) => Number.isFinite(amt) && amt > 0.01),
    );
  })();

  const refreshBalances = async () => {
    try {
      setBalances(await getGroupBalances(groupId));
    } catch {
      setSectionError('Balances could not be refreshed.');
    }
  };
  const refreshBreakdown = async () => {
    try {
      setBreakdownError(null);
      setDebtBreakdown(await getGroupDebtBreakdown(groupId));
    } catch {
      setBreakdownError('Breakdown could not be refreshed.');
    }
  };

  const buildExpensePayload = (): GroupExpenseCreate | null => {
    const amount = parseFloat(expAmount);
    if (!expTitle.trim() || !Number.isFinite(amount) || amount <= 0) {
      setExpError('Enter a title and an amount greater than zero.');
      return null;
    }
    const payload: GroupExpenseCreate = {
      title: expTitle.trim(),
      amount,
      split_type: expSplitType,
      category: expCategory || undefined,
    };
    if (selectedParticipants.length === 0) {
      setExpError('Add group members before saving an expense.');
      return null;
    }
    if (expSplitType === 'equal') {
      payload.participant_ids = selectedParticipants;
      return payload;
    }

    const splits = Object.fromEntries(
      selectedParticipants.map((uid) => [uid, Number(splitInputs[uid] || 0)]),
    );
    if (Object.values(splits).some((v) => !Number.isFinite(v) || v < 0)) {
      setExpError('Split values must be zero or greater.');
      return null;
    }
    const total = Object.values(splits).reduce((s, v) => s + v, 0);
    const expected = expSplitType === 'exact' ? amount : 100;
    if (Math.abs(total - expected) > 0.01) {
      setExpError(
        expSplitType === 'exact'
          ? `Exact splits must add up to ${formatAmount(amount)}.`
          : 'Percentages must add up to 100%.',
      );
      return null;
    }
    payload.splits_input = splits;
    return payload;
  };

  const handleSaveExpense = async () => {
    const payload = buildExpensePayload();
    if (!payload) return;
    setSavingExp(true);
    setExpError('');
    try {
      if (editingExpense) {
        const updated = await updateGroupExpense(
          groupId,
          editingExpense.id,
          payload,
        );
        setExpenses((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e)),
        );
        if (detailExpense?.id === updated.id) await handleViewExpense(updated);
      } else {
        const created = await createGroupExpense(groupId, payload);
        setExpenses((prev) => [created, ...prev]);
      }
      setShowExpenseModal(false);
      resetExpenseForm();
      await Promise.all([refreshBalances(), refreshBreakdown()]);
    } catch {
      setExpError('Could not save expense. Check details and try again.');
    } finally {
      setSavingExp(false);
    }
  };

  const handleViewExpense = async (expense: GroupExpense) => {
    setDetailExpense(expense);
    setDetailSplits([]);
    setDetailError('');
    setLoadingDetails(true);
    try {
      const details = await getGroupExpenseWithSplits(groupId, expense.id);
      setDetailExpense(details.expense);
      setDetailSplits(details.splits);
    } catch {
      setDetailError('Could not load split details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditExpense = async (expense: GroupExpense) => {
    setEditingExpense(expense);
    setExpTitle(expense.title);
    setExpAmount(String(expense.amount));
    setExpSplitType(expense.split_type);
    setExpCategory(expense.category ?? '');
    setExpError('');
    setSplitInputs({});
    setShowExpenseModal(true);
    try {
      const details = await getGroupExpenseWithSplits(groupId, expense.id);
      setSelectedParticipants(details.splits.map((s) => s.user_id));
      const amount = Number(details.expense.amount);
      setSplitInputs(
        Object.fromEntries(
          details.splits.map((s) => [
            s.user_id,
            expense.split_type === 'percentage' && amount > 0
              ? ((Number(s.amount) / amount) * 100).toFixed(2)
              : String(s.amount),
          ]),
        ),
      );
    } catch {
      setExpError(
        'Could not load existing splits. You can still save a new split.',
      );
    }
  };

  const handleDeleteExpense = async (expId: string) => {
    try {
      await deleteGroupExpense(groupId, expId);
      setExpenses((prev) => prev.filter((e) => e.id !== expId));
      await Promise.all([refreshBalances(), refreshBreakdown()]);
    } catch {}
  };

  const handleAddMember = async () => {
    if (!memberCode.trim()) return;
    setSavingMember(true);
    setMemberError('');
    try {
      const m = await addGroupMember(groupId, memberCode.trim());
      setMembers((prev) => [...prev, m]);
      setShowAddMember(false);
      setMemberCode('');
      await refreshBreakdown();
    } catch {
      setMemberError('Could not add member. Check the user code.');
    } finally {
      setSavingMember(false);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    const member = memberToRemove;
    setRemovingMemberId(member.user_id);
    try {
      await removeGroupMember(groupId, member.user_id);
      setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
      setMemberToRemove(null);
      await Promise.all([refreshBalances(), refreshBreakdown()]);
    } catch {
      setSectionError(
        'Could not remove that member — they may have an outstanding balance.',
      );
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleSettle = async () => {
    if (!settleReceiver || !settleAmount) return;
    setSavingSettle(true);
    setSettleError('');
    try {
      await createSettlement(groupId, {
        receiver_id: settleReceiver,
        amount: parseFloat(settleAmount),
      });
      const [set, bal] = await Promise.all([
        getGroupSettlements(groupId),
        getGroupBalances(groupId),
      ]);
      setSettlements(set);
      setBalances(bal);
      await refreshBreakdown();
      setShowSettle(false);
      setSettleReceiver('');
      setSettleAmount('');
    } catch {
      setSettleError('Could not record settlement.');
    } finally {
      setSavingSettle(false);
    }
  };

  const openSettle = (userId: string, amount: number) => {
    setSettleReceiver(userId);
    setSettleAmount(amount.toFixed(2));
    setShowSettle(true);
  };

  const fillSplitsEqually = () => {
    if (selectedParticipants.length === 0) return;
    const values = splitEvenly(
      expSplitType === 'exact' ? Number(expAmount || 0) : 100,
      selectedParticipants.length,
    );
    setSplitInputs(
      Object.fromEntries(
        selectedParticipants.map((uid, i) => [uid, values[i] ?? '0.00']),
      ),
    );
  };

  const isCreator = group?.created_by === currentUserId;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#faf8f5]">
        <ActivityIndicator size="large" color="#2d5a4f" />
      </View>
    );
  }

  if (error || !group) {
    return (
      <View className="flex-1 bg-[#faf8f5] px-4 py-8">
        <Text className="text-sm text-[#c0392b]">
          {error ?? 'Group not found.'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#faf8f5]">
      <View className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        <GroupHeader
          group={group}
          membersCount={members.length}
          expensesCount={expenses.length}
          onAddMember={() => setShowAddMember(true)}
          onAddExpense={openAddExpense}
        />

        {sectionError && <SectionWarning message={sectionError} />}

        <BalanceSummary
          balances={balances}
          currentUserId={currentUserId}
          payableDebts={payableDebts}
          userName={userName}
          onSettle={openSettle}
        />

        <GroupTabs tab={tab} onChange={setTab} />

        <View className="flex-1">
          {tab === 'expenses' && (
            <ExpensesTab
              expenses={expenses}
              currentUserId={currentUserId}
              isCreator={isCreator}
              userName={userName}
              onViewExpense={handleViewExpense}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}
          {tab === 'balances' && (
            <BalancesTab
              balances={balances}
              currentUserId={currentUserId}
              payableDebts={payableDebts}
              members={members}
              userName={userName}
              onSettle={openSettle}
            />
          )}
          {tab === 'settlements' && (
            <SettlementsTab
              settlements={settlements}
              debtBreakdown={debtBreakdown}
              breakdownError={breakdownError}
              userName={userName}
              onReloadBreakdown={refreshBreakdown}
            />
          )}
          {tab === 'members' && (
            <MembersTab
              members={members}
              groupCreatedBy={group.created_by}
              currentUserId={currentUserId}
              isCreator={isCreator}
              userName={userName}
              onRemoveMember={(m) => setMemberToRemove(m)}
              removingMemberId={removingMemberId}
              onAddMember={() => setShowAddMember(true)}
            />
          )}
        </View>
      </View>

      {detailExpense && (
        <ExpenseDetailsModal
          detailExpense={detailExpense}
          detailSplits={detailSplits}
          loadingDetails={loadingDetails}
          detailError={detailError}
          currentUserId={currentUserId}
          userName={userName}
          onClose={() => setDetailExpense(null)}
          onEditExpense={() => void handleEditExpense(detailExpense)}
          canEdit={detailExpense.paid_by === currentUserId}
        />
      )}

      <ExpenseEditorModal
        open={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        editingExpense={editingExpense}
        expTitle={expTitle}
        setExpTitle={setExpTitle}
        expAmount={expAmount}
        setExpAmount={setExpAmount}
        expSplitType={expSplitType}
        expCategory={expCategory}
        setExpCategory={setExpCategory}
        selectedParticipants={selectedParticipants}
        setSelectedParticipants={setSelectedParticipants}
        splitInputs={splitInputs}
        setSplitInputs={setSplitInputs}
        splitParticipantIds={splitParticipantIds}
        currentUserId={currentUserId}
        userName={userName}
        onSelectSplitType={(t) => {
          setExpSplitType(t);
          setExpError('');
        }}
        onFillSplitsEqually={fillSplitsEqually}
        onSave={handleSaveExpense}
        expError={expError}
        savingExp={savingExp}
      />

      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        memberCode={memberCode}
        setMemberCode={setMemberCode}
        onSubmit={handleAddMember}
        savingMember={savingMember}
        memberError={memberError}
      />

      <ConfirmRemoveMemberModal
        member={memberToRemove}
        memberName={memberToRemove ? userName(memberToRemove.user_id) : ''}
        onClose={() => setMemberToRemove(null)}
        onConfirm={confirmRemoveMember}
        removing={Boolean(
          memberToRemove && removingMemberId === memberToRemove.user_id,
        )}
      />

      <SettleModal
        open={showSettle}
        onClose={() => setShowSettle(false)}
        settleReceiver={settleReceiver}
        settleAmount={settleAmount}
        setSettleAmount={setSettleAmount}
        userName={userName}
        onSubmit={handleSettle}
        savingSettle={savingSettle}
        settleError={settleError}
      />
    </SafeAreaView>
  );
}
