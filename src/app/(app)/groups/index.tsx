import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getGroups, createGroup } from '@/services/groups';
import type { Group } from '@/types';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const GROUP_COLORS = [
  { bg: '#EEEDFE', text: '#534AB7' },
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#FAECE7', text: '#993C1D' },
  { bg: '#FBEAF0', text: '#993556' },
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#FEF9E7', text: '#8A6C0A' },
];

export default function GroupsScreen() {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [nameFocused, setNameFocused] = useState(false);

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .catch(() => setError('Failed to load groups.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const group = await createGroup(newName.trim());
      setGroups((prev) => [group, ...prev]);
      setShowCreate(false);
      setNewName('');
      router.push(`/(app)/groups/${group.id}`);
    } catch {
      setCreateError('Could not create group. Try again.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <View className="flex-1 bg-[#faf8f5]">
      <View className="max-w-2xl w-full mx-auto px-4 py-8">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-widest mb-1 text-[#8b8480]">
              Your spaces
            </Text>
            <Text className="text-2xl font-medium text-[#1a1816]">Groups</Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 rounded-xl bg-[#2d5a4f]"
            onPress={() => setShowCreate(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={15} color="#fff" />
            <Text className="text-sm font-medium text-white">New group</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View className="gap-3">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="h-16 rounded-2xl bg-[#f5f3f0] opacity-60"
              />
            ))}
          </View>
        )}

        {error && !loading && (
          <View className="rounded-xl p-4 bg-[#FEF2F2]">
            <Text className="text-sm text-[#B91C1C]">{error}</Text>
          </View>
        )}

        {!loading && !error && groups.length === 0 && (
          <View className="rounded-2xl p-10 items-center border border-[#e8e5e0] bg-white">
            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-4 bg-[#e8dcc8]">
              <Ionicons name="people-outline" size={24} color="#2d5a4f" />
            </View>

            <Text className="font-medium mb-1 text-[#1a1816]">
              No groups yet
            </Text>
            <Text className="text-sm mb-5 text-[#8b8480] text-center">
              Create a group to start splitting expenses with people you share
              costs with.
            </Text>

            <TouchableOpacity
              className="flex-row items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2d5a4f]"
              onPress={() => setShowCreate(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={15} color="#fff" />
              <Text className="text-sm font-medium text-white">
                Create your first group
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && groups.length > 0 && (
          <FlatList
            data={groups}
            keyExtractor={(g) => g.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={({ item: g, index: i }) => {
              const color = GROUP_COLORS[i % GROUP_COLORS.length];
              return (
                <TouchableOpacity
                  className="flex-row items-center gap-4 px-4 py-3.5 rounded-2xl border border-[#e8e5e0] bg-white"
                  onPress={() => router.push(`/(app)/groups/${g.id}`)}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color.bg }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: color.text }}
                    >
                      {getInitials(g.name)}
                    </Text>
                  </View>

                  <View className="flex-1 min-w-0">
                    <Text
                      className="font-medium text-sm text-[#1a1816]"
                      numberOfLines={1}
                    >
                      {g.name}
                    </Text>
                    <Text className="text-xs mt-0.5 text-[#8b8480]">
                      Created {formatDate(g.created_at)}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color="#8b8480" />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      <Modal
        visible={showCreate}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreate(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <Pressable
            className="flex-1 items-center justify-center p-4 bg-black/30"
            onPress={() => setShowCreate(false)}
          >
            <Pressable
              className="w-full max-w-sm rounded-3xl p-6 bg-white border border-[#e8e5e0]"
              style={{ elevation: 8 }}
              onPress={(e) => e.stopPropagation()}
            >
              <TouchableOpacity
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#f5f3f0]"
                onPress={() => {
                  setShowCreate(false);
                }}
              >
                <Ionicons name="close" size={15} color="#1a1816" />
              </TouchableOpacity>

              <Text className="text-base font-semibold mb-1 text-[#1a1816]">
                New group
              </Text>

              <Text className="text-sm mb-5 text-[#8b8480]">
                Give your group a name — trip, flat, team, whatever fits.
              </Text>

              <TextInput
                className={`w-full px-4 py-2.5 rounded-xl text-sm border mb-3 bg-[#f5f3f0] text-[#1a1816] ${
                  nameFocused ? 'border-[#2d5a4f]' : 'border-[#e8e5e0]'
                }`}
                placeholder="e.g. Goa Trip 2025"
                placeholderTextColor="#8b8480"
                value={newName}
                onChangeText={setNewName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                onSubmitEditing={handleCreate}
                returnKeyType="done"
                autoFocus
              />

              {createError ? (
                <Text className="text-xs mb-3 text-[#c0392b]">
                  {createError}
                </Text>
              ) : null}

              <TouchableOpacity
                className={`w-full py-2.5 rounded-xl flex-row items-center justify-center gap-2 bg-[#2d5a4f] ${
                  !newName.trim() || creating ? 'opacity-50' : 'opacity-100'
                }`}
                onPress={handleCreate}
                disabled={!newName.trim() || creating}
                activeOpacity={0.8}
              >
                {creating ? (
                  <ActivityIndicator size={15} color="#fff" />
                ) : (
                  <Ionicons name="add" size={15} color="#fff" />
                )}
                <Text className="text-sm font-medium text-white">
                  {creating ? 'Creating…' : 'Create group'}
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
