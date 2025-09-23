import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const SignupScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    user_type: 'student',
    terms_accepted: false,
    privacy_policy_accepted: false,
  });
  const [loading, setLoading] = useState(false);
  
  // Create refs for form navigation
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const phoneRef = useRef(null);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    
    if (!formData.first_name.trim()) {
      console.log('❌ First name validation failed');
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    if (!formData.last_name.trim()) {
      console.log('❌ Last name validation failed');
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }
    if (!formData.email.trim()) {
      console.log('❌ Email validation failed - empty');
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!validateEmail(formData.email.trim())) {
      console.log('❌ Email validation failed - invalid format');
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password.trim()) {
      console.log('❌ Password validation failed - empty');
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (!validatePassword(formData.password)) {
      console.log('❌ Password validation failed - weak password');
      Alert.alert('Error', 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Password confirmation failed');
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!formData.phone.trim()) {
      console.log('❌ Phone validation failed');
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.terms_accepted) {
      console.log('❌ Terms acceptance validation failed');
      Alert.alert('Error', 'Please accept the terms and conditions');
      return false;
    }
    if (!formData.privacy_policy_accepted) {
      console.log('❌ Privacy policy acceptance validation failed');
      Alert.alert('Error', 'Please accept the privacy policy');
      return false;
    }
    
    console.log('✅ All validations passed');
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
        phone: formData.phone.trim(),
        user_type: formData.user_type,
        terms_accepted: formData.terms_accepted,
        privacy_policy_accepted: formData.privacy_policy_accepted,
      };

      console.log('📤 Sending user data:', { ...userData, password: '[HIDDEN]', confirm_password: '[HIDDEN]' });
      const result = await register(userData);
      console.log('📡 Registration result:', result);
      
      if (result.success) {
        console.log('✅ Registration successful');
        Alert.alert('Success', result.message);
        setTimeout(() => {
          navigation.replace('MainApp');
        }, 1000);
      } else {
        console.log('❌ Registration failed:', result.message);
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.log('💥 Registration error:', error);
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
      console.log('🏁 Registration attempt completed');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>First Name:</Text>
          <TextInput
            style={styles.input}
            value={formData.first_name}
            onChangeText={(text) => updateFormData('first_name', text)}
            placeholder="Enter your first name"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
          />

          <Text style={styles.label}>Last Name:</Text>
          <TextInput
            ref={lastNameRef}
            style={styles.input}
            value={formData.last_name}
            onChangeText={(text) => updateFormData('last_name', text)}
            placeholder="Enter your last name"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <Text style={styles.label}>Email:</Text>
          <TextInput
            ref={emailRef}
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text style={styles.label}>Password:</Text>
          <TextInput
            ref={passwordRef}
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            placeholder="Enter your password"
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />

          <Text style={styles.label}>Confirm Password:</Text>
          <TextInput
            ref={confirmPasswordRef}
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text) => updateFormData('confirmPassword', text)}
            placeholder="Confirm your password"
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />

          <Text style={styles.label}>Phone Number:</Text>
          <TextInput
            ref={phoneRef}
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={handleSignup}
          />

          <Text style={styles.label}>User Type:</Text>
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                formData.user_type === 'student' && styles.userTypeButtonActive
              ]}
              onPress={() => updateFormData('user_type', 'student')}
            >
              <Text style={[
                styles.userTypeText,
                formData.user_type === 'student' && styles.userTypeTextActive
              ]}>
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                formData.user_type === 'faculty' && styles.userTypeButtonActive
              ]}
              onPress={() => updateFormData('user_type', 'faculty')}
            >
              <Text style={[
                styles.userTypeText,
                formData.user_type === 'faculty' && styles.userTypeTextActive
              ]}>
                Faculty
              </Text>
            </TouchableOpacity>
                </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateFormData('terms_accepted', !formData.terms_accepted)}
            >
              <View style={[styles.checkbox, formData.terms_accepted && styles.checkboxChecked]}>
                {formData.terms_accepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
              <Text style={styles.checkboxText}>
                I accept the Terms and Conditions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateFormData('privacy_policy_accepted', !formData.privacy_policy_accepted)}
            >
              <View style={[styles.checkbox, formData.privacy_policy_accepted && styles.checkboxChecked]}>
                {formData.privacy_policy_accepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                I accept the Privacy Policy
                    </Text>
            </TouchableOpacity>
                  </View>
                  
                    <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSignup}
                  disabled={loading}
                >
            <Text style={styles.buttonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>Already have an account? Sign In</Text>
          </TouchableOpacity>

          {/* Back to Welcome Button */}
          <TouchableOpacity
            style={styles.backToWelcomeButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.backToWelcomeText}>← Back to Welcome</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    ...(typeof document !== 'undefined' ? { overflow: 'auto', minHeight: '100vh' } : {}),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    paddingTop: 16,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    ...(typeof document !== 'undefined' ? { minHeight: '100vh' } : {}),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1a237e',
  },
  form: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  userTypeButtonActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  userTypeText: {
    fontSize: 13,
    color: '#666',
  },
  userTypeTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1a237e',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
  },
  loginText: {
    color: '#1a237e',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  backToWelcomeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
  },
  backToWelcomeText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  checkboxContainer: {
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1a237e',
    borderRadius: 3,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1a237e',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },

});

export default SignupScreen; 