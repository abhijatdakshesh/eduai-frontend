import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  PlatformCard,
  Title,
  Paragraph,
  PlatformButton,
  PlatformInput,
  PlatformIconButton,
  PlatformChip,
  PlatformActivityIndicator,
} from '../components/PlatformWrapper';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const quickResponses = [
    'How do I register for courses?',
    'What are the library hours?',
    'How do I pay my fees?',
    'Where is the student center?',
    'How do I contact my advisor?',
    'What are the dining options?',
  ];

  const botResponses = {
    'how do i register for courses': 'To register for courses, go to the Courses section in the app, browse available courses, and click "Enroll" on the courses you want to take. You can also visit the registrar\'s office for assistance.',
    'what are the library hours': 'The main library is open Monday-Friday 8:00 AM - 10:00 PM, Saturday 9:00 AM - 6:00 PM, and Sunday 12:00 PM - 8:00 PM. Extended hours are available during exam periods.',
    'how do i pay my fees': 'You can pay your fees through the Fees & Scholarships section in the app. We accept credit cards, bank transfers, and payment plans. You can also visit the bursar\'s office for in-person payments.',
    'where is the student center': 'The Student Center is located in the heart of campus, between the library and the main academic building. It houses dining facilities, study spaces, and student organization offices.',
    'how do i contact my advisor': 'You can contact your academic advisor through the HR & Staff section in the app, or email them directly. Their contact information is also available in your student portal.',
    'what are the dining options': 'We have several dining options on campus: the main dining hall, food court with various vendors, coffee shops, and grab-and-go locations. Meal plans are available for purchase.',
  };

  const addMessage = (text, sender) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateBotResponse = (userMessage) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      const lowerMessage = userMessage.toLowerCase();
      let response = 'I\'m sorry, I don\'t have information about that. Please contact the student services office for assistance.';
      
      // Check for exact matches
      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }
      
      // Check for partial matches
      if (response === 'I\'m sorry, I don\'t have information about that. Please contact the student services office for assistance.') {
        if (lowerMessage.includes('course') || lowerMessage.includes('register')) {
          response = botResponses['how do i register for courses'];
        } else if (lowerMessage.includes('library') || lowerMessage.includes('book')) {
          response = botResponses['what are the library hours'];
        } else if (lowerMessage.includes('fee') || lowerMessage.includes('pay') || lowerMessage.includes('payment')) {
          response = botResponses['how do i pay my fees'];
        } else if (lowerMessage.includes('center') || lowerMessage.includes('student')) {
          response = botResponses['where is the student center'];
        } else if (lowerMessage.includes('advisor') || lowerMessage.includes('counselor')) {
          response = botResponses['how do i contact my advisor'];
        } else if (lowerMessage.includes('food') || lowerMessage.includes('dining') || lowerMessage.includes('eat')) {
          response = botResponses['what are the dining options'];
        }
      }
      
      addMessage(response, 'bot');
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addMessage(inputText.trim(), 'user');
      simulateBotResponse(inputText.trim());
      setInputText('');
    }
  };

  const handleQuickResponse = (response) => {
    addMessage(response, 'user');
    simulateBotResponse(response);
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>AI Assistant</Title>
        <Paragraph style={styles.headerSubtitle}>Ask me anything about campus life!</Paragraph>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(message => (
          <View 
            key={message.id} 
            style={[
              styles.messageContainer,
              message.sender === 'user' ? styles.userMessage : styles.botMessage
            ]}
          >
            <PlatformCard style={[
              styles.messageCard,
              message.sender === 'user' ? styles.userMessageCard : styles.botMessageCard
            ]}>
              <Paragraph style={styles.messageText}>{message.text}</Paragraph>
              <Paragraph style={styles.messageTime}>
                {formatTime(message.timestamp)}
              </Paragraph>
            </PlatformCard>
          </View>
        ))}
        
        {isTyping && (
          <View style={styles.typingContainer}>
            <PlatformCard style={styles.typingCard}>
              <View style={styles.typingContent}>
                <PlatformActivityIndicator size="small" />
                <Paragraph style={styles.typingText}>AI is typing...</Paragraph>
              </View>
            </PlatformCard>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickResponsesContainer}>
        <Paragraph style={styles.quickResponsesTitle}>Quick Questions:</Paragraph>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickResponsesScroll}>
          {quickResponses.map((response, index) => (
            <PlatformChip
              key={index}
              onPress={() => handleQuickResponse(response)}
              style={styles.quickResponseChip}
            >
              {response}
            </PlatformChip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <PlatformInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          style={styles.textInput}
          multiline
          maxLength={500}
        />
        <PlatformIconButton
          icon="send"
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#1976d2',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
    padding: 12,
  },
  userMessageCard: {
    backgroundColor: '#1976d2',
  },
  botMessageCard: {
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typingCard: {
    backgroundColor: 'white',
    padding: 12,
    maxWidth: '60%',
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  quickResponsesContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickResponsesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  quickResponsesScroll: {
    flexDirection: 'row',
  },
  quickResponseChip: {
    marginRight: 8,
    backgroundColor: '#e3f2fd',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#1976d2',
  },
});

export default ChatbotScreen; 