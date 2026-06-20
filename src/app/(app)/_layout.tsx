import { useAuthStore } from '@/store/authStore';
import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  return <Slot />;
}
