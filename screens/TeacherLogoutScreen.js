import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const TeacherLogoutScreen = ({ navigation }) => {
  const { logout } = useAuth();

  useEffect(() => {
    const doLogout = async () => {
      try { await logout(); } finally {
        const parent = navigation.getParent();
        const root = parent?.getParent();
        (root || navigation).reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    };
    doLogout();
  }, [navigation, logout]);

  return (
    <View style={styles.container}><Text style={styles.text}>Signing you out...</Text></View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#1a237e' },
});

export default TeacherLogoutScreen;


