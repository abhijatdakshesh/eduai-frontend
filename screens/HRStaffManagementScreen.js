import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  PlatformCard,
  Title,
  Paragraph,
  PlatformButton,
  PlatformSearchbar,
  PlatformChip,
  PlatformModal,
  PlatformInput,
  PlatformIconButton,
  PlatformSnackbar,
  PlatformBadge,
  Text,
} from '../components/PlatformWrapper';

const HRStaffManagementScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'academic', name: 'Academic Affairs' },
    { id: 'student', name: 'Student Services' },
    { id: 'finance', name: 'Finance & Administration' },
    { id: 'it', name: 'Information Technology' },
    { id: 'facilities', name: 'Facilities Management' },
  ];

  const staffMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      position: 'Dean of Academic Affairs',
      department: 'academic',
      email: 'sarah.johnson@university.edu',
      phone: '+1 (555) 123-4567',
      office: 'Room 301, Administration Building',
      officeHours: 'Mon-Fri 9:00 AM - 5:00 PM',
      specialization: 'Academic Policy, Curriculum Development',
      avatar: '👩‍🏫',
      status: 'active',
    },
    {
      id: 2,
      name: 'Michael Chen',
      position: 'Student Services Director',
      department: 'student',
      email: 'michael.chen@university.edu',
      phone: '+1 (555) 234-5678',
      office: 'Room 205, Student Center',
      officeHours: 'Mon-Fri 8:00 AM - 6:00 PM',
      specialization: 'Student Life, Counseling Services',
      avatar: '👨‍💼',
      status: 'active',
    },
    {
      id: 3,
      name: 'Lisa Rodriguez',
      position: 'Financial Controller',
      department: 'finance',
      email: 'lisa.rodriguez@university.edu',
      phone: '+1 (555) 345-6789',
      office: 'Room 102, Finance Building',
      officeHours: 'Mon-Fri 8:30 AM - 4:30 PM',
      specialization: 'Budget Management, Financial Planning',
      avatar: '👩‍💻',
      status: 'active',
    },
    {
      id: 4,
      name: 'David Thompson',
      position: 'IT Systems Administrator',
      department: 'it',
      email: 'david.thompson@university.edu',
      phone: '+1 (555) 456-7890',
      office: 'Room 401, Technology Center',
      officeHours: 'Mon-Fri 7:00 AM - 7:00 PM',
      specialization: 'Network Security, System Administration',
      avatar: '👨‍💻',
      status: 'active',
    },
    {
      id: 5,
      name: 'Emily Davis',
      position: 'Facilities Manager',
      department: 'facilities',
      email: 'emily.davis@university.edu',
      phone: '+1 (555) 567-8901',
      office: 'Room 150, Maintenance Building',
      officeHours: 'Mon-Fri 6:00 AM - 6:00 PM',
      specialization: 'Building Maintenance, Safety Compliance',
      avatar: '👩‍🔧',
      status: 'active',
    },
    {
      id: 6,
      name: 'Dr. Robert Wilson',
      position: 'Associate Dean',
      department: 'academic',
      email: 'robert.wilson@university.edu',
      phone: '+1 (555) 678-9012',
      office: 'Room 302, Administration Building',
      officeHours: 'Mon-Fri 10:00 AM - 4:00 PM',
      specialization: 'Faculty Development, Research Programs',
      avatar: '👨‍🏫',
      status: 'active',
    },
  ];

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || staff.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAddStaff = () => {
    setEditingStaff(null);
    setModalVisible(true);
  };

  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setModalVisible(true);
  };

  const handleSaveStaff = () => {
    setSnackbarMessage(editingStaff ? 'Staff member updated successfully!' : 'Staff member added successfully!');
    setSnackbarVisible(true);
    setModalVisible(false);
    setEditingStaff(null);
  };

  const handleDeleteStaff = (staffId) => {
    setSnackbarMessage('Staff member removed successfully!');
    setSnackbarVisible(true);
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'academic': return '#2196F3';
      case 'student': return '#4CAF50';
      case 'finance': return '#FF9800';
      case 'it': return '#9C27B0';
      case 'facilities': return '#795548';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Search and Filter */}
        <PlatformCard style={styles.searchCard}>
          <PlatformSearchbar
            placeholder="Search staff members..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {departments.map(dept => (
              <PlatformChip
                key={dept.id}
                selected={selectedDepartment === dept.id}
                onPress={() => setSelectedDepartment(dept.id)}
                style={styles.filterChip}
              >
                {dept.name}
              </PlatformChip>
            ))}
          </ScrollView>
        </PlatformCard>

        {/* Staff List */}
        {filteredStaff.map(staff => (
          <PlatformCard key={staff.id} style={styles.staffCard}>
            <View style={styles.staffHeader}>
              <View style={styles.staffInfo}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatar}>{staff.avatar}</Text>
                </View>
                <View style={styles.staffDetails}>
                  <Title style={styles.staffName}>{staff.name}</Title>
                  <Paragraph style={styles.staffPosition}>{staff.position}</Paragraph>
                  <PlatformBadge style={[styles.departmentBadge, { backgroundColor: getDepartmentColor(staff.department) }]}>
                    {departments.find(d => d.id === staff.department)?.name}
                  </PlatformBadge>
                </View>
              </View>
              <View style={styles.staffActions}>
                <PlatformIconButton
                  icon="pencil"
                  size={20}
                  onPress={() => handleEditStaff(staff)}
                  style={styles.actionButton}
                />
                <PlatformIconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDeleteStaff(staff.id)}
                  style={styles.actionButton}
                />
              </View>
            </View>

            <View style={styles.contactSection}>
              <View style={styles.contactItem}>
                <Paragraph style={styles.contactLabel}>📧 Email:</Paragraph>
                <Paragraph style={styles.contactValue}>{staff.email}</Paragraph>
              </View>
              <View style={styles.contactItem}>
                <Paragraph style={styles.contactLabel}>📞 Phone:</Paragraph>
                <Paragraph style={styles.contactValue}>{staff.phone}</Paragraph>
              </View>
              <View style={styles.contactItem}>
                <Paragraph style={styles.contactLabel}>🏢 Office:</Paragraph>
                <Paragraph style={styles.contactValue}>{staff.office}</Paragraph>
              </View>
              <View style={styles.contactItem}>
                <Paragraph style={styles.contactLabel}>🕒 Hours:</Paragraph>
                <Paragraph style={styles.contactValue}>{staff.officeHours}</Paragraph>
              </View>
            </View>

            <View style={styles.specializationSection}>
              <Paragraph style={styles.specializationTitle}>Specialization:</Paragraph>
              <Paragraph style={styles.specializationText}>{staff.specialization}</Paragraph>
            </View>

            <View style={styles.staffButtons}>
              <PlatformButton
                mode="outlined"
                onPress={() => {}}
                style={styles.staffButton}
                compact
              >
                View Profile
              </PlatformButton>
              <PlatformButton
                mode="contained"
                onPress={() => {}}
                style={styles.staffButton}
                compact
              >
                Contact
              </PlatformButton>
            </View>
          </PlatformCard>
        ))}

        {filteredStaff.length === 0 && (
          <PlatformCard style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Title style={styles.emptyTitle}>No staff members found</Title>
              <Paragraph style={styles.emptyText}>
                Try adjusting your search criteria or filters
              </Paragraph>
            </View>
          </PlatformCard>
        )}
      </ScrollView>

      {/* Add Staff FAB */}
      <PlatformButton
        mode="contained"
        onPress={handleAddStaff}
        style={styles.fab}
        icon="plus"
      >
        Add Staff
      </PlatformButton>

      {/* Add/Edit Staff Modal */}
      <PlatformModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title style={styles.modalTitle}>
          {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        </Title>
        
        <PlatformInput
          label="Full Name"
          defaultValue={editingStaff?.name}
          style={styles.modalInput}
        />
        <PlatformInput
          label="Position"
          defaultValue={editingStaff?.position}
          style={styles.modalInput}
        />
        <PlatformInput
          label="Email"
          defaultValue={editingStaff?.email}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.modalInput}
        />
        <PlatformInput
          label="Phone"
          defaultValue={editingStaff?.phone}
          keyboardType="phone-pad"
          style={styles.modalInput}
        />
        <PlatformInput
          label="Office Location"
          defaultValue={editingStaff?.office}
          style={styles.modalInput}
        />
        <PlatformInput
          label="Office Hours"
          defaultValue={editingStaff?.officeHours}
          style={styles.modalInput}
        />
        <PlatformInput
          label="Specialization"
          defaultValue={editingStaff?.specialization}
          multiline
          numberOfLines={3}
          style={styles.modalInput}
        />

        <View style={styles.modalButtons}>
          <PlatformButton
            mode="outlined"
            onPress={() => setModalVisible(false)}
            style={styles.modalButton}
          >
            Cancel
          </PlatformButton>
          <PlatformButton
            mode="contained"
            onPress={handleSaveStaff}
            style={styles.modalButton}
          >
            Save
          </PlatformButton>
        </View>
      </PlatformModal>

      <PlatformSnackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </PlatformSnackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchCard: {
    margin: 16,
    padding: 16,
  },
  searchbar: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  staffCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  staffInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    fontSize: 40,
  },
  staffDetails: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  staffPosition: {
    color: '#666',
    marginBottom: 8,
  },
  departmentBadge: {
    alignSelf: 'flex-start',
  },
  staffActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 4,
  },
  contactSection: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contactLabel: {
    fontWeight: 'bold',
    width: 80,
    color: '#666',
  },
  contactValue: {
    flex: 1,
    color: '#333',
  },
  specializationSection: {
    marginBottom: 16,
  },
  specializationTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specializationText: {
    color: '#666',
    fontStyle: 'italic',
  },
  staffButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  staffButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyCard: {
    margin: 16,
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default HRStaffManagementScreen; 