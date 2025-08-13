import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { apiClient } from '../services/api';
import { useBackButton } from '../utils/backButtonHandler';

const isIOS = Platform.OS === 'ios';

const TeacherClassesScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useBackButton(navigation);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await apiClient.getTeacherClasses();
        setClasses(resp?.data?.classes || []);
      } catch (e) {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your classes...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.classCard}>
      <Text style={styles.className}>{item.name}</Text>
      <Text style={styles.classMeta}>{item.grade_level} • {item.academic_year}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={styles.smallBtn} onPress={() => navigation.navigate('MarkAttendance', { classId: item.id, className: item.name })}>
          <Text style={styles.smallBtnText}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#3b82f6' }]} onPress={() => navigation.navigate('AttendanceSummary', { classId: item.id })}>
          <Text style={styles.smallBtnText}>Summary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Classes</Text>
        <Text style={styles.headerSubtitle}>Select a class to mark attendance</Text>
      </View>
      <FlatList
        data={classes}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: isIOS ? 20 : 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#1a237e', fontSize: 16 },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  classCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  className: { color: '#1a237e', fontWeight: '700', fontSize: 18, marginBottom: 6 },
  classMeta: { color: '#6b7280', fontSize: 13, marginBottom: 8 },
  takeAttendance: { color: '#1a237e', fontWeight: '600', marginTop: 6 },
  smallBtn: { backgroundColor: '#1a237e', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  smallBtnText: { color: 'white', fontWeight: '700' },
});

export default TeacherClassesScreen;


