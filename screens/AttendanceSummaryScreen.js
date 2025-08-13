import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Platform } from 'react-native';
import { apiClient } from '../services/api';
import { useBackButton } from '../utils/backButtonHandler';

const isIOS = Platform.OS === 'ios';

const AttendanceSummaryScreen = ({ route, navigation }) => {
  const { classId } = route.params || {};
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useBackButton(navigation);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.getTeacherAttendanceSummary({ classId, from, to });
      setSummary(resp?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Summary</Text>
        <Text style={styles.headerSubtitle}>Class: {classId || 'All'}</Text>
      </View>
      <View style={styles.filters}>
        <View style={styles.filterBox}>
          <Text style={styles.label}>From</Text>
          <TextInput value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" style={styles.input} />
        </View>
        <View style={styles.filterBox}>
          <Text style={styles.label}>To</Text>
          <TextInput value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" style={styles.input} />
        </View>
        <TouchableOpacity style={styles.applyBtn} onPress={load} disabled={loading}>
          <Text style={styles.applyText}>{loading ? 'Loading...' : 'Apply'}</Text>
        </TouchableOpacity>
      </View>

      {summary && (
        <>
          <View style={styles.totals}>
            <View style={[styles.totalCard, styles.present]}><Text style={styles.totalText}>Present: {summary.totals.present}</Text></View>
            <View style={[styles.totalCard, styles.absent]}><Text style={styles.totalText}>Absent: {summary.totals.absent}</Text></View>
            <View style={[styles.totalCard, styles.late]}><Text style={styles.totalText}>Late: {summary.totals.late}</Text></View>
            <View style={[styles.totalCard, styles.excused]}><Text style={styles.totalText}>Excused: {summary.totals.excused}</Text></View>
          </View>
          <FlatList
            data={summary.byStudent}
            keyExtractor={(i) => String(i.student_id)}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>P:{item.present} A:{item.absent} L:{item.late} E:{item.excused}</Text>
              </View>
            )}
            contentContainerStyle={{ padding: isIOS ? 20 : 16 }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  filters: { flexDirection: 'row', alignItems: 'flex-end', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterBox: { flex: 1, marginRight: 8 },
  label: { color: '#374151', fontWeight: '600', marginBottom: 6, fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f9fafb' },
  applyBtn: { backgroundColor: '#1a237e', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  applyText: { color: 'white', fontWeight: '700' },
  totals: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: isIOS ? 20 : 16, paddingTop: 16 },
  totalCard: { flex: 1, marginHorizontal: 4, borderRadius: 10, padding: 12 },
  totalText: { color: 'white', fontWeight: '700' },
  present: { backgroundColor: '#10b981' },
  absent: { backgroundColor: '#ef4444' },
  late: { backgroundColor: '#f59e0b' },
  excused: { backgroundColor: '#3b82f6' },
  row: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginTop: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  name: { color: '#1a237e', fontWeight: '700' },
  meta: { color: '#6b7280', marginTop: 4 },
});

export default AttendanceSummaryScreen;


