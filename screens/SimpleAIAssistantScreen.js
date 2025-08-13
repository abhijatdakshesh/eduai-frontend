import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

const SimpleAIAssistantScreen = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      type: 'user',
      text: 'What courses are available for Computer Science?',
      timestamp: '10:31 AM',
    },
    {
      id: 3,
      type: 'bot',
      text: 'Here are the available Computer Science courses:\n\n• CS101: Introduction to Programming\n• CS201: Data Structures\n• CS301: Algorithms\n• CS401: Software Engineering\n\nWould you like more details about any specific course?',
      timestamp: '10:31 AM',
    },
  ]);

  const quickActions = [
    { id: 1, text: 'Course Information', icon: '📚' },
    { id: 2, text: 'Schedule Help', icon: '📅' },
    { id: 3, text: 'Fee Payment', icon: '💰' },
    { id: 4, text: 'Campus Services', icon: '🏠' },
    { id: 5, text: 'Academic Calendar', icon: '📆' },
    { id: 6, text: 'Contact Support', icon: '📞' },
  ];

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: chatHistory.length + 1,
        type: 'user',
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setChatHistory([...chatHistory, newMessage]);
      setMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: chatHistory.length + 2,
          type: 'bot',
          text: 'Thank you for your message! I\'m processing your request. This is a demo response.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleQuickAction = (action) => {
    const newMessage = {
      id: chatHistory.length + 1,
      type: 'user',
      text: `I need help with: ${action.text}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setChatHistory([...chatHistory, newMessage]);
    
    // Simulate AI response for quick actions
    setTimeout(() => {
      const aiResponse = {
        id: chatHistory.length + 2,
        type: 'bot',
        text: `I can help you with ${action.text.toLowerCase()}. Let me provide you with the relevant information.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <Text style={styles.headerSubtitle}>Your virtual campus guide</Text>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionButton}
              onPress={() => handleQuickAction(action)}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionText}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.chatContainer}>
        {chatHistory.map(chat => (
          <View
            key={chat.id}
            style={[
              styles.messageContainer,
              chat.type === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                chat.type === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text style={styles.messageText}>{chat.text}</Text>
              <Text style={styles.messageTime}>{chat.timestamp}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#546e7a',
    fontSize: 14,
  },
  quickActionsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a237e',
  },
  quickActionButton: {
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a237e',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#1a237e',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#1a237e',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8eaf6',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default SimpleAIAssistantScreen;

