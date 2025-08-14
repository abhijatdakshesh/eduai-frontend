import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, Alert } from 'react-native';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const ParentAnnouncementsScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.getParentAnnouncements({ limit: 20 });
      if (resp?.success) setItems(resp.data?.announcements || []);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Announcements</Text><Text style={styles.headerSubtitle}>{loading ? 'Loading...' : 'Latest updates'}</Text></View>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{new Date(item.created_at || item.date).toLocaleString()}</Text>
            <Text style={styles.body}>{item.body || item.message}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: isIOS ? 20 : 16, paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginTop: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  title: { color: '#1a237e', fontWeight: '800' },
  meta: { color: '#6b7280', marginTop: 2, fontSize: 12 },
  body: { color: '#374151', marginTop: 8 },
});

export default ParentAnnouncementsScreen;


