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

const { width, height } = Dimensions.get('window');
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
      setClassDetails(null);
      Alert.alert('Error', error.message || 'Failed to load class');
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
      setStudents([]);
      Alert.alert('Error', error.message || 'Failed to load enrolled students');
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
      setAvailableStudents([]);
      Alert.alert('Error', error.message || 'Failed to load available students');
    }
  };

  // Mark all students with the same status
  const markAll = (status) => {
    const next = {};
    (students || []).forEach((s) => {
      next[s.id] = { status, note: attendanceByStudentId[s.id]?.note || '' };
    });
    setAttendanceByStudentId(next);
  };

  // Save attendance for the selected date
  const saveAttendance = async () => {
    try {
      setSavingAttendance(true);
      const entries = (students || []).map((s) => ({
        student_id: s.id,
        status: attendanceByStudentId[s.id]?.status || 'present',
        note: attendanceByStudentId[s.id]?.note || '',
      }));
      const resp = await apiClient.markClassAttendance(classId, { date: attendanceDate, entries });
      if (resp?.success) {
        Alert.alert('Success', 'Attendance saved successfully!');
      } else {
        Alert.alert('Error', resp?.message || 'Failed to save attendance');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to save attendance');
    } finally {
      setSavingAttendance(false);
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
      <View style={styles.studentHeader}>
        <View style={styles.studentAvatar}>
          <Text style={styles.avatarText}>
            {(item.first_name?.[0] || '') + (item.last_name?.[0] || '')}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.studentId}>ID: {item.student_id}</Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
        </View>
        <View style={styles.studentActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewGrades(item)}
          >
            <Text style={styles.actionButtonText}>Grades</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemoveStudent(item)}
          >
            <Text style={styles.actionButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.performanceSection}>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Attendance</Text>
          <Text style={[
            styles.performanceValue,
            { color: (item.attendance || 0) >= 90 ? '#10b981' : (item.attendance || 0) >= 75 ? '#f59e0b' : '#ef4444' }
          ]}>{item.attendance || 0}%</Text>
        </View>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Current Grade</Text>
          <Text style={styles.performanceValue}>{item.current_grade || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.attendanceSection}>
        <Text style={styles.attendanceTitle}>Mark Attendance:</Text>
        <View style={styles.attendanceButtons}>
          <TouchableOpacity
            style={[
              styles.attendanceButton,
              styles.presentButton,
              attendanceByStudentId[item.id]?.status === 'present' && styles.attendanceButtonActive
            ]}
            onPress={() => setAttendanceByStudentId({
              ...attendanceByStudentId,
              [item.id]: { ...(attendanceByStudentId[item.id] || {}), status: 'present' }
            })}
          >
            <Text style={styles.attendanceButtonText}>Present</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.attendanceButton,
              styles.absentButton,
              attendanceByStudentId[item.id]?.status === 'absent' && styles.attendanceButtonActive
            ]}
            onPress={() => setAttendanceByStudentId({
              ...attendanceByStudentId,
              [item.id]: { ...(attendanceByStudentId[item.id] || {}), status: 'absent' }
            })}
          >
            <Text style={styles.attendanceButtonText}>Absent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.attendanceButton,
              styles.lateButton,
              attendanceByStudentId[item.id]?.status === 'late' && styles.attendanceButtonActive
            ]}
            onPress={() => setAttendanceByStudentId({
              ...attendanceByStudentId,
              [item.id]: { ...(attendanceByStudentId[item.id] || {}), status: 'late' }
            })}
          >
            <Text style={styles.attendanceButtonText}>Late</Text>
          </TouchableOpacity>
        </View>
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{classDetails?.name || 'Loading...'}</Text>
          <Text style={styles.headerSubtitle}>
            {classDetails?.grade_level || '-'} • Room {classDetails?.room_id || '-'}
          </Text>
          <Text style={styles.headerTeacher}>
            Teacher: {classDetails?.teacher?.name || classDetails?.teacher_name || 'Unassigned'}
          </Text>
        </View>
      </View>



      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Enrollment Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{classDetails?.enrolled_students ?? 0}</Text>
            <Text style={styles.statLabel}>Enrolled</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {(classDetails?.capacity ?? 0) - (classDetails?.enrolled_students ?? 0)}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{classDetails?.capacity ?? 0}</Text>
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
            <TouchableOpacity 
              style={[styles.markAllButton, styles.presentButton]} 
              onPress={() => markAll('present')}
            >
              <Text style={styles.markAllText}>All Present</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.markAllButton, styles.absentButton]} 
              onPress={() => markAll('absent')}
            >
              <Text style={styles.markAllText}>All Absent</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveAttendanceButton} 
              onPress={saveAttendance} 
              disabled={savingAttendance}
            >
              <Text style={styles.saveAttendanceText}>
                {savingAttendance ? 'Saving...' : 'Save'}
              </Text>
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
              scrollEnabled={false}
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
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No students enrolled</Text>
            </View>
          }
        />
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
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: isIOS ? 32 : 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: isIOS ? 18 : 16,
    color: '#e3f2fd',
    marginBottom: 20,
    textAlign: 'left',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerTeacher: {
    fontSize: isIOS ? 16 : 14,
    color: '#e3f2fd',
    fontStyle: 'italic',
    textAlign: 'left',
    marginTop: 12,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scheduleContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    marginTop: -15,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scheduleContent: {
    paddingHorizontal: 16,
  },
  scheduleCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scheduleDay: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 6,
  },
  scheduleTime: {
    fontSize: isIOS ? 14 : 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCard: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: isIOS ? 28 : 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 6,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: isIOS ? 16 : 14,
    backgroundColor: '#f8fafc',
    marginRight: 16,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: isIOS ? 16 : 14,
    fontWeight: 'bold',
  },
  addForm: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addFormHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  addFormTitle: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 6,
  },
  addFormSubtitle: {
    fontSize: isIOS ? 16 : 14,
    color: '#64748b',
  },
  availableStudentsList: {
    maxHeight: 300,
  },
  availableStudentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  availableStudentItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  availableStudentInfo: {
    flex: 1,
  },
  availableStudentName: {
    fontSize: isIOS ? 18 : 16,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 4,
  },
  availableStudentDetail: {
    fontSize: isIOS ? 14 : 12,
    color: '#64748b',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 3,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  checkboxSelected: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  addFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#64748b',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: isIOS ? 16 : 14,
    fontWeight: 'bold',
  },
  enrollButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  enrollButtonText: {
    color: 'white',
    fontSize: isIOS ? 16 : 14,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  studentsList: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  attendanceBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateContainer: {
    flex: 1,
    marginRight: 16,
  },
  dateLabel: {
    fontSize: isIOS ? 16 : 14,
    color: '#1a237e',
    marginBottom: 8,
    fontWeight: '600',
  },
  dateInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    fontSize: isIOS ? 16 : 14,
    fontWeight: '500',
  },
  markAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markAllText: {
    color: 'white',
    fontWeight: '700',
    fontSize: isIOS ? 14 : 12,
  },
  saveAttendanceButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveAttendanceText: {
    color: 'white',
    fontWeight: '700',
    fontSize: isIOS ? 14 : 12,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  studentId: {
    fontSize: isIOS ? 16 : 14,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '500',
  },
  studentEmail: {
    fontSize: isIOS ? 14 : 12,
    color: '#94a3b8',
    fontWeight: '400',
  },
  studentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewButton: {
    backgroundColor: '#3b82f6',
  },
  removeButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: isIOS ? 14 : 12,
    fontWeight: 'bold',
  },
  performanceSection: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: isIOS ? 14 : 12,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '500',
  },
  performanceValue: {
    fontSize: isIOS ? 18 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  attendanceSection: {
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
  },
  attendanceTitle: {
    fontSize: isIOS ? 18 : 16,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 16,
  },
  attendanceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  attendanceButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  presentButton: {
    backgroundColor: '#10b981',
  },
  absentButton: {
    backgroundColor: '#ef4444',
  },
  lateButton: {
    backgroundColor: '#f59e0b',
  },
  attendanceButtonActive: {
    borderWidth: 3,
    borderColor: '#1a237e',
    transform: [{ scale: 1.05 }],
  },
  attendanceButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: isIOS ? 14 : 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: isIOS ? 18 : 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AdminClassStudentsScreen;

