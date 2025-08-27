import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { apiClient } from '../services/api';
import { useBackButton } from '../utils/backButtonHandler';

const isIOS = Platform.OS === 'ios';

const TeacherDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useBackButton(navigation);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Load classes
        const resp = await apiClient.getTeacherClasses();
        const list = resp?.data?.classes || [];
        setClasses(list);

        // Load recent announcements (limit 5)
        try {
          const ann = await apiClient.getTeacherAnnouncements({ limit: 5 });
          const arr = ann?.data?.announcements || ann?.data || [];
          setAnnouncements(Array.isArray(arr) ? arr : []);
        } catch (e) {
          setAnnouncements([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalClasses = classes?.length || 0;
  const totalStudents = useMemo(() => {
    if (!Array.isArray(classes)) return 0;
    return classes.reduce((sum, c) => sum + (Number(c?.enrolled_students) || 0), 0);
  }, [classes]);
  const todayClasses = totalClasses; // Placeholder without a schedule endpoint

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teacher Dashboard</Text>
        <Text style={styles.headerSubtitle}>{loading ? 'Loading...' : 'Quick overview'}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{totalClasses}</Text>
          <Text style={styles.cardLabel}>My Classes</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{todayClasses}</Text>
          <Text style={styles.cardLabel}>Today</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNum}>{totalStudents}</Text>
          <Text style={styles.cardLabel}>Students</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('TeacherMarkAttendance')}>
            <Text style={styles.quickActionEmoji}>✅</Text>
            <Text style={styles.quickActionText}>Mark Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('TeacherAnnouncements')}>
            <Text style={styles.quickActionEmoji}>📣</Text>
            <Text style={styles.quickActionText}>Post Announcement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('TeacherUploadResults')}>
            <Text style={styles.quickActionEmoji}>📊</Text>
            <Text style={styles.quickActionText}>Upload Results</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Lists */}
      <ScrollView style={styles.lists} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Recent Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Announcements</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TeacherAnnouncements')}>
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color="#1a237e" />
          ) : announcements.length === 0 ? (
            <Text style={styles.emptyText}>No announcements yet.</Text>
          ) : (
            <FlatList
              data={announcements}
              keyExtractor={(item, idx) => String(item?.id || idx)}
              renderItem={({ item }) => (
                <View style={styles.annItem}>
                  <Text style={styles.annTitle} numberOfLines={1}>{item?.title || 'Untitled'}</Text>
                  <Text style={styles.annBody} numberOfLines={2}>{item?.body || ''}</Text>
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* My Classes (preview) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Classes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TeacherClasses')}>
              <Text style={styles.sectionLink}>Go to classes</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color="#1a237e" />
          ) : (classes?.length || 0) === 0 ? (
            <Text style={styles.emptyText}>No classes found.</Text>
          ) : (
            <FlatList
              data={classes.slice(0, 5)}
              keyExtractor={(item, idx) => String(item?.id || idx)}
              renderItem={({ item }) => (
                <View style={styles.classItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.classTitle} numberOfLines={1}>{item?.name || item?.title || 'Unnamed Class'}</Text>
                    <Text style={styles.classMeta}>{(item?.subject || item?.course || '—')} • {(item?.enrolled_students ?? 0)} students</Text>
                  </View>
                  <TouchableOpacity style={styles.classBtn} onPress={() => navigation.navigate('TeacherMarkAttendance', { classId: item?.id })}>
                    <Text style={styles.classBtnText}>Mark</Text>
                  </TouchableOpacity>
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
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


