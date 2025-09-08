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

const AdminUserManagementScreen = ({ navigation, route }) => {
  const { type = 'students' } = route.params || {};
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: type === 'students' ? 'student' : type === 'teachers' ? 'teacher' : 'parent',
    // Optional password for creating base user accounts
    password: '',
    // Student-specific fields
    student_id: '',
    grade_level: '',
    academic_year: '',
  });

  // Parent-child linking UI state (only for parents tab)
  const [linkingParentId, setLinkingParentId] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCandidates, setStudentCandidates] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [linking, setLinking] = useState(false);

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    fetchUsers();
  }, [type, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const currentType = filter === 'all' ? type : filter;
      let response;
      // Prefer role-specific endpoints for better compatibility
      if (currentType === 'students') {
        response = await apiClient.getAdminStudents();
      } else if (currentType === 'teachers') {
        response = await apiClient.getAdminTeachers();
      } else if (currentType === 'parents') {
        response = await apiClient.getAdminParents();
      } else {
        response = await apiClient.getAdminUsers({ role: currentType });
      }
      if (response?.success) {
        const data = response.data || {};
        const list =
          data.users ||
          data.students ||
          data.parents ||
          data.teachers ||
          data.items ||
          data.results ||
          (Array.isArray(data) ? data : []) ||
          [];
        setUsers(Array.isArray(list) ? list : []);
      } else {
        // Use sample data when API fails
        setUsers(getSampleUsersForType(currentType));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use sample data when API fails
      const currentType = filter === 'all' ? type : filter;
      setUsers(getSampleUsersForType(currentType));
    } finally {
      setLoading(false);
    }
  };

  // Sample user data based on type
  const getSampleUsersForType = (userType) => {
    if (userType === 'students') {
      return [
        {
          id: 1,
          first_name: 'Alex',
          last_name: 'Johnson',
          email: 'alex.johnson@student.edu',
          phone: '+1 (555) 123-4567',
          student_id: 'STU001',
          grade_level: 'Sophomore',
          academic_year: '2024-2025'
        },
        {
          id: 2,
          first_name: 'Sarah',
          last_name: 'Williams',
          email: 'sarah.williams@student.edu',
          phone: '+1 (555) 234-5678',
          student_id: 'STU002',
          grade_level: 'Junior',
          academic_year: '2024-2025'
        },
        {
          id: 3,
          first_name: 'Michael',
          last_name: 'Brown',
          email: 'michael.brown@student.edu',
          phone: '+1 (555) 345-6789',
          student_id: 'STU003',
          grade_level: 'Freshman',
          academic_year: '2024-2025'
        },
        {
          id: 4,
          first_name: 'Emily',
          last_name: 'Davis',
          email: 'emily.davis@student.edu',
          phone: '+1 (555) 456-7890',
          student_id: 'STU004',
          grade_level: 'Senior',
          academic_year: '2024-2025'
        },
        {
          id: 5,
          first_name: 'David',
          last_name: 'Miller',
          email: 'david.miller@student.edu',
          phone: '+1 (555) 567-8901',
          student_id: 'STU005',
          grade_level: 'Sophomore',
          academic_year: '2024-2025'
        },
        {
          id: 6,
          first_name: 'Jessica',
          last_name: 'Wilson',
          email: 'jessica.wilson@student.edu',
          phone: '+1 (555) 678-9012',
          student_id: 'STU006',
          grade_level: 'Junior',
          academic_year: '2024-2025'
        }
      ];
    } else if (currentType === 'teachers') {
      return [
        {
          id: 1,
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@faculty.edu',
          phone: '+1 (555) 111-2222',
          department: 'Computer Science',
          specialization: 'Software Engineering'
        },
        {
          id: 2,
          first_name: 'Prof. Michael',
          last_name: 'Chen',
          email: 'michael.chen@faculty.edu',
          phone: '+1 (555) 222-3333',
          department: 'Mathematics',
          specialization: 'Applied Mathematics'
        },
        {
          id: 3,
          first_name: 'Dr. Emily',
          last_name: 'Rodriguez',
          email: 'emily.rodriguez@faculty.edu',
          phone: '+1 (555) 333-4444',
          department: 'English',
          specialization: 'Literature'
        },
        {
          id: 4,
          first_name: 'Dr. James',
          last_name: 'Wilson',
          email: 'james.wilson@faculty.edu',
          phone: '+1 (555) 444-5555',
          department: 'Physics',
          specialization: 'Quantum Physics'
        },
        {
          id: 5,
          first_name: 'Dr. Lisa',
          last_name: 'Anderson',
          email: 'lisa.anderson@faculty.edu',
          phone: '+1 (555) 555-6666',
          department: 'Chemistry',
          specialization: 'Organic Chemistry'
        },
        {
          id: 6,
          first_name: 'Prof. Robert',
          last_name: 'Taylor',
          email: 'robert.taylor@faculty.edu',
          phone: '+1 (555) 666-7777',
          department: 'History',
          specialization: 'World History'
        }
      ];
    } else if (currentType === 'parents') {
      return [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 777-8888',
          relationship: 'Father'
        },
        {
          id: 2,
          first_name: 'Mary',
          last_name: 'Johnson',
          email: 'mary.johnson@email.com',
          phone: '+1 (555) 888-9999',
          relationship: 'Mother'
        },
        {
          id: 3,
          first_name: 'Robert',
          last_name: 'Williams',
          email: 'robert.williams@email.com',
          phone: '+1 (555) 999-0000',
          relationship: 'Father'
        },
        {
          id: 4,
          first_name: 'Jennifer',
          last_name: 'Brown',
          email: 'jennifer.brown@email.com',
          phone: '+1 (555) 000-1111',
          relationship: 'Mother'
        },
        {
          id: 5,
          first_name: 'David',
          last_name: 'Davis',
          email: 'david.davis@email.com',
          phone: '+1 (555) 111-2222',
          relationship: 'Father'
        },
        {
          id: 6,
          first_name: 'Susan',
          last_name: 'Miller',
          email: 'susan.miller@email.com',
          phone: '+1 (555) 222-3333',
          relationship: 'Mother'
        }
      ];
    }
    
    return [];
  };

  // Search students to link to a parent
  const searchStudentsForLink = async () => {
    try {
      const query = studentSearch?.trim();
      const params = {};
      if (query) params.q = query;
      let resp;
      // Prefer dedicated students endpoint
      try {
        resp = await apiClient.getAdminStudents(params);
      } catch (e) {
        resp = await apiClient.getAdminUsers({ role: 'students', ...(query ? { q: query } : {}) });
      }
      if (resp?.success) {
        const data = resp.data || {};
        const list = data.students || data.users || data.items || (Array.isArray(data) ? data : []);
        setStudentCandidates(Array.isArray(list) ? list : []);
      } else {
        // Use sample student data for linking
        const sampleStudents = getSampleUsersForType('students').filter(user => 
          !query || 
          user.first_name.toLowerCase().includes(query.toLowerCase()) ||
          user.last_name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        );
        setStudentCandidates(sampleStudents);
      }
    } catch (e) {
      // Use sample student data for linking
      const sampleStudents = getSampleUsersForType('students').filter(user => 
        !query || 
        user.first_name.toLowerCase().includes(query.toLowerCase()) ||
        user.last_name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      setStudentCandidates(sampleStudents);
    }
  };

  const startLinkingForParent = (parentId) => {
    setLinkingParentId(parentId);
    setStudentSearch('');
    setStudentCandidates([]);
    setSelectedStudentId(null);
  };

  const cancelLinking = () => {
    setLinkingParentId(null);
    setStudentSearch('');
    setStudentCandidates([]);
    setSelectedStudentId(null);
  };

  const confirmLinkParentChild = async () => {
    if (!linkingParentId || !selectedStudentId) {
      Alert.alert('Error', 'Select a student to link.');
      return;
    }
    try {
      setLinking(true);
      const resp = await apiClient.linkParentToChild(linkingParentId, selectedStudentId);
      if (resp.success) {
        Alert.alert('Success', resp.message || 'Parent linked to child');
        cancelLinking();
        fetchUsers();
      } else {
        Alert.alert('Error', resp.message || 'Failed to link parent to child');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to link parent to child');
    } finally {
      setLinking(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      let response;
      if (type === 'students') {
        // Validate student-specific fields
        if (!newUser.student_id) {
          Alert.alert('Error', 'Please provide a Student ID');
          return;
        }
        // Step 1: create base user (role student), capture user_id
        const baseUserPayload = {
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          phone: newUser.phone,
          role: 'student',
          user_type: 'student',
          password: newUser.password || 'ChangeMe123!',
        };
        const baseUserResp = await apiClient.createAdminUser(baseUserPayload);
        if (!baseUserResp?.success) {
          Alert.alert('Error', baseUserResp?.message || 'Failed to create user account');
          return;
        }
        const baseData = baseUserResp.data || {};
        const createdUser = baseData.user || baseData.created || baseData.account || baseData;
        const userId = createdUser?.id;
        if (!userId) {
          Alert.alert('Error', 'User created but ID not found in response');
          return;
        }
        // Step 2: create student profile with user_id
        const studentPayload = {
          user_id: userId,
          student_id: newUser.student_id,
          grade_level: newUser.grade_level,
          academic_year: newUser.academic_year,
        };
        response = await apiClient.createAdminStudent(studentPayload);
      } else if (type === 'teachers') {
        response = await apiClient.createAdminTeacher(newUser);
      } else if (type === 'parents') {
        response = await apiClient.createAdminParent(newUser);
      } else {
        response = await apiClient.createAdminUser(newUser);
      }
      if (response?.success) {
        Alert.alert('Success', 'User created successfully!');
        setShowAddForm(false);
        setNewUser({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          role: newUser.role,
          password: '',
          student_id: '',
          grade_level: '',
          academic_year: '',
        });
        fetchUsers();
      } else {
        Alert.alert('Error', response.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', error.message || 'Failed to create user');
    }
  };

  const handleEditUser = (user) => {
    // Toggle inline edit form for this user
    setEditingUserId(editingUserId === user.id ? null : user.id);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      grade_level: user.grade_level || '',
      department: user.department || '',
      specialization: user.specialization || '',
      relationship: user.relationship || '',
    });
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.first_name} ${user.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.deleteAdminUser(user.id);
              if (response.success) {
                Alert.alert('Success', 'User deleted successfully!');
                fetchUsers();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete user');
              }
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', error.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  // Inline editing state
  const [editingUserId, setEditingUserId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({});

  const saveEditedUser = async () => {
    if (!editingUserId) return;
    try {
      setSavingEdit(true);
      const payload = { ...editForm };
      let resp;
      if (type === 'students') {
        resp = await apiClient.updateAdminStudent(editingUserId, payload);
      } else if (type === 'teachers') {
        resp = await apiClient.updateAdminTeacher(editingUserId, payload);
      } else if (type === 'parents') {
        resp = await apiClient.updateAdminParent(editingUserId, payload);
      } else {
        resp = await apiClient.updateAdminUser(editingUserId, payload);
      }
      if (resp?.success) {
        Alert.alert('Success', 'User updated successfully!');
        setEditingUserId(null);
        fetchUsers();
      } else {
        Alert.alert('Error', resp?.message || 'Failed to update user');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to update user');
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTitle = () => {
    switch (type) {
      case 'students': return 'Student Management';
      case 'teachers': return 'Teacher Management';
      case 'parents': return 'Parent Management';
      default: return 'User Management';
    }
  };

  const getRoleLabel = () => {
    switch (type) {
      case 'students': return 'Student';
      case 'teachers': return 'Teacher';
      case 'parents': return 'Parent';
      default: return 'User';
    }
  };

  const renderUserCard = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
        {type === 'students' && (
          <Text style={styles.userDetail}>ID: {item.student_id} • Grade: {item.grade_level}</Text>
        )}
        {type === 'teachers' && (
          <Text style={styles.userDetail}>Department: {item.department} • {item.specialization}</Text>
        )}
        {type === 'parents' && (
          <Text style={styles.userDetail}>Relationship: {item.relationship}</Text>
        )}
        {type === 'parents' && (
          <ParentChildrenBadges parentId={item.id} />
        )}
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditUser(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        {type === 'parents' && (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: '#10b981' }]}
            onPress={() => startLinkingForParent(item.id)}
          >
            <Text style={styles.editButtonText}>Link Child</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Inline edit form */}
      {editingUserId === item.id && (
        <View style={styles.editPanel}>
          <Text style={styles.formTitle}>Edit {getRoleLabel()}</Text>
          <TextInput style={styles.formInput} placeholder="First Name" value={editForm.first_name} onChangeText={(t) => setEditForm({ ...editForm, first_name: t })} />
          <TextInput style={styles.formInput} placeholder="Last Name" value={editForm.last_name} onChangeText={(t) => setEditForm({ ...editForm, last_name: t })} />
          <TextInput style={styles.formInput} placeholder="Email" value={editForm.email} onChangeText={(t) => setEditForm({ ...editForm, email: t })} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.formInput} placeholder="Phone" value={editForm.phone} onChangeText={(t) => setEditForm({ ...editForm, phone: t })} keyboardType="phone-pad" />
          {type === 'students' && (
            <TextInput style={styles.formInput} placeholder="Grade Level" value={editForm.grade_level} onChangeText={(t) => setEditForm({ ...editForm, grade_level: t })} />
          )}
          {type === 'teachers' && (
            <>
              <TextInput style={styles.formInput} placeholder="Department" value={editForm.department} onChangeText={(t) => setEditForm({ ...editForm, department: t })} />
              <TextInput style={styles.formInput} placeholder="Specialization" value={editForm.specialization} onChangeText={(t) => setEditForm({ ...editForm, specialization: t })} />
            </>
          )}
          {type === 'parents' && (
            <TextInput style={styles.formInput} placeholder="Relationship" value={editForm.relationship} onChangeText={(t) => setEditForm({ ...editForm, relationship: t })} />
          )}
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingUserId(null)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { opacity: savingEdit ? 0.7 : 1 }]} onPress={saveEditedUser} disabled={savingEdit}>
              <Text style={styles.saveButtonText}>{savingEdit ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {type === 'parents' && linkingParentId === item.id && (
        <View style={styles.linkPanel}>
          <Text style={styles.linkTitle}>Link Child to {item.first_name} {item.last_name}</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Search students by name or email"
            value={studentSearch}
            onChangeText={setStudentSearch}
            onSubmitEditing={searchStudentsForLink}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <TouchableOpacity style={[styles.saveButton, { flex: 1, marginRight: 6 }]} onPress={searchStudentsForLink}>
              <Text style={styles.saveButtonText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelButton, { flex: 1, marginLeft: 6 }]} onPress={cancelLinking}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={studentCandidates}
            keyExtractor={(s) => s.id.toString()}
            renderItem={({ item: s }) => (
              <TouchableOpacity
                style={[styles.candidateRow, selectedStudentId === s.id && styles.candidateRowSelected]}
                onPress={() => setSelectedStudentId(selectedStudentId === s.id ? null : s.id)}
              >
                <Text style={styles.candidateName}>{s.first_name} {s.last_name}</Text>
                <Text style={styles.candidateMeta}>ID: {s.student_id} • {s.email}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyStateText}>No students found. Try searching.</Text>}
            style={{ maxHeight: 220, marginBottom: 10 }}
          />
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#10b981', opacity: linking ? 0.7 : 1 }]}
            onPress={confirmLinkParentChild}
            disabled={linking}
          >
            <Text style={styles.saveButtonText}>{linking ? 'Linking...' : selectedStudentId ? 'Link Selected Student' : 'Select a Student'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Small subcomponent to show linked children badges (lazy fetch per parent)
  const ParentChildrenBadges = ({ parentId }) => {
    const [loaded, setLoaded] = useState(false);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [children, setChildren] = useState([]);

    const loadChildren = async () => {
      try {
        setLoadingChildren(true);
        const resp = await apiClient.getAdminParentChildren(parentId);
        if (resp?.success) {
          const data = resp.data || {};
          const list = data.children || data.students || data.items || (Array.isArray(data) ? data : []);
          setChildren(Array.isArray(list) ? list : []);
          setLoaded(true);
        } else {
          setChildren([]);
          setLoaded(true);
        }
      } catch (e) {
        setChildren([]);
        setLoaded(true);
      } finally {
        setLoadingChildren(false);
      }
    };

    useEffect(() => {
      // Lazy-load once component mounts for this parent card
      loadChildren();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!loaded) {
      return <Text style={styles.userDetail}>{loadingChildren ? 'Loading children…' : ''}</Text>;
    }
    if (children.length === 0) {
      return <Text style={styles.userDetail}>No linked children</Text>;
    }
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {children.map((c) => (
          <View key={c.id} style={{ backgroundColor: '#e3f2fd', borderColor: '#90caf9', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginRight: 6, marginBottom: 6 }}>
            <Text style={{ color: '#1a237e', fontSize: 12, fontWeight: '600' }}>{(c.first_name || c.firstName) + ' ' + (c.last_name || c.lastName || '')}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading users...</Text>
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
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <Text style={styles.headerSubtitle}>Manage {getRoleLabel().toLowerCase()} accounts</Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${getRoleLabel().toLowerCase()}s...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add {getRoleLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* Add User Form */}
      {showAddForm && (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Add New {getRoleLabel()}</Text>
          
          <TextInput
            style={styles.formInput}
            placeholder="First Name"
            value={newUser.first_name}
            onChangeText={(text) => setNewUser({...newUser, first_name: text})}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Last Name"
            value={newUser.last_name}
            onChangeText={(text) => setNewUser({...newUser, last_name: text})}
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Email"
            value={newUser.email}
            onChangeText={(text) => setNewUser({...newUser, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.formInput}
            placeholder="Phone"
            value={newUser.phone}
            onChangeText={(text) => setNewUser({...newUser, phone: text})}
            keyboardType="phone-pad"
          />

          {/* Optional password for base account */}
          <TextInput
            style={styles.formInput}
            placeholder="Password (optional)"
            value={newUser.password}
            onChangeText={(text) => setNewUser({ ...newUser, password: text })}
            secureTextEntry
          />

          {/* Student-specific fields */}
          {type === 'students' && (
            <>
              <TextInput
                style={styles.formInput}
                placeholder="Student ID (required)"
                value={newUser.student_id}
                onChangeText={(text) => setNewUser({ ...newUser, student_id: text })}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Grade Level"
                value={newUser.grade_level}
                onChangeText={(text) => setNewUser({ ...newUser, grade_level: text })}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Academic Year (e.g., 2025-2026)"
                value={newUser.academic_year}
                onChangeText={(text) => setNewUser({ ...newUser, academic_year: text })}
              />
            </>
          )}

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddUser}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.usersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No {getRoleLabel().toLowerCase()}s found</Text>
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
    paddingHorizontal: 20,
  },
  headerSubtitle: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#e3f2fd',
    paddingHorizontal: 20,
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
  usersList: {
    flex: 1,
    paddingHorizontal: isIOS ? 20 : 16,
  },
  userCard: {
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
  userInfo: {
    marginBottom: isIOS ? 16 : 12,
  },
  userName: {
    fontSize: isIOS ? 18 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: isIOS ? 14 : 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  userDetail: {
    fontSize: isIOS ? 12 : 10,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    borderRadius: isIOS ? 8 : 6,
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 8 : 6,
    marginRight: isIOS ? 8 : 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: isIOS ? 14 : 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: isIOS ? 8 : 6,
    paddingHorizontal: isIOS ? 16 : 12,
    paddingVertical: isIOS ? 8 : 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: isIOS ? 14 : 12,
    fontWeight: 'bold',
  },
  editPanel: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: isIOS ? 12 : 10,
    paddingTop: isIOS ? 12 : 10,
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

export default AdminUserManagementScreen;
