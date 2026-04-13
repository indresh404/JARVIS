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

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const getAIResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('blood pressure') || input.includes('bp')) {
      return 'Based on your recent readings, your blood pressure is stable at 120/80. Remember to take your medication regularly and reduce salt intake.';
    } else if (input.includes('medication') || input.includes('medicine')) {
      return 'You have 3 active medications:\n• Lisinopril (10mg) - Daily at 8 AM\n• Atorvastatin (20mg) - Daily at 8 PM\n• Aspirin (81mg) - Daily at 8 AM';
    } else if (input.includes('appointment') || input.includes('doctor')) {
      return 'Your next appointment with Dr. Sharma is scheduled for April 15, 2026 at 10:00 AM. Would you like me to set a reminder?';
    } else if (input.includes('diet') || input.includes('food')) {
      return 'For better heart health, consider:\n• Reducing sodium intake\n• Eating more fruits and vegetables\n• Choosing whole grains\n• Limiting saturated fats';
    } else if (input.includes('exercise') || input.includes('workout')) {
      return 'Aim for 30 minutes of moderate exercise, 5 days a week. Walking, swimming, or cycling are great options. Start slow and gradually increase intensity.';
    } else if (input.includes('hello') || input.includes('hi')) {
      return 'Hello! How are you feeling today? I\'m here to help with any health questions you have.';
    } else if (input.includes('thank')) {
      return 'You\'re welcome! I\'m always here to help with your health concerns. Is there anything else I can assist you with?';
    } else {
      return 'I understand you\'re asking about health. Could you please provide more details? I can help with:\n• Blood pressure monitoring\n• Medication reminders\n• Appointment scheduling\n• Diet and nutrition advice\n• Exercise recommendations';
    }
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
        <View style={styles.headerRight} />
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