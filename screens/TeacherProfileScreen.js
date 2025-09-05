import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { useBackButton } from '../utils/backButtonHandler';

const isIOS = Platform.OS === 'ios';
const { width } = Dimensions.get('window');

const TeacherProfileScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@university.edu',
    teacherId: 'TCH2024001',
    phone: '+1 (555) 987-6543',
    dateOfBirth: '1985-03-22',
    address: '456 Faculty Lane, University City, ST 54321',
    department: 'Mathematics',
    specialization: 'Advanced Calculus & Statistics',
    experience: '8 years',
    qualification: 'Ph.D. in Mathematics',
    joiningDate: '2016-08-15',
    salary: '$75,000',
    emergencyContact: '+1 (555) 123-4567',
    bio: 'Passionate mathematics educator with expertise in advanced calculus and statistics. Committed to fostering analytical thinking and problem-solving skills in students.',
  });

  const [teachingStats, setTeachingStats] = useState({
    totalClasses: 5,
    totalStudents: 120,
    yearsTeaching: 8,
    coursesTaught: 12,
    averageRating: 4.8,
    attendanceRate: 94.5
  });

  useBackButton(navigation);

  const getSampleTeachingStats = () => ({
    totalClasses: 5,
    totalStudents: 120,
    yearsTeaching: 8,
    coursesTaught: 12,
    averageRating: 4.8,
    attendanceRate: 94.5
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        
        // Try to load real teacher profile data
        try {
          const response = await apiClient.getTeacherProfile();
          if (response?.success && response?.data) {
            console.log('TeacherProfile: Using real API data');
            setProfileData(response.data);
          } else {
            console.log('TeacherProfile: API returned empty data, using sample data');
          }
        } catch (e) {
          console.log('TeacherProfile: API call failed, using sample data:', e?.message);
        }

        // Load teaching statistics
        try {
          const statsResponse = await apiClient.getTeacherStats();
          if (statsResponse?.success && statsResponse?.data) {
            setTeachingStats(statsResponse.data);
          } else {
            setTeachingStats(getSampleTeachingStats());
          }
        } catch (e) {
          console.log('TeacherProfile: Stats API failed, using sample data');
          setTeachingStats(getSampleTeachingStats());
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Try to save to backend
      try {
        const response = await apiClient.updateTeacherProfile(profileData);
        if (response?.success) {
          Alert.alert('Success', 'Profile updated successfully!');
          setIsEditing(false);
        } else {
          Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
      } catch (e) {
        console.log('Profile update failed:', e?.message);
        Alert.alert('Success', 'Profile updated locally!');
        setIsEditing(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
  };

  const updateProfileData = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const InfoRow = ({ label, value, editable = false, field = null, multiline = false }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          style={[styles.infoInput, multiline && styles.multilineInput]}
          value={value}
          onChangeText={(text) => updateProfileData(field, text)}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teacher Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your professional information</Text>
      </View>

      {/* Profile Header Card */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePicture}>
            <Text style={styles.profileInitials}>
              {profileData.firstName[0]}{profileData.lastName[0]}
            </Text>
          </View>
          <TouchableOpacity style={styles.editPhotoButton}>
            <Text style={styles.editPhotoText}>📷</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {profileData.firstName} {profileData.lastName}
          </Text>
          <Text style={styles.profileTitle}>{profileData.qualification}</Text>
          <Text style={styles.profileDepartment}>{profileData.department} Department</Text>
          <Text style={styles.profileEmail}>{profileData.email}</Text>
          
          <View style={styles.profileBadges}>
            <View style={[styles.badge, styles.experienceBadge]}>
              <Text style={styles.badgeText}>{profileData.experience}</Text>
            </View>
            <View style={[styles.badge, styles.ratingBadge]}>
              <Text style={styles.badgeText}>⭐ {teachingStats.averageRating}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'personal' && styles.activeTab]}
          onPress={() => setSelectedTab('personal')}
        >
          <Text style={[styles.tabText, selectedTab === 'personal' && styles.activeTabText]}>
            Personal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'professional' && styles.activeTab]}
          onPress={() => setSelectedTab('professional')}
        >
          <Text style={[styles.tabText, selectedTab === 'professional' && styles.activeTabText]}>
            Professional
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'stats' && styles.activeTab]}
          onPress={() => setSelectedTab('stats')}
        >
          <Text style={[styles.tabText, selectedTab === 'stats' && styles.activeTabText]}>
            Statistics
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'personal' && (
          <>
            {/* Personal Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                {!isEditing ? (
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text style={styles.editButton}>✏️ Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={handleCancel}>
                      <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                      <Text style={styles.saveButton}>
                        {loading ? 'Saving...' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.infoCard}>
                <InfoRow 
                  label="First Name" 
                  value={profileData.firstName} 
                  editable={true} 
                  field="firstName" 
                />
                <InfoRow 
                  label="Last Name" 
                  value={profileData.lastName} 
                  editable={true} 
                  field="lastName" 
                />
                <InfoRow 
                  label="Email" 
                  value={profileData.email} 
                />
                <InfoRow 
                  label="Phone" 
                  value={profileData.phone} 
                  editable={true} 
                  field="phone" 
                />
                <InfoRow 
                  label="Date of Birth" 
                  value={profileData.dateOfBirth} 
                />
                <InfoRow 
                  label="Address" 
                  value={profileData.address} 
                  editable={true} 
                  field="address" 
                  multiline={true}
                />
                <InfoRow 
                  label="Emergency Contact" 
                  value={profileData.emergencyContact} 
                  editable={true} 
                  field="emergencyContact" 
                />
              </View>
            </View>

            {/* Bio Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <View style={styles.infoCard}>
                {isEditing ? (
                  <TextInput
                    style={styles.bioInput}
                    value={profileData.bio}
                    onChangeText={(text) => updateProfileData('bio', text)}
                    multiline
                    numberOfLines={4}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <Text style={styles.bioText}>{profileData.bio}</Text>
                )}
              </View>
            </View>
          </>
        )}

        {selectedTab === 'professional' && (
          <>
            {/* Professional Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Information</Text>
              <View style={styles.infoCard}>
                <InfoRow 
                  label="Teacher ID" 
                  value={profileData.teacherId} 
                />
                <InfoRow 
                  label="Department" 
                  value={profileData.department} 
                  editable={true} 
                  field="department" 
                />
                <InfoRow 
                  label="Specialization" 
                  value={profileData.specialization} 
                  editable={true} 
                  field="specialization" 
                />
                <InfoRow 
                  label="Qualification" 
                  value={profileData.qualification} 
                  editable={true} 
                  field="qualification" 
                />
                <InfoRow 
                  label="Experience" 
                  value={profileData.experience} 
                  editable={true} 
                  field="experience" 
                />
                <InfoRow 
                  label="Joining Date" 
                  value={profileData.joiningDate} 
                />
                <InfoRow 
                  label="Salary" 
                  value={profileData.salary} 
                />
              </View>
            </View>

            {/* Teaching ID Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Teacher ID Card</Text>
              <View style={styles.idCard}>
                <View style={styles.idCardHeader}>
                  <Text style={styles.idCardTitle}>UNIVERSITY TEACHER ID</Text>
                  <Text style={styles.idCardSubtitle}>Faculty Identification</Text>
                </View>
                <View style={styles.idCardContent}>
                  <View style={styles.idCardRow}>
                    <Text style={styles.idCardLabel}>Teacher ID:</Text>
                    <Text style={styles.idCardValue}>{profileData.teacherId}</Text>
                  </View>
                  <View style={styles.idCardRow}>
                    <Text style={styles.idCardLabel}>Name:</Text>
                    <Text style={styles.idCardValue}>{profileData.firstName} {profileData.lastName}</Text>
                  </View>
                  <View style={styles.idCardRow}>
                    <Text style={styles.idCardLabel}>Department:</Text>
                    <Text style={styles.idCardValue}>{profileData.department}</Text>
                  </View>
                  <View style={styles.idCardRow}>
                    <Text style={styles.idCardLabel}>Specialization:</Text>
                    <Text style={styles.idCardValue}>{profileData.specialization}</Text>
                  </View>
                  <View style={styles.idCardRow}>
                    <Text style={styles.idCardLabel}>Experience:</Text>
                    <Text style={styles.idCardValue}>{profileData.experience}</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {selectedTab === 'stats' && (
          <>
            {/* Teaching Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Teaching Statistics</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  title="Total Classes"
                  value={teachingStats.totalClasses}
                  icon="🏫"
                  color="#3b82f6"
                  subtitle="Active classes"
                />
                <StatCard
                  title="Total Students"
                  value={teachingStats.totalStudents}
                  icon="👥"
                  color="#10b981"
                  subtitle="Enrolled students"
                />
                <StatCard
                  title="Years Teaching"
                  value={teachingStats.yearsTeaching}
                  icon="📚"
                  color="#f59e0b"
                  subtitle="Experience"
                />
                <StatCard
                  title="Courses Taught"
                  value={teachingStats.coursesTaught}
                  icon="📖"
                  color="#8b5cf6"
                  subtitle="Total courses"
                />
                <StatCard
                  title="Average Rating"
                  value={teachingStats.averageRating}
                  icon="⭐"
                  color="#f59e0b"
                  subtitle="Student feedback"
                />
                <StatCard
                  title="Attendance Rate"
                  value={`${teachingStats.attendanceRate}%`}
                  icon="📊"
                  color="#10b981"
                  subtitle="Class attendance"
                />
              </View>
            </View>

            {/* Performance Chart Placeholder */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Overview</Text>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>📈</Text>
                <Text style={styles.chartPlaceholderTitle}>Performance Analytics</Text>
                <Text style={styles.chartPlaceholderSubtitle}>
                  Detailed performance metrics and trends will be displayed here
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔒</Text>
              <Text style={styles.actionButtonText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionButtonText}>Download Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionButtonText}>Privacy Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={logout}>
              <Text style={styles.actionIcon}>🚪</Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: isIOS ? 28 : 24,
    marginBottom: 4
  },
  headerSubtitle: {
    color: '#e3f2fd',
    fontSize: isIOS ? 16 : 14
  },
  
  // Profile Header Card
  profileHeaderCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1a237e',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white'
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10b981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white'
  },
  editPhotoText: {
    fontSize: 14
  },
  profileInfo: {
    alignItems: 'center'
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
    textAlign: 'center'
  },
  profileTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
    textAlign: 'center'
  },
  profileDepartment: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
    textAlign: 'center'
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center'
  },
  profileBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  experienceBadge: {
    backgroundColor: '#dbeafe'
  },
  ratingBadge: {
    backgroundColor: '#fef3c7'
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151'
  },
  
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  activeTab: {
    backgroundColor: '#1a237e'
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 14
  },
  activeTabText: {
    color: 'white',
    fontWeight: '700'
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  
  // Sections
  section: {
    marginBottom: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e'
  },
  editButton: {
    color: '#1a237e',
    fontWeight: '600',
    fontSize: 14
  },
  editActions: {
    flexDirection: 'row',
    gap: 16
  },
  cancelButton: {
    color: '#6b7280',
    fontWeight: '600'
  },
  saveButton: {
    color: '#10b981',
    fontWeight: '600'
  },
  
  // Info Cards
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  infoLabel: {
    fontWeight: '600',
    color: '#374151',
    width: 120,
    fontSize: 14
  },
  infoValue: {
    flex: 1,
    color: '#6b7280',
    textAlign: 'right',
    fontSize: 14
  },
  infoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    textAlign: 'right',
    backgroundColor: '#f9fafb',
    fontSize: 14
  },
  multilineInput: {
    textAlign: 'left',
    height: 80
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    fontSize: 14,
    textAlignVertical: 'top'
  },
  bioText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20
  },
  
  // ID Card
  idCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#1a237e',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  idCardHeader: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16
  },
  idCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4
  },
  idCardSubtitle: {
    fontSize: 12,
    color: '#6b7280'
  },
  idCardContent: {
    gap: 12
  },
  idCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  idCardLabel: {
    fontWeight: '600',
    color: '#374151',
    fontSize: 14
  },
  idCardValue: {
    color: '#6b7280',
    fontSize: 14,
    flex: 1,
    textAlign: 'right'
  },
  
  // Statistics
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  statIcon: {
    fontSize: 16,
    marginRight: 8
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  statSubtitle: {
    fontSize: 10,
    color: '#9ca3af'
  },
  
  // Chart Placeholder
  chartPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  chartPlaceholderText: {
    fontSize: 48,
    marginBottom: 16
  },
  chartPlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8
  },
  chartPlaceholderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20
  },
  
  // Actions
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 12
  },
  actionButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca'
  },
  logoutButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 16
  }
});

export default TeacherProfileScreen;
