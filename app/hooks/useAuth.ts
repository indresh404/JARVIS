import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { auth } from '../config/firebase';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const nativeClientId = useMemo(() => {
    if (Platform.OS === 'android') {
      return GOOGLE_ANDROID_CLIENT_ID;
    }

    if (Platform.OS === 'ios') {
      return GOOGLE_IOS_CLIENT_ID;
    }

    return GOOGLE_WEB_CLIENT_ID;
  }, []);

  const googleClientId = useMemo(() => {
    if (Platform.OS === 'android') {
      return GOOGLE_ANDROID_CLIENT_ID;
    }

    if (Platform.OS === 'ios') {
      return GOOGLE_IOS_CLIENT_ID;
    }

    return GOOGLE_WEB_CLIENT_ID;
  }, []);

  const [request, , promptAsync] = Google.useAuthRequest({
    clientId: googleClientId,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!nativeClientId) {
      const error =
        Platform.OS === 'web'
          ? 'Missing Google web client ID configuration.'
          : `Missing Google ${Platform.OS} client ID. Add EXPO_PUBLIC_GOOGLE_${Platform.OS.toUpperCase()}_CLIENT_ID to your .env.`;
      Alert.alert('Google Sign-In Unavailable', error);
      return { success: false, error };
    }

    if (!request) {
      const error = 'Google Sign-In is still preparing. Please try again.';
      Alert.alert('Please wait', error);
      return { success: false, error };
    }

    try {
      setGoogleLoading(true);

      const result = await promptAsync();

      if (result.type !== 'success') {
        if (result.type !== 'dismiss' && result.type !== 'cancel') {
          Alert.alert('Google Sign-In Failed', 'Unable to complete Google sign-in.');
        }
        return { success: false, error: `Google sign-in ${result.type}` };
      }

      let idToken =
        result.authentication?.idToken ??
        (typeof result.params?.id_token === 'string' ? result.params.id_token : undefined);

      if (!idToken && result.params?.code) {
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: googleClientId,
            code: result.params.code,
            redirectUri: request.redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier ?? '',
            },
          },
          Google.discovery
        );

        idToken = tokenResponse.idToken ?? undefined;
      }

      if (!idToken) {
        throw new Error(
          'Google authentication succeeded, but no ID token was returned for Firebase.'
        );
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);

      return {
        success: true,
        user: userCredential.user,
        additionalUserInfo: {
          displayName: userCredential.user.displayName,
          email: userCredential.user.email,
          photoURL: userCredential.user.photoURL,
        },
      };
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message ?? 'An unexpected error occurred.');
      return { success: false, error: error.message ?? 'Unknown error' };
    } finally {
      setGoogleLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    googleLoading,
    googleReady: Boolean(request),
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
};
