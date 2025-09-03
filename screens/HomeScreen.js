import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, Dimensions } from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    quickActions: [],
    recentActivities: [],
    performanceMetrics: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Back button handler for Home screen (shows exit alert)
  useBackButton(navigation, true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await apiClient.getDashboardStats();
      const quickActionsResponse = await apiClient.getDashboardQuickActions();
      
      if (statsResponse.success && quickActionsResponse.success) {
        // Transform backend data to frontend format
        const backendStats = statsResponse.data.stats || [];
        const backendActivities = statsResponse.data.recent_activities || [];
        const backendMetrics = statsResponse.data.performance_metrics || [];
        
        // Transform stats to frontend format - backend returns array of stat objects
        const transformedStats = backendStats.map(stat => {
          // Map backend stat IDs to frontend format
          let title, subtitle, icon, color, gradient;
          
          switch (stat.id) {
            case 'gpa':
              title = 'My GPA';
              subtitle = 'Current Semester';
              icon = '🎓';
              color = '#8b5cf6';
              gradient = ['#8b5cf6', '#a855f7'];
              break;
            case 'courses_enrolled':
              title = 'Courses Enrolled';
              subtitle = 'This Semester';
              icon = '📖';
              color = '#06b6d4';
              gradient = ['#06b6d4', '#0891b2'];
              break;
            case 'assignments_due':
              title = 'Assignments Due';
              subtitle = 'Next 7 Days';
              icon = '📝';
              color = '#f59e0b';
              gradient = ['#f59e0b', '#d97706'];
              break;
            case 'attendance':
              title = 'Attendance';
              subtitle = 'This Month';
              icon = '✅';
              color = '#10b981';
              gradient = ['#10b981', '#059669'];
              break;
            default:
              title = stat.title || 'Stat';
              subtitle = 'Current';
              icon = stat.icon || '📊';
              color = stat.color || '#6366f1';
              gradient = [color, color];
          }
          
          return {
            title,
            value: stat.value?.toString() || '0',
            icon,
            color,
            bgColor: color + '10',
            gradient,
            subtitle
          };
        });

        // Transform activities to frontend format
        const transformedActivities = backendActivities.map(activity => ({
          title: activity.title,
          description: activity.description,
          time: new Date(activity.date).toLocaleDateString(),
          type: activity.type,
          status: 'completed'
        }));

        // Transform performance metrics to frontend format
        const transformedMetrics = backendMetrics.map(metric => ({
          subject: metric.department,
          gpa: parseFloat(metric.average_gpa).toFixed(1),
          progress: parseFloat(metric.average_gpa) / 4.0, // Convert GPA to progress percentage
          color: metric.department === 'Computer Science' ? '#6366f1' : 
                 metric.department === 'Electrical Engineering' ? '#10b981' : '#f59e0b'
        }));

        setDashboardData({
          stats: transformedStats,
          quickActions: (quickActionsResponse.data || []).map(action => ({
            title: action.title,
            icon: action.icon,
            onPress: () => {
              // Map backend routes to frontend navigation
              switch (action.id) {
                case 'results_view':
                  navigation.navigate('Results Portal');
                  break;
                case 'schedule_view':
                  navigation.navigate('Schedule');
                  break;
                case 'course_registration':
                  navigation.navigate('Courses');
                  break;
                case 'ai_assistant':
                  navigation.navigate('Chatbot');
                  break;
                case 'job_search':
                  navigation.navigate('Job Portal');
                  break;
                case 'fee_payment':
                  navigation.navigate('Fees & Scholarships');
                  break;
                case 'campus_services':
                  navigation.navigate('Hostel & Transport');
                  break;
                case 'staff_directory':
                  navigation.navigate('HR & Staff');
                  break;
                case 'profile':
                  navigation.navigate('Profile');
                  break;
                default:
                  console.log('Unknown action:', action.id);
              }
            },
            color: action.id === 'results_view' ? '#8b5cf6' :
                   action.id === 'schedule_view' ? '#06b6d4' :
                   action.id === 'course_registration' ? '#f59e0b' :
                   action.id === 'ai_assistant' ? '#10b981' :
                   action.id === 'job_search' ? '#ef4444' :
                   action.id === 'fee_payment' ? '#06b6d4' : '#6366f1'
          })) || [
            { title: 'My Results', icon: '📊', onPress: () => navigation.navigate('Results Portal'), color: '#8b5cf6' },
            { title: 'Class Schedule', icon: '📅', onPress: () => navigation.navigate('Schedule'), color: '#06b6d4' },
            { title: 'Course Materials', icon: '📚', onPress: () => navigation.navigate('Courses'), color: '#f59e0b' },
            { title: 'AI Assistant', icon: '🤖', onPress: () => navigation.navigate('Chatbot'), color: '#10b981' },
          ],
          recentActivities: transformedActivities,
          performanceMetrics: transformedMetrics
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to default data if API fails
      setDashboardData({
        stats: [
          { 
            title: 'My GPA', 
            value: '3.85', 
            icon: '🎓', 
            color: '#8b5cf6', 
            bgColor: '#faf5ff',
            gradient: ['#8b5cf6', '#a855f7'],
            subtitle: 'Current Semester'
          },
          { 
            title: 'Courses Enrolled', 
            value: '5', 
            icon: '📖', 
            color: '#06b6d4', 
            bgColor: '#ecfeff',
            gradient: ['#06b6d4', '#0891b2'],
            subtitle: 'This Semester'
          },
          { 
            title: 'Assignments Due', 
            value: '3', 
            icon: '📝', 
            color: '#f59e0b', 
            bgColor: '#fffbeb',
            gradient: ['#f59e0b', '#d97706'],
            subtitle: 'Next 7 Days'
          },
          { 
            title: 'Attendance', 
            value: '94%', 
            icon: '✅', 
            color: '#10b981', 
            bgColor: '#f0fdf4',
            gradient: ['#10b981', '#059669'],
            subtitle: 'This Month'
          },
        ],
        quickActions: [
          { title: 'My Results', icon: '📊', onPress: () => navigation.navigate('Results Portal'), color: '#8b5cf6' },
          { title: 'Class Schedule', icon: '📅', onPress: () => navigation.navigate('Schedule'), color: '#06b6d4' },
          { title: 'Course Materials', icon: '📚', onPress: () => navigation.navigate('Courses'), color: '#f59e0b' },
          { title: 'AI Assistant', icon: '🤖', onPress: () => navigation.navigate('Chatbot'), color: '#10b981' },
        ],
        recentActivities: [
          { title: 'Assignment Submitted', description: 'Data Structures Assignment #3', time: '2 hours ago', type: 'assignment', status: 'completed' },
          { title: 'Grade Updated', description: 'CS101 - Introduction to Programming (A-)', time: '1 day ago', type: 'grade', status: 'completed' },
          { title: 'Course Registration', description: 'MATH201 - Calculus II', time: '2 days ago', type: 'course', status: 'completed' },
          { title: 'Attendance Marked', description: 'PHY101 - Physics Lab', time: '3 days ago', type: 'attendance', status: 'completed' },
        ],
        performanceMetrics: [
    { subject: 'Computer Science', gpa: 3.8, progress: 0.85, color: '#6366f1' },
    { subject: 'Mathematics', gpa: 3.6, progress: 0.78, color: '#10b981' },
    { subject: 'Physics', gpa: 3.9, progress: 0.92, color: '#f59e0b' },
    { subject: 'English', gpa: 3.7, progress: 0.81, color: '#ef4444' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setRefreshing(false));
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'course': return '📚';
      case 'grade': return '📊';
      case 'assignment': return '📝';
      case 'attendance': return '✅';
      case 'payment': return '💰';
      case 'job': return '💼';
      default: return '📋';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'course': return '#6366f1';
      case 'grade': return '#8b5cf6';
      case 'assignment': return '#f59e0b';
      case 'attendance': return '#10b981';
      case 'payment': return '#06b6d4';
      case 'job': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#06b6d4';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Student'}! 👋</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Overview</Text>
        <View style={styles.statsContainer}>
            {(dashboardData.stats || []).map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statGradient}>
                <View style={styles.statContent}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIcon}>{stat.icon}</Text>
                  </View>
                  <View style={styles.statText}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                      <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {(dashboardData.quickActions || []).map((action, index) => (
              <View key={index} style={styles.actionCard}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: action.color }]}
                  onPress={action.onPress}
                >
                  <View style={styles.actionButtonContent}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionText}>{action.title}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activitiesContainer}>
            {(dashboardData.recentActivities || []).map((activity, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={styles.activityContent}>
                  <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                    <Text style={styles.activityIconText}>{getActivityIcon(activity.type)}</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(activity.status) }]}>
                      {activity.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Performance</Text>
          <View style={styles.metricsContainer}>
            {(dashboardData.performanceMetrics || []).map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricSubject}>{metric.subject}</Text>
                  <View style={[styles.gpaBadge, { backgroundColor: metric.color }]}>
                    <Text style={styles.gpaText}>{metric.gpa}</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${metric.progress * 100}%`,
                        backgroundColor: metric.color 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: isIOS ? 16 : 20,
    paddingBottom: isIOS ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: isIOS ? 24 : 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  userName: {
    fontSize: isIOS ? 24 : 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  dateText: {
    color: '#6b7280',
    fontSize: isIOS ? 14 : 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: isIOS ? 12 : 16,
    marginTop: isIOS ? 12 : 16,
    marginBottom: isIOS ? 12 : 16,
  },
  statCard: {
    width: '48%',
    marginBottom: isIOS ? 8 : 12,
    marginHorizontal: '1%',
    borderRadius: isIOS ? 12 : 14,
    elevation: isIOS ? 2 : 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isIOS ? 2 : 3 },
    shadowOpacity: isIOS ? 0.08 : 0.09,
    shadowRadius: isIOS ? 4 : 6,
  },
  statGradient: {
    backgroundColor: '#ffffff',
    borderRadius: isIOS ? 12 : 14,
    padding: isIOS ? 12 : 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: isIOS ? 44 : 48,
    height: isIOS ? 44 : 48,
    borderRadius: isIOS ? 22 : 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isIOS ? 12 : 14,
  },
  statIcon: {
    fontSize: isIOS ? 22 : 24,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: isIOS ? 20 : 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  statTitle: {
    fontSize: isIOS ? 12 : 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: isIOS ? 10 : 12,
    color: '#9ca3af',
    fontWeight: '400',
    marginTop: 2,
  },
  section: {
    marginHorizontal: isIOS ? 12 : 16,
    marginBottom: isIOS ? 16 : 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isIOS ? 12 : 16,
  },
  sectionTitle: {
    fontSize: isIOS ? 18 : 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: isIOS ? 12 : 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: isIOS ? 8 : 10,
  },
  actionButton: {
    borderRadius: isIOS ? 12 : 14,
    elevation: isIOS ? 1 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isIOS ? 1 : 2 },
    shadowOpacity: isIOS ? 0.08 : 0.09,
    shadowRadius: isIOS ? 2 : 3,
  },
  actionButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: isIOS ? 16 : 18,
  },
  actionButtonLabel: {
    fontSize: isIOS ? 12 : 14,
    fontWeight: '600',
  },
  actionIcon: {
    fontSize: isIOS ? 28 : 30,
    marginBottom: isIOS ? 6 : 7,
  },
  actionText: {
    fontSize: isIOS ? 12 : 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  activitiesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: isIOS ? 12 : 16,
    padding: isIOS ? 12 : 16,
    elevation: isIOS ? 1 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isIOS ? 1 : 2 },
    shadowOpacity: isIOS ? 0.08 : 0.1,
    shadowRadius: isIOS ? 2 : 4,
  },
  activityCard: {
    marginBottom: isIOS ? 12 : 16,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: isIOS ? 40 : 48,
    height: isIOS ? 40 : 48,
    borderRadius: isIOS ? 20 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isIOS ? 12 : 16,
  },
  activityIconText: {
    fontSize: isIOS ? 18 : 20,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: isIOS ? 14 : 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: isIOS ? 12 : 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: isIOS ? 10 : 12,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: isIOS ? 6 : 8,
    paddingVertical: isIOS ? 3 : 4,
    borderRadius: isIOS ? 8 : 12,
  },
  statusText: {
    fontSize: isIOS ? 10 : 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metricsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: isIOS ? 12 : 16,
    padding: isIOS ? 16 : 20,
    elevation: isIOS ? 1 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isIOS ? 1 : 2 },
    shadowOpacity: isIOS ? 0.08 : 0.1,
    shadowRadius: isIOS ? 2 : 4,
  },
  metricCard: {
    marginBottom: isIOS ? 16 : 20,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isIOS ? 10 : 12,
  },
  metricSubject: {
    fontSize: isIOS ? 14 : 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  gpaBadge: {
    paddingHorizontal: isIOS ? 10 : 12,
    paddingVertical: isIOS ? 4 : 6,
    borderRadius: isIOS ? 8 : 12,
  },
  gpaText: {
    fontSize: isIOS ? 12 : 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressBar: {
    height: isIOS ? 6 : 8,
    borderRadius: isIOS ? 3 : 4,
    backgroundColor: '#e5e7eb',
  },
  progressFill: {
    height: '100%',
    borderRadius: isIOS ? 3 : 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 