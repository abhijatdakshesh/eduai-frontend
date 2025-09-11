import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Alert, Platform, Dimensions, RefreshControl } from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const AdminSectionDetailScreen = ({ navigation, route }) => {
  const { sectionId, sectionName } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useBackButton(navigation);

  useEffect(() => {
    fetchAll();
  }, [sectionId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [secResp, stuResp, tchResp] = await Promise.all([
        apiClient.getSection(sectionId),
        apiClient.getSectionStudents(sectionId),
        apiClient.getSectionTeachers(sectionId),
      ]);
      if (secResp?.success) setSection(secResp.data.section || secResp.data || null);
      if (stuResp?.success) setStudents(stuResp.data.students || stuResp.data || []);
      else setStudents([]);
      if (tchResp?.success) setTeachers(tchResp.data.teachers || tchResp.data || []);
      else setTeachers([]);
    } catch (e) {
      console.error('Section detail load error:', e);
      Alert.alert('Error', e?.message || 'Failed to load section details');
      setStudents([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const renderStudent = ({ item }) => (
    <View style={styles.personCard}>
      <View style={styles.personAvatar}><Text style={styles.avatarText}>{(item.first_name?.[0] || '') + (item.last_name?.[0] || '')}</Text></View>
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.personSub}>ID: {item.student_id}  •  {item.email || '—'}</Text>
      </View>
    </View>
  );

  const renderTeacher = ({ item }) => (
    <View style={styles.personCard}>
      <View style={[styles.personAvatar, { backgroundColor: '#10b981' }]}><Text style={styles.avatarText}>{(item.first_name?.[0] || '') + (item.last_name?.[0] || '')}</Text></View>
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.personSub}>{item.email || '—'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{section?.name || sectionName || 'Section'}</Text>
          <Text style={styles.headerSubtitle}>{section?.department || ''}{section?.academic_year ? ` • ${section.academic_year}` : ''}</Text>
        </View>
      </View>

      <ScrollView style={styles.body} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statNum}>{students.length}</Text><Text style={styles.statLabel}>Students</Text></View>
          <View style={styles.statBox}><Text style={styles.statNum}>{teachers.length}</Text><Text style={styles.statLabel}>Teachers</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Teachers</Text>
        <FlatList
          data={teachers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTeacher}
          ListEmptyComponent={<Text style={styles.empty}>No teachers assigned</Text>}
          scrollEnabled={false}
        />

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Students</Text>
        <FlatList
          data={students}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderStudent}
          ListEmptyComponent={<Text style={styles.empty}>No students assigned</Text>}
          scrollEnabled={false}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: { paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontSize: isIOS ? 28 : 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#e3f2fd', marginTop: 6 },
  body: { paddingHorizontal: 20, paddingTop: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: 'white', marginRight: 8, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  statNum: { fontSize: 22, fontWeight: '700', color: '#1a237e' },
  statLabel: { color: '#64748b', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a237e', marginVertical: 12 },
  personCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  personAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontWeight: '700' },
  personInfo: { flex: 1 },
  personName: { color: '#1a237e', fontWeight: '700' },
  personSub: { color: '#64748b', marginTop: 2 },
  empty: { color: '#94a3b8', fontStyle: 'italic', marginBottom: 8 },
});

export default AdminSectionDetailScreen;
