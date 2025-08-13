import { useEffect } from 'react';
import { BackHandler, Alert, Platform } from 'react-native';

// Hook for handling back button press
export const useBackButton = (navigation, showExitAlert = false) => {
  useEffect(() => {
    const backAction = () => {
      if (showExitAlert) {
        // Show exit confirmation for main screens
        Alert.alert('Exit App', 'Are you sure you want to exit the application?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'Yes', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      } else if (navigation && navigation.canGoBack()) {
        // Navigate back if possible
        navigation.goBack();
        return true;
      }
      return false;
    };

    // Handle mobile back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Handle web browser back button
    const handleWebBack = (event) => {
      if (showExitAlert) {
        event.preventDefault();
        const confirmExit = window.confirm('Are you sure you want to leave this page?');
        if (confirmExit) {
          window.close();
        }
        return;
      } else if (navigation && navigation.canGoBack()) {
        event.preventDefault();
        navigation.goBack();
        return;
      }
    };

    // Add web event listeners
    if (Platform.OS === 'web') {
      window.addEventListener('beforeunload', handleWebBack);
      window.addEventListener('popstate', handleWebBack);
    }

    return () => {
      backHandler.remove();
      if (Platform.OS === 'web') {
        window.removeEventListener('beforeunload', handleWebBack);
        window.removeEventListener('popstate', handleWebBack);
      }
    };
  }, [navigation, showExitAlert]);
};

// Hook for handling back button with custom action
export const useCustomBackButton = (customAction) => {
  useEffect(() => {
    const backAction = () => {
      if (customAction) {
        customAction();
        return true;
      }
      return false;
    };

    // Handle mobile back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Handle web browser back button
    const handleWebBack = (event) => {
      if (customAction) {
        event.preventDefault();
        customAction();
        return;
      }
    };

    // Add web event listeners
    if (Platform.OS === 'web') {
      window.addEventListener('beforeunload', handleWebBack);
      window.addEventListener('popstate', handleWebBack);
    }

    return () => {
      backHandler.remove();
      if (Platform.OS === 'web') {
        window.removeEventListener('beforeunload', handleWebBack);
        window.removeEventListener('popstate', handleWebBack);
      }
    };
  }, [customAction]);
};

// Hook for handling back button with confirmation dialog
export const useBackButtonWithConfirmation = (navigation, message = 'Are you sure you want to go back?') => {
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Confirm', message, [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { 
          text: 'Yes', 
          onPress: () => {
            if (navigation && navigation.canGoBack()) {
              navigation.goBack();
            }
          }
        },
      ]);
      return true;
    };

    // Handle mobile back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Handle web browser back button
    const handleWebBack = (event) => {
      event.preventDefault();
      const confirmBack = window.confirm(message);
      if (confirmBack && navigation && navigation.canGoBack()) {
        navigation.goBack();
      }
    };

    // Add web event listeners
    if (Platform.OS === 'web') {
      window.addEventListener('beforeunload', handleWebBack);
      window.addEventListener('popstate', handleWebBack);
    }

    return () => {
      backHandler.remove();
      if (Platform.OS === 'web') {
        window.removeEventListener('beforeunload', handleWebBack);
        window.removeEventListener('popstate', handleWebBack);
      }
    };
  }, [navigation, message]);
};
