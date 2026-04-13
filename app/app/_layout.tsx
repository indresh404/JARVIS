// app/_layout.tsx
import {
  Delius_400Regular,
} from '@expo-google-fonts/delius';
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { Loader } from '@/components/ui/Loader';
import { getCurrentPatient, getCurrentSession } from '@/services/auth.service';
import { supabase } from '@/services/supabaseClient';
import { useAuthStore } from '@/store/auth.store';

export default function RootLayout() {
  const setSessionState = useAuthStore((state) => state.setSessionState);
  const logout = useAuthStore((state) => state.logout);

  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_300Light,
    Delius_400Regular,
  });

  useEffect(() => {
    let mounted = true;

    const hydrateAuth = async () => {
      try {
        const session = await getCurrentSession();
        if (!mounted) return;

        if (!session || session.user.is_anonymous) {
          logout();
          return;
        }

        const patient = await getCurrentPatient();
        if (!mounted) return;

        setSessionState({
          userId: session.user.id,
          patientId: patient?.id ?? (session.user.user_metadata?.patient_id as string | null) ?? null,
          phoneNumber: (patient?.phone ?? session.user.user_metadata?.phone ?? null) as string | null,
          isLoggedIn: true,
          hasProfile: Boolean(patient),
          hasFamilyGroup: Boolean(patient?.family_id),
        });
      } catch {
        if (mounted) {
          logout();
        }
      }
    };

    hydrateAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session) {
        logout();
        return;
      }

      if (session.user.is_anonymous) {
        logout();
        return;
      }

      setSessionState({
        userId: session.user.id,
        isLoggedIn: true,
      });

      void hydrateAuth();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [logout, setSessionState]);

  if (!loaded) return <Loader text="Loading Swasthya AI..." />;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
