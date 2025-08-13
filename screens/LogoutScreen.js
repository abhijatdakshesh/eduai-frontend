import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  PlatformCard,
  Title,
  Paragraph,
  PlatformButton,
  PlatformList,
  PlatformSwitch,
  PlatformIconButton,
  PlatformSnackbar,
  PlatformBadge,
  PlatformAvatar,
  Text,
} from '../components/PlatformWrapper';
import { useAuth } from '../contexts/AuthContext';

const LogoutScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    pushNotifications: true,
  });

  const userProfile = {
    name: user ? `${user.first_name} ${user.last_name}` : 'User',
    email: user ? user.email : 'user@example.com',
    studentId: '2024001',
    major: 'Computer Science',
    gpa: 3.8,
    credits: 75,
    advisor: 'Dr. Sarah Johnson',
    graduationDate: '2025-05-15',
    phone: '+1 (555) 123-4567',
    address: '123 Student Ave, Campus Town, ST 12345',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Parent',
      phone: '+1 (555) 987-6543',
    },
  };

  const currentCourses = [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Programming',
      instructor: 'Dr. Smith',
      grade: 'A-',
      credits: 3,
    },
    {
      id: 2,
      code: 'MATH201',
      name: 'Calculus I',
      instructor: 'Dr. Johnson',
      grade: 'A',
      credits: 4,
    },
    {
      id: 3,
      code: 'PHY101',
      name: 'Physics I',
      instructor: 'Dr. Brown',
      grade: 'B+',
      credits: 4,
    },
  ];

  const quickActions = [
    { title: 'View Academic Record', icon: '📚', onPress: () => {} },
    { title: 'Download Transcript', icon: '📄', onPress: () => {} },
    { title: 'Update Contact Info', icon: '📝', onPress: () => setEditProfileModalVisible(true) },
    { title: 'App Settings', icon: '⚙️', onPress: () => setSettingsModalVisible(true) },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              setSnackbarMessage(result.message);
              setSnackbarVisible(true);
              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }],
                });
              }, 1000);
            } catch (error) {
              setSnackbarMessage('Logout failed. Please try again.');
              setSnackbarVisible(true);
            }
          },
        },
      ]
    );
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    setSnackbarMessage(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
    setSnackbarVisible(true);
  };

  const handleSaveProfile = () => {
    setSnackbarMessage('Profile updated successfully!');
    setSnackbarVisible(true);
    setEditProfileModalVisible(false);
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return '#4CAF50';
    if (grade.startsWith('B')) return '#FF9800';
    if (grade.startsWith('C')) return '#f44336';
    return '#666';
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <PlatformCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <PlatformAvatar.Text 
              size={80} 
              label={userProfile.name.split(' ').map(n => n[0]).join('')}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Title style={styles.profileName}>{userProfile.name}</Title>
              <Paragraph style={styles.profileEmail}>{userProfile.email}</Paragraph>
              <Paragraph style={styles.profileId}>Student ID: {userProfile.studentId}</Paragraph>
            </View>
          </View>

          <View style={styles.academicInfo}>
            <View style={styles.academicItem}>
              <Title style={styles.academicValue}>{userProfile.gpa}</Title>
              <Paragraph style={styles.academicLabel}>GPA</Paragraph>
            </View>
            <View style={styles.academicItem}>
              <Title style={styles.academicValue}>{userProfile.credits}</Title>
              <Paragraph style={styles.academicLabel}>Credits</Paragraph>
            </View>
            <View style={styles.academicItem}>
              <Title style={styles.academicValue}>{userProfile.major}</Title>
              <Paragraph style={styles.academicLabel}>Major</Paragraph>
            </View>
          </View>
        </PlatformCard>

        {/* Quick Actions */}
        <PlatformCard style={styles.actionsCard}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <PlatformButton
                key={index}
                mode="outlined"
                onPress={action.onPress}
                style={styles.actionButton}
                contentStyle={styles.actionContent}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Paragraph style={styles.actionText}>{action.title}</Paragraph>
              </PlatformButton>
            ))}
          </View>
        </PlatformCard>

        {/* Current Courses */}
        <PlatformCard style={styles.coursesCard}>
          <Title style={styles.sectionTitle}>Current Courses</Title>
          {currentCourses.map(course => (
            <View key={course.id} style={styles.courseItem}>
              <View style={styles.courseInfo}>
                <Title style={styles.courseCode}>{course.code}</Title>
                <Paragraph style={styles.courseName}>{course.name}</Paragraph>
                <Paragraph style={styles.courseInstructor}>Instructor: {course.instructor}</Paragraph>
              </View>
              <View style={styles.courseMeta}>
                <PlatformBadge style={[styles.gradeBadge, { backgroundColor: getGradeColor(course.grade) }]}>
                  {course.grade}
                </PlatformBadge>
                <Paragraph style={styles.courseCredits}>{course.credits} credits</Paragraph>
              </View>
            </View>
          ))}
        </PlatformCard>

        {/* Personal Information */}
        <PlatformCard style={styles.infoCard}>
          <Title style={styles.sectionTitle}>Personal Information</Title>
          
          <View style={styles.infoSection}>
            <Paragraph style={styles.infoLabel}>Academic Advisor:</Paragraph>
            <Paragraph style={styles.infoValue}>{userProfile.advisor}</Paragraph>
          </View>
          
          <View style={styles.infoSection}>
            <Paragraph style={styles.infoLabel}>Expected Graduation:</Paragraph>
            <Paragraph style={styles.infoValue}>{userProfile.graduationDate}</Paragraph>
          </View>
          
          <View style={styles.infoSection}>
            <Paragraph style={styles.infoLabel}>Phone:</Paragraph>
            <Paragraph style={styles.infoValue}>{userProfile.phone}</Paragraph>
          </View>
          
          <View style={styles.infoSection}>
            <Paragraph style={styles.infoLabel}>Address:</Paragraph>
            <Paragraph style={styles.infoValue}>{userProfile.address}</Paragraph>
          </View>
        </PlatformCard>

        {/* Emergency Contact */}
        <PlatformCard style={styles.emergencyCard}>
          <Title style={styles.sectionTitle}>Emergency Contact</Title>
          
          <View style={styles.infoSection}>
            <Paragraph style={styles.infoLabel}>Name:</Paragraph>
            <Paragraph style={styles.infoValue}>{userProfile.emergencyContact.name}</Paragraph>
          </View>
          
          <View style={styles.infoSection}>
            <Paragraph style={styles.infoLabel}>Relationship:</Paragraph>
            <Paragraph style={styles.infoValue}>{userProfile.emergencyContact.relationship}</Paragraph>
          </View>
          
          <View style={styles.infoSection}>
            <Paragraph style={styles.infoLabel}>Phone:</Paragraph>
            <Paragraph style={styles.infoValue}>{userProfile.emergencyContact.phone}</Paragraph>
          </View>
        </PlatformCard>

        {/* Logout Button */}
        <PlatformButton
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#f44336"
        >
          Logout
        </PlatformButton>
      </ScrollView>

      {/* Settings Modal */}
      <PlatformModal
        visible={settingsModalVisible}
        onDismiss={() => setSettingsModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title style={styles.modalTitle}>App Settings</Title>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Paragraph style={styles.settingLabel}>Push Notifications</Paragraph>
            <Paragraph style={styles.settingDescription}>Receive notifications about important updates</Paragraph>
          </View>
          <PlatformSwitch
            value={settings.pushNotifications}
            onValueChange={(value) => handleSettingChange('pushNotifications', value)}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Paragraph style={styles.settingLabel}>Email Updates</Paragraph>
            <Paragraph style={styles.settingDescription}>Receive email notifications</Paragraph>
          </View>
          <PlatformSwitch
            value={settings.emailUpdates}
            onValueChange={(value) => handleSettingChange('emailUpdates', value)}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Paragraph style={styles.settingLabel}>Dark Mode</Paragraph>
            <Paragraph style={styles.settingDescription}>Use dark theme for the app</Paragraph>
          </View>
          <PlatformSwitch
            value={settings.darkMode}
            onValueChange={(value) => handleSettingChange('darkMode', value)}
          />
        </View>

        <PlatformButton
          mode="contained"
          onPress={() => setSettingsModalVisible(false)}
          style={styles.modalButton}
        >
          Close
        </PlatformButton>
      </PlatformModal>

      {/* Edit Profile Modal */}
      <PlatformModal
        visible={editProfileModalVisible}
        onDismiss={() => setEditProfileModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title style={styles.modalTitle}>Edit Profile</Title>
        
        <PlatformInput
          label="Full Name"
          defaultValue={userProfile.name}
          style={styles.modalInput}
        />
        <PlatformInput
          label="Phone"
          defaultValue={userProfile.phone}
          keyboardType="phone-pad"
          style={styles.modalInput}
        />
        <PlatformInput
          label="Address"
          defaultValue={userProfile.address}
          multiline
          numberOfLines={3}
          style={styles.modalInput}
        />
        <PlatformInput
          label="Emergency Contact Name"
          defaultValue={userProfile.emergencyContact.name}
          style={styles.modalInput}
        />
        <PlatformInput
          label="Emergency Contact Phone"
          defaultValue={userProfile.emergencyContact.phone}
          keyboardType="phone-pad"
          style={styles.modalInput}
        />

        <View style={styles.modalButtons}>
          <PlatformButton
            mode="outlined"
            onPress={() => setEditProfileModalVisible(false)}
            style={styles.modalButton}
          >
            Cancel
          </PlatformButton>
          <PlatformButton
            mode="contained"
            onPress={handleSaveProfile}
            style={styles.modalButton}
          >
            Save Changes
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
  profileCard: {
    margin: 16,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#666',
    marginBottom: 4,
  },
  profileId: {
    color: '#666',
    fontSize: 12,
  },
  academicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  academicItem: {
    alignItems: 'center',
  },
  academicValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  academicLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  coursesCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  courseName: {
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 12,
    color: '#666',
  },
  courseMeta: {
    alignItems: 'flex-end',
  },
  gradeBadge: {
    marginBottom: 4,
  },
  courseCredits: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  emergencyCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#666',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    paddingVertical: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
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

export default LogoutScreen; 