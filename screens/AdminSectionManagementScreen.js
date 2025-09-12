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
import { Picker } from '@react-native-picker/picker';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const AdminSectionManagementScreen = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ first_name: '', last_name: '', email: '' });
  const [newSection, setNewSection] = useState({
    name: '',
    academic_year: '2024-2025',
  });

  useBackButton(navigation);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartmentId) {
      fetchSections();
    }
  }, [selectedDepartmentId]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourseDepartments();
      console.log('AdminSectionManagement: Department response:', response);
      if (response.success) {
        // Handle both array of strings and array of objects
        const departmentsData = response.data || [];
        console.log('AdminSectionManagement: Departments data:', departmentsData);
        if (Array.isArray(departmentsData) && departmentsData.length > 0) {
          // Check if it's an array of objects or strings
          if (typeof departmentsData[0] === 'object' && departmentsData[0].name) {
            // Keep the full department objects for ID access
            console.log('AdminSectionManagement: Using department objects:', departmentsData);
            setDepartments(departmentsData);
          } else {
            // It's already an array of strings - convert to objects
            const departmentObjects = departmentsData.map((name, index) => ({ id: index, name }));
            console.log('AdminSectionManagement: Converted strings to objects:', departmentObjects);
            setDepartments(departmentObjects);
          }
        } else {
          // Fallback departments
          console.log('AdminSectionManagement: Using fallback departments');
          setDepartments([
            { id: 1, name: 'Computer Science' },
            { id: 2, name: 'Information Science' },
            { id: 3, name: 'Electronics' },
            { id: 4, name: 'Mechanical' }
          ]);
        }
      } else {
        // Fallback departments
        console.log('AdminSectionManagement: API failed, using fallback departments');
        setDepartments([
          { id: 1, name: 'Computer Science' },
          { id: 2, name: 'Information Science' },
          { id: 3, name: 'Electronics' },
          { id: 4, name: 'Mechanical' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([
        { id: 1, name: 'Computer Science' },
        { id: 2, name: 'Information Science' },
        { id: 3, name: 'Electronics' },
        { id: 4, name: 'Mechanical' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    if (!selectedDepartmentId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.getSections({ 
        department_id: selectedDepartmentId,
        academic_year: '2024-2025',
        year: selectedYear || undefined,
        semester: selectedSemester || undefined,
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

    if (!selectedDepartmentId) {
      Alert.alert('Error', 'Please select a department first');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.createSection({
        name: newSection.name.toUpperCase(),
        department_id: selectedDepartmentId,
        academic_year: newSection.academic_year,
        year: selectedYear || undefined,
        semester: selectedSemester || undefined,
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
                // Optimistically update UI
                setSections((prev) => (Array.isArray(prev) ? prev.filter((s) => s.id !== section.id) : prev));
                // Then refetch to ensure server truth
                fetchSections();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete section');
              }
            } catch (error) {
              console.error('Error deleting section:', error);
              Alert.alert(
                'Delete Failed',
                (error?.message || 'Failed to delete section') + '\n\nYou can try force deleting (removes all assigned students and teachers, then deletes the section).',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Force Delete',
                    style: 'destructive',
                    onPress: () => forceDeleteSection(section),
                  },
                ]
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const forceDeleteSection = async (section) => {
    try {
      setLoading(true);
      console.log('Force deleting section:', section?.id);
      // 1) Fetch assigned users
      let students = [];
      let teachers = [];
      try {
        const stuResp = await apiClient.getSectionStudents(section.id);
        students = (stuResp?.success && (stuResp.data.students || stuResp.data)) || [];
      } catch (e) {
        console.log('Force delete: getSectionStudents failed, continuing...', e?.message);
      }
      try {
        const tchResp = await apiClient.getSectionTeachers(section.id);
        teachers = (tchResp?.success && (tchResp.data.teachers || tchResp.data)) || [];
      } catch (e) {
        console.log('Force delete: getSectionTeachers failed, continuing...', e?.message);
      }

      // 2) Remove teachers
      for (const t of teachers) {
        try {
          await apiClient.removeTeacherFromSection(section.id, t.id);
        } catch (e) {
          console.log('Force delete: removeTeacherFromSection failed for', t.id, e?.message);
        }
      }
      // 3) Remove students
      for (const s of students) {
        try {
          await apiClient.removeStudentFromSection(section.id, s.id);
        } catch (e) {
          console.log('Force delete: removeStudentFromSection failed for', s.id, e?.message);
        }
      }
      // 4) Delete section
      const delResp = await apiClient.deleteSection(section.id);
      if (delResp?.success) {
        Alert.alert('Success', 'Section force-deleted successfully');
        setSections((prev) => (Array.isArray(prev) ? prev.filter((s) => s.id !== section.id) : prev));
        fetchSections();
      } else {
        Alert.alert('Error', delResp?.message || 'Failed to delete section after cleanup');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Force delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManageStudents = async (section) => {
    setSelectedSection(section);
    try {
      setLoading(true);
      const [availResp, assignedResp] = await Promise.all([
        apiClient.getAvailableStudentsForSection(section.id),
        apiClient.getSectionStudents(section.id).catch(() => ({ success: false, data: [] })),
      ]);
      if (availResp?.success) {
        setAvailableStudents(availResp.data.students || availResp.data || []);
      } else {
        setAvailableStudents([]);
      }
      if (assignedResp?.success) {
        setAssignedStudents(assignedResp.data.students || assignedResp.data || []);
      } else {
        setAssignedStudents([]);
      }
      setShowStudentModal(true);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load students for this section');
    } finally {
      setLoading(false);
    }
  };

  const handleManageTeachers = async (section) => {
    setSelectedSection(section);
    try {
      setLoading(true);
      console.log('AdminSectionManagement: Fetching available teachers for section:', section.id);
      const [availResp, assignedResp] = await Promise.all([
        apiClient.getAvailableTeachersForSection(section.id),
        apiClient.getSectionTeachers(section.id).catch((e) => ({ success: false, data: [] })),
      ]);
      console.log('AdminSectionManagement: Available teachers response:', availResp);
      console.log('AdminSectionManagement: Assigned teachers response:', assignedResp);
      if (availResp?.success) {
        const teachers = availResp.data.teachers || availResp.data || [];
        setAvailableTeachers(teachers);
      } else {
        setAvailableTeachers([]);
      }
      if (assignedResp?.success) {
        const teachers = assignedResp.data.teachers || assignedResp.data || [];
        setAssignedTeachers(teachers);
      } else {
        setAssignedTeachers([]);
      }
      setShowTeacherModal(true);
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
      console.log('AdminSectionManagement: Assigning teacher:', selectedTeacher, 'to section:', selectedSection.id);
      const response = await apiClient.assignTeacherToSection(selectedSection.id, selectedTeacher);
      console.log('AdminSectionManagement: Teacher assignment response:', response);
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

  const handleCreateAndAssignTeacher = async () => {
    if (!newTeacher.first_name.trim() || !newTeacher.last_name.trim() || !newTeacher.email.trim()) {
      Alert.alert('Error', 'Please enter first name, last name, and email');
      return;
    }
    try {
      setLoading(true);
      console.log('AdminSectionManagement: Creating teacher:', newTeacher);
      // Create teacher in admin
      const createResp = await apiClient.createAdminTeacher({
        first_name: newTeacher.first_name.trim(),
        last_name: newTeacher.last_name.trim(),
        email: newTeacher.email.trim(),
        role: 'teacher',
        department_id: selectedDepartmentId,
        password: 'password123',
      });
      console.log('AdminSectionManagement: Teacher created response:', createResp);
      const teacherId = createResp?.data?.id || createResp?.data?.teacher?.id || createResp?.id;
      if (!teacherId) {
        Alert.alert('Error', 'Failed to create teacher (no ID returned)');
        return;
      }
      // Assign to section
      console.log('AdminSectionManagement: Assigning newly created teacher to section', selectedSection?.id);
      const assignResp = await apiClient.assignTeacherToSection(selectedSection.id, teacherId);
      if (assignResp?.success) {
        Alert.alert('Success', 'Teacher created and assigned successfully!');
        setCreatingTeacher(false);
        setNewTeacher({ first_name: '', last_name: '', email: '' });
        setShowTeacherModal(false);
        fetchSections();
      } else {
        Alert.alert('Error', assignResp?.message || 'Failed to assign the new teacher');
      }
    } catch (error) {
      console.error('Error creating/assigning teacher:', error);
      Alert.alert('Error', error?.message || 'Failed to create and assign teacher');
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

  const renderTeacherItem = ({ item }) => {
    console.log('AdminSectionManagement: Rendering teacher item:', item);
    const firstName = item.first_name || item.name?.split(' ')?.[0] || '';
    const lastName = item.last_name || (item.name?.split(' ')?.slice(1).join(' ') || '');
    return (
      <TouchableOpacity
        style={[
          styles.teacherItem,
          selectedTeacher === item.id && styles.teacherItemSelected,
        ]}
        onPress={() => {
          console.log('AdminSectionManagement: Teacher selected:', item.id);
          setSelectedTeacher(item.id);
        }}
      >
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>
            {firstName} {lastName}
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
  };

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
          <Text style={styles.headerTitle}>Department Management</Text>
          <Text style={styles.headerSubtitle}>
            Organize students and teachers by departments
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
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedDepartmentId || ''}
              onValueChange={(itemValue, itemIndex) => {
                if (itemValue && itemValue !== '') {
                  const selectedDept = departments.find(dept => dept.id === itemValue);
                  if (selectedDept) {
                    setSelectedDepartment(selectedDept.name);
                    setSelectedDepartmentId(selectedDept.id);
                  }
                } else {
                  setSelectedDepartment(null);
                  setSelectedDepartmentId(null);
                }
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select a department..." value="" />
              {departments.map((dept) => (
                <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Section Management */}
        {selectedDepartmentId && (
          <View style={styles.section}>
            {/* Year & Semester Filters */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <View style={[styles.dropdownContainer, { flex: 1 }]}>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={(val) => {
                    setSelectedYear(val);
                    setTimeout(fetchSections, 0);
                  }}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select Year (1-4)" value="" />
                  <Picker.Item label="1st Year" value="1" />
                  <Picker.Item label="2nd Year" value="2" />
                  <Picker.Item label="3rd Year" value="3" />
                  <Picker.Item label="4th Year" value="4" />
                </Picker>
              </View>
              <View style={[styles.dropdownContainer, { flex: 1 }]}>
                <Picker
                  selectedValue={selectedSemester}
                  onValueChange={(val) => {
                    setSelectedSemester(val);
                    setTimeout(fetchSections, 0);
                  }}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select Semester (1-8)" value="" />
                  <Picker.Item label="Sem 1" value="1" />
                  <Picker.Item label="Sem 2" value="2" />
                  <Picker.Item label="Sem 3" value="3" />
                  <Picker.Item label="Sem 4" value="4" />
                  <Picker.Item label="Sem 5" value="5" />
                  <Picker.Item label="Sem 6" value="6" />
                  <Picker.Item label="Sem 7" value="7" />
                  <Picker.Item label="Sem 8" value="8" />
                </Picker>
              </View>
            </View>
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

            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Assigned Students</Text>
            <FlatList
              data={assignedStudents}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item.id}
              style={styles.studentList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.emptyStateText}>None</Text>}
            />

            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Available Students</Text>
            <FlatList
              data={availableStudents}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item.id}
              style={styles.studentList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.emptyStateText}>No available students</Text>}
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
              {creatingTeacher ? 'Create a new teacher and assign to this section' : 'Select a teacher to assign to this section'}
            </Text>

            {/* Toggle create/select */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <TouchableOpacity
                style={[styles.createButton, { flex: 1, marginRight: 6, backgroundColor: creatingTeacher ? '#1a237e' : '#10b981' }]}
                onPress={() => setCreatingTeacher(!creatingTeacher)}
              >
                <Text style={styles.createButtonText}>
                  {creatingTeacher ? 'Use Existing' : 'Create New Teacher'}
                </Text>
              </TouchableOpacity>
            </View>

            {creatingTeacher ? (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={newTeacher.first_name}
                  onChangeText={(t) => setNewTeacher({ ...newTeacher, first_name: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={newTeacher.last_name}
                  onChangeText={(t) => setNewTeacher({ ...newTeacher, last_name: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={newTeacher.email}
                  onChangeText={(t) => setNewTeacher({ ...newTeacher, email: t })}
                />
              </View>
            ) : (
              <View>
                <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Assigned Teachers</Text>
                <FlatList
                  data={assignedTeachers}
                  renderItem={renderTeacherItem}
                  keyExtractor={(item) => item.id}
                  style={styles.teacherList}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={<Text style={styles.emptyStateText}>None</Text>}
                />
                <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Available Teachers</Text>
                <FlatList
                  data={availableTeachers}
                  renderItem={renderTeacherItem}
                  keyExtractor={(item) => item.id}
                  style={styles.teacherList}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No available teachers found</Text>
                      <Text style={styles.emptyStateSubtext}>
                        All teachers may already be assigned to sections
                      </Text>
                    </View>
                  }
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowTeacherModal(false);
                  setSelectedTeacher(null);
                  setCreatingTeacher(false);
                  setNewTeacher({ first_name: '', last_name: '', email: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={creatingTeacher ? handleCreateAndAssignTeacher : handleAssignTeacher}
                disabled={loading || (!creatingTeacher && !selectedTeacher) || (creatingTeacher && (!newTeacher.first_name || !newTeacher.last_name || !newTeacher.email))}
              >
                <Text style={styles.createButtonText}>
                  {loading ? (creatingTeacher ? 'Creating...' : 'Assigning...') : (creatingTeacher ? 'Create & Assign' : 'Assign Teacher')}
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
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    color: '#1a237e',
  },
  pickerItem: {
    fontSize: isIOS ? 16 : 14,
    color: '#1a237e',
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
