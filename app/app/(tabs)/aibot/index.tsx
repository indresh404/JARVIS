import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

const suggestions = ['Is my heart rate normal?', 'What does my risk score mean?', 'Check my medicines'];

export default function AIBotScreen() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([{ id: '1', role: 'assistant' as const, content: 'I am online and ready to help with your health questions.' }]);

  return (
    <ScreenWrapper backgroundColor={COLORS.blue[900]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Health Assistant</Text>
          <View style={styles.onlineDot} />
        </View>
        <ScrollView horizontal style={styles.chips} showsHorizontalScrollIndicator={false}>
          {suggestions.map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </ScrollView>
        <FlatList data={messages} renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />} keyExtractor={(item) => item.id} contentContainerStyle={{ padding: SPACING.md }} />
        <ChatInput
          value={text}
          onChangeText={setText}
          onSend={() => {
            if (!text.trim()) return;
            setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
            setText('');
          }}
          placeholder="Ask me anything health related..."
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
