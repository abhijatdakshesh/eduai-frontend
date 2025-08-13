import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const WebBackButton = ({ navigation, onPress, style, textStyle, showText = true }) => {
  // Only show on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity style={[styles.webBackButton, style]} onPress={handlePress}>
      <MaterialIcons name="arrow-back" size={24} color="#1a237e" />
      {showText && <Text style={[styles.webBackText, textStyle]}>Back</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  webBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#e3f2fd',
      borderColor: '#1a237e',
    },
  },
  webBackText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a237e',
  },
});

export default WebBackButton;
