import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Platform,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Animated,
  ActivityIndicator
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const SimpleAIAssistantScreen = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: '10:30 AM',
      avatar: '🤖',
    },
    {
      id: 2,
      type: 'user',
      text: 'What courses are available for Computer Science?',
      timestamp: '10:31 AM',
      avatar: '👤',
    },
    {
      id: 3,
      type: 'bot',
      text: 'Here are the available Computer Science courses:\n\n• CS101: Introduction to Programming\n• CS201: Data Structures\n• CS301: Algorithms\n• CS401: Software Engineering\n\nWould you like more details about any specific course?',
      timestamp: '10:31 AM',
      avatar: '🤖',
    },
  ]);

  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const quickActions = [
    { id: 1, text: 'Course Info', icon: '📚', color: '#3f51b5' },
    { id: 2, text: 'Schedule', icon: '📅', color: '#ff9800' },
    { id: 3, text: 'Fees', icon: '💰', color: '#4caf50' },
    { id: 4, text: 'Services', icon: '🏠', color: '#9c27b0' },
    { id: 5, text: 'Calendar', icon: '📆', color: '#f44336' },
    { id: 6, text: 'Support', icon: '📞', color: '#2196f3' },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        type: 'user',
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '👤',
      };
      
      setChatHistory(prev => [...prev, newMessage]);
      setMessage('');
      scrollToBottom();
      
      // Show typing indicator
      setIsTyping(true);
      
      // Simulate AI response
      setTimeout(() => {
        setIsTyping(false);
        const aiResponse = {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Thank you for your message! I\'m processing your request. This is a demo response that shows how the AI assistant would respond to your query.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '🤖',
        };
        setChatHistory(prev => [...prev, aiResponse]);
        scrollToBottom();
      }, 2000);
    }
  };

  const handleQuickAction = (action) => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      text: `I need help with: ${action.text}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '👤',
    };
    
    setChatHistory(prev => [...prev, newMessage]);
    scrollToBottom();
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate AI response for quick actions
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: `I can help you with ${action.text.toLowerCase()}. Let me provide you with the relevant information and guide you through the process.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '🤖',
      };
      setChatHistory(prev => [...prev, aiResponse]);
      scrollToBottom();
    }, 1500);
  };

  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );

  const MessageBubble = ({ message }) => (
    <View style={[
      styles.messageContainer,
      message.type === 'user' ? styles.userMessage : styles.botMessage,
    ]}>
      {message.type === 'bot' && (
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{message.avatar}</Text>
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        message.type === 'user' ? styles.userBubble : styles.botBubble,
      ]}>
        <Text style={[
          styles.messageText,
          message.type === 'user' ? styles.userMessageText : styles.botMessageText,
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          message.type === 'user' ? styles.userMessageTime : styles.botMessageTime,
        ]}>
          {message.timestamp}
        </Text>
      </View>
      
      {message.type === 'user' && (
        <View style={styles.userAvatarContainer}>
          <Text style={styles.userAvatar}>{message.avatar}</Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={isIOS ? 'padding' : 'height'}
      keyboardVerticalOffset={isIOS ? 90 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>Your virtual campus guide</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsScroll}
        >
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionButton, { borderColor: action.color }]}
              onPress={() => handleQuickAction(action)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionText}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {chatHistory.map(chat => (
          <MessageBubble key={chat.id} message={chat} />
        ))}
        
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled
            ]} 
            onPress={sendMessage}
            disabled={!message.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#e3f2fd',
    fontSize: 14,
    opacity: 0.9,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a237e',
  },
  quickActionsScroll: {
    paddingRight: 20,
  },
  quickActionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatar: {
    fontSize: 16,
  },
  userAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  userAvatar: {
    fontSize: 16,
    color: 'white',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#1a237e',
    borderBottomRightRadius: 6,
  },
  botBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: '#374151',
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botMessageTime: {
    color: '#9ca3af',
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  typingBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SimpleAIAssistantScreen;

