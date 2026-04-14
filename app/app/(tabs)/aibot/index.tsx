import React, { useState, useRef, useEffect } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform, Keyboard, Alert } from 'react-native';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { TouchableOpacity } from 'react-native';

import { backendService } from '@/services/backend.service';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';

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
  const [userTurnCount, setUserTurnCount] = useState(0);
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);

  const MAX_TURNS = 8;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const triggerOrchestration = async (allMessages: ChatMessage[]) => {
    setIsLoading(true);
    try {
      setMessages(prev => [...prev, {
        id: 'system-info',
        role: 'assistant',
        content: "🔄 Processing session summary and risk analysis..."
      }]);

      const log = allMessages.map(m => ({ role: m.role, content: m.content }));
      const patientId = user?.id || 'demo-patient';
      
      const summary = await backendService.endSession(patientId, log, "Continuing health conversation.");
      
      if (summary) {
        console.log('✅ Orchestration Summary:', summary);
        
        // Add summary message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `📊 **Session Summary:** ${summary.daily_summary}\n\n**Urgency:** ${summary.urgency}\n**Key Risks:** ${summary.key_risks}`
        }]);

        // If risk is critical (Urgent), trigger alert agent
        if (summary.urgency === 'Urgent') {
            Alert.alert(
                "🚨 CRITICAL ALERT",
                "Your symptoms indicate a high-risk situation. I am notifying your emergency contact and healthcare provider.",
                [{ text: "OK", onPress: () => console.log("Alert Acknowledged") }]
            );
            
            setMessages(prev => [...prev, {
                id: 'alert-msg',
                role: 'assistant',
                content: "⚠️ **Alert Agent Triggered:** Notified medical team of high-severity symptoms."
            }]);
        }
      }
    } catch (e) {
      console.error('Orchestration failed:', e);
    } finally {
      setIsLoading(false);
      setUserTurnCount(0); // Reset for next cycle
    }
  };

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setText('');
    setIsLoading(true);
    const newTurnCount = userTurnCount + 1;
    setUserTurnCount(newTurnCount);

    try {
      const context = {
        rolling_summary: messages.length > 0 ? "Active conversation about patient health" : "New patient consultation",
        profile_summary: "Patient has no existing profile data",
        last_7_summaries: [],
        active_medications: [],
        pending_doctor_questions: []
      };

      const res = await backendService.sendMessage(user?.id || 'demo-patient', text, context);

      if (res && res.bot_reply) {
        const botMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant' as const,
            content: res.bot_reply
          };
        const finalMessages = [...updatedMessages, botMsg];
        setMessages(finalMessages);

        // Check if we should orchestrate after this turn
        if (newTurnCount >= MAX_TURNS) {
            await triggerOrchestration(finalMessages);
        }
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
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>AI Health Assistant</Text>
              <View style={styles.onlineDot} />
            </View>
            
            <View style={styles.turnIndicator}>
               <Text style={styles.turnIndicatorText}>Turns until summary: {MAX_TURNS - userTurnCount}</Text>
            </View>

            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              style={styles.flatList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <View style={styles.chipContainer}>
                <ScrollView horizontal style={styles.chips} showsHorizontalScrollIndicator={false}>
                    {suggestions.map((chip) => (
                    <TouchableOpacity key={chip} style={styles.chip} onPress={() => setText(chip)}>
                        <Text style={styles.chipText}>{chip}</Text>
                    </TouchableOpacity>
                    ))}
                </ScrollView>
                </View>

                <ChatInput
                value={text}
                onChangeText={setText}
                onSend={handleSend}
                placeholder="Ask me anything health related..."
                disabled={isLoading}
                />
            </KeyboardAvoidingView>
          </View>
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: COLORS.blue[900] },
  container: { flex: 1, backgroundColor: COLORS.blue[900], paddingTop: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: SPACING.xs },
  title: { color: COLORS.white, fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.xl },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green[500] },
  turnIndicator: { alignItems: 'center', paddingBottom: 4 },
  turnIndicatorText: { color: COLORS.blue[300], fontSize: 10, fontFamily: TYPOGRAPHY.fonts.medium },
  chipContainer: { maxHeight: 50, marginBottom: 8 },
  chips: { paddingHorizontal: SPACING.md },
  chip: { borderWidth: 1, borderColor: COLORS.blue[300], borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, backgroundColor: `${COLORS.white}10`, height: 35 },
  chipText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.sm },
  flatList: { flex: 1 },
  messageList: { padding: SPACING.md, paddingBottom: SPACING.xl },
});

