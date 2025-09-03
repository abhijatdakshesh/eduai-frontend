import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BackHandler, Alert, Platform } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import consolidated configurations
import { theme } from './config/theme';
import {
  drawerNavigatorOptions,
  mainAppScreens,
  adminScreens,
  teacherScreens,
  parentScreens,
  authScreens,
  adminStackScreens,
} from './config/navigationConfig';

// Import LoadingScreen
import LoadingScreen from './components/LoadingScreen';

import AdminClassStudentsScreen from './screens/AdminClassStudentsScreen';
import AdminCourseEnrollmentsScreen from './screens/AdminCourseEnrollmentsScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Theme is now imported from config/theme.js

// Authentication Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      {authScreens.map((screen) => (
        <Stack.Screen 
          key={screen.name}
          name={screen.name} 
          component={screen.component} 
        />
      ))}
    </Stack.Navigator>
  );
};

// Main App Stack with Drawer Navigator
const MainAppStack = ({ route }) => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={drawerNavigatorOptions(theme)}
    >
      {mainAppScreens(theme).map((screen) => (
        <Drawer.Screen 
          key={screen.name}
          name={screen.name} 
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Drawer.Navigator>
  );
};

// Admin Stack Navigator
const AdminStack = () => {
  return (
    <Drawer.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={drawerNavigatorOptions(theme)}
    >
      {adminScreens(theme).map((screen) => (
        <Drawer.Screen 
          key={screen.name}
          name={screen.name} 
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Drawer.Navigator>
  );
};

// Teacher Drawer Navigator
const TeacherStack = () => {
  return (
    <Drawer.Navigator
      initialRouteName="TeacherDashboard"
      screenOptions={drawerNavigatorOptions(theme)}
    >
      {teacherScreens(theme).map((screen) => (
        <Drawer.Screen 
          key={screen.name}
          name={screen.name} 
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Drawer.Navigator>
  );
};

// Root Navigator Component
const RootNavigatorComponent = () => {
  const { isAuthenticated, loading, userRole } = useAuth();

  console.log('RootNavigator - isAuthenticated:', isAuthenticated, 'userRole:', userRole, 'loading:', loading);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      {isAuthenticated ? (
        userRole === 'admin' ? (
          <>
            <Stack.Screen name="AdminApp" component={AdminStack} />
            <Stack.Screen name="AdminClassStudents" component={AdminClassStudentsScreen} />
            <Stack.Screen name="AdminCourseEnrollments" component={AdminCourseEnrollmentsScreen} />
          </>
        ) : userRole === 'teacher' ? (
          <Stack.Screen name="TeacherApp" component={TeacherStack} />
        ) : userRole === 'parent' ? (
          <Stack.Screen name="ParentApp" component={ParentStack} />
        ) : (
          <Stack.Screen name="MainApp" component={MainAppStack} />
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};
// Parent Drawer Navigator
const ParentStack = () => {
  return (
    <Drawer.Navigator
      initialRouteName="ParentDashboard"
      screenOptions={drawerNavigatorOptions(theme)}
    >
      {parentScreens(theme).map((screen) => (
        <Drawer.Screen 
          key={screen.name}
          name={screen.name} 
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Drawer.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  return <RootNavigatorComponent />;
};

// Icon component is now defined in navigationConfig.js

export default function App() {
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Exit App', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'Yes', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    // Handle mobile back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Handle web browser back button and page unload
    const handleWebBack = (event) => {
      event.preventDefault();
      const confirmExit = window.confirm('Are you sure you want to leave this page?');
      if (confirmExit) {
        window.close();
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
  }, []);

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <PaperProvider theme={theme}>
          <NavigationContainer theme={theme}>
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

