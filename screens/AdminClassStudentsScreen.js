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

const AdminClassStudentsScreen = ({ navigation, route }) => {
  const { classId } = route.params;
  const [loading, setLoading] = useState(true);
  const [classDetails, setClassDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceByStudentId, setAttendanceByStudentId] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    fetchClassDetails();
    fetchEnrolledStudents();
    fetchAvailableStudents();
  }, []);

  useEffect(() => {
    // fetch attendance whenever the date changes
    const load = async () => {
      try {
        const response = await apiClient.getClassAttendance(classId, { date: attendanceDate });
        if (response.success) {
          const map = {};
          (response.data.records || []).forEach((r) => {
            map[r.student_id] = { status: r.status || 'present', note: r.note || '' };
          });
          setAttendanceByStudentId(map);
          return;
        }
      } catch (e) {}
      const map = {};
      (students || []).forEach((s) => {
        map[s.id] = { status: 'present', note: '' };
      });
      setAttendanceByStudentId(map);
    };
    load();
  }, [attendanceDate]);

  const fetchClassDetails = async () => {
    try {
      const response = await apiClient.getAdminClass(classId);
      if (response.success) {
        setClassDetails(response.data.class || null);
      } else {
        setClassDetails(null);
        Alert.alert('Error', response.message || 'Failed to load class');
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      setClassDetails(getMockClassDetails());
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getClassStudents(classId);
      if (response.success) {
        setStudents(response.data.students || []);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      setStudents(getMockEnrolledStudents());
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await apiClient.getAvailableStudents(classId);
      if (response.success) {
        setAvailableStudents(response.data.students || []);
      } else {
        setAvailableStudents([]);
      }
    } catch (error) {
      console.error('Error fetching available students:', error);
      setAvailableStudents(getMockAvailableStudents());
    }
  };


  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      Alert.alert('Error', 'Please select at least one student');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.enrollStudentsInClass(classId, selectedStudents);
      if (response.success) {
        Alert.alert('Success', 'Students enrolled successfully!');
        setShowAddForm(false);
        setSelectedStudents([]);
        fetchEnrolledStudents();
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

  const handleRemoveStudent = (student) => {
    Alert.alert(
      'Remove Student',
      `Are you sure you want to remove ${student.first_name} ${student.last_name} from this class?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.removeStudentFromClass(classId, student.id);
              if (response.success) {
                Alert.alert('Success', 'Student removed successfully!');
                fetchEnrolledStudents();
                fetchAvailableStudents();
              } else {
                Alert.alert('Error', response.message || 'Failed to remove student');
              }
            } catch (error) {
              console.error('Error removing student:', error);
              Alert.alert('Error', error.message || 'Failed to remove student');
            }
          },
        },
      ]
    );
  };

  const handleViewGrades = (student) => {
    navigation.navigate('AdminStudentGrades', {
      classId,
      studentId: student.id,
      studentName: `${student.first_name} ${student.last_name}`,
    });
  };

  const handleViewAttendance = (student) => {
    navigation.navigate('AdminStudentAttendance', {
      classId,
      studentId: student.id,
      studentName: `${student.first_name} ${student.last_name}`,
    });
  };

  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchString = searchQuery.toLowerCase();
    return (
      student.first_name.toLowerCase().includes(searchString) ||
      student.last_name.toLowerCase().includes(searchString) ||
      student.student_id.toLowerCase().includes(searchString) ||
      student.email.toLowerCase().includes(searchString)
    );
  });

  const renderStudentCard = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.studentDetail}>ID: {item.student_id}</Text>
        <Text style={styles.studentDetail}>Email: {item.email}</Text>
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
            <Text style={styles.performanceValue}>{item.current_grade}</Text>
          </View>
        </View>
        <View style={styles.attendanceControls}>
          <Text style={styles.attendanceLabel}>Mark:</Text>
          <TouchableOpacity
            style={[styles.attendanceBadge, styles.presentBadge, attendanceByStudentId[item.id]?.status === 'present' && styles.attendanceSelected]}
            onPress={() => setAttendanceByStudentId({ ...attendanceByStudentId, [item.id]: { ...(attendanceByStudentId[item.id] || {}), status: 'present' } })}
          >
            <Text style={styles.attendanceBadgeText}>P</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.attendanceBadge, styles.absentBadge, attendanceByStudentId[item.id]?.status === 'absent' && styles.attendanceSelected]}
            onPress={() => setAttendanceByStudentId({ ...attendanceByStudentId, [item.id]: { ...(attendanceByStudentId[item.id] || {}), status: 'absent' } })}
          >
            <Text style={styles.attendanceBadgeText}>A</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.attendanceBadge, styles.lateBadge, attendanceByStudentId[item.id]?.status === 'late' && styles.attendanceSelected]}
            onPress={() => setAttendanceByStudentId({ ...attendanceByStudentId, [item.id]: { ...(attendanceByStudentId[item.id] || {}), status: 'late' } })}
          >
            <Text style={styles.attendanceBadgeText}>L</Text>
          </TouchableOpacity>
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
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleRemoveStudent(item)}
        >
          <Text style={styles.actionButtonText}>Remove</Text>
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

  if (loading && !classDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading class details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{classDetails.name}</Text>
        <Text style={styles.headerSubtitle}>
          {classDetails.grade_level} • Room {classDetails.room_id}
        </Text>
        <Text style={styles.headerTeacher}>
          Teacher: {classDetails.teacher.name}
        </Text>
      </View>

      {/* Class Schedule */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scheduleContainer}
      >
        {classDetails.schedule.map((slot, index) => (
          <View key={index} style={styles.scheduleCard}>
            <Text style={styles.scheduleDay}>{slot.day}</Text>
            <Text style={styles.scheduleTime}>{slot.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Enrollment Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{classDetails.enrolled_students}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {classDetails.capacity - classDetails.enrolled_students}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{classDetails.capacity}</Text>
          <Text style={styles.statLabel}>Capacity</Text>
        </View>
      </View>

      {/* Attendance Controls */}
      <View style={styles.attendanceBar}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Date</Text>
          <TextInput
            style={styles.dateInput}
            value={attendanceDate}
            onChangeText={setAttendanceDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={styles.markAllContainer}>
          <TouchableOpacity style={[styles.markAllButton, styles.presentBadge]} onPress={() => markAll('present')}>
            <Text style={styles.markAllText}>All P</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.markAllButton, styles.absentBadge]} onPress={() => markAll('absent')}>
            <Text style={styles.markAllText}>All A</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.markAllButton, styles.lateBadge]} onPress={() => markAll('late')}>
            <Text style={styles.markAllText}>All L</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveAttendanceButton} onPress={saveAttendance} disabled={savingAttendance}>
            <Text style={styles.saveAttendanceText}>{savingAttendance ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Add */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
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
              Select students to add to this class
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
              onPress={handleAddStudents}
            >
              <Text style={styles.enrollButtonText}>
                Enroll {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.studentsList}
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
  headerTeacher: {
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
  studentsList: {
    flex: 1,
    paddingHorizontal: isIOS ? 20 : 16,
  },
  attendanceBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: isIOS ? 20 : 16,
    paddingVertical: isIOS ? 12 : 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateContainer: {
    flex: 1,
    marginRight: 12,
  },
  dateLabel: {
    fontSize: isIOS ? 14 : 12,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '600',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: isIOS ? 12 : 8,
    paddingHorizontal: isIOS ? 12 : 10,
    paddingVertical: isIOS ? 10 : 8,
    backgroundColor: '#f9fafb',
  },
  markAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  markAllText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  saveAttendanceButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveAttendanceText: {
    color: 'white',
    fontWeight: '700',
  },
  attendanceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isIOS ? 10 : 8,
  },
  attendanceLabel: {
    fontSize: isIOS ? 12 : 10,
    color: '#6b7280',
    marginRight: 8,
  },
  attendanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  attendanceSelected: {
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  presentBadge: { backgroundColor: '#10b981' },
  absentBadge: { backgroundColor: '#ef4444' },
  lateBadge: { backgroundColor: '#f59e0b' },
  attendanceBadgeText: {
    color: 'white',
    fontWeight: '800',
  },
  studentCard: {
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
  removeButton: {
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

export default AdminClassStudentsScreen;
