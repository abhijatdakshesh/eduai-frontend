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
  });

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    fetchUsers();
  }, [type, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminUsers({ role: filter === 'all' ? type : filter });
      if (response.success) {
        setUsers(response.data.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await apiClient.createAdminUser(newUser);
      if (response.success) {
        Alert.alert('Success', 'User created successfully!');
        setShowAddForm(false);
        setNewUser({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          role: newUser.role,
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
    Alert.alert('Edit User', 'Edit functionality will be implemented soon!');
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
      </View>
    </View>
  );

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
