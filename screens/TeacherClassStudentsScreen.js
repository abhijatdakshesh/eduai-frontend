import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const TeacherClassStudentsScreen = ({ navigation, route }) => {
  const { classId, className } = route.params;
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classDetails, setClassDetails] = useState(null);

  useBackButton(navigation);

  useEffect(() => {
    fetchClassStudents();
  }, [classId]);

  const fetchClassStudents = async () => {
    try {
      setLoading(true);
      console.log('TeacherClassStudents: Fetching students for class:', classId);
      
      // Fetch students in the class
      const studentsResponse = await apiClient.getTeacherClassStudents(classId);
      console.log('TeacherClassStudents: Students response:', JSON.stringify(studentsResponse, null, 2));
      
      if (studentsResponse?.success && studentsResponse?.data?.students) {
        setStudents(studentsResponse.data.students);
      } else {
        console.log('TeacherClassStudents: No students found or API error');
        setStudents([]);
      }

      // Try to get class details from the classes list
      try {
        const classesResponse = await apiClient.getTeacherClasses();
        if (classesResponse?.success && classesResponse?.data?.classes) {
          const classInfo = classesResponse.data.classes.find(cls => cls.id === classId);
          if (classInfo) {
            setClassDetails(classInfo);
          }
        }
      } catch (e) {
        console.log('TeacherClassStudents: Could not fetch class details:', e.message);
      }
    } catch (error) {
      console.log('TeacherClassStudents: Error fetching students:', error.message);
      Alert.alert('Error', 'Failed to load students. Please try again.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStudentItem = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.studentId}>ID: {item.student_id}</Text>
        {item.email && (
          <Text style={styles.studentEmail}>{item.email}</Text>
        )}
      </View>
      <View style={styles.studentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TeacherMarkAttendance', { 
            classId, 
            className,
            studentId: item.student_db_id,
            studentName: `${item.first_name} ${item.last_name}`
          })}
        >
          <Text style={styles.actionButtonText}>Mark Attendance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{className || 'Class Students'}</Text>
          <Text style={styles.headerSubtitle}>
            {classDetails?.grade_level || ''} • {classDetails?.academic_year || ''}
          </Text>
          <Text style={styles.headerStats}>
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Class Info Card */}
        {classDetails && (
          <View style={styles.classInfoCard}>
            <Text style={styles.classInfoTitle}>Class Information</Text>
            <View style={styles.classInfoRow}>
              <Text style={styles.classInfoLabel}>Class Name:</Text>
              <Text style={styles.classInfoValue}>{classDetails.name}</Text>
            </View>
            <View style={styles.classInfoRow}>
              <Text style={styles.classInfoLabel}>Grade Level:</Text>
              <Text style={styles.classInfoValue}>{classDetails.grade_level}</Text>
            </View>
            <View style={styles.classInfoRow}>
              <Text style={styles.classInfoLabel}>Academic Year:</Text>
              <Text style={styles.classInfoValue}>{classDetails.academic_year}</Text>
            </View>
            <View style={styles.classInfoRow}>
              <Text style={styles.classInfoLabel}>Max Students:</Text>
              <Text style={styles.classInfoValue}>{classDetails.max_students}</Text>
            </View>
            <View style={styles.classInfoRow}>
              <Text style={styles.classInfoLabel}>Current Students:</Text>
              <Text style={styles.classInfoValue}>{classDetails.current_students}</Text>
            </View>
          </View>
        )}

        {/* Students List */}
        <View style={styles.studentsSection}>
          <Text style={styles.sectionTitle}>Enrolled Students</Text>
          
          {students.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No students enrolled in this class</Text>
              <Text style={styles.emptyStateSubtext}>
                Students will appear here once they are enrolled by an administrator
              </Text>
            </View>
          ) : (
            <FlatList
              data={students}
              keyExtractor={(item) => item.student_db_id || item.student_id}
              renderItem={renderStudentItem}
              scrollEnabled={false}
              contentContainerStyle={styles.studentsList}
            />
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('TeacherMarkAttendance', { classId, className })}
          >
            <Text style={styles.quickActionButtonText}>Mark Class Attendance</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('TeacherClasses')}
          >
            <Text style={[styles.quickActionButtonText, styles.secondaryButtonText]}>
              Back to Classes
            </Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    color: '#1a237e',
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: isIOS ? 28 : 24,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#e3f2fd',
    fontSize: isIOS ? 16 : 14,
    marginBottom: 8,
  },
  headerStats: {
    color: '#e3f2fd',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  classInfoCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  classInfoTitle: {
    color: '#1a237e',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
  },
  classInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  classInfoLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  classInfoValue: {
    color: '#1a237e',
    fontSize: 14,
    fontWeight: '600',
  },
  studentsSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    color: '#1a237e',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
  },
  studentsList: {
    paddingBottom: 16,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#1a237e',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  studentId: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 2,
  },
  studentEmail: {
    color: '#6b7280',
    fontSize: 12,
  },
  studentActions: {
    marginLeft: 12,
  },
  actionButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    padding: 16,
    paddingTop: 0,
  },
  quickActionButton: {
    backgroundColor: '#1a237e',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#1a237e',
  },
  quickActionButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#1a237e',
  },
});

export default TeacherClassStudentsScreen;
