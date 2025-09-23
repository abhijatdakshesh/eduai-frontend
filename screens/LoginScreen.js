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

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef(null);

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
        Alert.alert('Success', result.message);
        // Navigation will be handled automatically by the AuthContext
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.pageContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          {/* Removed demo credentials */}
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus on password field when Enter is pressed
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
              autoComplete="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
          </View>

          {/* Quick Fill */}
          <View style={styles.quickFillRow}>
            <Text style={styles.quickFillLabel}>Quick fill:</Text>
            <TouchableOpacity
              style={styles.quickFillChip}
              onPress={() => {
                setEmail('student@eduai.com');
                setPassword('password123');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickFillChipText}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFillChip}
              onPress={() => {
                setEmail('cse.student@eduai.com');
                setPassword('password123');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickFillChipText}>CSE Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFillChip}
              onPress={() => {
                setEmail('ise.student@eduai.com');
                setPassword('password123');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickFillChipText}>ISE Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFillChip}
              onPress={() => {
                setEmail('teacher@eduai.com');
                setPassword('password123');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickFillChipText}>Teacher</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFillChip}
              onPress={() => {
                setEmail('cse.teacher@eduai.com');
                setPassword('password123');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickFillChipText}>CSE Teacher</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFillChip}
              onPress={() => {
                setEmail('ise.teacher@eduai.com');
                setPassword('password123');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickFillChipText}>ISE Teacher</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFillChip}
              onPress={() => {
                setEmail('parent@eduai.com');
                setPassword('ParentPass123!');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickFillChipText}>Parent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickFillChip}
              onPress={() => {
                setEmail('admin@eduai.com');
                setPassword('password123');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickFillChipText}>Admin</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>



          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword', { prefillEmail: email.trim() })}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>



          {/* Admin Login */}
          <TouchableOpacity 
            style={styles.adminLogin}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={styles.adminLoginText}>Admin Login</Text>
          </TouchableOpacity>
          {/* Teacher Login */}
          <TouchableOpacity 
            style={styles.adminLogin}
            onPress={() => navigation.navigate('TeacherLogin')}
          >
            <Text style={styles.adminLoginText}>Teacher Login</Text>
          </TouchableOpacity>
          {/* Parent Login */}
          <TouchableOpacity 
            style={styles.adminLogin}
            onPress={() => navigation.navigate('ParentLogin')}
          >
            <Text style={styles.adminLoginText}>Parent Login</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Signup')}
            activeOpacity={0.7}
          >
            <Text style={styles.signupText}>
              Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          {/* Back to Welcome Button */}
          <TouchableOpacity
            style={styles.backToWelcomeButton}
            onPress={() => navigation.navigate('Welcome')}
            activeOpacity={0.7}
          >
            <Text style={styles.backToWelcomeText}>
              ← Back to Welcome
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faff',
    ...(Platform.OS === 'web' ? { overflow: 'auto', minHeight: '100vh' } : {}),
  },
  pageContainer: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    ...(Platform.OS === 'web' ? { minHeight: '100vh', justifyContent: 'center' } : {}),
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  demoNote: {
    fontSize: 12,
    color: '#10b981',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fafbfc',
    color: '#1a1a1a',
    fontWeight: '400',
  },
  loginButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#4f46e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSection: {
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '60%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e5e9',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  signupButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  signupText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
  },
  signupTextBold: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  backToWelcomeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
  },
  backToWelcomeText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  adminLogin: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  adminLoginText: {
    color: '#1a237e',
    fontSize: 14,
    fontWeight: '500',
  },
  quickFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
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
    marginHorizontal: 6,
    marginVertical: 6,
  },
  quickFillChipText: {
    color: '#1a237e',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LoginScreen;