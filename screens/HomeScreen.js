import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Platform, 
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';

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

  // Animation values
  const fadeAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

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
          })) || [
            { title: 'My Results', icon: '📊', onPress: () => navigation.navigate('Results Portal') },
            { title: 'Class Schedule', icon: '📅', onPress: () => navigation.navigate('Schedule') },
            { title: 'Course Materials', icon: '📚', onPress: () => navigation.navigate('Courses') },
            { title: 'AI Assistant', icon: '🤖', onPress: () => navigation.navigate('Chatbot') },
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
            { title: 'My Results', icon: '📊', onPress: () => navigation.navigate('Results Portal') },
            { title: 'Class Schedule', icon: '📅', onPress: () => navigation.navigate('Schedule') },
            { title: 'Course Materials', icon: '📚', onPress: () => navigation.navigate('Courses') },
            { title: 'AI Assistant', icon: '🤖', onPress: () => navigation.navigate('Chatbot') },
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
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
          <Text style={styles.loadingSubtext}>Getting the latest updates</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={["#ffffff"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header with Gradient */}
        <Animated.View style={[styles.header, { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>Good {getGreeting()},</Text>
                <Text style={styles.userName}>{user?.name || 'Student'}! 👋</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Text style={styles.notificationIcon}>🔔</Text>
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </Animated.View>

        {/* Modern Stats Cards */}
        <Animated.View style={[styles.section, { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Overview</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsContainer}>
            {(dashboardData.stats || []).map((stat, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.statCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                <View style={[styles.statGradient, { backgroundColor: stat.color + '15' }]}>
                  <View style={styles.statContent}>
                    <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                      <Text style={styles.statIcon}>{stat.icon}</Text>
                    </View>
                    <View style={styles.statText}>
                      <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                      <Text style={styles.statTitle}>{stat.title}</Text>
                      <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
                    </View>
                    <View style={styles.statTrend}>
                      <Text style={styles.trendIcon}>📈</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Modern Quick Actions */}
        <Animated.View style={[styles.section, { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>All Features</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickActionsGrid}>
            {(dashboardData.quickActions || []).map((action, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.actionCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonContent}>
                    <View style={styles.actionIconContainer}>
                      <Text style={styles.actionIcon}>{action.icon}</Text>
                    </View>
                    <Text style={styles.actionText}>{action.title}</Text>
                    <View style={styles.actionArrow}>
                      <Text style={styles.arrowIcon}>→</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Modern Recent Activities */}
        <Animated.View style={[styles.section, { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activitiesContainer}>
            {(dashboardData.recentActivities || []).map((activity, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.activityCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                <View style={styles.activityContent}>
                  <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                    <Text style={styles.activityIconText}>{getActivityIcon(activity.type)}</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(activity.status) }]}>
                          {activity.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Modern Performance Metrics */}
        <Animated.View style={[styles.section, { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Academic Performance</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View Report</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.metricsContainer}>
            {(dashboardData.performanceMetrics || []).map((metric, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.metricCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                <View style={styles.metricHeader}>
                  <View style={styles.metricInfo}>
                    <Text style={styles.metricSubject}>{metric.subject}</Text>
                    <Text style={styles.metricGpa}>GPA: {metric.gpa}</Text>
                  </View>
                  <View style={[styles.gpaBadge, { backgroundColor: metric.color }]}>
                    <Text style={styles.gpaText}>{metric.gpa}</Text>
                  </View>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${metric.progress * 100}%`,
                          backgroundColor: metric.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(metric.progress * 100)}%</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Modern Widgets Section */}
        <Animated.View style={[styles.section, { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Highlights</Text>
          </View>
          <View style={styles.widgetsContainer}>
            <Animated.View style={[styles.widgetCard, styles.weatherWidget, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }]}>
              <View style={styles.widgetHeader}>
                <Text style={styles.widgetTitle}>Weather</Text>
                <Text style={styles.weatherIcon}>☀️</Text>
              </View>
              <Text style={styles.weatherTemp}>24°C</Text>
              <Text style={styles.weatherDesc}>Sunny</Text>
            </Animated.View>

            <Animated.View style={[styles.widgetCard, styles.eventsWidget, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }]}>
              <View style={styles.widgetHeader}>
                <Text style={styles.widgetTitle}>Upcoming</Text>
                <Text style={styles.eventsIcon}>📅</Text>
              </View>
              <Text style={styles.eventTitle}>CS101 Lab</Text>
              <Text style={styles.eventTime}>2:00 PM</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    borderTopColor: 'transparent',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: theme.fonts.titleLarge.fontSize,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    color: theme.colors.textSecondary,
  },

  // Header Styles
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...theme.shadows.large,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: theme.fonts.bodyLarge.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: theme.fonts.headlineMedium.fontSize,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  dateText: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: theme.fonts.titleLarge.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '15',
  },
  viewAllText: {
    fontSize: theme.fonts.labelMedium.fontSize,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
  },
  statGradient: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 24,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: theme.fonts.labelLarge.fontSize,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: theme.fonts.bodySmall.fontSize,
    color: theme.colors.textSecondary,
  },
  statTrend: {
    marginLeft: 8,
  },
  trendIcon: {
    fontSize: 16,
  },

  // Quick Actions Styles
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  actionButtonContent: {
    padding: 20,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  actionIcon: {
    fontSize: 28,
    color: '#64748b',
  },
  actionText: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  arrowIcon: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },

  // Activities Styles
  activitiesContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.medium,
  },
  activityCard: {
    marginBottom: 16,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityIconText: {
    fontSize: 20,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.fonts.titleMedium.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: theme.fonts.bodySmall.fontSize,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: theme.fonts.labelSmall.fontSize,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Metrics Styles
  metricsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.medium,
  },
  metricCard: {
    marginBottom: 20,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricSubject: {
    fontSize: theme.fonts.titleMedium.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  metricGpa: {
    fontSize: theme.fonts.bodySmall.fontSize,
    color: theme.colors.textSecondary,
  },
  gpaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gpaText: {
    fontSize: theme.fonts.labelLarge.fontSize,
    fontWeight: 'bold',
    color: 'white',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: theme.fonts.labelMedium.fontSize,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  // Widgets Styles
  widgetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  widgetCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.medium,
  },
  weatherWidget: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  eventsWidget: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: theme.fonts.labelLarge.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  weatherIcon: {
    fontSize: 20,
  },
  eventsIcon: {
    fontSize: 20,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  weatherDesc: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    color: '#92400e',
  },
  eventTitle: {
    fontSize: theme.fonts.titleMedium.fontSize,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    color: '#1e40af',
  },
});

export default HomeScreen; 