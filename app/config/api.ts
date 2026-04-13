// app/config/api.ts
import { Platform } from 'react-native';

/**
 * BACKEND_URL Configuration
 * - 10.0.2.2 is the IP of the special gateway to localhost on Android Emulator.
 * - localhost or 127.0.0.1 works for iOS Simulator.
 * - Use your machine's LOCAL IP (e.g., 192.168.1.33) if testing on a PHYSICAL device.
 */
const PHYSICAL_DEVICE_IP = '192.168.1.33'; // Update this if your IP changes
const EMULATOR_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

// CHANGE THIS TO TRUE IF TESTING ON A REAL PHONE
const IS_PHYSICAL_DEVICE = true; 

export const BACKEND_URL = `http://${IS_PHYSICAL_DEVICE ? PHYSICAL_DEVICE_IP : EMULATOR_IP}:8000`;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        VERIFY: '/auth/verify',
    },
    CHAT: {
        MESSAGE: '/chat/message',
        END_SESSION: '/chat/end-session',
    },
    FAMILY: {
        CREATE: '/family/create',
        JOIN: '/family/join',
        MEMBERS: (id: string) => `/family/members/${id}`,
    },
    MEDS: {
        LIST: (id: string) => `/meds/${id}`,
        LOG: '/meds/log',
    },
    PROFILE: {
        GET: (id: string) => `/profile/${id}`,
        PATCH: (id: string) => `/profile/${id}`,
        QR: (id: string) => `/profile/${id}/qr`,
    },
    CHECKINS: {
        PENDING: (id: string) => `/checkins/pending/${id}`,
        SUBMIT: '/checkins/submit',
    }
};
