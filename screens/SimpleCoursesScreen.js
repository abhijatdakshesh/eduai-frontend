import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Dimensions, Alert } from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const SimpleCoursesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Back button handler
  useBackButton(navigation);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourses();
      if (response.success && response.data && response.data.courses) {
        setCourses(response.data.courses);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch courses');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Error', error.message || 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.getCourseDepartments();
      if (response.success && response.data && response.data.departments) {
        setDepartments(['all', ...response.data.departments.map(dept => dept.name)]);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch departments');
        setDepartments(['all']);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      Alert.alert('Error', error.message || 'Failed to fetch departments');
      setDepartments(['all']);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(true);
      const response = await apiClient.enrollInCourse(courseId);
      if (response.success) {
        Alert.alert('Success', 'Successfully enrolled in course!');
        fetchCourses(); // Refresh the course list
      } else {
        Alert.alert('Error', response.message || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      Alert.alert('Error', 'Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleDrop = async (courseId) => {
    Alert.alert(
      'Drop Course',
      'Are you sure you want to drop this course?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Drop',
          style: 'destructive',
          onPress: async () => {
            try {
              setEnrolling(true);
              const response = await apiClient.dropCourse(courseId);
              if (response.success) {
                Alert.alert('Success', 'Successfully dropped course!');
                fetchCourses(); // Refresh the course list
              } else {
                Alert.alert('Error', response.message || 'Failed to drop course');
              }
            } catch (error) {
              console.error('Drop course error:', error);
              Alert.alert('Error', 'Failed to drop course. Please try again.');
            } finally {
              setEnrolling(false);
            }
          }
        }
      ]
    );
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getEnrollmentStatus = (course) => {
    if (course.enrolled >= course.capacity) return { text: 'Full', color: '#ef4444' };
    if (course.is_enrolled) return { text: 'Enrolled', color: '#10b981' };
    return { text: 'Available', color: '#10b981' };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Demo Notice */}
      {/* Demo notice removed */}
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Course Management</Text>
        <Text style={styles.headerSubtitle}>Browse and manage your courses</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {departments.map((dept) => (
            <TouchableOpacity
              key={dept}
              style={[
                styles.filterChip,
                selectedDepartment === dept && styles.filterChipSelected
              ]}
              onPress={() => setSelectedDepartment(dept)}
            >
              <Text style={[
                styles.filterChipText,
                selectedDepartment === dept && styles.filterChipTextSelected
              ]}>
                {dept === 'all' ? 'All Departments' : dept}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.coursesContainer}>
        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No courses found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredCourses.map((course) => {
            const enrollmentStatus = getEnrollmentStatus(course);
          return (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseCode}>{course.code}</Text>
                  <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseInstructor}>Instructor: {course.instructor}</Text>
                    <Text style={styles.courseDepartment}>{course.department}</Text>
                </View>
                  <View style={styles.courseStats}>
                    <Text style={styles.creditsText}>{course.credits} Credits</Text>
                    <Text style={styles.enrollmentText}>
                      {course.enrolled}/{course.capacity} Students
                    </Text>
                </View>
              </View>

              <View style={styles.courseDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Schedule:</Text>
                  <Text style={styles.detailValue}>{course.schedule}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Room:</Text>
                  <Text style={styles.detailValue}>{course.room}</Text>
                </View>
                </View>

                <View style={styles.courseActions}>
                  <View style={[styles.statusBadge, { backgroundColor: enrollmentStatus.color + '20' }]}>
                    <Text style={[styles.statusText, { color: enrollmentStatus.color }]}>
                      {enrollmentStatus.text}
                    </Text>
              </View>

                  {course.is_enrolled ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.dropButton]}
                      onPress={() => handleDrop(course.id)}
                      disabled={enrolling}
                    >
                      <Text style={styles.dropButtonText}>Drop Course</Text>
                </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.actionButton, 
                        styles.enrollButton,
                        enrollmentStatus.text === 'Full' && styles.disabledButton
                      ]}
                      onPress={() => handleEnroll(course.id)}
                      disabled={enrolling || enrollmentStatus.text === 'Full'}
                    >
                      <Text style={styles.enrollButtonText}>
                        {enrollmentStatus.text === 'Full' ? 'Full' : 'Enroll'}
                      </Text>
                </TouchableOpacity>
                  )}
                </View>
            </View>
          );
          })
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
  header: {
    padding: isIOS ? 16 : 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
  },
  headerTitle: {
    fontSize: isIOS ? 20 : 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#546e7a',
    fontSize: isIOS ? 12 : 14,
  },
  searchSection: {
    padding: isIOS ? 16 : 20,
    paddingBottom: isIOS ? 8 : 10,
  },
  searchBar: {
    backgroundColor: '#ffffff',
    borderRadius: isIOS ? 6 : 8,
    padding: isIOS ? 10 : 12,
    marginBottom: isIOS ? 12 : 16,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#e8eaf6',
    paddingHorizontal: isIOS ? 12 : 16,
    paddingVertical: isIOS ? 6 : 8,
    borderRadius: isIOS ? 16 : 20,
    marginRight: isIOS ? 6 : 8,
  },
  filterChipSelected: {
    backgroundColor: '#1a237e',
  },
  filterChipText: {
    color: '#1a237e',
    fontSize: isIOS ? 12 : 14,
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  coursesContainer: {
    flex: 1,
    padding: isIOS ? 16 : 20,
    paddingTop: 0,
  },
  courseCard: {
    backgroundColor: '#ffffff',
    borderRadius: isIOS ? 10 : 12,
    padding: isIOS ? 12 : 16,
    marginBottom: isIOS ? 12 : 16,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: isIOS ? 14 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  courseName: {
    fontSize: isIOS ? 16 : 18,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 4,
  },
  courseInstructor: {
    color: '#546e7a',
    fontSize: isIOS ? 12 : 14,
  },
  courseDepartment: {
    color: '#546e7a',
    fontSize: isIOS ? 12 : 14,
    marginTop: 2,
  },
  courseStats: {
    alignItems: 'flex-end',
  },
  creditsText: {
    fontSize: isIOS ? 10 : 12,
    fontWeight: '600',
    color: '#1a237e',
  },
  enrollmentText: {
    fontSize: isIOS ? 10 : 12,
    fontWeight: '600',
    color: '#1a237e',
  },
  courseDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#1a237e',
    fontSize: isIOS ? 12 : 14,
  },
  detailValue: {
    color: '#546e7a',
    fontSize: isIOS ? 12 : 14,
    flex: 1,
    textAlign: 'right',
  },
  courseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: isIOS ? 6 : 8,
    paddingVertical: isIOS ? 3 : 4,
    borderRadius: isIOS ? 8 : 12,
  },
  statusText: {
    fontSize: isIOS ? 10 : 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButton: {
    paddingHorizontal: isIOS ? 12 : 16,
    paddingVertical: isIOS ? 6 : 8,
    borderRadius: isIOS ? 6 : 8,
    alignItems: 'center',
  },
  enrollButton: {
    backgroundColor: '#1a237e',
  },
  dropButton: {
    backgroundColor: '#ef4444',
  },
  enrollButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: isIOS ? 12 : 14,
  },
  dropButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: isIOS ? 12 : 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#546e7a',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#546e7a',
    textAlign: 'center',
  },
  demoNotice: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  demoNoticeText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SimpleCoursesScreen;

