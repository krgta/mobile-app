import { useAuthStore } from '@/store/authStore';
import { Slot } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, []);
  return <Slot />;
}
