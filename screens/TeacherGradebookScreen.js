import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';

const sampleAssignments = [
  { id: 'a1', title: 'Assignment 1', due: '2025-09-01', max: 100 },
  { id: 'a2', title: 'Quiz 1', due: '2025-09-05', max: 20 },
];

const TeacherGradebookScreen = () => {
  const [assignments, setAssignments] = useState(sampleAssignments);

  const createAssignment = () => {
    Alert.alert('Gradebook', 'Assignment creation coming soon.');
  };

  const exportCsv = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Export', 'CSV export available on web.');
      return;
    }
    const headers = ['title','due','max'];
    const rows = assignments.map(a => [a.title, a.due, a.max]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradebook_assignments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>Due: {item.due}</Text>
      <Text style={styles.meta}>Max: {item.max}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gradebook</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.button} onPress={createAssignment}>
            <Text style={styles.buttonText}>New Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#0ea5e9', marginLeft: 8 }]} onPress={exportCsv}>
            <Text style={styles.buttonText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={assignments}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 22 },
  button: { backgroundColor: '#1a237e', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  buttonText: { color: 'white', fontWeight: '700' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  title: { color: '#1a237e', fontWeight: '700', marginBottom: 6 },
  meta: { color: '#6b7280', fontSize: 12 },
});

export default TeacherGradebookScreen;


