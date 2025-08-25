import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const UnifiedLoginScreen = ({ 
  navigation, 
  userType = 'student',
  title = 'Welcome Back',
  subtitle = 'Sign in to continue',
  cardTitle = 'Sign In',
  buttonText = 'Sign In',
  quickFillOptions = [],
  showBackButton = false,
  onBackPress = null
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef(null);

  const userTypeConfig = {
    student: {
      title: 'Student Portal',
      subtitle: 'Sign in to access your courses',
      cardTitle: 'Student Access',
      buttonText: 'Sign In as Student',
      quickFill: [
        { label: 'Student', email: 'student@eduai.com', password: 'password123' },
        { label: 'Admin', email: 'admin@eduai.com', password: 'password123' },
        { label: 'Teacher', email: 'teacher@eduai.com', password: 'password123' }
      ]
    },
    admin: {
      title: 'Admin Portal',
      subtitle: 'Sign in to manage the system',
      cardTitle: 'Administrator Access',
      buttonText: 'Sign In as Admin',
      quickFill: [
        { label: 'Admin', email: 'admin@eduai.com', password: 'password123' },
        { label: 'Teacher', email: 'teacher@eduai.com', password: 'password123' },
        { label: 'Student', email: 'student@eduai.com', password: 'password123' }
      ]
    },
    teacher: {
      title: 'Teacher Portal',
      subtitle: 'Sign in to manage your classes',
      cardTitle: 'Teacher Access',
      buttonText: 'Sign In as Teacher',
      quickFill: [
        { label: 'Teacher', email: 'teacher@eduai.com', password: 'password123' },
        { label: 'Admin', email: 'admin@eduai.com', password: 'password123' },
        { label: 'Student', email: 'student@eduai.com', password: 'password123' }
      ]
    },
    parent: {
      title: 'Parent Portal',
      subtitle: 'Sign in to view your child\'s progress',
      cardTitle: 'Parent Access',
      buttonText: 'Sign In as Parent',
      quickFill: [
        { label: 'Parent', email: 'parent@eduai.com', password: 'password123' }
      ]
    }
  };

  const config = userTypeConfig[userType] || userTypeConfig.student;

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        Alert.alert('Success', result.message || `Successfully logged in as ${userType}`);
        // Navigation will be handled automatically by the AuthContext
      } else {
        Alert.alert('Error', result.message || `Invalid ${userType} credentials`);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>{config.cardTitle}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => {
                if (passwordInputRef.current) {
                  passwordInputRef.current.focus();
                }
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing In...' : config.buttonText}
            </Text>
          </TouchableOpacity>

          {/* Quick fill credentials */}
          {config.quickFill && config.quickFill.length > 0 && (
            <View style={styles.quickFillRow}>
              <Text style={styles.quickFillLabel}>Quick fill:</Text>
              {config.quickFill.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickFillChip}
                  onPress={() => handleQuickFill(option.email, option.password)}
                >
                  <Text style={styles.quickFillChipText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Back button */}
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={onBackPress || (() => navigation.goBack())}
            >
              <Text style={styles.backButtonText}>← Back to Main Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: isIOS ? 32 : 28,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isIOS ? 16 : 14,
    color: '#666',
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: isIOS ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    fontSize: isIOS ? 16 : 14,
    color: '#1a237e',
  },
  loginButton: {
    backgroundColor: '#1a237e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1a237e',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: isIOS ? 18 : 16,
  },
  quickFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
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
    marginVertical: 2,
  },
  quickFillChipText: {
    color: '#1a237e',
    fontSize: 12,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  backButtonText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: isIOS ? 16 : 14,
  },
});

export default UnifiedLoginScreen;
