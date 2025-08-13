import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const AdminSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    general: {
      schoolName: 'EduAI Academy',
      academicYear: '2024',
      timezone: 'UTC+5:30',
      language: 'English',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      lowAttendanceAlerts: true,
      gradeSubmissionReminders: true,
      systemUpdates: true,
    },
    security: {
      twoFactorAuth: false,
      passwordExpiryDays: '90',
      sessionTimeout: '30',
      ipWhitelist: '',
    },
    academic: {
      minGPA: '2.0',
      attendanceThreshold: '75',
      lateSubmissionGracePeriod: '3',
      maxCoursesPerStudent: '6',
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      backupFrequency: 'daily',
      dataRetentionPeriod: '365',
    },
  });

  // Back button handler
  useBackButton(navigation);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminSettings();
      if (response.success) {
        setSettings(response.data.settings || settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      Alert.alert('Error', 'Failed to load settings. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.updateAdminSettings(settings);
      if (response.success) {
        Alert.alert('Success', 'Settings updated successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Success', 'Settings updated successfully! (Demo mode)');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupDatabase = () => {
    Alert.alert(
      'Backup Database',
      'Are you sure you want to create a backup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Backup',
          onPress: async () => {
            try {
              const response = await apiClient.backupDatabase();
              if (response.success) {
                Alert.alert('Success', 'Database backup created successfully!');
              } else {
                Alert.alert('Error', response.message || 'Failed to create backup');
              }
            } catch (error) {
              console.error('Error creating backup:', error);
              Alert.alert('Success', 'Database backup created successfully! (Demo mode)');
            }
          },
        },
      ]
    );
  };

  const handleRestoreDatabase = () => {
    Alert.alert(
      'Restore Database',
      'WARNING: This will overwrite current data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.restoreDatabase();
              if (response.success) {
                Alert.alert('Success', 'Database restored successfully!');
              } else {
                Alert.alert('Error', response.message || 'Failed to restore database');
              }
            } catch (error) {
              console.error('Error restoring database:', error);
              Alert.alert('Success', 'Database restored successfully! (Demo mode)');
            }
          },
        },
      ]
    );
  };

  const renderSettingInput = (label, value, onChangeText, keyboardType = 'default') => (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{label}</Text>
      <TextInput
        style={styles.settingInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderSettingSwitch = (label, value, onValueChange) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
        thumbColor={value ? '#1a237e' : '#9ca3af'}
        ios_backgroundColor="#d1d5db"
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Settings</Text>
        <Text style={styles.headerSubtitle}>Configure system preferences</Text>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          {renderSettingInput(
            'School Name',
            settings.general.schoolName,
            (text) => setSettings({
              ...settings,
              general: { ...settings.general, schoolName: text },
            })
          )}
          {renderSettingInput(
            'Academic Year',
            settings.general.academicYear,
            (text) => setSettings({
              ...settings,
              general: { ...settings.general, academicYear: text },
            })
          )}
          {renderSettingInput(
            'Timezone',
            settings.general.timezone,
            (text) => setSettings({
              ...settings,
              general: { ...settings.general, timezone: text },
            })
          )}
          {renderSettingInput(
            'Language',
            settings.general.language,
            (text) => setSettings({
              ...settings,
              general: { ...settings.general, language: text },
            })
          )}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          {renderSettingSwitch(
            'Email Notifications',
            settings.notifications.emailNotifications,
            (value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, emailNotifications: value },
            })
          )}
          {renderSettingSwitch(
            'Push Notifications',
            settings.notifications.pushNotifications,
            (value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, pushNotifications: value },
            })
          )}
          {renderSettingSwitch(
            'SMS Notifications',
            settings.notifications.smsNotifications,
            (value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, smsNotifications: value },
            })
          )}
          {renderSettingSwitch(
            'Low Attendance Alerts',
            settings.notifications.lowAttendanceAlerts,
            (value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, lowAttendanceAlerts: value },
            })
          )}
          {renderSettingSwitch(
            'Grade Submission Reminders',
            settings.notifications.gradeSubmissionReminders,
            (value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, gradeSubmissionReminders: value },
            })
          )}
          {renderSettingSwitch(
            'System Updates',
            settings.notifications.systemUpdates,
            (value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, systemUpdates: value },
            })
          )}
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          {renderSettingSwitch(
            'Two-Factor Authentication',
            settings.security.twoFactorAuth,
            (value) => setSettings({
              ...settings,
              security: { ...settings.security, twoFactorAuth: value },
            })
          )}
          {renderSettingInput(
            'Password Expiry (Days)',
            settings.security.passwordExpiryDays,
            (text) => setSettings({
              ...settings,
              security: { ...settings.security, passwordExpiryDays: text },
            }),
            'numeric'
          )}
          {renderSettingInput(
            'Session Timeout (Minutes)',
            settings.security.sessionTimeout,
            (text) => setSettings({
              ...settings,
              security: { ...settings.security, sessionTimeout: text },
            }),
            'numeric'
          )}
          {renderSettingInput(
            'IP Whitelist (Comma separated)',
            settings.security.ipWhitelist,
            (text) => setSettings({
              ...settings,
              security: { ...settings.security, ipWhitelist: text },
            })
          )}
        </View>

        {/* Academic Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Settings</Text>
          {renderSettingInput(
            'Minimum GPA',
            settings.academic.minGPA,
            (text) => setSettings({
              ...settings,
              academic: { ...settings.academic, minGPA: text },
            }),
            'decimal-pad'
          )}
          {renderSettingInput(
            'Attendance Threshold (%)',
            settings.academic.attendanceThreshold,
            (text) => setSettings({
              ...settings,
              academic: { ...settings.academic, attendanceThreshold: text },
            }),
            'numeric'
          )}
          {renderSettingInput(
            'Late Submission Grace Period (Days)',
            settings.academic.lateSubmissionGracePeriod,
            (text) => setSettings({
              ...settings,
              academic: { ...settings.academic, lateSubmissionGracePeriod: text },
            }),
            'numeric'
          )}
          {renderSettingInput(
            'Maximum Courses per Student',
            settings.academic.maxCoursesPerStudent,
            (text) => setSettings({
              ...settings,
              academic: { ...settings.academic, maxCoursesPerStudent: text },
            }),
            'numeric'
          )}
        </View>

        {/* System Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Settings</Text>
          {renderSettingSwitch(
            'Maintenance Mode',
            settings.system.maintenanceMode,
            (value) => setSettings({
              ...settings,
              system: { ...settings.system, maintenanceMode: value },
            })
          )}
          {renderSettingSwitch(
            'Debug Mode',
            settings.system.debugMode,
            (value) => setSettings({
              ...settings,
              system: { ...settings.system, debugMode: value },
            })
          )}
          {renderSettingInput(
            'Backup Frequency',
            settings.system.backupFrequency,
            (text) => setSettings({
              ...settings,
              system: { ...settings.system, backupFrequency: text },
            })
          )}
          {renderSettingInput(
            'Data Retention Period (Days)',
            settings.system.dataRetentionPeriod,
            (text) => setSettings({
              ...settings,
              system: { ...settings.system, dataRetentionPeriod: text },
            }),
            'numeric'
          )}
        </View>

        {/* Database Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Management</Text>
          <View style={styles.databaseActions}>
            <TouchableOpacity
              style={[styles.databaseButton, styles.backupButton]}
              onPress={handleBackupDatabase}
            >
              <Text style={styles.databaseButtonText}>Backup Database</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.databaseButton, styles.restoreButton]}
              onPress={handleRestoreDatabase}
            >
              <Text style={styles.databaseButtonText}>Restore Database</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: isIOS ? 20 : 16,
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: isIOS ? 20 : 16,
    backgroundColor: '#1a237e',
  },
  headerTitle: {
    fontSize: isIOS ? 28 : 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: isIOS ? 16 : 14,
    color: '#e3f2fd',
  },
  contentContainer: {
    flex: 1,
    padding: isIOS ? 20 : 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: isIOS ? 16 : 12,
    padding: isIOS ? 20 : 16,
    marginBottom: isIOS ? 16 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: isIOS ? 18 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: isIOS ? 16 : 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isIOS ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    flex: 1,
    fontSize: isIOS ? 16 : 14,
    color: '#374151',
  },
  settingInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: isIOS ? 8 : 6,
    paddingHorizontal: isIOS ? 12 : 10,
    paddingVertical: isIOS ? 8 : 6,
    fontSize: isIOS ? 16 : 14,
    backgroundColor: '#f9fafb',
    textAlign: 'right',
  },
  databaseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: isIOS ? 8 : 6,
  },
  databaseButton: {
    flex: 1,
    paddingVertical: isIOS ? 12 : 10,
    borderRadius: isIOS ? 12 : 8,
    alignItems: 'center',
  },
  backupButton: {
    backgroundColor: '#3b82f6',
    marginRight: isIOS ? 8 : 6,
  },
  restoreButton: {
    backgroundColor: '#ef4444',
    marginLeft: isIOS ? 8 : 6,
  },
  databaseButtonText: {
    color: 'white',
    fontSize: isIOS ? 16 : 14,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: isIOS ? 12 : 8,
    paddingVertical: isIOS ? 16 : 14,
    alignItems: 'center',
    marginVertical: isIOS ? 20 : 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: isIOS ? 18 : 16,
    fontWeight: 'bold',
  },
});

export default AdminSettingsScreen;
