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
  Modal,
  RefreshControl,
} from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const AdminSectionManagementScreen = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [newSection, setNewSection] = useState({
    name: '',
    academic_year: '2024-2025',
  });

  useBackButton(navigation);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchSections();
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourseDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      } else {
        // Fallback departments
        setDepartments(['Computer Science', 'Information Science', 'Electronics', 'Mechanical']);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments(['Computer Science', 'Information Science', 'Electronics', 'Mechanical']);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    if (!selectedDepartment) return;
    
    try {
      setLoading(true);
      const response = await apiClient.getSections({ 
        department: selectedDepartment,
        academic_year: '2024-2025'
      });
      if (response.success) {
        setSections(response.data.sections || []);
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSections();
    setRefreshing(false);
  };

  const handleCreateSection = async () => {
    if (!newSection.name.trim()) {
      Alert.alert('Error', 'Please enter a section name');
      return;
    }

    if (!selectedDepartment) {
      Alert.alert('Error', 'Please select a department first');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.createSection({
        name: newSection.name.toUpperCase(),
        department: selectedDepartment,
        academic_year: newSection.academic_year,
      });

      if (response.success) {
        Alert.alert('Success', 'Section created successfully!');
        setShowCreateModal(false);
        setNewSection({ name: '', academic_year: '2024-2025' });
        fetchSections();
      } else {
        Alert.alert('Error', response.message || 'Failed to create section');
      }
    } catch (error) {
      console.error('Error creating section:', error);
      Alert.alert('Error', 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = (section) => {
    Alert.alert(
      'Delete Section',
      `Are you sure you want to delete section ${section.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await apiClient.deleteSection(section.id);
              if (response.success) {
                Alert.alert('Success', 'Section deleted successfully!');
                fetchSections();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete section');
              }
            } catch (error) {
              console.error('Error deleting section:', error);
              Alert.alert('Error', 'Failed to delete section');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleManageStudents = async (section) => {
    setSelectedSection(section);
    try {
      setLoading(true);
      const response = await apiClient.getAvailableStudentsForSection(section.id);
      if (response.success) {
        setAvailableStudents(response.data.students || []);
        setShowStudentModal(true);
      } else {
        Alert.alert('Error', 'Failed to load available students');
      }
    } catch (error) {
      console.error('Error fetching available students:', error);
      Alert.alert('Error', 'Failed to load available students');
    } finally {
      setLoading(false);
    }
  };

  const handleManageTeachers = async (section) => {
    setSelectedSection(section);
    try {
      setLoading(true);
      const response = await apiClient.getAvailableTeachersForSection(section.id);
      if (response.success) {
        setAvailableTeachers(response.data.teachers || []);
        setShowTeacherModal(true);
      } else {
        Alert.alert('Error', 'Failed to load available teachers');
      }
    } catch (error) {
      console.error('Error fetching available teachers:', error);
      Alert.alert('Error', 'Failed to load available teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      Alert.alert('Error', 'Please select at least one student');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.addStudentsToSection(selectedSection.id, selectedStudents);
      if (response.success) {
        Alert.alert('Success', `${selectedStudents.length} student(s) added successfully!`);
        setShowStudentModal(false);
        setSelectedStudents([]);
        fetchSections();
      } else {
        Alert.alert('Error', response.message || 'Failed to add students');
      }
    } catch (error) {
      console.error('Error adding students:', error);
      Alert.alert('Error', 'Failed to add students');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) {
      Alert.alert('Error', 'Please select a teacher');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.assignTeacherToSection(selectedSection.id, selectedTeacher);
      if (response.success) {
        Alert.alert('Success', 'Teacher assigned successfully!');
        setShowTeacherModal(false);
        setSelectedTeacher(null);
        fetchSections();
      } else {
        Alert.alert('Error', response.message || 'Failed to assign teacher');
      }
    } catch (error) {
      console.error('Error assigning teacher:', error);
      Alert.alert('Error', 'Failed to assign teacher');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const renderDepartmentCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.departmentCard,
        selectedDepartment === item && styles.departmentCardSelected,
      ]}
      onPress={() => setSelectedDepartment(item)}
    >
      <Text style={[
        styles.departmentName,
        selectedDepartment === item && styles.departmentNameSelected,
      ]}>
        {item}
      </Text>
      {selectedDepartment === item && (
        <Text style={styles.selectedIndicator}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const renderSectionCard = ({ item }) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionName}>{item.name}</Text>
          <Text style={styles.sectionDetails}>
            {item.department} • {item.academic_year}
          </Text>
          <Text style={styles.sectionStats}>
            {item.student_count || 0} Students • {item.teacher_count || 0} Teachers
          </Text>
        </View>
        <View style={styles.sectionActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.manageButton]}
            onPress={() => handleManageStudents(item)}
          >
            <Text style={styles.actionButtonText}>👥 Students</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.manageButton]}
            onPress={() => handleManageTeachers(item)}
          >
            <Text style={styles.actionButtonText}>👨‍🏫 Teachers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteSection(item)}
          >
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStudentItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.studentItem,
        selectedStudents.includes(item.id) && styles.studentItemSelected,
      ]}
      onPress={() => toggleStudentSelection(item.id)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.studentDetails}>
          ID: {item.student_id} • {item.grade_level}
        </Text>
      </View>
      <View style={[
        styles.checkbox,
        selectedStudents.includes(item.id) && styles.checkboxSelected,
      ]} />
    </TouchableOpacity>
  );

  const renderTeacherItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.teacherItem,
        selectedTeacher === item.id && styles.teacherItemSelected,
      ]}
      onPress={() => setSelectedTeacher(item.id)}
    >
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.teacherDetails}>
          {item.department} • {item.email}
        </Text>
      </View>
      <View style={[
        styles.radioButton,
        selectedTeacher === item.id && styles.radioButtonSelected,
      ]} />
    </TouchableOpacity>
  );

  if (loading && !selectedDepartment) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading departments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Section Management</Text>
          <Text style={styles.headerSubtitle}>
            Organize students and teachers by sections
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Department Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Department</Text>
          <FlatList
            data={departments}
            renderItem={renderDepartmentCard}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.departmentList}
          />
        </View>

        {/* Section Management */}
        {selectedDepartment && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedDepartment} Sections
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createButtonText}>+ Create Section</Text>
              </TouchableOpacity>
            </View>

            {sections.length > 0 ? (
              <FlatList
                data={sections}
                renderItem={renderSectionCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No sections found for {selectedDepartment}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Create your first section to get started
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Section Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Section</Text>
            <Text style={styles.modalSubtitle}>
              Department: {selectedDepartment}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Section Name (e.g., A, B, C)"
              value={newSection.name}
              onChangeText={(text) => setNewSection({ ...newSection, name: text })}
              maxLength={10}
            />

            <TextInput
              style={styles.input}
              placeholder="Academic Year"
              value={newSection.academic_year}
              onChangeText={(text) => setNewSection({ ...newSection, academic_year: text })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateSection}
                disabled={loading}
              >
                <Text style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Student Management Modal */}
      <Modal
        visible={showStudentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStudentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Manage Students - {selectedSection?.name}
            </Text>
            <Text style={styles.modalSubtitle}>
              Select students to add to this section
            </Text>

            <FlatList
              data={availableStudents}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item.id}
              style={styles.studentList}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowStudentModal(false);
                  setSelectedStudents([]);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleAddStudents}
                disabled={loading || selectedStudents.length === 0}
              >
                <Text style={styles.createButtonText}>
                  {loading ? 'Adding...' : `Add ${selectedStudents.length} Student(s)`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Teacher Management Modal */}
      <Modal
        visible={showTeacherModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTeacherModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Assign Teacher - {selectedSection?.name}
            </Text>
            <Text style={styles.modalSubtitle}>
              Select a teacher to assign to this section
            </Text>

            <FlatList
              data={availableTeachers}
              renderItem={renderTeacherItem}
              keyExtractor={(item) => item.id}
              style={styles.teacherList}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowTeacherModal(false);
                  setSelectedTeacher(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleAssignTeacher}
                disabled={loading || !selectedTeacher}
              >
                <Text style={styles.createButtonText}>
                  {loading ? 'Assigning...' : 'Assign Teacher'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  headerTitle: {
    fontSize: isIOS ? 32 : 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: isIOS ? 16 : 14,
    color: '#e3f2fd',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  departmentList: {
    paddingRight: 20,
  },
  departmentCard: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  departmentCardSelected: {
    borderColor: '#1a237e',
    backgroundColor: '#e3f2fd',
  },
  departmentName: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: '#64748b',
  },
  departmentNameSelected: {
    color: '#1a237e',
  },
  selectedIndicator: {
    fontSize: 16,
    color: '#1a237e',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  sectionDetails: {
    fontSize: isIOS ? 14 : 12,
    color: '#64748b',
    marginBottom: 4,
  },
  sectionStats: {
    fontSize: isIOS ? 14 : 12,
    color: '#10b981',
    fontWeight: '600',
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  manageButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: isIOS ? 12 : 10,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: 'white',
    fontSize: isIOS ? 14 : 12,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateText: {
    fontSize: isIOS ? 18 : 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: isIOS ? 14 : 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: isIOS ? 14 : 12,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: isIOS ? 16 : 14,
    backgroundColor: '#f8fafc',
    marginBottom: 16,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#64748b',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: isIOS ? 16 : 14,
    fontWeight: 'bold',
  },
  studentList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  studentItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: isIOS ? 14 : 12,
    color: '#64748b',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  checkboxSelected: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  teacherList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  teacherItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  teacherItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 4,
  },
  teacherDetails: {
    fontSize: isIOS ? 14 : 12,
    color: '#64748b',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  radioButtonSelected: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
});

export default AdminSectionManagementScreen;
