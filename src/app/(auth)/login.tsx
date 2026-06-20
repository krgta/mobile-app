import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      setError('Please enter email and password.');
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(app)/dashboard');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Invalid email or password.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome back!</Text>
              <Text style={styles.subtitle}>
                Enter your credentials to continue
              </Text>
            </View>
            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
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
            </View>
            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                >
                  <Text style={styles.forgotPassword}>Forgot Password</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    passwordFocused && styles.inputFocused,
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Signing In...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Log in</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google button placeholder */}
            <TouchableOpacity style={styles.googleButton} disabled={true}>
              <Text style={styles.googleButtonText}>
                🔵 Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Footer link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apost have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
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
    padding: 20,
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

  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },

  fieldGroup: {
    gap: 8,
    marginBottom: 20,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  forgotPassword: {
    fontSize: 12,
    color: colors.accentPrimary,
  },

  input: {
    height: 48,
    backgroundColor: 'rgba(245, 243, 240, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(232, 229, 224, 0.6)',
    borderRadius: 999,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.textPrimary,
  },

  inputFocused: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.white,
  },

  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },

  passwordInput: {
    paddingRight: 48,
  },

  eyeButton: {
    position: 'absolute',
    right: 14,
  },

  errorBox: {
    padding: 12,
    backgroundColor: 'rgba(127, 29, 29, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
  },

  errorText: {
    fontSize: 14,
    color: '#f87171',
  },

  submitButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.accentPrimary,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButtonDisabled: {
    opacity: 0.5,
  },

  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 8,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(232, 229, 224, 0.4)',
  },

  dividerText: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },

  googleButton: {
    width: '100%',
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  googleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },

  footerText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  footerLink: {
    fontSize: 14,
    color: colors.accentPrimary,
    fontWeight: '600',
  },
});
