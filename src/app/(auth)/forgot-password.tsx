import { colors } from '@/constants/colors';
import { requestPasswordReset } from '@/services/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const [emailFocused, setEmailFocused] = useState(false);

  async function handleSubmit() {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch {
      setError(
        'Could not send a reset email. Check the address and try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {sent ? (
              <View style={styles.successContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons
                    name="email-check"
                    size={24}
                    color="black"
                  />
                </View>
                <Text style={styles.successTitle}>Check your email</Text>
                <Text style={styles.successSubtitle}>
                  We sent password reset instructions to{' '}
                  <Text style={styles.emailHighlight}>{email}</Text>.
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <Text style={styles.returnLink}>Return to login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={20}
                    color="black"
                  />
                  <Text style={styles.backText}>Back to login</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  Enter your email and we will send you a reset link.
                </Text>

                {/* Email */}
                <TextInput
                  style={[styles.input, emailFocused && styles.inputFocused]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />

                {/* Error */}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Submit button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    saving && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.submitButtonText}>Send reset link</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },

  container: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(232, 229, 224, 0.4)',
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },

  successContainer: {
    alignItems: 'center',
  },

  iconWrapper: {
    marginBottom: 16,
  },

  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },

  successSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },

  emailHighlight: {
    fontWeight: '600',
    color: colors.textPrimary,
  },

  returnLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentPrimary,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },

  backText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },

  input: {
    height: 48,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(245, 243, 240, 0.5)',
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 16,
  },

  inputFocused: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.white,
  },

  errorText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 12,
  },

  submitButton: {
    height: 48,
    width: '100%',
    borderRadius: 12,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  submitButtonDisabled: {
    opacity: 0.5,
  },

  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
});
