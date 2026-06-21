import { updateCurrentUser } from '@/services/users';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types/user';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  return (
    <ProfileEditor
      key={user.id}
      user={user}
      setUser={setUser}
      onLogout={logout}
    />
  );
}

function ProfileEditor({
  user,
  setUser,
  onLogout,
}: {
  user: User;
  setUser: (user: User) => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [profilePicture, setProfilePicture] = useState(
    user.profile_picture ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [picFocused, setPicFocused] = useState(false);

  const displayName = name || user.name;

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updatedUser = await updateCurrentUser({
        name: name.trim(),
        profile_picture: profilePicture.trim() || null,
      });
      setUser(updatedUser);
      setMessage('Profile updated.');
    } catch {
      setError('Could not update your profile.');
    } finally {
      setSaving(false);
    }
  }

  async function copyCode() {
    await Clipboard.setStringAsync(user.user_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: handleLogout },
    ]);
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.pageHeader}>
        <Text style={styles.pageLabel}>Account</Text>
        <Text style={styles.pageTitle}>Profile</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.avatarRow}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              {displayName ? (
                <Text style={styles.avatarInitials}>
                  {getInitials(displayName)}
                </Text>
              ) : (
                <Text style={{ fontSize: 22, color: colors.accentPrimary }}>
                  👤
                </Text>
              )}
            </View>
          )}
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.avatarEmail}>{user.email}</Text>
            <Text style={styles.avatarProvider}>
              {user.auth_provider} account
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Your user code</Text>
        <Text style={styles.sectionSubtitle}>
          Share this code when someone wants to add you to a group.
        </Text>
        <TouchableOpacity
          style={styles.codeRow}
          onPress={copyCode}
          activeOpacity={0.7}
        >
          <Text style={styles.codeText}>{user.user_code}</Text>
          <Text>
            {copied ? (
              <Ionicons
                name="checkmark"
                size={18}
                color={colors.accentPrimary}
              />
            ) : (
              <Ionicons name="copy" size={18} color={colors.accentPrimary} />
            )}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.formTitle}>Edit Profile</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={[styles.input, nameFocused && styles.inputFocused]}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Profile picture URL</Text>
          <TextInput
            style={[styles.input, picFocused && styles.inputFocused]}
            value={profilePicture}
            onChangeText={setProfilePicture}
            placeholder="https://..."
            placeholderTextColor={colors.textMuted}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setPicFocused(true)}
            onBlur={() => setPicFocused(false)}
          />
        </View>
        {message ? <Text style={styles.successMessage}>{message}</Text> : null}

        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

        <TouchableOpacity
          style={[
            styles.saveButton,
            (saving || !name.trim()) && styles.saveButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={saving || !name.trim()}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save changes</Text>
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    maxWidth: 672,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },

  pageHeader: {
    marginBottom: 4,
  },

  pageLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: 4,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  avatarInitials: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accentPrimary,
  },

  avatarInfo: {
    flex: 1,
    minWidth: 0,
  },

  avatarName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  avatarEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },

  avatarProvider: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: 'capitalize',
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },

  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  codeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },

  formTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 20,
  },

  fieldGroup: {
    marginBottom: 16,
  },

  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: 8,
  },

  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },

  inputFocused: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.white,
  },

  successMessage: {
    fontSize: 14,
    color: colors.accentPrimary,
    marginBottom: 16,
  },

  errorMessage: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 16,
  },

  saveButton: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  saveButtonDisabled: {
    opacity: 0.5,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },

  logoutButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(192, 57, 43, 0.3)',
    paddingVertical: 12,
    marginTop: 8,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.error,
  },
});
