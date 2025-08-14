import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, FlatList } from 'react-native';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const ParentDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const [kids, anns] = await Promise.all([
        apiClient.getParentChildren(),
        apiClient.getParentAnnouncements({ limit: 5 }),
      ]);
      if (kids?.success) setChildren(kids.data?.children || []);
      if (anns?.success) setAnnouncements(anns.data?.announcements || []);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openChild = (child) => {
    navigation.navigate('ParentChildren', { focusId: child.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parent Dashboard</Text>
        <Text style={styles.headerSubtitle}>{loading ? 'Loading...' : 'Overview of your family'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Children</Text>
        <FlatList
          data={children}
          horizontal
          keyExtractor={(c) => String(c.id)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.childCard} onPress={() => openChild(item)}>
              <Text style={styles.childName}>{item.first_name} {item.last_name}</Text>
              <Text style={styles.childMeta}>{item.grade_level}</Text>
              <View style={styles.childActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ParentAttendance', { studentId: item.id, childName: item.first_name })}>
                  <Text style={styles.actionText}>Attendance</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.secondary]} onPress={() => navigation.navigate('ParentResults', { studentId: item.id, childName: item.first_name })}>
                  <Text style={styles.actionText}>Results</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: isIOS ? 20 : 16 }}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Announcements</Text>
        {announcements.map((a) => (
          <View key={a.id} style={styles.announcement}>
            <Text style={styles.annTitle}>{a.title}</Text>
            <Text style={styles.annMeta}>{new Date(a.created_at || a.date).toLocaleString()}</Text>
            <Text style={styles.annBody} numberOfLines={2}>{a.body || a.message}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  section: { paddingVertical: 16 },
  sectionTitle: { color: '#1a237e', fontWeight: '700', fontSize: 18, marginBottom: 8, paddingHorizontal: isIOS ? 20 : 16 },
  childCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginRight: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  childName: { color: '#1a237e', fontWeight: '800' },
  childMeta: { color: '#6b7280', marginTop: 4 },
  childActions: { flexDirection: 'row', marginTop: 10 },
  actionBtn: { backgroundColor: '#1a237e', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
  secondary: { backgroundColor: '#3b82f6' },
  actionText: { color: 'white', fontWeight: '700' },
  announcement: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginHorizontal: isIOS ? 20 : 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  annTitle: { color: '#1a237e', fontWeight: '700' },
  annMeta: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  annBody: { color: '#374151', marginTop: 6 },
});

export default ParentDashboardScreen;


