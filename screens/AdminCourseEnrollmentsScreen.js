import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const AdminCourseEnrollmentsScreen = ({ navigation, route }) => {
  const { courseId } = route.params;
  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    fetchCourseDetails();
    fetchEnrollments();
    fetchAvailableStudents();
  }, []);

  const fetchCourseDetails = async () => {
    try {
      const response = await apiClient.getAdminCourse(courseId);
      if (response.success) {
        setCourseDetails(response.data.course || null);
      } else {
        setCourseDetails(null);
        Alert.alert('Error', response.message || 'Failed to load course');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      setCourseDetails(null);
      Alert.alert('Error', error.message || 'Failed to load course');
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourseEnrollments(courseId);
      if (response.success) {
        setEnrollments(response.data.enrollments || []);
      } else {
        setEnrollments([]);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await apiClient.getAvailableStudentsForCourse(courseId);
      if (response.success) {
        setAvailableStudents(response.data.students || []);
      } else {
        setAvailableStudents([]);
      }
    } catch (error) {
      console.error('Error fetching available students:', error);
      setAvailableStudents([]);
    }
  };

  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) {
      Alert.alert('Error', 'Please select at least one student');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.enrollStudentsInCourse(courseId, selectedStudents);
      if (response.success) {
        Alert.alert('Success', 'Students enrolled successfully!');
        setShowAddForm(false);
        setSelectedStudents([]);
        fetchEnrollments();
        fetchAvailableStudents();
      } else {
        Alert.alert('Error', response.message || 'Failed to enroll students');
      }
    } catch (error) {
      console.error('Error enrolling students:', error);
      Alert.alert('Error', error.message || 'Failed to enroll students');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenrollStudent = (enrollment) => {
    Alert.alert(
      'Unenroll Student',
      `Are you sure you want to unenroll ${enrollment.student.first_name} ${enrollment.student.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unenroll',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.unenrollStudentFromCourse(courseId, enrollment.student.id);
              if (response.success) {
                Alert.alert('Success', 'Student unenrolled successfully!');
                fetchEnrollments();
                fetchAvailableStudents();
              } else {
                Alert.alert('Error', response.message || 'Failed to unenroll student');
              }
            } catch (error) {
              console.error('Error unenrolling student:', error);
              Alert.alert('Error', error.message || 'Failed to unenroll student');
            }
          },
        },
      ]
    );
  };

  const handleViewGrades = (enrollment) => {
    navigation.navigate('AdminStudentGrades', {
      courseId,
      studentId: enrollment.student.id,
      studentName: `${enrollment.student.first_name} ${enrollment.student.last_name}`,
    });
  };

  const handleViewAttendance = (enrollment) => {
    navigation.navigate('AdminStudentAttendance', {
      courseId,
      studentId: enrollment.student.id,
      studentName: `${enrollment.student.first_name} ${enrollment.student.last_name}`,
    });
  };

  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const searchString = searchQuery.toLowerCase();
    const student = enrollment.student;
    return (
      student.first_name.toLowerCase().includes(searchString) ||
      student.last_name.toLowerCase().includes(searchString) ||
      student.student_id.toLowerCase().includes(searchString) ||
      student.email.toLowerCase().includes(searchString)
    );
  });

  const renderEnrollmentCard = ({ item }) => (
    <View style={styles.enrollmentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>
          {item.student.first_name} {item.student.last_name}
        </Text>
        <Text style={styles.studentDetail}>ID: {item.student.student_id}</Text>
        <Text style={styles.studentDetail}>Email: {item.student.email}</Text>
        <Text style={styles.studentDetail}>Enrolled: {item.enrollment_date}</Text>
        <View style={styles.performanceContainer}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Attendance</Text>
            <Text style={[
              styles.performanceValue,
              { color: item.attendance >= 90 ? '#10b981' : item.attendance >= 75 ? '#f59e0b' : '#ef4444' }
            ]}>{item.attendance}%</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Current Grade</Text>
            <Text style={styles.performanceValue}>{item.grade}</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Last Attended</Text>
            <Text style={styles.performanceValue}>{item.last_attendance}</Text>
          </View>
        </View>
      </View>

      <View style={styles.studentActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.gradesButton]}
          onPress={() => handleViewGrades(item)}
        >
          <Text style={styles.actionButtonText}>Grades</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.attendanceButton]}
          onPress={() => handleViewAttendance(item)}
        >
          <Text style={styles.actionButtonText}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.unenrollButton]}
          onPress={() => handleUnenrollStudent(item)}
        >
          <Text style={styles.actionButtonText}>Unenroll</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAvailableStudentItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.availableStudentItem,
        selectedStudents.includes(item.id) && styles.availableStudentItemSelected,
      ]}
      onPress={() => toggleStudentSelection(item.id)}
    >
      <View style={styles.availableStudentInfo}>
        <Text style={styles.availableStudentName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.availableStudentDetail}>
          ID: {item.student_id} • {item.grade_level}
        </Text>
      </View>
      <View style={[
        styles.checkbox,
        selectedStudents.includes(item.id) && styles.checkboxSelected,
      ]} />
    </TouchableOpacity>
  );

  if (loading && !courseDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading course details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{courseDetails.name}</Text>
        <Text style={styles.headerSubtitle}>
          {courseDetails.code} • {courseDetails.department}
        </Text>
        <Text style={styles.headerInstructor}>
          Instructor: {courseDetails.instructor.name}
        </Text>
      </View>

      {/* Course Schedule */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scheduleContainer}
      >
        {courseDetails.schedule.map((slot, index) => (
          <View key={index} style={styles.scheduleCard}>
            <Text style={styles.scheduleDay}>{slot.day}</Text>
            <Text style={styles.scheduleTime}>{slot.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Enrollment Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{courseDetails.enrolled}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {courseDetails.capacity - courseDetails.enrolled}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{courseDetails.capacity}</Text>
          <Text style={styles.statLabel}>Capacity</Text>
        </View>
      </View>

      {/* Search and Add */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search enrollments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add Students</Text>
        </TouchableOpacity>
      </View>

      {/* Add Students Form */}
      {showAddForm && (
        <View style={styles.addForm}>
          <View style={styles.addFormHeader}>
            <Text style={styles.addFormTitle}>Add Students</Text>
            <Text style={styles.addFormSubtitle}>
              Select students to enroll in this course
            </Text>
          </View>

          <FlatList
            data={availableStudents}
            renderItem={renderAvailableStudentItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.availableStudentsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No available students</Text>
              </View>
            }
          />

          <View style={styles.addFormActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddForm(false);
                setSelectedStudents([]);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.enrollButton}
              onPress={handleEnrollStudents}
            >
              <Text style={styles.enrollButtonText}>
                Enroll {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Enrollments List */}
      <FlatList
        data={filteredEnrollments}
        renderItem={renderEnrollmentCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.enrollmentsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No students enrolled</Text>
          </View>
        }
      />
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
    marginBottom: 2,
  },
  headerInstructor: {
    fontSize: isIOS ? 14 : 12,
    color: '#e3f2fd',
    fontStyle: 'italic',
  },
  scheduleContainer: {
    backgroundColor: 'white',
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 12 : 10,
  },
  scheduleCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: isIOS ? 12 : 8,
    padding: isIOS ? 16 : 12,
    marginRight: isIOS ? 8 : 6,
    alignItems: 'center',
  },
  scheduleDay: {
    fontSize: isIOS ? 14 : 12,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: isIOS ? 12 : 10,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isIOS ? 20 : 16,
    paddingVertical: isIOS ? 16 : 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: isIOS ? 24 : 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: isIOS ? 20 : 16,
    paddingVertical: isIOS ? 16 : 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: isIOS ? 12 : 8,
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 12 : 10,
    fontSize: isIOS ? 16 : 14,
    backgroundColor: '#f9fafb',
    marginRight: isIOS ? 12 : 10,
  },
  addButton: {
    backgroundColor: '#10b981',
    borderRadius: isIOS ? 12 : 8,
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 12 : 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: isIOS ? 14 : 12,
    fontWeight: 'bold',
  },
  addForm: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  addFormHeader: {
    padding: isIOS ? 20 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  addFormTitle: {
    fontSize: isIOS ? 18 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  addFormSubtitle: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
  },
  availableStudentsList: {
    maxHeight: 300,
  },
  availableStudentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isIOS ? 20 : 16,
    paddingVertical: isIOS ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  availableStudentItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  availableStudentInfo: {
    flex: 1,
  },
  availableStudentName: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  availableStudentDetail: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  checkboxSelected: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  addFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: isIOS ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    borderRadius: isIOS ? 12 : 8,
    paddingVertical: isIOS ? 12 : 10,
    alignItems: 'center',
    marginRight: isIOS ? 8 : 6,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: isIOS ? 16 : 14,
    fontWeight: 'bold',
  },
  enrollButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: isIOS ? 12 : 8,
    paddingVertical: isIOS ? 12 : 10,
    alignItems: 'center',
    marginLeft: isIOS ? 8 : 6,
  },
  enrollButtonText: {
    color: 'white',
    fontSize: isIOS ? 16 : 14,
    fontWeight: 'bold',
  },
  enrollmentsList: {
    flex: 1,
    paddingHorizontal: isIOS ? 20 : 16,
  },
  enrollmentCard: {
    backgroundColor: 'white',
    borderRadius: isIOS ? 16 : 12,
    padding: isIOS ? 20 : 16,
    marginVertical: isIOS ? 8 : 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  studentInfo: {
    marginBottom: isIOS ? 16 : 12,
  },
  studentName: {
    fontSize: isIOS ? 18 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  studentDetail: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  performanceContainer: {
    flexDirection: 'row',
    marginTop: isIOS ? 12 : 10,
    paddingTop: isIOS ? 12 : 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  performanceItem: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: isIOS ? 12 : 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: '#1a237e',
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 8 : 6,
    borderRadius: isIOS ? 8 : 6,
    marginLeft: isIOS ? 8 : 6,
  },
  gradesButton: {
    backgroundColor: '#3b82f6',
  },
  attendanceButton: {
    backgroundColor: '#f59e0b',
  },
  unenrollButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: isIOS ? 14 : 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: isIOS ? 16 : 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default AdminCourseEnrollmentsScreen;
