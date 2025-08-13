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

const AdminCourseManagementScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    department: '',
    credits: '',
    description: '',
    instructor_id: '',
    capacity: '',
  });

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, [selectedDepartment]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminCourses({
        department: selectedDepartment === 'all' ? undefined : selectedDepartment,
      });
      if (response.success) {
        setCourses(response.data.courses || []);
      } else {
        setCourses([]);
        Alert.alert('Error', response.message || 'Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      Alert.alert('Error', error.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.getCourseDepartments();
      if (response.success) {
        setDepartments(['all', ...response.data.departments]);
      } else {
        setDepartments(['all']);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments(['all']);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.code || !newCourse.name || !newCourse.department || !newCourse.credits) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await apiClient.createAdminCourse(newCourse);
      if (response.success) {
        Alert.alert('Success', 'Course created successfully!');
        setShowAddForm(false);
        setNewCourse({
          code: '',
          name: '',
          department: '',
          credits: '',
          description: '',
          instructor_id: '',
          capacity: '',
        });
        fetchCourses();
      } else {
        Alert.alert('Error', response.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      Alert.alert('Error', error.message || 'Failed to create course');
    }
  };

  const handleViewEnrollments = (course) => {
    navigation.navigate('AdminCourseEnrollments', { courseId: course.id });
  };

  const handleEditCourse = (course) => {
    Alert.alert('Edit Course', 'Edit functionality will be implemented soon!');
  };

  const handleDeleteCourse = (course) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete ${course.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.deleteAdminCourse(course.id);
              if (response.success) {
                Alert.alert('Success', 'Course deleted successfully!');
                fetchCourses();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete course');
              }
            } catch (error) {
              console.error('Error deleting course:', error);
              Alert.alert('Error', error.message || 'Failed to delete course');
            }
          },
        },
      ]
    );
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderCourseCard = ({ item }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseInfo}>
        <Text style={styles.courseCode}>{item.code}</Text>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseDetail}>Department: {item.department}</Text>
        <Text style={styles.courseDetail}>Credits: {item.credits}</Text>
        <Text style={styles.courseDetail}>Instructor: {item.instructor.name}</Text>
        <Text style={styles.courseDetail}>
          Enrollment: {item.enrolled}/{item.capacity}
        </Text>
        
        {/* Schedule */}
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Schedule:</Text>
          {item.schedule.map((slot, index) => (
            <Text key={index} style={styles.scheduleText}>
              {slot.day}: {slot.time}
            </Text>
          ))}
        </View>

        <Text style={styles.courseDescription}>{item.description}</Text>
      </View>

      <View style={styles.courseActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewEnrollments(item)}
        >
          <Text style={styles.actionButtonText}>View Enrollments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditCourse(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCourse(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Course Management</Text>
          <Text style={styles.headerSubtitle}>Manage academic courses</Text>
        </View>
      </View>

      {/* Department Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {departments.map((department) => (
          <TouchableOpacity
            key={department}
            style={[
              styles.filterButton,
              selectedDepartment === department && styles.filterButtonSelected,
            ]}
            onPress={() => setSelectedDepartment(department)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedDepartment === department && styles.filterButtonTextSelected,
            ]}>
              {department === 'all' ? 'All Departments' : department}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search and Add */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add Course</Text>
        </TouchableOpacity>
      </View>

      {/* Add Course Form */}
      {showAddForm && (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Add New Course</Text>
          
          <TextInput
            style={styles.formInput}
            placeholder="Course Code"
            value={newCourse.code}
            onChangeText={(text) => setNewCourse({...newCourse, code: text})}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Course Name"
            value={newCourse.name}
            onChangeText={(text) => setNewCourse({...newCourse, name: text})}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Department"
            value={newCourse.department}
            onChangeText={(text) => setNewCourse({...newCourse, department: text})}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Credits"
            value={newCourse.credits}
            onChangeText={(text) => setNewCourse({...newCourse, credits: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Capacity"
            value={newCourse.capacity}
            onChangeText={(text) => setNewCourse({...newCourse, capacity: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.formInput, styles.descriptionInput]}
            placeholder="Course Description"
            value={newCourse.description}
            onChangeText={(text) => setNewCourse({...newCourse, description: text})}
            multiline
            numberOfLines={4}
          />

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddCourse}
            >
              <Text style={styles.saveButtonText}>Create Course</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Courses List */}
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.coursesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No courses found</Text>
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
    backgroundColor: '#1a237e',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: Platform.OS === 'ios' ? 28 : 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#e3f2fd',
    opacity: 0.9,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 12 : 10,
  },
  filterButton: {
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 8 : 6,
    borderRadius: isIOS ? 20 : 16,
    backgroundColor: '#f3f4f6',
    marginRight: isIOS ? 8 : 6,
  },
  filterButtonSelected: {
    backgroundColor: '#1a237e',
  },
  filterButtonText: {
    fontSize: isIOS ? 14 : 12,
    color: '#374151',
  },
  filterButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
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
    padding: isIOS ? 20 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  formTitle: {
    fontSize: isIOS ? 18 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: isIOS ? 16 : 12,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: isIOS ? 12 : 8,
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 12 : 10,
    fontSize: isIOS ? 16 : 14,
    backgroundColor: '#f9fafb',
    marginBottom: isIOS ? 12 : 10,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: isIOS ? 16 : 12,
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
  saveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: isIOS ? 12 : 8,
    paddingVertical: isIOS ? 12 : 10,
    alignItems: 'center',
    marginLeft: isIOS ? 8 : 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: isIOS ? 16 : 14,
    fontWeight: 'bold',
  },
  coursesList: {
    flex: 1,
    paddingHorizontal: isIOS ? 20 : 16,
  },
  courseCard: {
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
  courseInfo: {
    marginBottom: isIOS ? 16 : 12,
  },
  courseCode: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 4,
  },
  courseName: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  courseDetail: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  scheduleContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  scheduleTitle: {
    fontSize: isIOS ? 14 : 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: isIOS ? 12 : 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  courseDescription: {
    fontSize: isIOS ? 14 : 12,
    color: '#4b5563',
    marginTop: 8,
    fontStyle: 'italic',
  },
  courseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: isIOS ? 12 : 10,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: isIOS ? 8 : 6,
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 8 : 6,
    marginLeft: isIOS ? 8 : 6,
  },
  editButton: {
    backgroundColor: '#f59e0b',
  },
  deleteButton: {
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
  },
});

export default AdminCourseManagementScreen;
