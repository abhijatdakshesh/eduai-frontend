import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { announcementsAPI } from '../services/apiService';

const TeacherAnnouncementsScreen = () => {
  const [text, setText] = useState('');
  const [posts, setPosts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const publish = async () => {
    if (!text.trim()) {
      Alert.alert('Announcements', 'Write something to post.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: text.substring(0, 80),
        body: text,
        audience: 'both',
        scope_type: 'global',
      };
      const res = await announcementsAPI.createForTeacher(payload);
      if (res.success) {
        const created = res.data?.announcement || { id: Date.now().toString(), text, ts: new Date().toISOString() };
        setPosts([{ id: created.id?.toString() || Date.now().toString(), text, ts: created.created_at || new Date().toISOString() }, ...posts]);
        setText('');
        Alert.alert('Announcements', 'Announcement published.');
      } else {
        Alert.alert('Announcements', res.message || 'Failed to publish');
      }
    } catch (e) {
      Alert.alert('Announcements', e.message || 'Failed to publish');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Class Announcements</Text>
      </View>
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Share an update with your class..."
          multiline
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={[styles.postBtn, submitting && { opacity: 0.7 }]} onPress={publish} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.postText}>Post</Text>}
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.postTextBody}>{item.text}</Text>
            <Text style={styles.postMeta}>{new Date(item.ts).toLocaleString()}</Text>
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
  composer: { backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 12 },
  input: { minHeight: 80, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10 },
  postBtn: { marginTop: 10, alignSelf: 'flex-end', backgroundColor: '#1a237e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  postText: { color: 'white', fontWeight: '700' },
  post: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  postTextBody: { color: '#111827' },
  postMeta: { color: '#6b7280', fontSize: 12, marginTop: 6 },
});

export default TeacherAnnouncementsScreen;


