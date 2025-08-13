import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  PlatformCard,
  Title,
  Paragraph,
  PlatformButton,
  PlatformList,
  PlatformSearchbar,
  PlatformChip,
  PlatformModal,
  PlatformInput,
  PlatformIconButton,
  PlatformSnackbar,
  PlatformBadge,
  Text,
} from '../components/PlatformWrapper';

const CoursesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [courses, setCourses] = useState([
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Computer Science',
      instructor: 'Dr. Sarah Johnson',
      department: 'Computer Science',
      credits: 3,
      enrolled: 45,
      capacity: 50,
      schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
      room: 'Room 201',
      description: 'Fundamental concepts of computer science and programming.',
      isEnrolled: false,
    },
    {
      id: 2,
      code: 'MATH201',
      name: 'Calculus II',
      instructor: 'Prof. Michael Chen',
      department: 'Mathematics',
      credits: 4,
      enrolled: 38,
      capacity: 40,
      schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
      room: 'Room 105',
      description: 'Advanced calculus concepts and applications.',
      isEnrolled: true,
    },
    {
      id: 3,
      code: 'ENG101',
      name: 'English Composition',
      instructor: 'Dr. Emily Davis',
      department: 'English',
      credits: 3,
      enrolled: 42,
      capacity: 45,
      schedule: 'Mon, Wed, Fri 1:00 PM - 2:00 PM',
      room: 'Room 301',
      description: 'Writing and communication skills development.',
      isEnrolled: false,
    },
    {
      id: 4,
      code: 'PHYS101',
      name: 'Physics I',
      instructor: 'Prof. Robert Wilson',
      department: 'Physics',
      credits: 4,
      enrolled: 35,
      capacity: 40,
      schedule: 'Tue, Thu 9:00 AM - 10:30 AM',
      room: 'Lab 101',
      description: 'Introduction to classical mechanics and thermodynamics.',
      isEnrolled: false,
    },
    {
      id: 5,
      code: 'BUS201',
      name: 'Business Management',
      instructor: 'Dr. Lisa Thompson',
      department: 'Business',
      credits: 3,
      enrolled: 48,
      capacity: 50,
      schedule: 'Mon, Wed 3:00 PM - 4:30 PM',
      room: 'Room 401',
      description: 'Principles of business management and leadership.',
      isEnrolled: true,
    },
  ]);

  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    instructor: '',
    department: 'Computer Science',
    credits: '',
    capacity: '',
    schedule: '',
    room: '',
    description: '',
  });

  const departments = ['all', 'Computer Science', 'Mathematics', 'English', 'Physics', 'Business'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleEnroll = (courseId) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, isEnrolled: !course.isEnrolled, enrolled: course.isEnrolled ? course.enrolled - 1 : course.enrolled + 1 }
        : course
    ));
    setSnackbarMessage('Enrollment updated successfully!');
    setSnackbarVisible(true);
  };

  const handleAddCourse = () => {
    if (!newCourse.code || !newCourse.name || !newCourse.instructor) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarVisible(true);
      return;
    }

    const course = {
      id: Date.now(),
      ...newCourse,
      enrolled: 0,
      isEnrolled: false,
    };

    setCourses(prev => [...prev, course]);
    setNewCourse({
      code: '',
      name: '',
      instructor: '',
      department: 'Computer Science',
      credits: '',
      capacity: '',
      schedule: '',
      room: '',
      description: '',
    });
    setModalVisible(false);
    setSnackbarMessage('Course added successfully!');
    setSnackbarVisible(true);
  };

  const handleEditCourse = () => {
    if (!editingCourse.code || !editingCourse.name || !editingCourse.instructor) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarVisible(true);
      return;
    }

    setCourses(prev => prev.map(course => 
      course.id === editingCourse.id ? editingCourse : course
    ));
    setEditingCourse(null);
    setModalVisible(false);
    setSnackbarMessage('Course updated successfully!');
    setSnackbarVisible(true);
  };

  const handleDeleteCourse = (courseId) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    setSnackbarMessage('Course deleted successfully!');
    setSnackbarVisible(true);
  };

  const openEditModal = (course) => {
    setEditingCourse({ ...course });
    setModalVisible(true);
  };

  const getEnrollmentStatus = (course) => {
    if (course.isEnrolled) return { text: 'Enrolled', color: '#388e3c' };
    if (course.enrolled >= course.capacity) return { text: 'Full', color: '#d32f2f' };
    return { text: 'Available', color: '#1a237e' };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Title style={styles.headerTitle}>Course Management</Title>
          <Paragraph style={styles.headerSubtitle}>Browse and manage your courses</Paragraph>
        </View>
        <PlatformButton
          mode="contained"
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
          buttonColor="#1a237e"
          icon="plus"
        >
          Add Course
        </PlatformButton>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <PlatformSearchbar
            placeholder="Search courses..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#1a237e"
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {departments.map((dept) => (
              <PlatformChip
                key={dept}
                selected={selectedDepartment === dept}
                onPress={() => setSelectedDepartment(dept)}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
                selectedColor="#ffffff"
                showSelectedOverlay
              >
                {dept === 'all' ? 'All Departments' : dept}
              </PlatformChip>
            ))}
          </ScrollView>
        </View>

        {/* Courses List */}
        <View style={styles.coursesContainer}>
          {filteredCourses.map((course) => {
            const status = getEnrollmentStatus(course);
            return (
              <PlatformCard key={course.id} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <View style={styles.courseInfo}>
                    <Title style={styles.courseCode}>{course.code}</Title>
                    <Title style={styles.courseName}>{course.name}</Title>
                    <Paragraph style={styles.courseInstructor}>by {course.instructor}</Paragraph>
                  </View>
                  <View style={styles.courseActions}>
                    <PlatformBadge style={[styles.statusBadge, { backgroundColor: status.color }]}>
                      {status.text}
                    </PlatformBadge>
                    <PlatformIconButton
                      icon="dots-vertical"
                      onPress={() => {}}
                      iconColor="#1a237e"
                    />
                  </View>
                </View>

                <View style={styles.courseDetails}>
                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Department:</Paragraph>
                    <Paragraph style={styles.detailValue}>{course.department}</Paragraph>
                  </View>
                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Credits:</Paragraph>
                    <Paragraph style={styles.detailValue}>{course.credits}</Paragraph>
                  </View>
                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Schedule:</Paragraph>
                    <Paragraph style={styles.detailValue}>{course.schedule}</Paragraph>
                  </View>
                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Room:</Paragraph>
                    <Paragraph style={styles.detailValue}>{course.room}</Paragraph>
                  </View>
                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Enrollment:</Paragraph>
                    <Paragraph style={styles.detailValue}>
                      {course.enrolled}/{course.capacity} students
                    </Paragraph>
                  </View>
                </View>

                <View style={styles.courseActions}>
                  <PlatformButton
                    mode={course.isEnrolled ? "outlined" : "contained"}
                    onPress={() => handleEnroll(course.id)}
                    style={styles.enrollButton}
                    textColor={course.isEnrolled ? "#1a237e" : "#ffffff"}
                    buttonColor={course.isEnrolled ? "transparent" : "#1a237e"}
                    disabled={!course.isEnrolled && course.enrolled >= course.capacity}
                  >
                    {course.isEnrolled ? 'Drop Course' : 'Enroll'}
                  </PlatformButton>
                  
                  <View style={styles.actionButtons}>
                    <PlatformButton
                      mode="text"
                      onPress={() => openEditModal(course)}
                      textColor="#1a237e"
                      compact
                    >
                      Edit
                    </PlatformButton>
                    <PlatformButton
                      mode="text"
                      onPress={() => handleDeleteCourse(course.id)}
                      textColor="#d32f2f"
                      compact
                    >
                      Delete
                    </PlatformButton>
                  </View>
                </View>
              </PlatformCard>
            );
          })}
        </View>
      </ScrollView>

      {/* Add/Edit Course Modal */}
      <PlatformModal
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
          setEditingCourse(null);
        }}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.modalHeader}>
          <Title style={styles.modalTitle}>
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </Title>
          <PlatformIconButton
            icon="close"
            onPress={() => {
              setModalVisible(false);
              setEditingCourse(null);
            }}
            iconColor="#1a237e"
          />
        </View>

        <ScrollView style={styles.modalForm}>
          <PlatformInput
            label="Course Code"
            value={editingCourse ? editingCourse.code : newCourse.code}
            onChangeText={(value) => editingCourse 
              ? setEditingCourse({...editingCourse, code: value})
              : setNewCourse({...newCourse, code: value})
            }
            style={styles.modalInput}
            mode="outlined"
          />
          
          <PlatformInput
            label="Course Name"
            value={editingCourse ? editingCourse.name : newCourse.name}
            onChangeText={(value) => editingCourse 
              ? setEditingCourse({...editingCourse, name: value})
              : setNewCourse({...newCourse, name: value})
            }
            style={styles.modalInput}
            mode="outlined"
          />
          
          <PlatformInput
            label="Instructor"
            value={editingCourse ? editingCourse.instructor : newCourse.instructor}
            onChangeText={(value) => editingCourse 
              ? setEditingCourse({...editingCourse, instructor: value})
              : setNewCourse({...newCourse, instructor: value})
            }
            style={styles.modalInput}
            mode="outlined"
          />
          
          <PlatformInput
            label="Department"
            value={editingCourse ? editingCourse.department : newCourse.department}
            onChangeText={(value) => editingCourse 
              ? setEditingCourse({...editingCourse, department: value})
              : setNewCourse({...newCourse, department: value})
            }
            style={styles.modalInput}
            mode="outlined"
          />
          
          <PlatformInput
            label="Credits"
            value={editingCourse ? editingCourse.credits.toString() : newCourse.credits}
            onChangeText={(value) => editingCourse 
              ? setEditingCourse({...editingCourse, credits: value})
              : setNewCourse({...newCourse, credits: value})
            }
            keyboardType="numeric"
            style={styles.modalInput}
            mode="outlined"
          />
          
          <PlatformInput
            label="Capacity"
            value={editingCourse ? editingCourse.capacity.toString() : newCourse.capacity}
            onChangeText={(value) => editingCourse 
              ? setEditingCourse({...editingCourse, capacity: value})
              : setNewCourse({...newCourse, capacity: value})
            }
            keyboardType="numeric"
            style={styles.modalInput}
            mode="outlined"
          />
          
          <PlatformInput
            label="Schedule"
            value={editingCourse ? editingCourse.schedule : newCourse.schedule}
            onChangeText={(value) => editingCourse 
              ? setEditingCourse({...editingCourse, schedule: value})
              : setNewCourse({...newCourse, schedule: value})
            }
            style={styles.modalInput}
            mode="outlined"
          />
          
          <PlatformInput
            label="Room"
            value={editingCourse ? editingCourse.room : newCourse.room}
            onChangeText={(value) => editingCourse 
              ? setEditingCourse({...editingCourse, room: value})
              : setNewCourse({...newCourse, room: value})
            }
            style={styles.modalInput}
            mode="outlined"
          />
          
          <PlatformInput
            label="Description"
            value={editingCourse ? editingCourse.description : newCourse.description}
            onChangeText={(value) => editingCourse 
              ? setEditingCourse({...editingCourse, description: value})
              : setNewCourse({...newCourse, description: value})
            }
            multiline
            numberOfLines={3}
            style={styles.modalInput}
            mode="outlined"
          />
        </ScrollView>

        <View style={styles.modalActions}>
          <PlatformButton
            mode="outlined"
            onPress={() => {
              setModalVisible(false);
              setEditingCourse(null);
            }}
            style={styles.modalButton}
            textColor="#1a237e"
            buttonColor="transparent"
          >
            Cancel
          </PlatformButton>
          <PlatformButton
            mode="contained"
            onPress={editingCourse ? handleEditCourse : handleAddCourse}
            style={styles.modalButton}
            buttonColor="#1a237e"
          >
            {editingCourse ? 'Update' : 'Add Course'}
          </PlatformButton>
        </View>
      </PlatformModal>

      <PlatformSnackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </PlatformSnackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#546e7a',
    fontSize: 14,
  },
  addButton: {
    borderRadius: 8,
  },
  searchSection: {
    padding: 20,
    paddingBottom: 10,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#e8eaf6',
  },
  filterChipText: {
    color: '#1a237e',
  },
  coursesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  courseCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 4,
  },
  courseInstructor: {
    color: '#546e7a',
    fontSize: 14,
  },
  courseActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    marginBottom: 8,
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
    fontSize: 14,
  },
  detailValue: {
    color: '#546e7a',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  enrollButton: {
    marginBottom: 8,
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 0,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  modalForm: {
    padding: 20,
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e8eaf6',
  },
  modalButton: {
    marginLeft: 12,
    borderRadius: 8,
  },
  snackbar: {
    backgroundColor: '#1a237e',
  },
});

export default CoursesScreen; 