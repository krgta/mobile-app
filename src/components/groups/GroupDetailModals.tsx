import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Dispatch, SetStateAction } from 'react';
import type { GroupExpense, GroupMember, ExpenseSplit } from '@/types';
import { formatAmount } from './group-detail-utils';
import type { UserNameFn } from './group-detail-shared';

type SplitType = 'equal' | 'exact' | 'percentage';

function ModalShell({
  visible,
  onClose,
  children,
  scrollable = false,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      hardwareAccelerated
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          className="flex-1 items-center justify-center p-4 bg-black/30"
          onPress={onClose}
        >
          <Pressable
            className="w-full max-w-sm rounded-3xl bg-white border border-[#e8e5e0] p-6"
            style={{ elevation: 8 }}
            onPress={(e) => e.stopPropagation()}
          >
            {scrollable ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            ) : (
              children
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function CloseBtn({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#f5f3f0]"
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name="close" size={15} color="#1a1816" />
    </TouchableOpacity>
  );
}

export function AddMemberModal({
  open,
  onClose,
  memberCode,
  setMemberCode,
  onSubmit,
  savingMember,
  memberError,
}: {
  open: boolean;
  onClose: () => void;
  memberCode: string;
  setMemberCode: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
  savingMember: boolean;
  memberError: string;
}) {
  return (
    <ModalShell visible={open} onClose={onClose}>
      <CloseBtn onPress={onClose} />
      <Text className="text-base font-semibold mb-1 text-[#1a1816] pr-8">
        Add member
      </Text>
      <Text className="text-sm mb-4 text-[#8b8480]">
        Enter the person's user code — they can find it in their profile.
      </Text>
      <TextInput
        className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#e8e5e0] bg-[#f5f3f0] text-[#1a1816] mb-3"
        placeholder="e.g. USR-XXXX"
        placeholderTextColor="#8b8480"
        value={memberCode}
        onChangeText={setMemberCode}
        onSubmitEditing={onSubmit}
        returnKeyType="done"
        autoFocus
        autoCapitalize="characters"
      />
      {memberError ? (
        <Text className="text-xs mb-2 text-[#c0392b]">{memberError}</Text>
      ) : null}
      <TouchableOpacity
        className={`w-full py-2.5 rounded-xl flex-row items-center justify-center gap-2 bg-[#2d5a4f] ${
          !memberCode.trim() || savingMember ? 'opacity-50' : 'opacity-100'
        }`}
        onPress={onSubmit}
        disabled={!memberCode.trim() || savingMember}
        activeOpacity={0.8}
      >
        {savingMember ? (
          <ActivityIndicator size={15} color="#fff" />
        ) : (
          <Ionicons name="person-add-outline" size={15} color="#fff" />
        )}
        <Text className="text-sm font-medium text-white">
          {savingMember ? 'Adding…' : 'Add member'}
        </Text>
      </TouchableOpacity>
    </ModalShell>
  );
}

export function ConfirmRemoveMemberModal({
  member,
  memberName,
  onClose,
  onConfirm,
  removing,
}: {
  member: GroupMember | null;
  memberName: string;
  onClose: () => void;
  onConfirm: () => void;
  removing: boolean;
}) {
  return (
    <ModalShell visible={!!member} onClose={removing ? () => {} : onClose}>
      <CloseBtn onPress={onClose} disabled={removing} />

      <View className="mb-4 h-11 w-11 items-center justify-center rounded-2xl bg-[#FEF2F2]">
        <Ionicons name="trash-outline" size={18} color="#A32D2D" />
      </View>

      <Text className="text-base font-semibold mb-1 text-[#1a1816] pr-8">
        Remove member?
      </Text>
      <Text className="text-sm mb-5 text-[#8b8480]">
        {memberName} will lose access to this group. Members with outstanding
        balances may not be removable.
      </Text>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className={`flex-1 rounded-xl border border-[#e8e5e0] bg-white px-4 py-2.5 items-center ${removing ? 'opacity-50' : 'opacity-100'}`}
          onPress={onClose}
          disabled={removing}
          activeOpacity={0.8}
        >
          <Text className="text-sm font-medium text-[#1a1816]">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 rounded-xl px-4 py-2.5 flex-row items-center justify-center gap-2 bg-[#A32D2D] ${removing ? 'opacity-50' : 'opacity-100'}`}
          onPress={onConfirm}
          disabled={removing}
          activeOpacity={0.8}
        >
          {removing ? (
            <ActivityIndicator size={15} color="#fff" />
          ) : (
            <Ionicons name="trash-outline" size={15} color="#fff" />
          )}
          <Text className="text-sm font-medium text-white">
            {removing ? 'Removing...' : 'Remove'}
          </Text>
        </TouchableOpacity>
      </View>
    </ModalShell>
  );
}

export function SettleModal({
  open,
  onClose,
  settleReceiver,
  settleAmount,
  setSettleAmount,
  userName,
  onSubmit,
  savingSettle,
  settleError,
}: {
  open: boolean;
  onClose: () => void;
  settleReceiver: string;
  settleAmount: string;
  setSettleAmount: Dispatch<SetStateAction<string>>;
  userName: UserNameFn;
  onSubmit: () => void;
  savingSettle: boolean;
  settleError: string;
}) {
  return (
    <ModalShell visible={open} onClose={onClose}>
      <CloseBtn onPress={onClose} />
      <Text className="text-base font-semibold mb-1 text-[#1a1816] pr-8">
        Record settlement
      </Text>
      <Text className="text-sm mb-4 text-[#8b8480]">
        Confirm you paid{' '}
        <Text className="font-bold text-[#1a1816]">
          {userName(settleReceiver)}
        </Text>
        .
      </Text>
      <TextInput
        className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#e8e5e0] bg-[#f5f3f0] text-[#1a1816] mb-3"
        value={settleAmount}
        onChangeText={setSettleAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor="#8b8480"
        autoFocus
      />
      {settleError ? (
        <Text className="text-xs mb-2 text-[#c0392b]">{settleError}</Text>
      ) : null}
      <TouchableOpacity
        className={`w-full py-2.5 rounded-xl flex-row items-center justify-center gap-2 bg-[#2d5a4f] ${
          !settleAmount || savingSettle ? 'opacity-50' : 'opacity-100'
        }`}
        onPress={onSubmit}
        disabled={!settleAmount || savingSettle}
        activeOpacity={0.8}
      >
        {savingSettle ? (
          <ActivityIndicator size={15} color="#fff" />
        ) : (
          <Ionicons name="checkmark-circle-outline" size={15} color="#fff" />
        )}
        <Text className="text-sm font-medium text-white">
          {savingSettle ? 'Saving…' : 'Confirm'}
        </Text>
      </TouchableOpacity>
    </ModalShell>
  );
}

export function ExpenseDetailsModal({
  detailExpense,
  detailSplits,
  loadingDetails,
  detailError,
  currentUserId,
  userName,
  onClose,
  onEditExpense,
  canEdit,
}: {
  detailExpense: GroupExpense;
  detailSplits: ExpenseSplit[];
  loadingDetails: boolean;
  detailError: string;
  currentUserId?: string;
  userName: UserNameFn;
  onClose: () => void;
  onEditExpense: () => void;
  canEdit: boolean;
}) {
  return (
    <ModalShell visible={!!detailExpense} onClose={onClose} scrollable>
      <CloseBtn onPress={onClose} />

      <View className="pr-8 mb-5">
        <Text className="text-xs font-semibold uppercase tracking-widest mb-1 text-[#8b8480]">
          Expense details
        </Text>
        <Text className="text-lg font-semibold text-[#1a1816]">
          {detailExpense.title}
        </Text>
        <Text className="text-sm mt-1 text-[#8b8480]">
          Paid by {userName(detailExpense.paid_by)} ·{' '}
          {new Date(detailExpense.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-3 mb-5">
        <View className="rounded-2xl p-4 bg-[#f5f3f0] flex-1">
          <Text className="text-xs mb-1 text-[#8b8480]">Total</Text>
          <Text className="text-base font-semibold text-[#1a1816]">
            {formatAmount(detailExpense.amount)}
          </Text>
        </View>
        <View className="rounded-2xl p-4 bg-[#f5f3f0] flex-1">
          <Text className="text-xs mb-1 text-[#8b8480]">Split</Text>
          <Text className="text-base font-semibold capitalize text-[#1a1816]">
            {detailExpense.split_type}
          </Text>
        </View>
        {detailExpense.category ? (
          <View className="rounded-2xl p-4 bg-[#f5f3f0] w-full">
            <Text className="text-xs mb-1 text-[#8b8480]">Category</Text>
            <Text className="text-base font-semibold text-[#1a1816] capitalize">
              {detailExpense.category}
            </Text>
          </View>
        ) : null}
      </View>

      <Text className="text-xs font-semibold uppercase tracking-widest mb-3 text-[#8b8480]">
        Breakdown
      </Text>

      {loadingDetails ? (
        <View className="h-20 items-center justify-center">
          <ActivityIndicator color="#2d5a4f" />
        </View>
      ) : detailError ? (
        <Text className="text-sm text-[#c0392b]">{detailError}</Text>
      ) : (
        <View className="gap-2">
          {detailSplits.map((split) => (
            <View
              key={split.id}
              className="flex-row items-center justify-between rounded-2xl px-4 py-3 bg-[#f5f3f0]"
            >
              <Text className="text-sm font-medium text-[#1a1816]">
                {userName(split.user_id)}
                {split.user_id === currentUserId ? ' (you)' : ''}
              </Text>
              <Text className="text-sm font-semibold text-[#1a1816]">
                {formatAmount(split.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {canEdit && (
        <TouchableOpacity
          className="mt-5 w-full flex-row items-center justify-center gap-2 rounded-xl py-2.5 bg-[#2d5a4f]"
          onPress={onEditExpense}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={15} color="#fff" />
          <Text className="text-sm font-medium text-white">Edit expense</Text>
        </TouchableOpacity>
      )}
    </ModalShell>
  );
}

export function ExpenseEditorModal({
  open,
  onClose,
  editingExpense,
  expTitle,
  setExpTitle,
  expAmount,
  setExpAmount,
  expSplitType,
  expCategory,
  setExpCategory,
  selectedParticipants,
  setSelectedParticipants,
  splitInputs,
  setSplitInputs,
  splitParticipantIds,
  currentUserId,
  userName,
  onSelectSplitType,
  onFillSplitsEqually,
  onSave,
  expError,
  savingExp,
}: {
  open: boolean;
  onClose: () => void;
  editingExpense: GroupExpense | null;
  expTitle: string;
  setExpTitle: Dispatch<SetStateAction<string>>;
  expAmount: string;
  setExpAmount: Dispatch<SetStateAction<string>>;
  expSplitType: SplitType;
  expCategory: string;
  setExpCategory: Dispatch<SetStateAction<string>>;
  selectedParticipants: string[];
  setSelectedParticipants: Dispatch<SetStateAction<string[]>>;
  splitInputs: Record<string, string>;
  setSplitInputs: Dispatch<SetStateAction<Record<string, string>>>;
  splitParticipantIds: string[];
  currentUserId?: string;
  userName: UserNameFn;
  onSelectSplitType: (t: SplitType) => void;
  onFillSplitsEqually: () => void;
  onSave: () => void;
  expError: string;
  savingExp: boolean;
}) {
  return (
    <ModalShell visible={open} onClose={onClose} scrollable>
      <CloseBtn onPress={onClose} />
      <Text className="text-base font-semibold mb-4 text-[#1a1816] pr-8">
        {editingExpense ? 'Edit expense' : 'Add expense'}
      </Text>

      <TextInput
        className="w-full px-4 py-2.5 rounded-xl text-sm border border-[#e8e5e0] bg-[#f5f3f0] text-[#1a1816] mb-3"
        placeholder="What was it for?"
        placeholderTextColor="#8b8480"
        value={expTitle}
        onChangeText={setExpTitle}
        autoFocus
      />

      <View className="relative mb-3">
        <Text className="absolute left-3 top-2.5 text-sm text-[#8b8480] z-10">
          ₹
        </Text>
        <TextInput
          className="w-full pl-7 pr-4 py-2.5 rounded-xl text-sm border border-[#e8e5e0] bg-[#f5f3f0] text-[#1a1816]"
          placeholder="0.00"
          placeholderTextColor="#8b8480"
          value={expAmount}
          onChangeText={setExpAmount}
          keyboardType="decimal-pad"
        />
      </View>

      <View className="flex-row gap-2 mb-3">
        {(['equal', 'exact', 'percentage'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => onSelectSplitType(t)}
            className={`flex-1 py-1.5 rounded-lg items-center ${
              expSplitType === t ? 'bg-[#2d5a4f]' : 'bg-[#f5f3f0]'
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-medium capitalize ${expSplitType === t ? 'text-white' : 'text-[#8b8480]'}`}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-medium text-[#1a1816] mb-2">
        Participants
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-1">
        {splitParticipantIds.map((userId) => {
          const selected = selectedParticipants.includes(userId);
          return (
            <TouchableOpacity
              key={userId}
              onPress={() =>
                setSelectedParticipants((prev) =>
                  selected
                    ? prev.filter((id) => id !== userId)
                    : [...prev, userId],
                )
              }
              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
                selected
                  ? 'border-[#534AB7] bg-[#EEEDFE]'
                  : 'border-[#e8e5e0] bg-white'
              }`}
              activeOpacity={0.7}
            >
              <Text className="text-sm text-[#1a1816]" numberOfLines={1}>
                {userName(userId)}
              </Text>
              {selected && (
                <Ionicons name="checkmark-circle" size={14} color="#534AB7" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text className="text-xs text-[#8b8480] mb-3">
        {selectedParticipants.length} selected
      </Text>

      {expSplitType !== 'equal' && (
        <View className="rounded-2xl border border-[#e8e5e0] p-3 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold uppercase tracking-widest text-[#8b8480]">
              {expSplitType === 'exact' ? 'Exact amounts' : 'Percentages'}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-medium text-[#8b8480]">
                {expSplitType === 'exact'
                  ? `${formatAmount(Object.values(splitInputs).reduce((s, v) => s + Number(v || 0), 0))} / ${formatAmount(Number(expAmount || 0))}`
                  : `${Object.values(splitInputs)
                      .reduce((s, v) => s + Number(v || 0), 0)
                      .toFixed(2)}% / 100%`}
              </Text>
              <TouchableOpacity
                className="rounded-lg px-2 py-1 bg-[#f5f3f0]"
                onPress={onFillSplitsEqually}
                disabled={selectedParticipants.length === 0}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-medium text-[#1a1816]">
                  Fill equally
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {selectedParticipants.length === 0 ? (
            <View className="rounded-xl px-3 py-2 bg-[#f5f3f0]">
              <Text className="text-xs text-[#8b8480]">
                Select at least one participant.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {selectedParticipants.map((userId) => (
                <View key={userId} className="flex-row items-center gap-3">
                  <Text
                    className="flex-1 text-sm font-medium text-[#1a1816]"
                    numberOfLines={1}
                  >
                    {userName(userId)}
                    {userId === currentUserId ? ' (you)' : ''}
                  </Text>
                  <View className="relative w-28">
                    {expSplitType === 'exact' && (
                      <Text className="absolute left-3 top-2 text-xs text-[#8b8480] z-10">
                        ₹
                      </Text>
                    )}
                    <TextInput
                      className={`w-full rounded-xl border border-[#e8e5e0] py-2 text-right text-sm bg-[#f5f3f0] text-[#1a1816] ${
                        expSplitType === 'exact' ? 'pl-6 pr-3' : 'px-3'
                      }`}
                      keyboardType="decimal-pad"
                      value={splitInputs[userId] ?? ''}
                      onChangeText={(val) =>
                        setSplitInputs((cur) => ({ ...cur, [userId]: val }))
                      }
                    />
                    {expSplitType === 'percentage' && (
                      <Text className="absolute right-3 top-2 text-xs text-[#8b8480]">
                        %
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {expError ? (
        <Text className="text-xs mt-1 mb-2 text-[#c0392b]">{expError}</Text>
      ) : null}

      <TouchableOpacity
        className={`w-full mt-2 py-2.5 rounded-xl flex-row items-center justify-center gap-2 bg-[#2d5a4f] ${
          !expTitle.trim() || !expAmount || savingExp
            ? 'opacity-50'
            : 'opacity-100'
        }`}
        onPress={onSave}
        disabled={!expTitle.trim() || !expAmount || savingExp}
        activeOpacity={0.8}
      >
        {savingExp ? (
          <ActivityIndicator size={15} color="#fff" />
        ) : (
          <Ionicons
            name={editingExpense ? 'checkmark-circle-outline' : 'add'}
            size={15}
            color="#fff"
          />
        )}
        <Text className="text-sm font-medium text-white">
          {savingExp
            ? 'Saving…'
            : editingExpense
              ? 'Save changes'
              : 'Add expense'}
        </Text>
      </TouchableOpacity>
    </ModalShell>
  );
}
