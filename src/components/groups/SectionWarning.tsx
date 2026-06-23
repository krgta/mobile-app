import { View, Text } from 'react-native';

export function SectionWarning({ message }: { message: string }) {
  return (
    <View className="mb-5 rounded-2xl border border-[#F3D08A] bg-[#FFF8E7] px-4 py-3">
      <Text className="text-sm text-[#7A4A00]">{message}</Text>
    </View>
  );
}
