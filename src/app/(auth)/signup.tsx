import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setIsLoading(true);
    try {
      await signup(name, email, password);
      router.push('/(app)/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Someting went wrong.');
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
        <View style={styles.card}>
          <Text style={styles.title}>Create an acoount</Text>
          <Text style={styles.subtitle}>Join us and get started today</Text>

          {/* Name field */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoComplete="off"
            autoCapitalize="words"
          />

          {/* Email Field */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Field */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Footer link */}
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.link}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#faf8f5',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1a1816',
  },

  subtitle: {
    fontSize: 14,
    color: '#8b8480',
    marginBottom: 28,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1816',
    marginBottom: 6,
    marginTop: 14,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e8e5e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1a1816',
    backgroundColor: '#f5f3f0',
  },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  eyeBtn: {
    padding: 8,
  },

  error: {
    color: '#c0392b',
    fontSize: 13,
    marginTop: 8,
  },

  btn: {
    backgroundColor: '#2d5a4f',
    borderRadius: 999,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  btnDisabled: {
    opacity: 0.5,
  },

  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8b8480',
    marginTop: 24,
  },

  link: {
    color: '#2d5a4f',
    fontWeight: '700',
  },
});
