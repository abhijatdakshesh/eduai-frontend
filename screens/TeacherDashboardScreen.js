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

  const getSampleClasses = () => [
    {
      id: 1,
      name: 'Mathematics 10A',
      subject: 'Mathematics',
      course: 'Advanced Mathematics',
      grade_level: 'Grade 10',
      academic_year: '2024',
      enrolled_students: 28,
      capacity: 30,
      room: 'Room 201',
      schedule: 'Mon, Wed, Fri 9:00 AM - 10:00 AM'
    },
    {
      id: 2,
      name: 'Physics 11B',
      subject: 'Physics',
      course: 'Physics I',
      grade_level: 'Grade 11',
      academic_year: '2024',
      enrolled_students: 24,
      capacity: 25,
      room: 'Lab 101',
      schedule: 'Tue, Thu 2:00 PM - 3:30 PM'
    },
    {
      id: 3,
      name: 'Chemistry 12A',
      subject: 'Chemistry',
      course: 'Advanced Chemistry',
      grade_level: 'Grade 12',
      academic_year: '2024',
      enrolled_students: 22,
      capacity: 25,
      room: 'Lab 202',
      schedule: 'Mon, Wed 1:00 PM - 2:30 PM'
    }
  ];

  const getSampleAnnouncements = () => [
    {
      id: 1,
      title: 'Mid-term Exam Schedule',
      content: 'Mid-term exams will be conducted from March 15-20. Please prepare accordingly.',
      created_at: '2024-03-01T10:00:00Z',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Parent-Teacher Meeting',
      content: 'Parent-teacher meetings are scheduled for March 25th. Please confirm your availability.',
      created_at: '2024-02-28T14:30:00Z',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Science Fair Project Guidelines',
      content: 'Science fair projects are due by March 30th. Guidelines have been shared in class.',
      created_at: '2024-02-27T09:15:00Z',
      priority: 'low'
    }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Try to load real data first
        try {
          console.log('TeacherDashboard: Attempting to fetch teacher classes...');
          const resp = await apiClient.getTeacherClasses();
          console.log('TeacherDashboard: Full API response:', JSON.stringify(resp, null, 2));
          
          if (resp?.success && resp?.data?.classes && Array.isArray(resp.data.classes)) {
            console.log('TeacherDashboard: Using real API data with', resp.data.classes.length, 'classes');
            // Map the API data to ensure correct field names
            const mappedClasses = resp.data.classes.map(cls => ({
              ...cls,
              enrolled_students: parseInt(cls.current_students) || 0,
              subject: cls.subject || cls.name,
              course: cls.course || cls.name
            }));
            setClasses(mappedClasses);
          } else {
            console.log('TeacherDashboard: API returned invalid response, using sample data');
            setClasses(getSampleClasses());
          }
        } catch (e) {
          console.log('TeacherDashboard: API call failed, using sample data:', e?.message);
          setClasses(getSampleClasses());
        }

        // Load recent announcements (limit 5)
        try {
          const ann = await apiClient.getTeacherAnnouncements({ limit: 5 });
          const arr = ann?.data?.announcements || ann?.data || [];
          if (Array.isArray(arr) && arr.length > 0) {
            setAnnouncements(arr);
          } else {
            setAnnouncements(getSampleAnnouncements());
          }
        } catch (e) {
          console.log('Announcements API failed, showing sample data');
          setAnnouncements(getSampleAnnouncements());
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
          <TouchableOpacity style={[styles.quickAction, styles.primaryAction]} onPress={() => navigation.navigate('TeacherAttendanceFlow')}>
            <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Text style={styles.quickActionEmoji}>📋</Text>
            </View>
            <Text style={[styles.quickActionText, styles.primaryActionText]}>Take Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('TeacherMarkAttendance')}>
            <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF' }]}>
              <Text style={styles.quickActionEmoji}>✅</Text>
            </View>
            <Text style={styles.quickActionText}>Quick Mark</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsRow}>
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
                  <TouchableOpacity style={styles.classBtn} onPress={() => navigation.navigate('TeacherAttendanceFlow')}>
                    <Text style={styles.classBtnText}>Take Attendance</Text>
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
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 64 : 44, paddingBottom: 28, paddingHorizontal: 20 },
  headerBadge: { width: 52, height: 8, borderRadius: 999, backgroundColor: '#ffffff', opacity: 0.35, marginBottom: 10 },
  headerEyebrow: { color: '#e3f2fd', fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' },
  headerTitle: { color: 'white', fontWeight: '800', fontSize: isIOS ? 30 : 26, marginTop: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 14 : 13, marginTop: 6 },
  cards: { flexDirection: 'row', paddingHorizontal: isIOS ? 20 : 16, marginTop: 16 },
  card: { flex: 1, backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardPrimary: { borderColor: '#e8eaf6', borderWidth: 1 },
  cardSecondary: { borderColor: '#e3f2fd', borderWidth: 1 },
  cardTertiary: { borderColor: '#e8f5e8', borderWidth: 1 },
  cardAccent: { width: 28, height: 4, borderRadius: 999, backgroundColor: '#3f51b5', marginBottom: 10, opacity: 0.8 },
  cardNum: { color: '#1a237e', fontWeight: '800', fontSize: 24 },
  cardLabel: { color: '#64748b', marginTop: 6 },
  actions: { paddingHorizontal: isIOS ? 20 : 16, marginTop: 16 },
  sectionCaption: { color: '#64748b', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  quickAction: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  primaryAction: { backgroundColor: '#1a237e', borderColor: '#1a237e', shadowColor: '#1a237e', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  iconCircle: { width: 42, height: 42, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickActionEmoji: { fontSize: 20 },
  quickActionText: { color: '#374151', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  primaryActionText: { color: '#ffffff', fontWeight: '700' },
  lists: { paddingHorizontal: isIOS ? 20 : 16, marginTop: 18 },
  section: { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#1a237e', fontWeight: '700', fontSize: 16 },
  sectionLink: { color: '#3f51b5' },
  emptyText: { color: '#64748b' },
  annItem: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  annTitle: { color: '#1a237e', fontWeight: '600' },
  annBody: { color: '#64748b', marginTop: 4, fontSize: 12 },
  classItem: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center' },
  classTitle: { color: '#1a237e', fontWeight: '600' },
  classMeta: { color: '#64748b', marginTop: 2, fontSize: 12 },
  classBtn: { backgroundColor: '#3f51b5', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginLeft: 10 },
  classBtnText: { color: 'white', fontWeight: '700' },
});

export default TeacherDashboardScreen;


