import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, FlatList, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';
const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PADDING = 16; // matches statsGrid paddingHorizontal
const GAP = 16; // vertical spacing already; we'll simulate horizontal gap with space-between
const STAT_CARD_WIDTH = SCREEN_WIDTH > 420
  ? (SCREEN_WIDTH - (H_PADDING * 2) - GAP) / 2
  : SCREEN_WIDTH - (H_PADDING * 2);

const ParentDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ childrenCount: 0, unreadAnnouncements: 0, unpaidInvoices: 0, upcomingEvents: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [dash, kids, anns] = await Promise.all([
        apiClient.getParentDashboard(),
        apiClient.getParentChildren(),
        apiClient.getParentAnnouncements({ limit: 5 }),
      ]);
      if (kids?.success) setChildren(kids.data?.children || []);
      if (anns?.success) setAnnouncements(anns.data?.announcements || []);
      // Normalize stats from dashboard response with safe fallbacks
      if (dash?.success) {
        const raw = dash.data?.stats || dash.data || {};
        const pickNum = (k, alt) => Number(raw?.[k] ?? raw?.[alt] ?? 0) || 0;
        setStats({
          childrenCount: pickNum('children', 'childrenCount') || (kids?.data?.children?.length || 0),
          unreadAnnouncements: pickNum('unreadAnnouncements', 'unread_announcements'),
          unpaidInvoices: pickNum('unpaidInvoices', 'unpaid_invoices'),
          upcomingEvents: pickNum('upcomingEvents', 'upcoming_events'),
        });
      } else {
        setStats((prev) => ({ ...prev, childrenCount: kids?.data?.children?.length || 0 }));
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const openChild = (child) => {
    navigation.navigate('ParentChildren', { focusId: child.id });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parent Dashboard</Text>
        <Text style={styles.headerSubtitle}>{loading ? 'Loading...' : 'Welcome back'}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statPrimary]}>
          <Text style={styles.statNumber}>{stats.childrenCount}</Text>
          <Text style={styles.statLabel}>Children</Text>
        </View>
        <View style={[styles.statCard, styles.statInfo]}>
          <Text style={styles.statNumber}>{stats.unreadAnnouncements}</Text>
          <Text style={styles.statLabel}>Unread Announcements</Text>
        </View>
        <View style={[styles.statCard, styles.statWarning]}>
          <Text style={styles.statNumber}>{stats.unpaidInvoices}</Text>
          <Text style={styles.statLabel}>Unpaid Invoices</Text>
        </View>
        <View style={[styles.statCard, styles.statSuccess]}>
          <Text style={styles.statNumber}>{stats.upcomingEvents}</Text>
          <Text style={styles.statLabel}>Upcoming Events</Text>
        </View>
      </View>

      {/* Children carousel */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}> 
          <Text style={styles.sectionTitle}>My Children</Text>
        </View>
        {children.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>No children linked</Text></View>
        ) : (
          <FlatList
            data={children}
            horizontal
            keyExtractor={(c) => String(c.id)}
            renderItem={({ item }) => (
              <View style={styles.childCard}>
                <Text style={styles.childName}>{item.first_name} {item.last_name}</Text>
                <Text style={styles.childMeta}>{item.grade_level}</Text>
                <View style={styles.childChips}>
                  <TouchableOpacity style={[styles.chip, styles.chipPrimary]} onPress={() => navigation.navigate('ParentAttendance', { studentId: item.id, childName: item.first_name })}><Text style={styles.chipText}>Attendance</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.chip, styles.chipInfo]} onPress={() => navigation.navigate('ParentResults', { studentId: item.id, childName: item.first_name })}><Text style={styles.chipText}>Results</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.chip, styles.chipWarning]} onPress={() => navigation.navigate('ParentFees', { studentId: item.id, childName: item.first_name })}><Text style={styles.chipText}>Fees</Text></TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingHorizontal: isIOS ? 20 : 16 }}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      {/* Announcements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}> 
          <Text style={styles.sectionTitle}>Announcements</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ParentAnnouncements')}><Text style={styles.link}>View all</Text></TouchableOpacity>
        </View>
        {announcements.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>No announcements</Text></View>
        ) : (
          announcements.map((a) => (
            <View key={a.id} style={styles.announcement}>
              <View style={styles.annHeader}>
                <Text style={styles.annTitle}>{a.title}</Text>
                <Text style={styles.annMeta}>{new Date(a.created_at || a.date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.annBody} numberOfLines={2}>{a.body || a.message}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 12, justifyContent: 'space-between', alignItems: 'stretch' },
  statCard: { width: STAT_CARD_WIDTH, backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, minHeight: 120 },
  statNumber: { color: '#1a237e', fontWeight: '800', fontSize: 24, marginBottom: 6 },
  statLabel: { color: '#6b7280', fontWeight: '600', textAlign: 'center' },
  statPrimary: { backgroundColor: '#e3f2fd' },
  statInfo: { backgroundColor: '#e1f5fe' },
  statWarning: { backgroundColor: '#fff3e0' },
  statSuccess: { backgroundColor: '#e8f5e9' },
  section: { paddingVertical: 16 },
  sectionHeader: { paddingHorizontal: isIOS ? 20 : 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: '#1a237e', fontWeight: '700', fontSize: 18 },
  link: { color: '#1a237e', fontWeight: '700' },
  childCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginRight: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3, width: 240 },
  childName: { color: '#1a237e', fontWeight: '800' },
  childMeta: { color: '#6b7280', marginTop: 4 },
  childChips: { flexDirection: 'row', marginTop: 10 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, marginRight: 6 },
  chipPrimary: { backgroundColor: '#e3f2fd' },
  chipInfo: { backgroundColor: '#e1f5fe' },
  chipWarning: { backgroundColor: '#fff3e0' },
  chipText: { color: '#1a237e', fontWeight: '700' },
  announcement: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginHorizontal: isIOS ? 20 : 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  annHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  annTitle: { color: '#1a237e', fontWeight: '700' },
  annMeta: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  annBody: { color: '#374151', marginTop: 6 },
  emptyCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginHorizontal: isIOS ? 20 : 16 },
  emptyText: { color: '#6b7280', textAlign: 'center' },
});

export default ParentDashboardScreen;


