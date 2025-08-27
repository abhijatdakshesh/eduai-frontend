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
      {/* Header */}
      <View style={styles.header}> 
        <View style={styles.headerBadge} />
        <Text style={styles.headerEyebrow}>Overview</Text>
        <Text style={styles.headerTitle}>Teacher Dashboard</Text>
        <Text style={styles.headerSubtitle}>{loading ? 'Fetching your latest data…' : 'Stay on top of classes, attendance and updates'}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.cards}>
        <View style={[styles.card, styles.cardPrimary]}> 
          <View style={styles.cardAccent} />
          <Text style={styles.cardNum}>{totalClasses}</Text>
          <Text style={styles.cardLabel}>My Classes</Text>
        </View>
        <View style={[styles.card, styles.cardSecondary]}>
          <View style={[styles.cardAccent, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.cardNum}>{todayClasses}</Text>
          <Text style={styles.cardLabel}>Today</Text>
        </View>
        <View style={[styles.card, styles.cardTertiary]}>
          <View style={[styles.cardAccent, { backgroundColor: '#10b981' }]} />
          <Text style={styles.cardNum}>{totalStudents}</Text>
          <Text style={styles.cardLabel}>Students</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Text style={styles.sectionCaption}>Quick actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('TeacherMarkAttendance')}>
            <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Text style={styles.quickActionEmoji}>✅</Text>
            </View>
            <Text style={styles.quickActionText}>Mark Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('TeacherAnnouncements')}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFEFF' }]}>
              <Text style={styles.quickActionEmoji}>📣</Text>
            </View>
            <Text style={styles.quickActionText}>Post Announcement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('TeacherUploadResults')}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Text style={styles.quickActionEmoji}>📊</Text>
            </View>
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
  container: { flex: 1, backgroundColor: '#0b1025' },
  header: { backgroundColor: '#0b1025', paddingTop: isIOS ? 64 : 44, paddingBottom: 28, paddingHorizontal: 20 },
  headerBadge: { width: 52, height: 8, borderRadius: 999, backgroundColor: '#3b82f6', opacity: 0.35, marginBottom: 10 },
  headerEyebrow: { color: '#a5b4fc', fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' },
  headerTitle: { color: 'white', fontWeight: '800', fontSize: isIOS ? 30 : 26, marginTop: 4 },
  headerSubtitle: { color: '#94a3b8', fontSize: isIOS ? 14 : 13, marginTop: 6 },
  cards: { flexDirection: 'row', paddingHorizontal: isIOS ? 20 : 16, marginTop: -16 },
  card: { flex: 1, backgroundColor: '#111637', borderRadius: 16, padding: 20, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20 },
  cardPrimary: { borderColor: '#4338ca', borderWidth: 1 },
  cardSecondary: { borderColor: '#1d4ed8', borderWidth: 1 },
  cardTertiary: { borderColor: '#065f46', borderWidth: 1 },
  cardAccent: { width: 28, height: 4, borderRadius: 999, backgroundColor: '#6366f1', marginBottom: 10, opacity: 0.8 },
  cardNum: { color: 'white', fontWeight: '800', fontSize: 24 },
  cardLabel: { color: '#94a3b8', marginTop: 6 },
  actions: { paddingHorizontal: isIOS ? 20 : 16, marginTop: 16 },
  sectionCaption: { color: '#94a3b8', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  quickAction: { flex: 1, backgroundColor: '#0f1533', borderWidth: 1, borderColor: '#1f2a63', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center' },
  iconCircle: { width: 42, height: 42, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickActionEmoji: { fontSize: 20 },
  quickActionText: { color: '#cbd5e1', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  lists: { paddingHorizontal: isIOS ? 20 : 16, marginTop: 18 },
  section: { backgroundColor: '#0f1533', borderColor: '#1f2a63', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: 'white', fontWeight: '700', fontSize: 16 },
  sectionLink: { color: '#60a5fa' },
  emptyText: { color: '#64748b' },
  annItem: { backgroundColor: '#0b1025', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1f2a63' },
  annTitle: { color: 'white', fontWeight: '600' },
  annBody: { color: '#94a3b8', marginTop: 4, fontSize: 12 },
  classItem: { backgroundColor: '#0b1025', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1f2a63', flexDirection: 'row', alignItems: 'center' },
  classTitle: { color: 'white', fontWeight: '600' },
  classMeta: { color: '#94a3b8', marginTop: 2, fontSize: 12 },
  classBtn: { backgroundColor: '#1d4ed8', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginLeft: 10 },
  classBtnText: { color: 'white', fontWeight: '700' },
});

export default TeacherDashboardScreen;


