import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

const AdminLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('admin@eduai.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // Navigation will be handled by AuthContext
        Alert.alert('Success', 'Logged in as admin');
      } else {
        Alert.alert('Error', result.message || 'Invalid admin credentials');
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
        <Text style={styles.title}>Admin Portal</Text>
        <Text style={styles.subtitle}>Sign in to manage the system</Text>
        <Text style={styles.demoNote}>Demo: admin@eduai.com / admin123</Text>
      </View>

      <View style={styles.loginCard}>
        <Text style={styles.cardTitle}>Administrator Access</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter admin email"
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
          onPress={handleAdminLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing In...' : 'Sign In as Admin'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Student Login</Text>
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
});

export default AdminLoginScreen;
