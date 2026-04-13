// app/(onboarding)/chat.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/services/supabaseClient';
import { BACKEND_URL, API_ENDPOINTS } from '@/config/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your AI Health Assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    if (user) {
      fetchUserName();
    }
  }, [user]);

  const fetchUserName = async () => {
    const { data } = await supabase
      .from('users')
      .select('name')
      .eq('id', user?.id)
      .single();
    if (data?.name) setUserName(data.name);
  };

  const getUserInitials = () => {
    if (!userName) return 'U';
    return userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Handle session end on unmount
  useEffect(() => {
    return () => {
      if (user?.id) {
        const sessionId = 'session-' + user.id;
        fetch(`${BACKEND_URL}${API_ENDPOINTS.CHAT.END_SESSION}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id: user.id, session_id: sessionId })
        }).catch(e => console.error("End session error:", e));
      }
    };
  }, [user]);

  const getFallbackReply = (input: string): string => {
    const msg = input.toLowerCase();
    if (msg.includes('blood pressure') || msg.includes('bp')) return 'Your recent BP readings have been tracking around 118/76 — within normal range. Continue your Amlodipine as prescribed and monitor weekly.';
    if (msg.includes('headache') || msg.includes('head')) return 'Headaches can be linked to blood pressure fluctuations or dehydration. I\'ve noted this symptom. How long has this been going on?';
    if (msg.includes('tired') || msg.includes('fatigue') || msg.includes('energy')) return 'Fatigue is a common concern with your conditions. Are you sleeping 7-8 hours? Let\'s also check if you\'ve missed any doses recently.';
    if (msg.includes('medic') || msg.includes('tablet') || msg.includes('pill')) return 'You have 3 active medications: Metformin 500mg (morning), Amlodipine 5mg (evening), Vitamin D3 (afternoon). Have you been taking them consistently?';
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) return 'Hello! How are you feeling today? I\'m your AI health assistant — tell me about any symptoms, medications, or health concerns.';
    if (msg.includes('pain') || msg.includes('hurt') || msg.includes('ache')) return 'I understand you\'re experiencing pain. Can you tell me where exactly and rate it from 1-10? This helps me assess the severity.';
    if (msg.includes('sugar') || msg.includes('glucose') || msg.includes('diabet')) return 'Blood sugar management is key with your profile. Have you checked your levels today? Aim for fasting glucose below 126 mg/dL.';
    if (msg.includes('sleep') || msg.includes('insomnia')) return 'Sleep quality directly impacts your heart health and blood pressure. 7-8 hours is recommended. Any difficulty falling asleep or staying asleep?';
    return 'Thank you for sharing that. I\'m tracking this information to build your health profile. Can you tell me more, or is there a specific symptom you\'d like to discuss?';
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    const sessionId = 'session-' + (user?.id || 'demo');
    fetch(`${BACKEND_URL}${API_ENDPOINTS.CHAT.MESSAGE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: user?.id || 'demo-patient',
        session_id: sessionId,
        message: currentInput,
      }),
    })
      .then(res => res.json())
      .then(data => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.bot_reply || getFallbackReply(currentInput),
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      })
      .catch(() => {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: getFallbackReply(currentInput),
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };



  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="chatbubble-ellipses" size={16} color="#0474FC" />
        </View>
      )}
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
      {item.isUser && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{getUserInitials()}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0474FC" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubble-ellipses" size={22} color="#0474FC" />
        </View>
        <Text style={styles.headerTitle}>AI Health Assistant</Text>
        <TouchableOpacity
          onPress={() => router.push('/(onboarding)/agent-log')}
          style={styles.doneButton}
        >
          <Text style={styles.doneButtonText}>Done</Text>
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0474FC" />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about your health..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F1FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0474FC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F1FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0474FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#0474FC',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#111827',
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0474FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});