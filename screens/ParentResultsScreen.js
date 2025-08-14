import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Platform, Alert } from 'react-native';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const ParentResultsScreen = ({ route }) => {
  const { studentId, childName } = route.params || {};
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.getParentChildResults(studentId, { semester, year });
      if (resp?.success) setResults(resp.data?.results || []);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Results - {childName || 'Student'}</Text><Text style={styles.headerSubtitle}>Filters and transcript data</Text></View>
      <View style={styles.filters}>
        <View style={styles.filterBox}><Text style={styles.label}>Semester</Text><TextInput value={semester} onChangeText={setSemester} placeholder="Fall/Spring" style={styles.input} /></View>
        <View style={styles.filterBox}><Text style={styles.label}>Year</Text><TextInput value={year} onChangeText={setYear} placeholder="2024" style={styles.input} /></View>
        <TouchableOpacity style={styles.applyBtn} onPress={load} disabled={loading}><Text style={styles.applyText}>{loading ? 'Loading...' : 'Apply'}</Text></TouchableOpacity>
      </View>
      <FlatList
        data={results}
        keyExtractor={(i, idx) => String(i.id || idx)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.course}>{item.course_name}</Text>
              <Text style={styles.meta}>Credits: {item.credits} • {item.semester} {item.year}</Text>
            </View>
            <View style={styles.grade}><Text style={styles.gradeText}>{item.grade}</Text></View>
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
  row: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginTop: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  course: { color: '#1a237e', fontWeight: '700' },
  meta: { color: '#6b7280', marginTop: 2 },
  grade: { backgroundColor: '#e3f2fd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  gradeText: { color: '#1a237e', fontWeight: '800' },
});

export default ParentResultsScreen;


