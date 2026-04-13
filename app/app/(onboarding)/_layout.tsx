// app/(onboarding)/_layout.tsx
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen name="chat" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="family-setup" />
      <Stack.Screen name="user-details" />
    </Stack>
  );
}