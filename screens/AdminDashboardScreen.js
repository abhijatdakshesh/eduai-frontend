import React, { useState, useEffect, useRef } from 'react';
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
  RefreshControl,
  Animated,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalStudents: 1247,
    totalTeachers: 89,
    totalClasses: 156,
    totalCourses: 45,
    totalParents: 892,
    activeEnrollments: 1180,
    attendanceRate: 94.2,
    averageGPA: 3.42,
    newEnrollments: 23,
    pendingApprovals: 7,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    fetchAdminStats();
    loadNotifications();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin dashboard stats...');
      
      // Simulate API call with enhanced data
      const response = await apiClient.getAdminDashboardStats();
      if (response.success) {
        setStats({
          ...stats,
          ...response.data.stats,
        });
      } else {
        // Use enhanced mock data
        setStats({
          totalStudents: 1247,
          totalTeachers: 89,
          totalClasses: 156,
          totalCourses: 45,
          totalParents: 892,
          activeEnrollments: 1180,
          attendanceRate: 94.2,
          averageGPA: 3.42,
          newEnrollments: 23,
          pendingApprovals: 7,
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Use mock data as fallback
      setStats({
        totalStudents: 1247,
        totalTeachers: 89,
        totalClasses: 156,
        totalCourses: 45,
        totalParents: 892,
        activeEnrollments: 1180,
        attendanceRate: 94.2,
        averageGPA: 3.42,
        newEnrollments: 23,
        pendingApprovals: 7,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = () => {
    setNotifications([
      {
        id: 1,
        type: 'success',
        title: 'New Student Registration',
        message: 'John Smith has been successfully enrolled in Grade 10A',
        time: '2 minutes ago',
        icon: '👤',
      },
      {
        id: 2,
        type: 'warning',
        title: 'Low Attendance Alert',
        message: 'Grade 9B attendance dropped below 85%',
        time: '15 minutes ago',
        icon: '⚠️',
      },
      {
        id: 3,
        type: 'info',
        title: 'Course Update',
        message: 'Advanced Mathematics course has been updated',
        time: '1 hour ago',
        icon: '📚',
      },
      {
        id: 4,
        type: 'success',
        title: 'Teacher Assignment',
        message: 'Ms. Johnson assigned to Grade 11 Physics',
        time: '2 hours ago',
        icon: '👨‍🏫',
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAdminStats(), loadNotifications()]);
    setRefreshing(false);
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
      case 'bulkImport':
        navigation.navigate('AdminBulkImport');
        break;
      case 'attendanceAudit':
        navigation.navigate('AdminAttendanceAudit');
        break;
      default:
        Alert.alert('Coming Soon', 'This feature will be available soon!');
    }
  };

  // Modern UI Components
  const MetricCard = ({ title, value, change, icon, color = '#1a237e', onPress }) => (
    <Animated.View 
      style={[
        styles.metricCard, 
        { borderLeftColor: color, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.metricCardTouchable}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricIcon}>{icon}</Text>
          <Text style={styles.metricTitle}>{title}</Text>
        </View>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        {change && (
          <Text style={[styles.metricChange, { color: change > 0 ? '#10b981' : '#ef4444' }]}>
            {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const QuickActionCard = ({ title, subtitle, icon, color, onPress }) => (
    <Animated.View 
      style={[
        styles.actionCard, 
        { backgroundColor: color, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.actionCardTouchable}>
        <View style={styles.actionIconContainer}>
          <Text style={styles.actionIcon}>{icon}</Text>
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const NotificationItem = ({ notification }) => (
    <View style={[styles.notificationItem, styles[`notification${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`]]}>
      <View style={styles.notificationIcon}>
        <Text style={styles.notificationIconText}>{notification.icon}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
    </View>
  );

  const TimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {['7d', '30d', '90d'].map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            selectedTimeRange === range && styles.timeRangeButtonActive
          ]}
          onPress={() => setSelectedTimeRange(range)}
        >
          <Text style={[
            styles.timeRangeText,
            selectedTimeRange === range && styles.timeRangeTextActive
          ]}>
            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🚀 Loading Dashboard...</Text>
      </View>
    );
  }

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
    <View style={styles.container}>
      {/* Modern Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setShowSearchModal(true)}
            >
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => setShowNotifications(!showNotifications)}
            >
              <Text style={styles.notificationButtonText}>🔔</Text>
              {notifications.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>🎯 Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Real-time system insights & management</Text>
          <TimeRangeSelector />
        </View>
      </Animated.View>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard 
              title="Total Students" 
              value={stats.totalStudents.toLocaleString()} 
              change={12.5}
              icon="👥"
              color="#3b82f6"
              onPress={() => navigation.navigate('AdminUserManagement', { type: 'students' })}
            />
            <MetricCard 
              title="Active Teachers" 
              value={stats.totalTeachers} 
              change={8.2}
              icon="👨‍🏫"
              color="#10b981"
              onPress={() => navigation.navigate('AdminUserManagement', { type: 'teachers' })}
            />
            <MetricCard 
              title="Attendance Rate" 
              value={`${stats.attendanceRate}%`} 
              change={-1.2}
              icon="📅"
              color="#f59e0b"
              onPress={() => navigation.navigate('AdminAttendanceAudit')}
            />
            <MetricCard 
              title="Average GPA" 
              value={stats.averageGPA} 
              change={2.1}
              icon="📈"
              color="#8b5cf6"
              onPress={() => navigation.navigate('AdminReports')}
            />
            <MetricCard 
              title="New Enrollments" 
              value={stats.newEnrollments} 
              change={15.3}
              icon="🆕"
              color="#06b6d4"
              onPress={() => navigation.navigate('AdminUserManagement', { type: 'students' })}
            />
            <MetricCard 
              title="Pending Approvals" 
              value={stats.pendingApprovals} 
              change={-5.8}
              icon="⏳"
              color="#ef4444"
              onPress={() => Alert.alert('Pending Approvals', 'Review pending applications')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Add Student"
              subtitle="Register new student"
              icon="👤"
              color="#e3f2fd"
              onPress={() => handleQuickAction('addStudent')}
            />
            <QuickActionCard
              title="Add Teacher"
              subtitle="Register new teacher"
              icon="👨‍🏫"
              color="#f3e5f5"
              onPress={() => handleQuickAction('addTeacher')}
            />
            <QuickActionCard
              title="Create Class"
              subtitle="Set up new class"
              icon="🏫"
              color="#e8f5e9"
              onPress={() => handleQuickAction('createClass')}
            />
            <QuickActionCard
              title="Manage Courses"
              subtitle="Course administration"
              icon="📚"
              color="#e1f5fe"
              onPress={() => handleQuickAction('manageCourses')}
            />
            <QuickActionCard
              title="View Reports"
              subtitle="Analytics & insights"
              icon="📊"
              color="#fff3e0"
              onPress={() => handleQuickAction('viewReports')}
            />
            <QuickActionCard
              title="Bulk Import"
              subtitle="Import data via CSV"
              icon="📥"
              color="#fce4ec"
              onPress={() => handleQuickAction('bulkImport')}
            />
            <QuickActionCard
              title="Attendance Audit"
              subtitle="Review attendance"
              icon="📋"
              color="#f1f8e9"
              onPress={() => handleQuickAction('attendanceAudit')}
            />
            <QuickActionCard
              title="Settings"
              subtitle="System configuration"
              icon="⚙️"
              color="#ffebee"
              onPress={() => handleQuickAction('systemSettings')}
            />
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔔 Recent Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotifications(true)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.notificationsList}>
            {notifications.slice(0, 3).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModal}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>🔍 Search</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search students, teachers, classes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            <Text style={styles.searchHint}>Search functionality coming soon!</Text>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔔 Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <NotificationItem notification={item} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
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
    fontWeight: '600',
  },

  // Modern Header Styles
  header: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#1a237e',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchButtonText: {
    fontSize: 18,
    color: 'white',
  },
  notificationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },
  notificationButtonText: {
    fontSize: 18,
    color: 'white',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    opacity: 0.9,
    marginBottom: 16,
  },

  // Time Range Selector
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: 'white',
  },
  timeRangeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  timeRangeTextActive: {
    color: '#1a237e',
  },

  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  metricsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },

  // Metric Cards
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginTop: -20,
  },
  metricCard: {
    width: (width - 56) / 2,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  metricCardTouchable: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionCard: {
    width: (width - 56) / 2,
    borderRadius: 20,
    padding: 20,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  actionCardTouchable: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Notifications
  notificationsList: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notificationSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    paddingLeft: 16,
  },
  notificationWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    paddingLeft: 16,
  },
  notificationInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    paddingLeft: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationIconText: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  searchModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: height * 0.6,
  },
  notificationsModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: height * 0.8,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  searchHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AdminDashboardScreen;
