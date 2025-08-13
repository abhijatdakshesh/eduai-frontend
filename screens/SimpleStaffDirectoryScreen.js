import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

const SimpleStaffDirectoryScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'computer-science', name: 'Computer Science' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'english', name: 'English' },
    { id: 'physics', name: 'Physics' },
    { id: 'administration', name: 'Administration' },
  ];

  const staffMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      position: 'Professor',
      department: 'Computer Science',
      email: 'sarah.johnson@university.edu',
      phone: '+1 (555) 123-4567',
      office: 'Room 201, Building A',
      officeHours: 'Mon, Wed 2:00 PM - 4:00 PM',
      avatar: '👩‍🏫',
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      position: 'Associate Professor',
      department: 'Mathematics',
      email: 'michael.chen@university.edu',
      phone: '+1 (555) 234-5678',
      office: 'Room 105, Building B',
      officeHours: 'Tue, Thu 1:00 PM - 3:00 PM',
      avatar: '👨‍🏫',
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      position: 'Assistant Professor',
      department: 'English',
      email: 'emily.davis@university.edu',
      phone: '+1 (555) 345-6789',
      office: 'Room 301, Building C',
      officeHours: 'Mon, Fri 10:00 AM - 12:00 PM',
      avatar: '👩‍🏫',
    },
    {
      id: 4,
      name: 'Dr. Robert Wilson',
      position: 'Professor',
      department: 'Physics',
      email: 'robert.wilson@university.edu',
      phone: '+1 (555) 456-7890',
      office: 'Room 401, Building D',
      officeHours: 'Wed, Fri 3:00 PM - 5:00 PM',
      avatar: '👨‍🏫',
    },
    {
      id: 5,
      name: 'Ms. Jennifer Smith',
      position: 'Administrative Assistant',
      department: 'Administration',
      email: 'jennifer.smith@university.edu',
      phone: '+1 (555) 567-8901',
      office: 'Room 101, Main Building',
      officeHours: 'Mon - Fri 9:00 AM - 5:00 PM',
      avatar: '👩‍💼',
    },
  ];

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || 
                             staff.department.toLowerCase().replace(' ', '-') === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staff Directory</Text>
        <Text style={styles.headerSubtitle}>Find faculty and staff members</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search staff members..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {departments.map(dept => (
            <TouchableOpacity
              key={dept.id}
              style={[
                styles.filterChip,
                selectedDepartment === dept.id && styles.filterChipSelected
              ]}
              onPress={() => setSelectedDepartment(dept.id)}
            >
              <Text style={[
                styles.filterChipText,
                selectedDepartment === dept.id && styles.filterChipTextSelected
              ]}>
                {dept.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.staffContainer}>
        {filteredStaff.map(staff => (
          <View key={staff.id} style={styles.staffCard}>
            <View style={styles.staffHeader}>
              <View style={styles.staffInfo}>
                <Text style={styles.staffAvatar}>{staff.avatar}</Text>
                <View style={styles.staffDetails}>
                  <Text style={styles.staffName}>{staff.name}</Text>
                  <Text style={styles.staffPosition}>{staff.position}</Text>
                  <Text style={styles.staffDepartment}>{staff.department}</Text>
                </View>
              </View>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Email:</Text>
                <Text style={styles.contactValue}>{staff.email}</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Phone:</Text>
                <Text style={styles.contactValue}>{staff.phone}</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Office:</Text>
                <Text style={styles.contactValue}>{staff.office}</Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Office Hours:</Text>
                <Text style={styles.contactValue}>{staff.officeHours}</Text>
              </View>
            </View>

            <View style={styles.staffActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Send Email</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Schedule Meeting</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredStaff.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No staff found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search criteria or department filter
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
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
  searchSection: {
    padding: 20,
    paddingBottom: 10,
  },
  searchBar: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#1a237e',
  },
  filterChipText: {
    color: '#1a237e',
    fontSize: 14,
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  staffContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  staffCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  staffHeader: {
    marginBottom: 16,
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffAvatar: {
    fontSize: 40,
    marginRight: 16,
  },
  staffDetails: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a237e',
  },
  staffPosition: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  staffDepartment: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contactLabel: {
    fontWeight: 'bold',
    width: 80,
    color: '#1a237e',
    fontSize: 14,
  },
  contactValue: {
    flex: 1,
    color: '#666',
    fontSize: 14,
  },
  staffActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a237e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a237e',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

export default SimpleStaffDirectoryScreen;

