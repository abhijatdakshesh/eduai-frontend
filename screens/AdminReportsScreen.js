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
        setReportData(response.data || getMockReportData(reportType));
      } else {
        setReportData(getMockReportData(reportType));
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setReportData(getMockReportData(reportType));
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = (reportType) => {
    switch (reportType) {
      case 'student_performance':
        return {
          title: 'Student Performance Report',
          summary: {
            total_students: 1250,
            average_gpa: 3.45,
            honor_roll: 325,
            at_risk: 45,
          },
          performance_distribution: [
            { grade: 'A', count: 450, percentage: 36 },
            { grade: 'B', count: 375, percentage: 30 },
            { grade: 'C', count: 275, percentage: 22 },
            { grade: 'D', count: 100, percentage: 8 },
            { grade: 'F', count: 50, percentage: 4 },
          ],
          top_courses: [
            { name: 'Advanced Mathematics', average_grade: 3.8 },
            { name: 'Physics 101', average_grade: 3.7 },
            { name: 'Computer Science', average_grade: 3.6 },
          ],
        };

      case 'teacher_evaluation':
        return {
          title: 'Teacher Evaluation Report',
          summary: {
            total_teachers: 85,
            average_rating: 4.2,
            top_rated: 15,
            needs_improvement: 5,
          },
          department_ratings: [
            { department: 'Mathematics', rating: 4.5 },
            { department: 'Science', rating: 4.3 },
            { department: 'English', rating: 4.1 },
            { department: 'History', rating: 4.0 },
          ],
          top_teachers: [
            { name: 'Dr. Sarah Wilson', department: 'Mathematics', rating: 4.9 },
            { name: 'Prof. Michael Chen', department: 'Physics', rating: 4.8 },
            { name: 'Mrs. Emily Brown', department: 'English', rating: 4.7 },
          ],
        };

      case 'attendance':
        return {
          title: 'Attendance Report',
          summary: {
            total_classes: 45,
            average_attendance: 92,
            perfect_attendance: 450,
            chronic_absence: 25,
          },
          attendance_by_grade: [
            { grade: '9th', attendance: 94 },
            { grade: '10th', attendance: 93 },
            { grade: '11th', attendance: 91 },
            { grade: '12th', attendance: 90 },
          ],
          lowest_attendance_courses: [
            { name: 'Early Morning Physics', attendance: 85 },
            { name: 'Friday Afternoon Math', attendance: 87 },
            { name: 'Monday Morning English', attendance: 88 },
          ],
        };

      case 'enrollment':
        return {
          title: 'Enrollment Report',
          summary: {
            total_enrollment: 1250,
            new_students: 320,
            withdrawn: 45,
            waitlisted: 75,
          },
          enrollment_by_grade: [
            { grade: '9th', count: 315 },
            { grade: '10th', count: 308 },
            { grade: '11th', count: 322 },
            { grade: '12th', count: 305 },
          ],
          popular_courses: [
            { name: 'Computer Science', enrolled: 150, capacity: 150 },
            { name: 'Advanced Biology', enrolled: 145, capacity: 150 },
            { name: 'Creative Writing', enrolled: 140, capacity: 150 },
          ],
        };

      default:
        return null;
    }
  };

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
