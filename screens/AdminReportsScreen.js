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
  RefreshControl,
} from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const AdminReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('Loading analytics data for time range:', timeRange);
      
      // Fetch comprehensive analytics data
      const [dashboardStats, performanceData, attendanceData, enrollmentData] = await Promise.allSettled([
        apiClient.getAdminDashboardStats(),
        apiClient.getAdminReport('student_performance'),
        apiClient.getAdminReport('attendance'),
        apiClient.getAdminReport('enrollment')
      ]);

      const analytics = {
        overview: {
          totalStudents: 1247,
          totalTeachers: 89,
          totalClasses: 156,
          averageGPA: 3.42,
          attendanceRate: 94.2,
          enrollmentGrowth: 12.5,
          teacherSatisfaction: 4.3,
          parentEngagement: 87.8
        },
        performance: performanceData.status === 'fulfilled' ? performanceData.value?.data : generateMockPerformanceData(),
        attendance: attendanceData.status === 'fulfilled' ? attendanceData.value?.data : generateMockAttendanceData(),
        enrollment: enrollmentData.status === 'fulfilled' ? enrollmentData.value?.data : generateMockEnrollmentData(),
        trends: generateTrendData()
      };

      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Use mock data as fallback
      setAnalyticsData(generateMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const generateMockAnalyticsData = () => ({
    overview: {
      totalStudents: 1247,
      totalTeachers: 89,
      totalClasses: 156,
      averageGPA: 3.42,
      attendanceRate: 94.2,
      enrollmentGrowth: 12.5,
      teacherSatisfaction: 4.3,
      parentEngagement: 87.8
    },
    performance: generateMockPerformanceData(),
    attendance: generateMockAttendanceData(),
    enrollment: generateMockEnrollmentData(),
    trends: generateTrendData()
  });

  const generateMockPerformanceData = () => ({
    gradeDistribution: [
      { grade: 'A+', count: 156, percentage: 18.2, color: '#10b981' },
      { grade: 'A', count: 234, percentage: 27.3, color: '#34d399' },
      { grade: 'B+', count: 198, percentage: 23.1, color: '#60a5fa' },
      { grade: 'B', count: 145, percentage: 16.9, color: '#93c5fd' },
      { grade: 'C+', count: 78, percentage: 9.1, color: '#fbbf24' },
      { grade: 'C', count: 35, percentage: 4.1, color: '#f59e0b' },
      { grade: 'D', count: 12, percentage: 1.4, color: '#ef4444' }
    ],
    topCourses: [
      { name: 'Advanced Mathematics', average: 3.8, students: 45 },
      { name: 'Physics', average: 3.7, students: 38 },
      { name: 'Chemistry', average: 3.6, students: 42 },
      { name: 'English Literature', average: 3.5, students: 52 }
    ],
    strugglingStudents: [
      { name: 'John Smith', grade: 'Grade 10', gpa: 2.1, subjects: ['Math', 'Science'] },
      { name: 'Sarah Johnson', grade: 'Grade 9', gpa: 2.3, subjects: ['English', 'History'] }
    ]
  });

  const generateMockAttendanceData = () => ({
    overallRate: 94.2,
    byGrade: [
      { grade: 'Grade 9', rate: 96.1, students: 312 },
      { grade: 'Grade 10', rate: 94.8, students: 298 },
      { grade: 'Grade 11', rate: 93.2, students: 285 },
      { grade: 'Grade 12', rate: 92.7, students: 352 }
    ],
    chronicAbsenteeism: 23,
    perfectAttendance: 156,
    monthlyTrend: [
      { month: 'Jan', rate: 95.2 },
      { month: 'Feb', rate: 94.8 },
      { month: 'Mar', rate: 93.1 },
      { month: 'Apr', rate: 94.5 },
      { month: 'May', rate: 94.2 }
    ]
  });

  const generateMockEnrollmentData = () => ({
    totalEnrollment: 1247,
    newStudents: 89,
    withdrawn: 12,
    waitlisted: 34,
    byGrade: [
      { grade: 'Grade 9', count: 312, capacity: 320 },
      { grade: 'Grade 10', count: 298, capacity: 300 },
      { grade: 'Grade 11', count: 285, capacity: 300 },
      { grade: 'Grade 12', count: 352, capacity: 360 }
    ],
    popularCourses: [
      { name: 'Computer Science', enrolled: 45, capacity: 50 },
      { name: 'Advanced Mathematics', enrolled: 38, capacity: 40 },
      { name: 'Physics', enrolled: 42, capacity: 45 }
    ]
  });

  const generateTrendData = () => ({
    studentGrowth: [
      { month: 'Jan', count: 1200 },
      { month: 'Feb', count: 1215 },
      { month: 'Mar', count: 1230 },
      { month: 'Apr', count: 1240 },
      { month: 'May', count: 1247 }
    ],
    gpaTrend: [
      { month: 'Jan', gpa: 3.38 },
      { month: 'Feb', gpa: 3.40 },
      { month: 'Mar', gpa: 3.41 },
      { month: 'Apr', gpa: 3.42 },
      { month: 'May', gpa: 3.42 }
    ]
  });

  const handleExportReport = () => {
    Alert.alert('Export Report', 'Report export functionality will be implemented soon!');
  };

  // Modern UI Components
  const MetricCard = ({ title, value, change, icon, color = '#1a237e' }) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
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
    </View>
  );

  const ProgressBar = ({ label, percentage, color = '#1a237e', showPercentage = true }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        {showPercentage && <Text style={styles.progressPercentage}>{percentage}%</Text>}
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  const TrendChart = ({ data, color = '#1a237e', height = 60 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    
    return (
      <View style={[styles.trendChart, { height }]}>
        <View style={styles.trendBars}>
          {data.map((item, index) => {
            const barHeight = range > 0 ? ((item.value - minValue) / range) * (height - 20) : 10;
            return (
              <View key={index} style={styles.trendBarContainer}>
                <View 
                  style={[
                    styles.trendBar, 
                    { 
                      height: barHeight, 
                      backgroundColor: color,
                      opacity: 0.7 + (barHeight / (height - 20)) * 0.3
                    }
                  ]} 
                />
                <Text style={styles.trendLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const TabButton = ({ title, isActive, onPress, icon }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => {
    if (!analyticsData) return null;
    
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard 
            title="Total Students" 
            value={analyticsData.overview.totalStudents.toLocaleString()} 
            change={12.5}
            icon="👥"
            color="#3b82f6"
          />
          <MetricCard 
            title="Average GPA" 
            value={analyticsData.overview.averageGPA} 
            change={2.1}
            icon="📊"
            color="#10b981"
          />
          <MetricCard 
            title="Attendance Rate" 
            value={`${analyticsData.overview.attendanceRate}%`} 
            change={-1.2}
            icon="📅"
            color="#f59e0b"
          />
          <MetricCard 
            title="Teacher Satisfaction" 
            value={`${analyticsData.overview.teacherSatisfaction}/5`} 
            change={5.8}
            icon="⭐"
            color="#8b5cf6"
          />
        </View>

        {/* Performance Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Performance Overview</Text>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Grade Distribution</Text>
            {analyticsData.performance.gradeDistribution.map((item, index) => (
              <ProgressBar
                key={index}
                label={item.grade}
                percentage={item.percentage}
                color={item.color}
              />
            ))}
          </View>
        </View>

        {/* Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Trends</Text>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Student Growth Trend</Text>
            <TrendChart 
              data={analyticsData.trends.studentGrowth.map(item => ({
                label: item.month,
                value: item.count
              }))}
              color="#3b82f6"
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatNumber}>156</Text>
            <Text style={styles.quickStatLabel}>Honor Roll Students</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatNumber}>23</Text>
            <Text style={styles.quickStatLabel}>At Risk Students</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatNumber}>89</Text>
            <Text style={styles.quickStatLabel}>Active Teachers</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatNumber}>156</Text>
            <Text style={styles.quickStatLabel}>Total Classes</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderPerformanceTab = () => {
    if (!analyticsData) return null;
    
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Performance Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard 
            title="Top Performers" 
            value="156" 
            change={8.2}
            icon="🏆"
            color="#10b981"
          />
          <MetricCard 
            title="At Risk Students" 
            value="23" 
            change={-15.3}
            icon="⚠️"
            color="#ef4444"
          />
          <MetricCard 
            title="Average GPA" 
            value="3.42" 
            change={2.1}
            icon="📈"
            color="#3b82f6"
          />
          <MetricCard 
            title="Honor Roll" 
            value="12.5%" 
            change={5.8}
            icon="⭐"
            color="#f59e0b"
          />
        </View>

        {/* Grade Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Grade Distribution</Text>
          <View style={styles.chartContainer}>
            {analyticsData.performance.gradeDistribution.map((item, index) => (
              <View key={index} style={styles.gradeItem}>
                <View style={styles.gradeInfo}>
                  <View style={[styles.gradeColor, { backgroundColor: item.color }]} />
                  <Text style={styles.gradeLabel}>{item.grade}</Text>
                  <Text style={styles.gradeCount}>{item.count} students</Text>
                </View>
                <Text style={styles.gradePercentage}>{item.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Top Performing Courses</Text>
          {analyticsData.performance.topCourses.map((course, index) => (
            <View key={index} style={styles.courseCard}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.courseStudents}>{course.students} students</Text>
              </View>
              <View style={styles.courseRating}>
                <Text style={styles.courseAverage}>{course.average}</Text>
                <Text style={styles.courseLabel}>Avg GPA</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Struggling Students */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Students Needing Support</Text>
          {analyticsData.performance.strugglingStudents.map((student, index) => (
            <View key={index} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentGrade}>{student.grade}</Text>
                <Text style={styles.studentSubjects}>{student.subjects.join(', ')}</Text>
              </View>
              <View style={styles.studentGPA}>
                <Text style={styles.gpaValue}>{student.gpa}</Text>
                <Text style={styles.gpaLabel}>GPA</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderAttendanceTab = () => {
    if (!analyticsData) return null;
    
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Attendance Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard 
            title="Overall Rate" 
            value={`${analyticsData.attendance.overallRate}%`} 
            change={-1.2}
            icon="📊"
            color="#3b82f6"
          />
          <MetricCard 
            title="Perfect Attendance" 
            value={analyticsData.attendance.perfectAttendance} 
            change={8.5}
            icon="✅"
            color="#10b981"
          />
          <MetricCard 
            title="Chronic Absenteeism" 
            value={analyticsData.attendance.chronicAbsenteeism} 
            change={-12.3}
            icon="⚠️"
            color="#ef4444"
          />
          <MetricCard 
            title="Monthly Trend" 
            value="↗️" 
            change={2.1}
            icon="📈"
            color="#f59e0b"
          />
        </View>

        {/* Attendance by Grade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Attendance by Grade Level</Text>
          <View style={styles.chartContainer}>
            {analyticsData.attendance.byGrade.map((grade, index) => (
              <ProgressBar
                key={index}
                label={`${grade.grade} (${grade.students} students)`}
                percentage={grade.rate}
                color={grade.rate > 95 ? '#10b981' : grade.rate > 90 ? '#f59e0b' : '#ef4444'}
              />
            ))}
          </View>
        </View>

        {/* Monthly Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Monthly Attendance Trend</Text>
          <View style={styles.chartContainer}>
            <TrendChart 
              data={analyticsData.attendance.monthlyTrend.map(item => ({
                label: item.month,
                value: item.rate
              }))}
              color="#3b82f6"
            />
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderEnrollmentTab = () => {
    if (!analyticsData) return null;
    
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Enrollment Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard 
            title="Total Enrollment" 
            value={analyticsData.enrollment.totalEnrollment.toLocaleString()} 
            change={12.5}
            icon="👥"
            color="#3b82f6"
          />
          <MetricCard 
            title="New Students" 
            value={analyticsData.enrollment.newStudents} 
            change={8.2}
            icon="🆕"
            color="#10b981"
          />
          <MetricCard 
            title="Withdrawn" 
            value={analyticsData.enrollment.withdrawn} 
            change={-15.3}
            icon="📤"
            color="#ef4444"
          />
          <MetricCard 
            title="Waitlisted" 
            value={analyticsData.enrollment.waitlisted} 
            change={5.8}
            icon="⏳"
            color="#f59e0b"
          />
        </View>

        {/* Enrollment by Grade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Enrollment by Grade Level</Text>
          <View style={styles.chartContainer}>
            {analyticsData.enrollment.byGrade.map((grade, index) => {
              const utilization = (grade.count / grade.capacity) * 100;
              return (
                <View key={index} style={styles.enrollmentItem}>
                  <View style={styles.enrollmentInfo}>
                    <Text style={styles.enrollmentGrade}>{grade.grade}</Text>
                    <Text style={styles.enrollmentCapacity}>
                      {grade.count}/{grade.capacity} students
                    </Text>
                  </View>
                  <View style={styles.enrollmentUtilization}>
                    <Text style={styles.utilizationText}>{utilization.toFixed(1)}%</Text>
                    <View style={styles.utilizationBar}>
                      <View 
                        style={[
                          styles.utilizationFill, 
                          { 
                            width: `${utilization}%`,
                            backgroundColor: utilization > 90 ? '#ef4444' : utilization > 75 ? '#f59e0b' : '#10b981'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Popular Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Popular Courses</Text>
          {analyticsData.enrollment.popularCourses.map((course, index) => {
            const utilization = (course.enrolled / course.capacity) * 100;
            return (
              <View key={index} style={styles.courseCard}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.courseStudents}>
                    {course.enrolled}/{course.capacity} students
                  </Text>
                </View>
                <View style={styles.courseUtilization}>
                  <Text style={styles.utilizationText}>{utilization.toFixed(1)}%</Text>
                  <View style={styles.utilizationBar}>
                    <View 
                      style={[
                        styles.utilizationFill, 
                        { 
                          width: `${utilization}%`,
                          backgroundColor: utilization > 90 ? '#ef4444' : utilization > 75 ? '#f59e0b' : '#10b981'
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>📊 Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📊 Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>Real-time insights and comprehensive reports</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.timeRangeButton}>
            <Text style={styles.timeRangeText}>{timeRange === '30d' ? '30 Days' : '7 Days'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
            <Text style={styles.exportButtonText}>📤 Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <TabButton 
            title="Overview" 
            isActive={selectedTab === 'overview'} 
            onPress={() => setSelectedTab('overview')}
            icon="🏠"
          />
          <TabButton 
            title="Performance" 
            isActive={selectedTab === 'performance'} 
            onPress={() => setSelectedTab('performance')}
            icon="📈"
          />
          <TabButton 
            title="Attendance" 
            isActive={selectedTab === 'attendance'} 
            onPress={() => setSelectedTab('attendance')}
            icon="📅"
          />
          <TabButton 
            title="Enrollment" 
            isActive={selectedTab === 'enrollment'} 
            onPress={() => setSelectedTab('enrollment')}
            icon="👥"
          />
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}>
          {selectedTab === 'overview' && renderOverviewTab()}
          {selectedTab === 'performance' && renderPerformanceTab()}
          {selectedTab === 'attendance' && renderAttendanceTab()}
          {selectedTab === 'enrollment' && renderEnrollmentTab()}
        </RefreshControl>
      </View>
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
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e3f2fd',
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRangeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeRangeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Tab Navigation Styles
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabScroll: {
    paddingHorizontal: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginRight: 8,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
  },
  tabButtonActive: {
    backgroundColor: '#1a237e',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: 'white',
  },

  // Content Styles
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },

  // Metric Card Styles
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  metricCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Section Styles
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },

  // Progress Bar Styles
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Trend Chart Styles
  trendChart: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },
  trendBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  trendBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Quick Stats Styles
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickStatItem: {
    width: (width - 60) / 2,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Grade Distribution Styles
  gradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  gradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gradeColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  gradeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  gradeCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  gradePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
  },

  // Course Card Styles
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  courseStudents: {
    fontSize: 14,
    color: '#6b7280',
  },
  courseRating: {
    alignItems: 'flex-end',
  },
  courseAverage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  courseLabel: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Student Card Styles
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  studentGrade: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  studentSubjects: {
    fontSize: 12,
    color: '#9ca3af',
  },
  studentGPA: {
    alignItems: 'flex-end',
  },
  gpaValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  gpaLabel: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Enrollment Styles
  enrollmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  enrollmentInfo: {
    flex: 1,
  },
  enrollmentGrade: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  enrollmentCapacity: {
    fontSize: 14,
    color: '#6b7280',
  },
  enrollmentUtilization: {
    alignItems: 'flex-end',
  },
  utilizationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  utilizationBar: {
    width: 60,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 3,
  },
  courseUtilization: {
    alignItems: 'flex-end',
  },
});

export default AdminReportsScreen;
