export const signInWithPhone = async (phone: string) => {
  return { success: true, phone, verificationId: `verify_${Date.now()}` };
};

export const verifyOTP = async (verificationId: string, otp: string) => {
  return { success: otp.length === 6, userId: verificationId.replace('verify_', 'user_') };
};

export const signInWithGoogle = async () => {
  return { success: true, userId: `google_${Date.now()}` };
};

export const signOut = async () => ({ success: true });
