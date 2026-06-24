import { colors } from '@/constants/colors';
import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerBackTitle: 'Groups',
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Groups', headerShown: false }}
      />

      <Stack.Screen
        name="[group_id]"
        options={{
          title: 'Group',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
