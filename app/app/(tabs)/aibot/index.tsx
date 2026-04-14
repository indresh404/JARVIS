import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { TouchableOpacity } from 'react-native';

import { backendService } from '@/services/backend.service';
import { useAuthStore } from '@/store/auth.store';

const suggestions = ['Is my heart rate normal?', 'What does my risk score mean?', 'Check my medicines'];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIBotScreen() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: '1', role: 'assistant', content: 'I am online and ready to help with your health questions.' }]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const context = {
        rolling_summary: messages.length > 0 ? "Active conversation about patient health" : "New patient consultation",
        profile_summary: "Patient has no existing profile data",
        last_7_summaries: [],
        active_medications: [],
        pending_doctor_questions: []
      };

      // Debug: Log what we're sending
      const debugBody = {
        message: text,
        patient_id: user?.id || 'demo-patient',
        session_id: 'main-chat',
        patient_context: context
      };
      console.log('🔍 Sending to backend:', JSON.stringify(debugBody, null, 2));

      const res = await backendService.sendMessage(user?.id || 'demo-patient', text, context);

      console.log('Backend response:', res);

      if (res && res.bot_reply) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: res.bot_reply
        }]);
      } else if (res && res.detail) {
        // Handle validation errors or specific backend detail error messages
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: `⚠️ Backend error: ${JSON.stringify(res.detail)}`
        }]);
      } else {
        throw new Error('No bot_reply in response');
      }
    } catch (e) {
      console.error('Chat error details:', e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: "⚠️ Unable to reach AI assistant. Please check if backend is running."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.masterContainer}>
      <ScreenWrapper style={{ backgroundColor: COLORS.blue[900] }} scroll={false}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>AI Health Assistant</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.chipContainer}>
              <ScrollView horizontal style={styles.chips} showsHorizontalScrollIndicator={false}>
                {suggestions.map((chip) => (
                  <TouchableOpacity key={chip} style={styles.chip} onPress={() => setText(chip)}>
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <FlatList
              data={messages}
              renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              style={styles.flatList}
            />
            <ChatInput
              value={text}
              onChangeText={setText}
              onSend={handleSend}
              placeholder="Ask me anything health related..."
              disabled={isLoading}
            />
          </View>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: COLORS.blue[900] },
  keyboardView: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.blue[900], paddingTop: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: SPACING.sm },
  title: { color: COLORS.white, fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.xl },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green[500] },
  chipContainer: { maxHeight: 50 },
  chips: { marginTop: 12, paddingHorizontal: SPACING.md },
  chip: { borderWidth: 1, borderColor: COLORS.blue[300], borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, backgroundColor: `${COLORS.white}10`, height: 35 },
  chipText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.sm },
  flatList: { flex: 1 },
  messageList: { padding: SPACING.md, paddingBottom: SPACING.xl },
});
