import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const SimpleProfileScreen = () => {
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@university.edu',
    studentId: 'STU2024001',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1998-05-15',
    address: '123 University Ave, Campus City, ST 12345',
    major: 'Computer Science',
    year: 'Junior',
    gpa: '3.85',
  });

  const academicInfo = [
    { label: 'Major', value: profileData.major },
    { label: 'Year', value: profileData.year },
    { label: 'GPA', value: profileData.gpa },
    { label: 'Credits Completed', value: '75' },
    { label: 'Expected Graduation', value: 'Spring 2025' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
  };

  const updateProfileData = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your personal information</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePicture}>
            <Text style={styles.profileInitials}>
              {profileData.firstName[0]}{profileData.lastName[0]}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {profileData.firstName} {profileData.lastName}
          </Text>
          <Text style={styles.profileEmail}>{profileData.email}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First Name:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={profileData.firstName}
                  onChangeText={(value) => updateProfileData('firstName', value)}
                />
              ) : (
                <Text style={styles.infoValue}>{profileData.firstName}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Name:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={profileData.lastName}
                  onChangeText={(value) => updateProfileData('lastName', value)}
                />
              ) : (
                <Text style={styles.infoValue}>{profileData.lastName}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{profileData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={profileData.phone}
                  onChangeText={(value) => updateProfileData('phone', value)}
                />
              ) : (
                <Text style={styles.infoValue}>{profileData.phone}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth:</Text>
              <Text style={styles.infoValue}>{profileData.dateOfBirth}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={profileData.address}
                  onChangeText={(value) => updateProfileData('address', value)}
                  multiline
                />
              ) : (
                <Text style={styles.infoValue}>{profileData.address}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Academic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          <View style={styles.infoCard}>
            {academicInfo.map((info, index) => (
              <View key={index} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{info.label}:</Text>
                <Text style={styles.infoValue}>{info.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Student ID Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student ID</Text>
          <View style={styles.idCard}>
            <View style={styles.idCardHeader}>
              <Text style={styles.idCardTitle}>UNIVERSITY ID CARD</Text>
              <Text style={styles.idCardSubtitle}>Student Identification</Text>
            </View>
            <View style={styles.idCardContent}>
              <View style={styles.idCardRow}>
                <Text style={styles.idCardLabel}>Student ID:</Text>
                <Text style={styles.idCardValue}>{profileData.studentId}</Text>
              </View>
              <View style={styles.idCardRow}>
                <Text style={styles.idCardLabel}>Name:</Text>
                <Text style={styles.idCardValue}>{profileData.firstName} {profileData.lastName}</Text>
              </View>
              <View style={styles.idCardRow}>
                <Text style={styles.idCardLabel}>Major:</Text>
                <Text style={styles.idCardValue}>{profileData.major}</Text>
              </View>
              <View style={styles.idCardRow}>
                <Text style={styles.idCardLabel}>Year:</Text>
                <Text style={styles.idCardValue}>{profileData.year}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Download Transcript</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Request Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={logout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
  },
  profilePictureSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  editButton: {
    color: '#1a237e',
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
  },
  cancelButton: {
    color: '#666',
    marginRight: 16,
  },
  saveButton: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#1a237e',
    width: 100,
  },
  infoValue: {
    flex: 1,
    color: '#666',
    textAlign: 'right',
  },
  infoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e8eaf6',
    borderRadius: 4,
    padding: 8,
    textAlign: 'right',
  },
  idCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#1a237e',
  },
  idCardHeader: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
    paddingBottom: 10,
  },
  idCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  idCardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  idCardContent: {
    gap: 8,
  },
  idCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  idCardLabel: {
    fontWeight: 'bold',
    color: '#1a237e',
  },
  idCardValue: {
    color: '#666',
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#1a237e',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default SimpleProfileScreen;

