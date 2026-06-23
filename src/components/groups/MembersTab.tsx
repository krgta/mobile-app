import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GroupMember } from '@/types';
import { COLORS, formatDate, getInitials } from './group-detail-utils';
import type { UserNameFn } from './group-detail-shared';

export function MembersTab({
  members,
  groupCreatedBy,
  currentUserId,
  isCreator,
  userName,
  onRemoveMember,
  removingMemberId,
  onAddMember,
}: {
  members: GroupMember[];
  groupCreatedBy: string;
  currentUserId?: string;
  isCreator: boolean;
  userName: UserNameFn;
  onRemoveMember: (m: GroupMember) => void;
  removingMemberId: string | null;
  onAddMember: () => void;
}) {
  return (
    <FlatList
      data={members}
      keyExtractor={(m) => m.id}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View className="h-2" />}
      contentContainerStyle={{ paddingBottom: 32 }}
      ListFooterComponent={
        <TouchableOpacity
          className="w-full flex-row items-center justify-center gap-2 py-3 mt-2 rounded-2xl border border-dashed border-[#e8e5e0]"
          onPress={onAddMember}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add-outline" size={15} color="#8b8480" />
          <Text className="text-sm font-medium text-[#8b8480]">Add member</Text>
        </TouchableOpacity>
      }
      renderItem={({ item: member, index }) => {
        const color = COLORS[index % COLORS.length];
        const isCreatorMember = member.user_id === groupCreatedBy;

        return (
          <View className="flex-row items-center gap-3 px-4 py-3.5 rounded-2xl border border-[#e8e5e0] bg-white">
            <View
              className="w-9 h-9 rounded-full items-center justify-center shrink-0"
              style={{ backgroundColor: color.bg }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: color.text }}
              >
                {getInitials(userName(member.user_id))}
              </Text>
            </View>

            <View className="flex-1 min-w-0">
              <Text
                className="text-sm font-medium text-[#1a1816]"
                numberOfLines={1}
              >
                {userName(member.user_id)}
                {member.user_id === currentUserId ? ' (you)' : ''}
              </Text>
              <Text className="text-xs mt-0.5 text-[#8b8480]">
                {isCreatorMember ? 'Admin' : 'Member'} · Joined{' '}
                {formatDate(member.joined_at)}
              </Text>
            </View>

            {isCreator && !isCreatorMember && (
              <TouchableOpacity
                className="p-1.5 rounded-lg shrink-0"
                onPress={() => onRemoveMember(member)}
                disabled={removingMemberId === member.user_id}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {removingMemberId === member.user_id ? (
                  <ActivityIndicator size={14} color="#8b8480" />
                ) : (
                  <Ionicons name="trash-outline" size={14} color="#A32D2D" />
                )}
              </TouchableOpacity>
            )}
          </View>
        );
      }}
    />
  );
}
