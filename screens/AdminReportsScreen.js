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
} from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const AdminReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    if (selectedReport) {
      fetchReportData(selectedReport);
    } else {
      setLoading(false);
    }
  }, [selectedReport]);

  const fetchReportData = async (reportType) => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminReport(reportType);
      if (response.success) {
        setReportData(response.data || null);
      } else {
        Alert.alert('Error', response.message || 'Failed to load report');
        setReportData(null);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      Alert.alert('Error', error.message || 'Failed to load report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Removed mock report generator

  const handleExportReport = () => {
    Alert.alert('Export Report', 'Report export functionality will be implemented soon!');
  };

  const renderReportCard = (title, subtitle, onPress) => (
    <TouchableOpacity
      style={[
        styles.reportCard,
        selectedReport === title.toLowerCase().replace(/\s+/g, '_') && styles.reportCardSelected,
      ]}
      onPress={onPress}
    >
      <Text style={styles.reportCardTitle}>{title}</Text>
      <Text style={styles.reportCardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const renderPerformanceReport = () => (
    <View style={styles.reportContent}>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.total_students}</Text>
          <Text style={styles.summaryLabel}>Total Students</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.average_gpa}</Text>
          <Text style={styles.summaryLabel}>Average GPA</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.honor_roll}</Text>
          <Text style={styles.summaryLabel}>Honor Roll</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.at_risk}</Text>
          <Text style={styles.summaryLabel}>At Risk</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Grade Distribution</Text>
        {reportData.performance_distribution.map((item, index) => (
          <View key={index} style={styles.distributionBar}>
            <Text style={styles.distributionLabel}>{item.grade}</Text>
            <View style={styles.distributionBarContainer}>
              <View
                style={[
                  styles.distributionBarFill,
                  { width: `${item.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.distributionCount}>{item.count}</Text>
            <Text style={styles.distributionPercentage}>{item.percentage}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Top Performing Courses</Text>
        {reportData.top_courses.map((course, index) => (
          <View key={index} style={styles.courseItem}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseGrade}>Avg. Grade: {course.average_grade}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTeacherReport = () => (
    <View style={styles.reportContent}>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.total_teachers}</Text>
          <Text style={styles.summaryLabel}>Total Teachers</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.average_rating}</Text>
          <Text style={styles.summaryLabel}>Average Rating</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.top_rated}</Text>
          <Text style={styles.summaryLabel}>Top Rated</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.needs_improvement}</Text>
          <Text style={styles.summaryLabel}>Needs Improvement</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Department Ratings</Text>
        {reportData.department_ratings.map((dept, index) => (
          <View key={index} style={styles.ratingBar}>
            <Text style={styles.ratingLabel}>{dept.department}</Text>
            <View style={styles.ratingBarContainer}>
              <View
                style={[
                  styles.ratingBarFill,
                  { width: `${(dept.rating / 5) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.ratingScore}>{dept.rating}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Top Rated Teachers</Text>
        {reportData.top_teachers.map((teacher, index) => (
          <View key={index} style={styles.teacherItem}>
            <Text style={styles.teacherName}>{teacher.name}</Text>
            <Text style={styles.teacherDetail}>
              {teacher.department} • Rating: {teacher.rating}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAttendanceReport = () => (
    <View style={styles.reportContent}>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.total_classes}</Text>
          <Text style={styles.summaryLabel}>Total Classes</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.average_attendance}%</Text>
          <Text style={styles.summaryLabel}>Average Attendance</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.perfect_attendance}</Text>
          <Text style={styles.summaryLabel}>Perfect Attendance</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.chronic_absence}</Text>
          <Text style={styles.summaryLabel}>Chronic Absence</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Attendance by Grade Level</Text>
        {reportData.attendance_by_grade.map((grade, index) => (
          <View key={index} style={styles.attendanceBar}>
            <Text style={styles.attendanceLabel}>{grade.grade}</Text>
            <View style={styles.attendanceBarContainer}>
              <View
                style={[
                  styles.attendanceBarFill,
                  { width: `${grade.attendance}%` },
                ]}
              />
            </View>
            <Text style={styles.attendancePercentage}>{grade.attendance}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Lowest Attendance Courses</Text>
        {reportData.lowest_attendance_courses.map((course, index) => (
          <View key={index} style={styles.courseItem}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseAttendance}>Attendance: {course.attendance}%</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderEnrollmentReport = () => (
    <View style={styles.reportContent}>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.total_enrollment}</Text>
          <Text style={styles.summaryLabel}>Total Enrollment</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.new_students}</Text>
          <Text style={styles.summaryLabel}>New Students</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.withdrawn}</Text>
          <Text style={styles.summaryLabel}>Withdrawn</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{reportData.summary.waitlisted}</Text>
          <Text style={styles.summaryLabel}>Waitlisted</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Enrollment by Grade Level</Text>
        {reportData.enrollment_by_grade.map((grade, index) => (
          <View key={index} style={styles.enrollmentBar}>
            <Text style={styles.enrollmentLabel}>{grade.grade}</Text>
            <View style={styles.enrollmentBarContainer}>
              <View
                style={[
                  styles.enrollmentBarFill,
                  { width: `${(grade.count / 400) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.enrollmentCount}>{grade.count}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Popular Courses (At Capacity)</Text>
        {reportData.popular_courses.map((course, index) => (
          <View key={index} style={styles.courseItem}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseEnrollment}>
              {course.enrolled}/{course.capacity} Students
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading report data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics & Reports</Text>
        <Text style={styles.headerSubtitle}>View insights and statistics</Text>
      </View>

      {/* Report Types */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.reportTypesContainer}
      >
        {renderReportCard(
          'Student Performance',
          'Academic grades and achievements',
          () => setSelectedReport('student_performance')
        )}
        {renderReportCard(
          'Teacher Evaluation',
          'Teaching effectiveness and ratings',
          () => setSelectedReport('teacher_evaluation')
        )}
        {renderReportCard(
          'Attendance',
          'Class attendance statistics',
          () => setSelectedReport('attendance')
        )}
        {renderReportCard(
          'Enrollment',
          'Student enrollment trends',
          () => setSelectedReport('enrollment')
        )}
      </ScrollView>

      {/* Report Content */}
      <ScrollView style={styles.contentContainer}>
        {selectedReport ? (
          <>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>{reportData.title}</Text>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={handleExportReport}
              >
                <Text style={styles.exportButtonText}>Export Report</Text>
              </TouchableOpacity>
            </View>

            {selectedReport === 'student_performance' && renderPerformanceReport()}
            {selectedReport === 'teacher_evaluation' && renderTeacherReport()}
            {selectedReport === 'attendance' && renderAttendanceReport()}
            {selectedReport === 'enrollment' && renderEnrollmentReport()}
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              Select a report type to view detailed analytics
            </Text>
          </View>
        )}
      </ScrollView>
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
  },
  header: {
    paddingHorizontal: isIOS ? 20 : 16,
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: isIOS ? 20 : 16,
    backgroundColor: '#1a237e',
  },
  headerTitle: {
    fontSize: isIOS ? 28 : 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: isIOS ? 16 : 14,
    color: '#e3f2fd',
  },
  reportTypesContainer: {
    backgroundColor: 'white',
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 12 : 10,
  },
  reportCard: {
    width: width * 0.7,
    backgroundColor: '#f3f4f6',
    borderRadius: isIOS ? 16 : 12,
    padding: isIOS ? 20 : 16,
    marginRight: isIOS ? 12 : 10,
  },
  reportCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1a237e',
    borderWidth: 2,
  },
  reportCardTitle: {
    fontSize: isIOS ? 18 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  reportCardSubtitle: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
  },
  contentContainer: {
    flex: 1,
    padding: isIOS ? 20 : 16,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: isIOS ? 16 : 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isIOS ? 24 : 20,
  },
  reportTitle: {
    fontSize: isIOS ? 24 : 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  exportButton: {
    backgroundColor: '#10b981',
    borderRadius: isIOS ? 12 : 8,
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 8 : 6,
  },
  exportButtonText: {
    color: 'white',
    fontSize: isIOS ? 14 : 12,
    fontWeight: 'bold',
  },
  reportContent: {
    flex: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: isIOS ? 24 : 20,
  },
  summaryCard: {
    width: (width - (isIOS ? 56 : 48)) / 2,
    backgroundColor: 'white',
    borderRadius: isIOS ? 16 : 12,
    padding: isIOS ? 20 : 16,
    margin: isIOS ? 8 : 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryNumber: {
    fontSize: isIOS ? 24 : 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: isIOS ? 16 : 12,
    padding: isIOS ? 20 : 16,
    marginBottom: isIOS ? 16 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: isIOS ? 18 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: isIOS ? 16 : 12,
  },
  distributionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isIOS ? 12 : 10,
  },
  distributionLabel: {
    width: 30,
    fontSize: isIOS ? 14 : 12,
    fontWeight: '600',
    color: '#374151',
  },
  distributionBarContainer: {
    flex: 1,
    height: isIOS ? 16 : 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    marginHorizontal: isIOS ? 12 : 10,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    backgroundColor: '#1a237e',
    borderRadius: 999,
  },
  distributionCount: {
    width: 50,
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  distributionPercentage: {
    width: 50,
    fontSize: isIOS ? 14 : 12,
    color: '#1a237e',
    fontWeight: '600',
    textAlign: 'right',
  },
  courseItem: {
    marginBottom: isIOS ? 12 : 10,
  },
  courseName: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  courseGrade: {
    fontSize: isIOS ? 14 : 12,
    color: '#10b981',
  },
  courseAttendance: {
    fontSize: isIOS ? 14 : 12,
    color: '#ef4444',
  },
  courseEnrollment: {
    fontSize: isIOS ? 14 : 12,
    color: '#3b82f6',
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isIOS ? 12 : 10,
  },
  ratingLabel: {
    width: 100,
    fontSize: isIOS ? 14 : 12,
    fontWeight: '600',
    color: '#374151',
  },
  ratingBarContainer: {
    flex: 1,
    height: isIOS ? 16 : 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    marginHorizontal: isIOS ? 12 : 10,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 999,
  },
  ratingScore: {
    width: 40,
    fontSize: isIOS ? 14 : 12,
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'right',
  },
  teacherItem: {
    marginBottom: isIOS ? 12 : 10,
  },
  teacherName: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  teacherDetail: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
  },
  attendanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isIOS ? 12 : 10,
  },
  attendanceLabel: {
    width: 60,
    fontSize: isIOS ? 14 : 12,
    fontWeight: '600',
    color: '#374151',
  },
  attendanceBarContainer: {
    flex: 1,
    height: isIOS ? 16 : 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    marginHorizontal: isIOS ? 12 : 10,
    overflow: 'hidden',
  },
  attendanceBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 999,
  },
  attendancePercentage: {
    width: 50,
    fontSize: isIOS ? 14 : 12,
    color: '#3b82f6',
    fontWeight: '600',
    textAlign: 'right',
  },
  enrollmentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isIOS ? 12 : 10,
  },
  enrollmentLabel: {
    width: 60,
    fontSize: isIOS ? 14 : 12,
    fontWeight: '600',
    color: '#374151',
  },
  enrollmentBarContainer: {
    flex: 1,
    height: isIOS ? 16 : 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    marginHorizontal: isIOS ? 12 : 10,
    overflow: 'hidden',
  },
  enrollmentBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 999,
  },
  enrollmentCount: {
    width: 50,
    fontSize: isIOS ? 14 : 12,
    color: '#f59e0b',
    fontWeight: '600',
    textAlign: 'right',
  },
});

export default AdminReportsScreen;
