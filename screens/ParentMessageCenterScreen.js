import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';

const ParentMessageCenterScreen = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    setMessages([{ id: Date.now().toString(), sender: 'me', text, ts: new Date().toISOString() }, ...messages]);
    setText('');
    Alert.alert('Message', 'Message sent (demo).');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Message Center</Text>
        <Text style={styles.headerSubtitle}>Contact teachers/admin</Text>
      </View>
      <View style={styles.composer}>
        <TextInput style={styles.input} placeholder="Type a message" value={text} onChangeText={setText} />
        <TouchableOpacity style={styles.send} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.msg, item.sender === 'me' ? styles.me : styles.them]}>
            <Text style={styles.msgText}>{item.text}</Text>
            <Text style={styles.msgMeta}>{new Date(item.ts).toLocaleTimeString()}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 22 },
  headerSubtitle: { color: '#e3f2fd' },
  composer: { flexDirection: 'row', padding: 16, backgroundColor: 'white', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  send: { marginLeft: 8, backgroundColor: '#1a237e', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  sendText: { color: 'white', fontWeight: '700' },
  msg: { borderRadius: 12, padding: 12, marginBottom: 8 },
  me: { backgroundColor: '#e0f2fe', alignSelf: 'flex-end' },
  them: { backgroundColor: 'white', alignSelf: 'flex-start' },
  msgText: { color: '#111827' },
  msgMeta: { color: '#6b7280', fontSize: 10, marginTop: 4 },
});

export default ParentMessageCenterScreen;


