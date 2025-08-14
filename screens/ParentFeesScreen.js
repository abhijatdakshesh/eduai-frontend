import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const ParentFeesScreen = ({ route }) => {
  const { studentId, childName } = route.params || {};
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.getParentChildInvoices(studentId);
      if (resp?.success) setInvoices(resp.data?.invoices || []);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openInvoice = (inv) => {
    Alert.alert('Invoice', `Amount due: ${inv.amount_due}\nDue: ${inv.due_date}\nStatus: ${inv.status}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Fees - {childName || 'Student'}</Text><Text style={styles.headerSubtitle}>{loading ? 'Loading...' : 'Invoices and payments'}</Text></View>
      <FlatList
        data={invoices}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openInvoice(item)}>
            <Text style={styles.title}>{item.title || `Invoice ${item.id}`}</Text>
            <Text style={styles.meta}>Due: {item.due_date} • Amount: {item.amount_due}</Text>
            <View style={[styles.badge, { backgroundColor: item.status === 'paid' ? '#10b981' : '#f59e0b' }]}><Text style={styles.badgeText}>{String(item.status || '').toUpperCase()}</Text></View>
          </TouchableOpacity>
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
  meta: { color: '#6b7280', marginTop: 2 },
  badge: { marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: 'white', fontWeight: '800' },
});

export default ParentFeesScreen;


