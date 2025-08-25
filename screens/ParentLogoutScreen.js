import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const ParentLogoutScreen = ({ navigation }) => {
  const { logout } = useAuth();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await logout();
      } finally {
        // Use a more reliable navigation reset method
        try {
          const parent = navigation.getParent();
          const root = parent?.getParent();
          if (root) {
            root.reset({ index: 0, routes: [{ name: 'Auth' }] });
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
          }
        } catch (navError) {
          console.log('Navigation reset error:', navError);
          // Fallback: just navigate to Auth
          navigation.navigate('Auth');
        }
      }
    };
    doLogout();
  }, [navigation, logout]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Signing you out...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  text: { 
    color: '#1a237e',
    fontSize: 16,
    fontWeight: '500'
  },
});

export default ParentLogoutScreen;
