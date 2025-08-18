import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, BackHandler, Alert, Platform } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import all screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import CoursesScreen from './screens/CoursesScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import JobPortalScreen from './screens/JobPortalScreen';
import FeesAndScholarshipScreen from './screens/FeesAndScholarshipScreen';
import HostelAndTransportationScreen from './screens/HostelAndTransportationScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import HRStaffManagementScreen from './screens/HRStaffManagementScreen';
import LogoutScreen from './screens/LogoutScreen';
import SimpleCoursesScreen from './screens/SimpleCoursesScreen';
import SimpleScheduleScreen from './screens/SimpleScheduleScreen';
import SimpleJobPortalScreen from './screens/SimpleJobPortalScreen';
import SimpleFinanceScreen from './screens/SimpleFinanceScreen';
import SimpleCampusServicesScreen from './screens/SimpleCampusServicesScreen';
import SimpleAIAssistantScreen from './screens/SimpleAIAssistantScreen';
import SimpleStaffDirectoryScreen from './screens/SimpleStaffDirectoryScreen';
import SimpleProfileScreen from './screens/SimpleProfileScreen';
import SimpleResultsPortalScreen from './screens/SimpleResultsPortalScreen';
import StudentAttendanceScreen from './screens/StudentAttendanceScreen';
import LoadingScreen from './components/LoadingScreen';

// Import Admin Screens
import AdminLoginScreen from './screens/AdminLoginScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminUserManagementScreen from './screens/AdminUserManagementScreen';
import AdminClassManagementScreen from './screens/AdminClassManagementScreen';
import AdminCourseManagementScreen from './screens/AdminCourseManagementScreen';
import AdminReportsScreen from './screens/AdminReportsScreen';
import AdminSettingsScreen from './screens/AdminSettingsScreen';
import AdminClassStudentsScreen from './screens/AdminClassStudentsScreen';
import AdminCourseEnrollmentsScreen from './screens/AdminCourseEnrollmentsScreen';
import AdminLogoutScreen from './screens/AdminLogoutScreen';
import AdminAttendanceAuditScreen from './screens/AdminAttendanceAuditScreen';
import TeacherLoginScreen from './screens/TeacherLoginScreen';
// Teacher Screens
import TeacherClassesScreen from './screens/TeacherClassesScreen';
import MarkAttendanceScreen from './screens/MarkAttendanceScreen';
import TeacherDashboardScreen from './screens/TeacherDashboardScreen';
import TeacherLogoutScreen from './screens/TeacherLogoutScreen';
import AttendanceSummaryScreen from './screens/AttendanceSummaryScreen';
import TeacherQRCheckInScreen from './screens/TeacherQRCheckInScreen';
import TeacherGradebookScreen from './screens/TeacherGradebookScreen';
import TeacherAnnouncementsScreen from './screens/TeacherAnnouncementsScreen';
// Parent Screens
import ParentLoginScreen from './screens/ParentLoginScreen';
import ParentDashboardScreen from './screens/ParentDashboardScreen';
import ParentChildrenScreen from './screens/ParentChildrenScreen';
import ParentAttendanceScreen from './screens/ParentAttendanceScreen';
import ParentResultsScreen from './screens/ParentResultsScreen';
import ParentFeesScreen from './screens/ParentFeesScreen';
import ParentAnnouncementsScreen from './screens/ParentAnnouncementsScreen';
import ParentMessageCenterScreen from './screens/ParentMessageCenterScreen';
import AdminBulkImportScreen from './screens/AdminBulkImportScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Beautiful dark blue and white theme
const theme = {
  colors: {
    primary: '#1a237e', // Dark blue
    primaryDark: '#0d47a1',
    primaryLight: '#534bae',
    accent: '#2962ff', // Bright blue accent
    background: '#f8fafc', // Light gray background
    surface: '#ffffff',
    text: '#1a237e', // Dark blue text
    textSecondary: '#546e7a', // Gray text
    error: '#d32f2f',
    success: '#388e3c',
    warning: '#f57c00',
    info: '#1976d2',
    divider: '#e3f2fd',
    card: '#ffffff',
    border: '#e8eaf6',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    bodySmall: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 12,
    },
    labelLarge: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 14,
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 12,
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 11,
      letterSpacing: 0.5,
    },
    bodyLarge: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 16,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 14,
    },
    titleLarge: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 22,
    },
    titleMedium: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 16,
    },
    titleSmall: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 14,
    },
    headlineLarge: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 32,
    },
    headlineMedium: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 28,
    },
    headlineSmall: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 24,
    },
  },
  roundness: 12,
};

