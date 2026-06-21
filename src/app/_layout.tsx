import { useAuthStore } from '@/store/authStore';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const isInitialised = useAuthStore((s) => s.isInitialised);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (!isInitialised) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)/dashboard');
    }
    if (isAuthenticated && inAppGroup) {
      router.replace('/(auth)/login');
    }
  }, [isInitialised, isAuthenticated]);

  if (!isInitialised) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#faf8f5',
        }}
      >
        <ActivityIndicator size="large" color="#2d5a4f" />
      </View>
    );
  }

  return <Slot />;
}
