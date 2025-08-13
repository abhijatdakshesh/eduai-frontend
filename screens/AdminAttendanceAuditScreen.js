import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Platform } from 'react-native';
import { apiClient } from '../services/api';
import { useBackButton } from '../utils/backButtonHandler';

const isIOS = Platform.OS === 'ios';

const AdminAttendanceAuditScreen = ({ navigation }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useBackButton(navigation);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.getAdminAttendanceAudit({ from, to, classId, teacherId });
      setEntries(resp?.data?.entries || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Audit</Text>
        <Text style={styles.headerSubtitle}>Search changes by date, class, teacher</Text>
      </View>

      <View style={styles.filters}>
        <TextInput value={from} onChangeText={setFrom} placeholder="From (YYYY-MM-DD)" style={styles.input} />
        <TextInput value={to} onChangeText={setTo} placeholder="To (YYYY-MM-DD)" style={styles.input} />
        <TextInput value={classId} onChangeText={setClassId} placeholder="Class ID (optional)" style={styles.input} />
        <TextInput value={teacherId} onChangeText={setTeacherId} placeholder="Teacher ID (optional)" style={styles.input} />
        <TouchableOpacity style={styles.applyBtn} onPress={load} disabled={loading}>
          <Text style={styles.applyText}>{loading ? 'Loading...' : 'Apply'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: isIOS ? 20 : 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.title}>{item.class_name} • {item.student_name}</Text>
            <Text style={styles.meta}>Date: {item.date} • By: {item.changed_by}</Text>
            <Text style={styles.change}>Status: {item.old_status} → {item.new_status}</Text>
            {!!item.notes && <Text style={styles.notes}>Notes: {item.notes}</Text>}
            <Text style={styles.time}>Changed: {new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  filters: { backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f9fafb', marginBottom: 10 },
  applyBtn: { backgroundColor: '#1a237e', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, alignSelf: 'flex-end' },
  applyText: { color: 'white', fontWeight: '700' },
  row: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  title: { color: '#1a237e', fontWeight: '700' },
  meta: { color: '#6b7280', marginTop: 4 },
  change: { color: '#111827', marginTop: 6, fontWeight: '600' },
  notes: { color: '#374151', marginTop: 4, fontStyle: 'italic' },
  time: { color: '#9ca3af', marginTop: 4, fontSize: 12 },
});

export default AdminAttendanceAuditScreen;


