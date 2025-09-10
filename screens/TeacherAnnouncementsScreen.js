import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { announcementsAPI } from '../services/apiService';
import { apiClient } from '../services/api';

const TeacherAnnouncementsScreen = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('both'); // 'students' | 'parents' | 'both'
  const [scopeType, setScopeType] = useState('global'); // 'global' | 'class'
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [posts, setPosts] = useState([]);

  const loadAnnouncements = async () => {
    try {
      setLoadingList(true);
      const res = await announcementsAPI.listForTeacher({ limit: 20 });
      const list = res.success ? (res.data?.announcements || []) : [];
      setPosts(list.map(a => ({
        id: String(a.id || Date.now()),
        text: a.body,
        ts: a.created_at || new Date().toISOString(),
        title: a.title,
      })));
    } catch (e) {
      // handled by wrapper
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    // Load teacher classes for class-scoped announcements
    apiClient.getTeacherClasses().then(r => {
      const list = r?.data?.classes || r?.data || [];
      setClasses(list);
    }).catch(() => {});
    loadAnnouncements();
  }, []);

  const publish = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Announcements', 'Please enter a title and message.');
      return;
    }
    if (scopeType === 'class' && !selectedClassId) {
      Alert.alert('Announcements', 'Please select a class for class-scoped announcements.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        body: body.trim(),
        audience,
        scope_type: scopeType,
        ...(scopeType === 'class' ? { scope_id: selectedClassId } : {}),
      };
      const res = await announcementsAPI.createForTeacher(payload);
      if (res.success) {
        setTitle('');
        setBody('');
        setScopeType('global');
        setSelectedClassId(null);
        await loadAnnouncements();
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
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a title..."
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, { marginTop: 10 }]}>Message</Text>
        <TextInput
          style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
          placeholder="Share an update with your class..."
          multiline
          value={body}
          onChangeText={setBody}
        />

        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TouchableOpacity onPress={() => setAudience('students')} style={[styles.chip, audience === 'students' && styles.chipActive]}>
            <Text style={[styles.chipText, audience === 'students' && styles.chipTextActive]}>Students</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAudience('parents')} style={[styles.chip, audience === 'parents' && styles.chipActive]}>
            <Text style={[styles.chipText, audience === 'parents' && styles.chipTextActive]}>Parents</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAudience('both')} style={[styles.chip, audience === 'both' && styles.chipActive]}>
            <Text style={[styles.chipText, audience === 'both' && styles.chipTextActive]}>Both</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TouchableOpacity onPress={() => setScopeType('global')} style={[styles.chip, scopeType === 'global' && styles.chipActive]}>
            <Text style={[styles.chipText, scopeType === 'global' && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScopeType('class')} style={[styles.chip, scopeType === 'class' && styles.chipActive]}>
            <Text style={[styles.chipText, scopeType === 'class' && styles.chipTextActive]}>Class</Text>
          </TouchableOpacity>
        </View>

        {scopeType === 'class' && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Select Class</Text>
            <View style={styles.classPicker}>
              {classes.length === 0 ? (
                <Text style={{ color: '#6b7280' }}>No classes found.</Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {classes.map((c) => (
                    <TouchableOpacity key={String(c.id)} onPress={() => setSelectedClassId(c.id)} style={[styles.classPill, selectedClassId === c.id && styles.classPillActive]}>
                      <Text style={[styles.classPillText, selectedClassId === c.id && styles.classPillTextActive]}>
                        {c.name || c.class_name || `Class ${c.id}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity style={[styles.postBtn, submitting && { opacity: 0.7 }]} onPress={publish} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.postText}>Post</Text>}
        </TouchableOpacity>
      </View>
      {loadingList ? (
        <View style={{ padding: 16 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.post}>
              <Text style={styles.postTitle}>{item.title || 'Announcement'}</Text>
              <Text style={styles.postTextBody}>{item.text}</Text>
              <Text style={styles.postMeta}>{new Date(item.ts).toLocaleString()}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 22 },
  composer: { backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 12 },
  label: { color: '#1f2937', fontWeight: '600', marginBottom: 6 },
  input: { minHeight: 44, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, marginRight: 8 },
  chipActive: { backgroundColor: '#e8eaf6', borderColor: '#1a237e' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#1a237e', fontWeight: '700' },
  classPicker: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, backgroundColor: '#f9fafb' },
  classPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8, marginBottom: 8 },
  classPillActive: { backgroundColor: '#e8eaf6', borderColor: '#1a237e' },
  classPillText: { color: '#374151' },
  classPillTextActive: { color: '#1a237e', fontWeight: '700' },
  postBtn: { marginTop: 10, alignSelf: 'flex-end', backgroundColor: '#1a237e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  postText: { color: 'white', fontWeight: '700' },
  post: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  postTitle: { color: '#111827', fontWeight: '700', marginBottom: 6 },
  postTextBody: { color: '#111827' },
  postMeta: { color: '#6b7280', fontSize: 12, marginTop: 6 },
});

export default TeacherAnnouncementsScreen;


