import { useAuthStore } from '@/store/auth.store';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isLoggedIn, hasProfile, hasFamilyGroup } = useAuthStore();

  if (!isLoggedIn) return <Redirect href="/(auth)/login" />;
  if (!hasProfile) return <Redirect href="/(onboarding)/user-details" />;
  if (!hasFamilyGroup) return <Redirect href="/(onboarding)/family-setup" />;
  return <Redirect href="/(tabs)/home" />;
}

