import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { apiClient } from '../services/api';
import { useBackButton } from '../utils/backButtonHandler';

const isIOS = Platform.OS === 'ios';

const TeacherDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ classes: 0, today: 0 });

  useBackButton(navigation);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await apiClient.getTeacherClasses();
        const classes = resp?.data?.classes || [];
        setStats({ classes: classes.length, today: classes.length });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}> 
        <Text style={styles.headerTitle}>Teacher Dashboard</Text>
        <Text style={styles.headerSubtitle}>{loading ? 'Loading...' : 'Quick overview'}</Text>
      </View>

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{stats.classes}</Text>
          <Text style={styles.cardLabel}>My Classes</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{stats.today}</Text>
          <Text style={styles.cardLabel}>Today</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('TeacherClasses')}> 
          <Text style={styles.actionText}>Go to Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.secondary]} onPress={() => navigation.navigate('AttendanceSummary', { classId: undefined })}>
          <Text style={styles.actionText}>View Summary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  cards: { flexDirection: 'row', padding: isIOS ? 20 : 16 },
  card: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 20, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  cardNum: { color: '#1a237e', fontWeight: '800', fontSize: 24 },
  cardLabel: { color: '#6b7280', marginTop: 6 },
  actions: { paddingHorizontal: isIOS ? 20 : 16 },
  actionBtn: { backgroundColor: '#1a237e', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  actionText: { color: 'white', fontWeight: '700' },
  secondary: { backgroundColor: '#3b82f6' },
});

export default TeacherDashboardScreen;


