import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const { isLoggedIn, hasProfile } = useAuthStore();

  if (!isLoggedIn) return <Redirect href="/(auth)/welcome" />;
  if (!hasProfile) return <Redirect href="/(onboarding)/user-details" />;
  return <Redirect href="/(tabs)/home" />;
}
