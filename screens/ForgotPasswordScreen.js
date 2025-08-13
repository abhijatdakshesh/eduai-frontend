import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route?.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }
  }, [route?.params?.prefillEmail]);

  const submit = async () => {
    const emailToUse = email.trim();
    if (!emailToUse) {
      Alert.alert('Forgot Password', 'Please enter your email');
      return;
    }
    try {
      setLoading(true);
      const resp = await apiClient.forgotPassword(emailToUse);
      if (resp?.success) {
        Alert.alert(
          'Email sent',
          'If an account exists for this email, reset instructions have been sent.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', resp?.message || 'Unable to send reset email.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Unable to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <Text style={styles.headerSubtitle}>Enter your email to receive reset instructions</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="send"
          onSubmitEditing={submit}
        />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} disabled={loading} onPress={submit}>
          <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Email'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1a237e', paddingTop: isIOS ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: isIOS ? 28 : 24, marginBottom: 4 },
  headerSubtitle: { color: '#e3f2fd', fontSize: isIOS ? 16 : 14 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, margin: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  label: { color: '#374151', fontWeight: '600', marginBottom: 8, fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#f9fafb', fontSize: 16, color: '#111827' },
  button: { backgroundColor: '#1a237e', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontWeight: '700' },
  backLink: { alignItems: 'center', marginTop: 12 },
  backText: { color: '#6b7280', fontWeight: '600' },
});

export default ForgotPasswordScreen;


