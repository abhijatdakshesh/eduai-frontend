import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalCourses: 0,
    totalParents: 0,
    activeEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminDashboardStats();
      if (response.success) {
        setStats(response.data.stats || {});
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch admin stats');
        setStats({
          totalStudents: 0,
          totalTeachers: 0,
          totalClasses: 0,
          totalCourses: 0,
          totalParents: 0,
          activeEnrollments: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      Alert.alert('Error', error.message || 'Failed to fetch admin stats');
      setStats({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalCourses: 0,
        totalParents: 0,
        activeEnrollments: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'addStudent':
        navigation.navigate('AdminUserManagement', { type: 'students' });
        break;
      case 'addTeacher':
        navigation.navigate('AdminUserManagement', { type: 'teachers' });
        break;
      case 'createClass':
        navigation.navigate('AdminClassManagement');
        break;
      case 'manageCourses':
        navigation.navigate('AdminCourseManagement');
        break;
      case 'viewReports':
        navigation.navigate('AdminReports');
        break;
      case 'systemSettings':
        navigation.navigate('AdminSettings');
        break;
      default:
        Alert.alert('Coming Soon', 'This feature will be available soon!');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
      </View>
    );
  }

  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>System Management Overview</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.mainContent}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>👥</Text>
            </View>
            <Text style={styles.statNumber}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={[styles.statCard, styles.statCardSecondary]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>👨‍🏫</Text>
            </View>
            <Text style={styles.statNumber}>{stats.totalTeachers}</Text>
            <Text style={styles.statLabel}>Total Teachers</Text>
          </View>
          <View style={[styles.statCard, styles.statCardSuccess]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🏫</Text>
            </View>
            <Text style={styles.statNumber}>{stats.totalClasses}</Text>
            <Text style={styles.statLabel}>Total Classes</Text>
          </View>
          <View style={[styles.statCard, styles.statCardInfo]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📚</Text>
            </View>
            <Text style={styles.statNumber}>{stats.totalCourses}</Text>
            <Text style={styles.statLabel}>Total Courses</Text>
          </View>
          <View style={[styles.statCard, styles.statCardWarning]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>👨‍👩‍👧‍👦</Text>
            </View>
            <Text style={styles.statNumber}>{stats.totalParents}</Text>
            <Text style={styles.statLabel}>Total Parents</Text>
          </View>
          <View style={[styles.statCard, styles.statCardDanger]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>✅</Text>
            </View>
            <Text style={styles.statNumber}>{stats.activeEnrollments}</Text>
            <Text style={styles.statLabel}>Active Enrollments</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Frequently used operations</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardPrimary]}
              onPress={() => handleQuickAction('addStudent')}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>➕</Text>
              </View>
              <Text style={styles.actionTitle}>Add Student</Text>
              <Text style={styles.actionSubtitle}>Register new student</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardSecondary]}
              onPress={() => handleQuickAction('addTeacher')}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>👨‍🏫</Text>
              </View>
              <Text style={styles.actionTitle}>Add Teacher</Text>
              <Text style={styles.actionSubtitle}>Register new teacher</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardSuccess]}
              onPress={() => handleQuickAction('createClass')}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>🏫</Text>
              </View>
              <Text style={styles.actionTitle}>Create Class</Text>
              <Text style={styles.actionSubtitle}>Set up new class</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardInfo]}
              onPress={() => handleQuickAction('manageCourses')}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📚</Text>
              </View>
              <Text style={styles.actionTitle}>Manage Courses</Text>
              <Text style={styles.actionSubtitle}>Course administration</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardWarning]}
              onPress={() => handleQuickAction('viewReports')}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📊</Text>
              </View>
              <Text style={styles.actionTitle}>View Reports</Text>
              <Text style={styles.actionSubtitle}>Analytics & insights</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardDanger]}
              onPress={() => handleQuickAction('systemSettings')}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>⚙️</Text>
              </View>
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionSubtitle}>System configuration</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <Text style={styles.sectionSubtitle}>Latest system updates</Text>
          </View>
          <View style={styles.activitiesList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIconContainer, styles.activityIconPrimary]}>
                <Text style={styles.activityIcon}>👤</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New student registered</Text>
                <Text style={styles.activityTime}>2 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIconContainer, styles.activityIconSecondary]}>
                <Text style={styles.activityIcon}>📚</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Course "Advanced Mathematics" created</Text>
                <Text style={styles.activityTime}>15 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIconContainer, styles.activityIconSuccess]}>
                <Text style={styles.activityIcon}>🏫</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Class "Grade 10A" assigned to teacher</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#1a237e',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: Platform.OS === 'ios' ? 32 : 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#e3f2fd',
    opacity: 0.9,
  },
  mainContent: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: -30,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 140,
  },
  statCardPrimary: { 
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.1)',
  },
  statCardSecondary: { 
    backgroundColor: '#f3e5f5',
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.1)',
  },
  statCardSuccess: { 
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.1)',
  },
  statCardInfo: { 
    backgroundColor: '#e1f5fe',
    borderWidth: 1,
    borderColor: 'rgba(2, 136, 209, 0.1)',
  },
  statCardWarning: { 
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: 'rgba(239, 108, 0, 0.1)',
  },
  statCardDanger: { 
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.1)',
  },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statIcon: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: Platform.OS === 'ios' ? 28 : 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: Platform.OS === 'ios' ? 14 : 13,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 8,
    lineHeight: Platform.OS === 'ios' ? 20 : 18,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'ios' ? 24 : 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    color: '#6b7280',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  actionCardPrimary: { backgroundColor: '#e3f2fd' },
  actionCardSecondary: { backgroundColor: '#f3e5f5' },
  actionCardSuccess: { backgroundColor: '#e8f5e9' },
  actionCardInfo: { backgroundColor: '#e1f5fe' },
  actionCardWarning: { backgroundColor: '#fff3e0' },
  actionCardDanger: { backgroundColor: '#ffebee' },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: Platform.OS === 'ios' ? 13 : 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  activitiesList: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityIconPrimary: { backgroundColor: '#e3f2fd' },
  activityIconSecondary: { backgroundColor: '#f3e5f5' },
  activityIconSuccess: { backgroundColor: '#e8f5e9' },
  activityIcon: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: Platform.OS === 'ios' ? 13 : 11,
    color: '#6b7280',
  },
});

export default AdminDashboardScreen;
