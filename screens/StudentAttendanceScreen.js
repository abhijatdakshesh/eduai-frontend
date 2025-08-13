import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const StudentAttendanceScreen = ({ navigation }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [summaryTotals, setSummaryTotals] = useState({ present: 0, absent: 0, late: 0, excused: 0 });

  const load = async () => {
    try {
      setLoading(true);
      const [rec, sum] = await Promise.all([
        apiClient.getStudentAttendance({ from, to }),
        apiClient.getStudentAttendanceSummary({ from, to }),
      ]);
      const recs = rec?.success ? (rec.data?.attendance || []) : [];
      setRecords(recs);

      // Normalize summary response shapes and fallback to compute from recs
      let totals = { present: 0, absent: 0, late: 0, excused: 0 };
      if (sum?.success && sum.data) {
        const d = sum.data;
        const src = d.totals || d.summary || d;
        const pick = (k) => Number(src?.[k] ?? src?.[`${k}_count`] ?? src?.[k?.toUpperCase?.()] ?? 0) || 0;
        totals = {
          present: pick('present'),
          absent: pick('absent'),
          late: pick('late'),
          excused: pick('excused'),
        };
      }
      // If totals are all zero but we have records, compute from records as fallback
      if ((totals.present + totals.absent + totals.late + totals.excused) === 0 && recs.length > 0) {
        totals = recs.reduce((acc, r) => {
          const s = String(r.status || '').toLowerCase();
          if (s === 'present') acc.present += 1;
          else if (s === 'absent') acc.absent += 1;
          else if (s === 'late') acc.late += 1;
          else if (s === 'excused') acc.excused += 1;
          return acc;
        }, { present: 0, absent: 0, late: 0, excused: 0 });
      }
      setSummaryTotals(totals);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const statusColor = (s) => {
    switch ((s || '').toLowerCase()) {
      case 'present': return '#10b981';
      case 'absent': return '#ef4444';
      case 'late': return '#f59e0b';
      case 'excused': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Attendance</Text>
        <Text style={styles.headerSubtitle}>Track your attendance by date</Text>
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

      <View style={styles.totals}>
        <View style={[styles.totalCard, { backgroundColor: '#10b981' }]}><Text style={styles.totalText}>Present: {summaryTotals.present}</Text></View>
        <View style={[styles.totalCard, { backgroundColor: '#ef4444' }]}><Text style={styles.totalText}>Absent: {summaryTotals.absent}</Text></View>
        <View style={[styles.totalCard, { backgroundColor: '#f59e0b' }]}><Text style={styles.totalText}>Late: {summaryTotals.late}</Text></View>
        <View style={[styles.totalCard, { backgroundColor: '#3b82f6' }]}><Text style={styles.totalText}>Excused: {summaryTotals.excused}</Text></View>
      </View>

      <FlatList
        data={records}
        keyExtractor={(i, idx) => String(i.id || i.attendance_id || idx)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.dateText}>{item.date}</Text>
              <Text style={styles.classText}>{item.class_name || item.course_name}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}>
              <Text style={styles.badgeText}>{(item.status || '?').toUpperCase()}</Text>
            </View>
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
  filters: { flexDirection: 'row', alignItems: 'flex-end', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterBox: { flex: 1, marginRight: 8 },
  label: { color: '#374151', fontWeight: '600', marginBottom: 6, fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f9fafb' },
  applyBtn: { backgroundColor: '#1a237e', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  applyText: { color: 'white', fontWeight: '700' },
  totals: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: isIOS ? 20 : 16, paddingTop: 16 },
  totalCard: { flex: 1, marginHorizontal: 4, borderRadius: 10, padding: 12 },
  totalText: { color: 'white', fontWeight: '700' },
  row: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  rowLeft: { flexDirection: 'column' },
  dateText: { color: '#1a237e', fontWeight: '700' },
  classText: { color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: 'white', fontWeight: '800' },
});

export default StudentAttendanceScreen;