// Authentication Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
      <Stack.Screen name="ParentLogin" component={ParentLoginScreen} />
    </Stack.Navigator>
  );
};

// Main App Stack with Drawer Navigator
const MainAppStack = ({ route }) => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -10,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 8,
          marginVertical: 2,
        },
        drawerActiveBackgroundColor: theme.colors.divider,
        sceneContainerStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Icon name="🏠" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Courses" 
        component={SimpleCoursesScreen}
        options={{
          title: 'Course Management',
          drawerIcon: ({ color, size }) => (
            <Icon name="📚" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Schedule" 
        component={SimpleScheduleScreen}
        options={{
          title: 'Class Schedule',
          drawerIcon: ({ color, size }) => (
            <Icon name="📅" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Results Portal" 
        component={SimpleResultsPortalScreen}
        options={{
          title: 'Academic Results',
          drawerIcon: ({ color, size }) => (
            <Icon name="📊" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="My Attendance" 
        component={StudentAttendanceScreen}
        options={{
          title: 'My Attendance',
          drawerIcon: ({ color, size }) => (
            <Icon name="🗓️" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Job Portal" 
        component={SimpleJobPortalScreen}
        options={{
          title: 'Career Portal',
          drawerIcon: ({ color, size }) => (
            <Icon name="💼" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Fees & Scholarships" 
        component={SimpleFinanceScreen}
        options={{
          title: 'Finance Center',
          drawerIcon: ({ color, size }) => (
            <Icon name="💰" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Hostel & Transport" 
        component={SimpleCampusServicesScreen}
        options={{
          title: 'Campus Services',
          drawerIcon: ({ color, size }) => (
            <Icon name="🏠" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Chatbot" 
        component={SimpleAIAssistantScreen}
        options={{
          title: 'AI Assistant',
          drawerIcon: ({ color, size }) => (
            <Icon name="🤖" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="HR & Staff" 
        component={SimpleStaffDirectoryScreen}
        options={{
          title: 'Staff Directory',
          drawerIcon: ({ color, size }) => (
            <Icon name="👥" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={SimpleProfileScreen}
        options={{
          title: 'My Profile',
          drawerIcon: ({ color, size }) => (
            <Icon name="👤" size={size} color={color} />
          ),
        }}
      />

    </Drawer.Navigator>
  );
};

// Admin Stack Navigator
const AdminStack = () => {
  return (
    <Drawer.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerStyle: {
          backgroundColor: '#ffffff',
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -10,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 8,
          marginVertical: 2,
        },
        drawerActiveBackgroundColor: theme.colors.divider,
        sceneContainerStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Drawer.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Icon name="📊" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AdminUserManagement" 
        component={AdminUserManagementScreen}
        options={{
          title: 'User Management',
          drawerIcon: ({ color, size }) => (
            <Icon name="👥" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AdminClassManagement" 
        component={AdminClassManagementScreen}
        options={{
          title: 'Class Management',
          drawerIcon: ({ color, size }) => (
            <Icon name="🏫" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AdminCourseManagement" 
        component={AdminCourseManagementScreen}
        options={{
          title: 'Course Management',
          drawerIcon: ({ color, size }) => (
            <Icon name="📚" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AdminReports" 
        component={AdminReportsScreen}
        options={{
          title: 'Reports & Analytics',
          drawerIcon: ({ color, size }) => (
            <Icon name="📈" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AdminAttendanceAudit"
        component={AdminAttendanceAuditScreen}
        options={{
          title: 'Attendance Audit',
          drawerIcon: ({ color, size }) => (
            <Icon name="🧾" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AdminSettings" 
        component={AdminSettingsScreen}
        options={{
          title: 'System Settings',
          drawerIcon: ({ color, size }) => (
            <Icon name="⚙️" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AdminLogout"
        component={AdminLogoutScreen}
        options={{
          title: 'Logout',
          drawerIcon: ({ color, size }) => (
            <Icon name="🚪" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AdminBulkImport"
        component={AdminBulkImportScreen}
        options={{
          title: 'Bulk Import',
          drawerIcon: ({ color, size }) => (
            <Icon name="📥" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Teacher Drawer Navigator
const TeacherStack = () => {
  return (
    <Drawer.Navigator
      initialRouteName="TeacherDashboard"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary, elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        headerTitleAlign: 'center',
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerStyle: { backgroundColor: '#ffffff', width: 280 },
        drawerLabelStyle: { fontSize: 16, fontWeight: '500', marginLeft: -10 },
        drawerItemStyle: { borderRadius: 8, marginHorizontal: 8, marginVertical: 2 },
        drawerActiveBackgroundColor: theme.colors.divider,
        sceneContainerStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Drawer.Screen name="TeacherDashboard" component={TeacherDashboardScreen} options={{ title: 'Dashboard', drawerIcon: ({ color, size }) => (<Icon name="📊" size={size} color={color} />), }} />
      <Drawer.Screen name="TeacherClasses" component={TeacherClassesScreen} options={{ title: 'My Classes', drawerIcon: ({ color, size }) => (<Icon name="🏫" size={size} color={color} />), }} />
      <Drawer.Screen name="TeacherMarkAttendance" component={MarkAttendanceScreen} options={{ title: 'Mark Attendance', drawerIcon: ({ color, size }) => (<Icon name="✅" size={size} color={color} />), }} />
      <Drawer.Screen name="TeacherSummary" component={AttendanceSummaryScreen} options={{ title: 'Summary', drawerIcon: ({ color, size }) => (<Icon name="🧾" size={size} color={color} />), }} />
      <Drawer.Screen name="TeacherQR" component={TeacherQRCheckInScreen} options={{ title: 'QR Check-In', drawerIcon: ({ color, size }) => (<Icon name="📷" size={size} color={color} />), }} />
      <Drawer.Screen name="TeacherGradebook" component={TeacherGradebookScreen} options={{ title: 'Gradebook', drawerIcon: ({ color, size }) => (<Icon name="🧮" size={size} color={color} />), }} />
      <Drawer.Screen name="TeacherAnnouncements" component={TeacherAnnouncementsScreen} options={{ title: 'Announcements', drawerIcon: ({ color, size }) => (<Icon name="📣" size={size} color={color} />), }} />
      <Drawer.Screen name="TeacherSchedule" component={SimpleScheduleScreen} options={{ title: 'Schedule', drawerIcon: ({ color, size }) => (<Icon name="📅" size={size} color={color} />), }} />
      <Drawer.Screen name="TeacherProfile" component={SimpleProfileScreen} options={{ title: 'Profile', drawerIcon: ({ color, size }) => (<Icon name="👤" size={size} color={color} />), }} />
      <Drawer.Screen name="TeacherLogout" component={TeacherLogoutScreen} options={{ title: 'Logout', drawerIcon: ({ color, size }) => (<Icon name="🚪" size={size} color={color} />), }} />
    </Drawer.Navigator>
  );
};

// Root Navigator Component
const RootNavigatorComponent = () => {
  const { isAuthenticated, loading, userRole } = useAuth();

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
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary, elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        headerTitleAlign: 'center',
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerStyle: { backgroundColor: '#ffffff', width: 280 },
        drawerLabelStyle: { fontSize: 16, fontWeight: '500', marginLeft: -10 },
        drawerItemStyle: { borderRadius: 8, marginHorizontal: 8, marginVertical: 2 },
        drawerActiveBackgroundColor: theme.colors.divider,
        sceneContainerStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Drawer.Screen name="ParentDashboard" component={ParentDashboardScreen} options={{ title: 'Dashboard', drawerIcon: ({ color, size }) => (<Icon name="📊" size={size} color={color} />), }} />
      <Drawer.Screen name="ParentChildren" component={ParentChildrenScreen} options={{ title: 'My Children', drawerIcon: ({ color, size }) => (<Icon name="👨‍👩‍👧‍👦" size={size} color={color} />), }} />
      <Drawer.Screen name="ParentAttendance" component={ParentAttendanceScreen} options={{ title: 'Attendance', drawerIcon: ({ color, size }) => (<Icon name="🗓️" size={size} color={color} />), }} />
      <Drawer.Screen name="ParentResults" component={ParentResultsScreen} options={{ title: 'Results', drawerIcon: ({ color, size }) => (<Icon name="📈" size={size} color={color} />), }} />
      <Drawer.Screen name="ParentFees" component={ParentFeesScreen} options={{ title: 'Fees', drawerIcon: ({ color, size }) => (<Icon name="💳" size={size} color={color} />), }} />
      <Drawer.Screen name="ParentAnnouncements" component={ParentAnnouncementsScreen} options={{ title: 'Announcements', drawerIcon: ({ color, size }) => (<Icon name="📣" size={size} color={color} />), }} />
      <Drawer.Screen name="ParentMessages" component={ParentMessageCenterScreen} options={{ title: 'Messages', drawerIcon: ({ color, size }) => (<Icon name="✉️" size={size} color={color} />), }} />
    </Drawer.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  return <RootNavigatorComponent />;
};

// Beautiful Icon component with gradient effect
const Icon = ({ name, size, color }) => {
  return (
    <Text style={{ 
      fontSize: size, 
      color: color,
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    }}>
      {name}
    </Text>
  );
};

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

