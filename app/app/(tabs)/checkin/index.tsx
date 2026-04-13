import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '@/theme';

export default function CheckinScreen() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([{ id: '1', role: 'assistant' as const, content: 'How are you feeling today? Any discomfort, sleep changes, or stress?' }]);
  return (
    <ScreenWrapper backgroundColor={COLORS.blue[900]}>
      <View style={styles.container}>
        <Text style={styles.title}>Daily Check-in</Text>
        <Text style={styles.date}>Monday, Apr 6</Text>
        <LinearGradient colors={GRADIENTS.green} style={styles.streak}>
          <Text style={styles.streakText}>🔥 5 day streak</Text>
        </LinearGradient>
        <FlatList data={messages} contentContainerStyle={styles.list} renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />} keyExtractor={(item) => item.id} />
        <ChatInput
          value={text}
          onChangeText={setText}
          onSend={() => {
            if (!text.trim()) return;
            setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
            setText('');
          }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.blue[900], paddingTop: SPACING.md },
  title: { color: COLORS.white, textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xl, fontFamily: TYPOGRAPHY.fonts.bold },
  date: { color: `${COLORS.white}B3`, textAlign: 'center', marginTop: 4 },
  streak: { alignSelf: 'center', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 },
  streakText: { color: COLORS.white, fontFamily: TYPOGRAPHY.fonts.medium },
  list: { padding: SPACING.md },
});
