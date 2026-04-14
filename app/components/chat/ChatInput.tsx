// components/chat/ChatInput.tsx
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  disabled = false,
  placeholder = 'Type your answer...',
}) => {
  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray[400]}
            multiline
            editable={!disabled}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!value.trim() || disabled) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!value.trim() || disabled}
          >
            <Ionicons
              name="send"
              size={20}
              color={value.trim() && !disabled ? COLORS.white : COLORS.gray[400]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary, // Changed from blue[900]
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryDark, // Changed from blue[700]
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    maxHeight: 100,
    paddingTop: SPACING.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary, // Changed from blue[500]
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray[200],
  },
});