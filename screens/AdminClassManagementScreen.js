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

const AdminClassManagementScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    grade_level: '',
    academic_year: '2024',
    teacher_id: '',
    room_id: '',
    capacity: '',
  });

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminClasses();
      if (response.success) {
        setClasses(response.data.classes || []);
      } else {
        setClasses([]);
        Alert.alert('Error', response.message || 'Failed to load classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
      Alert.alert('Error', error.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await apiClient.getAdminUsers({ role: 'teachers' });
      if (response.success) {
        setTeachers(response.data.users || []);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    }
  };

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.grade_level || !newClass.teacher_id) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await apiClient.createAdminClass(newClass);
      if (response.success) {
        Alert.alert('Success', 'Class created successfully!');
        setShowAddForm(false);
        setNewClass({
          name: '',
          grade_level: '',
          academic_year: '2024',
          teacher_id: '',
          room_id: '',
          capacity: '',
        });
        fetchClasses();
      } else {
        Alert.alert('Error', response.message || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      Alert.alert('Error', error.message || 'Failed to create class');
    }
  };

  const handleViewStudents = (classItem) => {
    navigation.navigate('AdminClassStudents', { classId: classItem.id });
  };

  const handleEditClass = (classItem) => {
    Alert.alert('Edit Class', 'Edit functionality will be implemented soon!');
  };

  const handleDeleteClass = (classItem) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete ${classItem.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.deleteAdminClass(classItem.id);
              if (response.success) {
                Alert.alert('Success', 'Class deleted successfully!');
                fetchClasses();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete class');
              }
            } catch (error) {
              console.error('Error deleting class:', error);
              Alert.alert('Error', error.message || 'Failed to delete class');
            }
          },
        },
      ]
    );
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.grade_level.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderClassCard = ({ item }) => (
    <View style={styles.classCard}>
      <View style={styles.classInfo}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={styles.classDetail}>Grade Level: {item.grade_level}</Text>
        <Text style={styles.classDetail}>Teacher: {item.teacher.name}</Text>
        <Text style={styles.classDetail}>Room: {item.room_id}</Text>
        <Text style={styles.classDetail}>
          Students: {item.enrolled_students}/{item.capacity}
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
      </View>

      <View style={styles.classActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewStudents(item)}
        >
          <Text style={styles.actionButtonText}>View Students</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditClass(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteClass(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading classes...</Text>
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
          <Text style={styles.headerTitle}>Class Management</Text>
          <Text style={styles.headerSubtitle}>Manage academic classes</Text>
        </View>
      </View>

      {/* Search and Add */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search classes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add Class</Text>
        </TouchableOpacity>
      </View>

      {/* Add Class Form */}
      {showAddForm && (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Add New Class</Text>
          
          <TextInput
            style={styles.formInput}
            placeholder="Class Name"
            value={newClass.name}
            onChangeText={(text) => setNewClass({...newClass, name: text})}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Grade Level"
            value={newClass.grade_level}
            onChangeText={(text) => setNewClass({...newClass, grade_level: text})}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Room ID"
            value={newClass.room_id}
            onChangeText={(text) => setNewClass({...newClass, room_id: text})}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Capacity"
            value={newClass.capacity}
            onChangeText={(text) => setNewClass({...newClass, capacity: text})}
            keyboardType="numeric"
          />

          {/* Teacher Selection */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Select Teacher:</Text>
            <ScrollView style={styles.teacherList}>
              {teachers.map((teacher) => (
                <TouchableOpacity
                  key={teacher.id}
                  style={[
                    styles.teacherOption,
                    newClass.teacher_id === teacher.id && styles.teacherOptionSelected,
                  ]}
                  onPress={() => setNewClass({...newClass, teacher_id: teacher.id})}
                >
                  <Text style={[
                    styles.teacherOptionText,
                    newClass.teacher_id === teacher.id && styles.teacherOptionTextSelected,
                  ]}>
                    {teacher.first_name} {teacher.last_name} - {teacher.department}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddClass}
            >
              <Text style={styles.saveButtonText}>Create Class</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Classes List */}
      <FlatList
        data={filteredClasses}
        renderItem={renderClassCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.classesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No classes found</Text>
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
  pickerContainer: {
    marginBottom: isIOS ? 16 : 12,
  },
  pickerLabel: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  teacherList: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: isIOS ? 12 : 8,
  },
  teacherOption: {
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  teacherOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  teacherOptionText: {
    fontSize: isIOS ? 14 : 12,
    color: '#374151',
  },
  teacherOptionTextSelected: {
    color: '#1a237e',
    fontWeight: '600',
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
  classesList: {
    flex: 1,
    paddingHorizontal: isIOS ? 20 : 16,
  },
  classCard: {
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
  classInfo: {
    marginBottom: isIOS ? 16 : 12,
  },
  className: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  classDetail: {
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
  classActions: {
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

export default AdminClassManagementScreen;
