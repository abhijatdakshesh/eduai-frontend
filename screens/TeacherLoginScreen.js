import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const TeacherLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleTeacherLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        Alert.alert('Error', result.message || 'Invalid teacher credentials');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Teacher Portal</Text>
        <Text style={styles.subtitle}>Sign in to manage your classes</Text>
      </View>

      <View style={styles.loginCard}>
        <Text style={styles.cardTitle}>Teacher Access</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter teacher email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleTeacherLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>{loading ? 'Signing In...' : 'Sign In as Teacher'}</Text>
        </TouchableOpacity>

        {/* Quick fill credentials */}
        <View style={styles.quickFillRow}>
          <Text style={styles.quickFillLabel}>Quick fill:</Text>
          <TouchableOpacity
            style={styles.quickFillChip}
            onPress={() => { setEmail('teacher@eduai.com'); setPassword('password123'); }}
          >
            <Text style={styles.quickFillChipText}>Teacher</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickFillChip}
            onPress={() => { setEmail('admin@eduai.com'); setPassword('password123'); }}
          >
            <Text style={styles.quickFillChipText}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickFillChip}
            onPress={() => { setEmail('student@eduai.com'); setPassword('password123'); }}
          >
            <Text style={styles.quickFillChipText}>Student</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Main Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 32 : 28,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    color: '#666',
  },
  demoNote: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 12,
    fontStyle: 'italic',
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'ios' ? 16 : 12,
    padding: Platform.OS === 'ios' ? 32 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: Platform.OS === 'ios' ? 24 : 20,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: Platform.OS === 'ios' ? 24 : 20,
  },
  inputLabel: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: Platform.OS === 'ios' ? 16 : 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    backgroundColor: '#f9fafb',
  },
  loginButton: {
    backgroundColor: '#1a237e',
    borderRadius: Platform.OS === 'ios' ? 12 : 8,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '500',
  },
  quickFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickFillLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginRight: 8,
  },
  quickFillChip: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginHorizontal: 4,
  },
  quickFillChipText: {
    color: '#1a237e',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TeacherLoginScreen;


