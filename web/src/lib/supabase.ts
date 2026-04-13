import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables from both Vite and process.env
const getEnvVar = (key: string): string | undefined => {
  try {
    // Try Vite's import.meta.env first
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
    // Fallback to process.env (defined in vite.config.ts)
    if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
      return (process.env as any)[key];
    }
  } catch (e) {
    // Ignore errors in env access
  }
  return undefined;
};

const rawUrl = getEnvVar('VITE_SUPABASE_URL');
const rawKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Validate URL format
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

// Final values with guaranteed valid fallbacks to prevent initialization crash
const finalUrl = isValidUrl(rawUrl) ? rawUrl! : 'https://placeholder-project.supabase.co';
const finalKey = rawKey || 'placeholder-key';

if (!rawUrl || !rawKey) {
  console.error(
    'Swasthya AI: Supabase credentials missing or invalid!\n' +
    'Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Secrets panel.\n' +
    'Current URL:', rawUrl
  );
}

export const supabase = createClient(finalUrl, finalKey);
