import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

import { backendService } from '@/services/backend.service';
import { useAuthStore } from '@/store/auth.store';

const suggestions = ['Is my heart rate normal?', 'What does my risk score mean?', 'Check my medicines'];

export default function AIBotScreen() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([{ id: '1', role: 'assistant' as const, content: 'I am online and ready to help with your health questions.' }]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMsg]);
    setText('');
    setIsLoading(true);

    try {
      const context = {
        rolling_summary: "General inquiry",
        profile_summary: "",
        last_7_summaries: [],
        active_medications: [],
        pending_doctor_questions: []
      };

      const res = await backendService.sendMessage(user?.id || 'demo', text, context); 
      
      if (res && res.bot_reply) {
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'assistant' as const, 
            content: res.bot_reply 
        }]);
      } else {
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'assistant' as const, 
            content: "I'm having trouble connecting to my knowledge base. Please try again." 
        }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={COLORS.blue[900]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Health Assistant</Text>
          <View style={styles.onlineDot} />
        </View>
        <ScrollView horizontal style={styles.chips} showsHorizontalScrollIndicator={false}>
          {suggestions.map((chip) => (
            <TouchableOpacity key={chip} style={styles.chip} onPress={() => setText(chip)}>
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <FlatList 
            data={messages} 
            renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />} 
            keyExtractor={(item) => item.id} 
            contentContainerStyle={{ padding: SPACING.md }} 
        />
        <ChatInput
          value={text}
          onChangeText={setText}
          onSend={handleSend}
          placeholder="Ask me anything health related..."
          disabled={isLoading}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.blue[900], paddingTop: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  title: { color: COLORS.white, fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.xl },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green[500] },
  chips: { marginTop: 12, maxHeight: 40, paddingHorizontal: SPACING.md },
  chip: { borderWidth: 1, borderColor: COLORS.blue[300], borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, backgroundColor: `${COLORS.white}10` },
  chipText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.sm },
});
