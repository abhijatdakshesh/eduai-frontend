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
  Animated,
  Modal,
  StatusBar,
} from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';
import { theme } from '../config/theme';

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

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
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
        // Use sample data when API fails
        setCourses(getSampleCourses());
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Use sample data when API fails
      setCourses(getSampleCourses());
    } finally {
      setLoading(false);
    }
  };

  // Sample course data
  const getSampleCourses = () => [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Computer Science',
      department: 'Computer Science',
      credits: 3,
      description: 'Fundamental concepts of computer science including programming, algorithms, and data structures.',
      instructor: { name: 'Dr. Sarah Johnson' },
      enrolled: 28,
      capacity: 30,
      schedule: [
        { day: 'Monday', time: '10:00 AM - 11:30 AM' },
        { day: 'Wednesday', time: '10:00 AM - 11:30 AM' },
        { day: 'Friday', time: '10:00 AM - 11:30 AM' }
      ]
    },
    {
      id: 2,
      code: 'MATH201',
      name: 'Calculus II',
      department: 'Mathematics',
      credits: 4,
      description: 'Advanced calculus topics including integration techniques, sequences, and series.',
      instructor: { name: 'Prof. Michael Chen' },
      enrolled: 24,
      capacity: 25,
      schedule: [
        { day: 'Tuesday', time: '2:00 PM - 3:30 PM' },
        { day: 'Thursday', time: '2:00 PM - 3:30 PM' }
      ]
    },
    {
      id: 3,
      code: 'ENG101',
      name: 'English Composition',
      department: 'English',
      credits: 3,
      description: 'Development of writing skills through various forms of composition and critical thinking.',
      instructor: { name: 'Dr. Emily Rodriguez' },
      enrolled: 22,
      capacity: 25,
      schedule: [
        { day: 'Monday', time: '1:00 PM - 2:30 PM' },
        { day: 'Wednesday', time: '1:00 PM - 2:30 PM' }
      ]
    },
    {
      id: 4,
      code: 'PHYS101',
      name: 'General Physics I',
      department: 'Physics',
      credits: 4,
      description: 'Mechanics, thermodynamics, and wave motion with laboratory component.',
      instructor: { name: 'Dr. James Wilson' },
      enrolled: 18,
      capacity: 20,
      schedule: [
        { day: 'Tuesday', time: '9:00 AM - 10:30 AM' },
        { day: 'Thursday', time: '9:00 AM - 10:30 AM' },
        { day: 'Friday', time: '2:00 PM - 4:00 PM' }
      ]
    },
    {
      id: 5,
      code: 'CHEM101',
      name: 'General Chemistry',
      department: 'Chemistry',
      credits: 4,
      description: 'Atomic structure, chemical bonding, and stoichiometry with laboratory work.',
      instructor: { name: 'Dr. Lisa Anderson' },
      enrolled: 26,
      capacity: 30,
      schedule: [
        { day: 'Monday', time: '11:00 AM - 12:30 PM' },
        { day: 'Wednesday', time: '11:00 AM - 12:30 PM' },
        { day: 'Friday', time: '11:00 AM - 1:00 PM' }
      ]
    },
    {
      id: 6,
      code: 'HIST101',
      name: 'World History',
      department: 'History',
      credits: 3,
      description: 'Survey of world civilizations from ancient times to the present.',
      instructor: { name: 'Prof. Robert Taylor' },
      enrolled: 20,
      capacity: 25,
      schedule: [
        { day: 'Tuesday', time: '3:00 PM - 4:30 PM' },
        { day: 'Thursday', time: '3:00 PM - 4:30 PM' }
      ]
    },
    {
      id: 7,
      code: 'CS201',
      name: 'Data Structures and Algorithms',
      department: 'Computer Science',
      credits: 3,
      description: 'Advanced programming concepts including linked lists, trees, and sorting algorithms.',
      instructor: { name: 'Dr. Sarah Johnson' },
      enrolled: 15,
      capacity: 20,
      schedule: [
        { day: 'Monday', time: '2:00 PM - 3:30 PM' },
        { day: 'Wednesday', time: '2:00 PM - 3:30 PM' }
      ]
    },
    {
      id: 8,
      code: 'BIO101',
      name: 'General Biology',
      department: 'Biology',
      credits: 4,
      description: 'Cell biology, genetics, and evolution with laboratory component.',
      instructor: { name: 'Dr. Maria Garcia' },
      enrolled: 29,
      capacity: 30,
      schedule: [
        { day: 'Tuesday', time: '10:00 AM - 11:30 AM' },
        { day: 'Thursday', time: '10:00 AM - 11:30 AM' },
        { day: 'Friday', time: '10:00 AM - 12:00 PM' }
      ]
    }
  ];

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.getCourseDepartments();
      if (response.success) {
        setDepartments(['all', ...response.data.departments]);
      } else {
        // Use sample departments when API fails
        setDepartments(['all', 'Computer Science', 'Mathematics', 'English', 'Physics', 'Chemistry', 'History', 'Biology']);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Use sample departments when API fails
      setDepartments(['all', 'Computer Science', 'Mathematics', 'English', 'Physics', 'Chemistry', 'History', 'Biology']);
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

  // Calculate statistics
  const getCourseStats = () => {
    const totalCourses = courses.length;
    const totalEnrolled = courses.reduce((sum, course) => sum + (course.enrolled || 0), 0);
    const totalCapacity = courses.reduce((sum, course) => sum + (course.capacity || 0), 0);
    const avgEnrollment = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
    
    return { totalCourses, totalEnrolled, totalCapacity, avgEnrollment };
  };

  const stats = getCourseStats();

  const renderCourseCard = ({ item, index }) => {
    const enrollmentPercentage = item.capacity > 0 ? (item.enrolled / item.capacity) * 100 : 0;
    
    return (
      <Animated.View 
        style={[
          styles.courseCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <View style={styles.courseCardHeader}>
          <View style={styles.courseCodeContainer}>
            <Text style={styles.courseCode}>{item.code}</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: enrollmentPercentage >= 80 ? '#ef4444' : 
                              enrollmentPercentage >= 60 ? '#f59e0b' : '#10b981' 
            }]}>
              <Text style={styles.statusText}>
                {enrollmentPercentage >= 80 ? 'Full' : 
                 enrollmentPercentage >= 60 ? 'Almost Full' : 'Available'}
              </Text>
            </View>
          </View>
          <Text style={styles.courseName}>{item.name}</Text>
        </View>

        <View style={styles.courseDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department</Text>
            <Text style={styles.detailValue}>{item.department}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Credits</Text>
            <Text style={styles.detailValue}>{item.credits}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Instructor</Text>
            <Text style={styles.detailValue}>{item.instructor.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Enrollment</Text>
            <View style={styles.enrollmentContainer}>
              <Text style={styles.detailValue}>{item.enrolled}/{item.capacity}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${enrollmentPercentage}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {item.schedule && item.schedule.length > 0 && (
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>Schedule</Text>
            <View style={styles.scheduleGrid}>
              {item.schedule.slice(0, 2).map((slot, index) => (
                <View key={index} style={styles.scheduleItem}>
                  <Text style={styles.scheduleDay}>{slot.day}</Text>
                  <Text style={styles.scheduleTime}>{slot.time}</Text>
                </View>
              ))}
              {item.schedule.length > 2 && (
                <View style={styles.scheduleItem}>
                  <Text style={styles.scheduleMore}>+{item.schedule.length - 2} more</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {item.description && (
          <Text style={styles.courseDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.courseActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => handleViewEnrollments(item)}
          >
            <Text style={styles.actionButtonText}>👥 Enrollments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => handleEditCourse(item)}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() => handleDeleteCourse(item)}
          >
            <Text style={styles.actionButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Modern Header with Gradient */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButtonHeader}
            onPress={() => setShowAddForm(true)}
          >
            <Text style={styles.addButtonHeaderText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Course Management</Text>
          <Text style={styles.headerSubtitle}>Manage academic courses and enrollments</Text>
        </View>
      </Animated.View>

      {/* Statistics Dashboard */}
      <Animated.View style={[styles.statsContainer, { 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }]}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalCourses}</Text>
          <Text style={styles.statLabel}>Total Courses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalEnrolled}</Text>
          <Text style={styles.statLabel}>Enrolled Students</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.avgEnrollment}%</Text>
          <Text style={styles.statLabel}>Avg. Enrollment</Text>
        </View>
      </Animated.View>

      {/* Modern Filter Chips */}
      <Animated.View style={[styles.filterSection, { 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {departments.map((department) => (
            <TouchableOpacity
              key={department}
              style={[
                styles.filterChip,
                selectedDepartment === department && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedDepartment(department)}
            >
              <Text style={[
                styles.filterChipText,
                selectedDepartment === department && styles.filterChipTextSelected,
              ]}>
                {department === 'all' ? '🏫 All' : `📚 ${department}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Modern Search Bar */}
      <Animated.View style={[styles.searchSection, { 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }]}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses, instructors, or codes..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Modern Modal for Add Course Form */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Course</Text>
            <View style={styles.modalSpacer} />
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Course Code *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., CS101"
                value={newCourse.code}
                onChangeText={(text) => setNewCourse({...newCourse, code: text})}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Course Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Introduction to Computer Science"
                value={newCourse.name}
                onChangeText={(text) => setNewCourse({...newCourse, name: text})}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Department *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Computer Science"
                value={newCourse.department}
                onChangeText={(text) => setNewCourse({...newCourse, department: text})}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Credits *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="3"
                  value={newCourse.credits}
                  onChangeText={(text) => setNewCourse({...newCourse, credits: text})}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Capacity</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="30"
                  value={newCourse.capacity}
                  onChangeText={(text) => setNewCourse({...newCourse, capacity: text})}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Course Description</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Brief description of the course content and objectives..."
                value={newCourse.description}
                onChangeText={(text) => setNewCourse({...newCourse, description: text})}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddCourse}
            >
              <Text style={styles.modalSaveText}>Create Course</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modern Courses List */}
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.coursesList}
        contentContainerStyle={styles.coursesListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <Text style={styles.emptyStateIcon}>📚</Text>
            <Text style={styles.emptyStateTitle}>No courses found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery ? 'Try adjusting your search terms' : 'Add your first course to get started'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowAddForm(true)}
              >
                <Text style={styles.emptyStateButtonText}>+ Add Course</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    borderTopColor: 'transparent',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: theme.fonts.titleMedium.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
  },

  // Header Styles
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...theme.shadows.large,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  addButtonHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonHeaderText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: theme.fonts.headlineMedium.fontSize,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: theme.fonts.bodyLarge.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Statistics Styles
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginTop: -12,
    marginHorizontal: 16,
    borderRadius: 16,
    ...theme.shadows.medium,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fonts.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Filter Styles
  filterSection: {
    backgroundColor: 'white',
    paddingVertical: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
  },
  filterContent: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fonts.labelMedium.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: 'white',
  },

  // Search Styles
  searchSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchContainer: {
    flexDirection: 'row',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: theme.colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fonts.bodyMedium.fontSize,
    color: theme.colors.text,
    padding: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: theme.fonts.titleLarge.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  formLabel: {
    fontSize: theme.fonts.labelLarge.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: theme.fonts.bodyMedium.fontSize,
    backgroundColor: '#f9fafb',
    color: theme.colors.text,
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: theme.fonts.titleMedium.fontSize,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalSaveText: {
    fontSize: theme.fonts.titleMedium.fontSize,
    fontWeight: '600',
    color: 'white',
  },

  // Course List Styles
  coursesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  coursesListContent: {
    paddingBottom: 20,
  },

  // Course Card Styles
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  courseCardHeader: {
    marginBottom: 16,
  },
  courseCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseCode: {
    fontSize: theme.fonts.labelLarge.fontSize,
    fontWeight: '600',
    color: theme.colors.primary,
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: theme.fonts.labelSmall.fontSize,
    fontWeight: '600',
    color: 'white',
  },
  courseName: {
    fontSize: theme.fonts.titleMedium.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    lineHeight: 24,
  },
  courseDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: theme.fonts.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: theme.fonts.bodySmall.fontSize,
    color: theme.colors.text,
    fontWeight: '600',
  },
  enrollmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginLeft: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  scheduleContainer: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  scheduleTitle: {
    fontSize: theme.fonts.labelLarge.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scheduleItem: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  scheduleDay: {
    fontSize: theme.fonts.labelSmall.fontSize,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  scheduleTime: {
    fontSize: theme.fonts.labelSmall.fontSize,
    color: theme.colors.textSecondary,
  },
  scheduleMore: {
    fontSize: theme.fonts.labelSmall.fontSize,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  courseDescription: {
    fontSize: theme.fonts.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  courseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: theme.fonts.labelMedium.fontSize,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    color: theme.colors.text,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: theme.fonts.titleLarge.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    fontSize: theme.fonts.titleMedium.fontSize,
    fontWeight: '600',
    color: 'white',
  },
});

export default AdminCourseManagementScreen;
