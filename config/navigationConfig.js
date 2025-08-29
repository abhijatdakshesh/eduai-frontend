import React from 'react';
import { Text } from 'react-native';

// Import all screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import JobPortalScreen from '../screens/JobPortalScreen';
import FeesAndScholarshipScreen from '../screens/FeesAndScholarshipScreen';
import HostelAndTransportationScreen from '../screens/HostelAndTransportationScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import HRStaffManagementScreen from '../screens/HRStaffManagementScreen';
import LogoutScreen from '../screens/LogoutScreen';
import ParentLogoutScreen from '../screens/ParentLogoutScreen';
import SimpleCoursesScreen from '../screens/SimpleCoursesScreen';
import SimpleScheduleScreen from '../screens/SimpleScheduleScreen';
import SimpleJobPortalScreen from '../screens/SimpleJobPortalScreen';
import SimpleFinanceScreen from '../screens/SimpleFinanceScreen';
import SimpleCampusServicesScreen from '../screens/SimpleCampusServicesScreen';
import SimpleAIAssistantScreen from '../screens/SimpleAIAssistantScreen';
import SimpleStaffDirectoryScreen from '../screens/SimpleStaffDirectoryScreen';
import SimpleProfileScreen from '../screens/SimpleProfileScreen';
import SimpleResultsPortalScreen from '../screens/SimpleResultsPortalScreen';
import StudentAttendanceScreen from '../screens/StudentAttendanceScreen';
import StudentAnnouncementsListScreen from '../screens/StudentAnnouncementsListScreen';
import StudentAnnouncementDetailScreen from '../screens/StudentAnnouncementDetailScreen';

// Import Admin Screens
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUserManagementScreen from '../screens/AdminUserManagementScreen';
import AdminClassManagementScreen from '../screens/AdminClassManagementScreen';
import AdminCourseManagementScreen from '../screens/AdminCourseManagementScreen';
import AdminReportsScreen from '../screens/AdminReportsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import AdminClassStudentsScreen from '../screens/AdminClassStudentsScreen';
import AdminCourseEnrollmentsScreen from '../screens/AdminCourseEnrollmentsScreen';
import AdminLogoutScreen from '../screens/AdminLogoutScreen';
import AdminAttendanceAuditScreen from '../screens/AdminAttendanceAuditScreen';
import TeacherLoginScreen from '../screens/TeacherLoginScreen';

// Teacher Screens
import TeacherClassesScreen from '../screens/TeacherClassesScreen';
import MarkAttendanceScreen from '../screens/MarkAttendanceScreen';
import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';
import TeacherLogoutScreen from '../screens/TeacherLogoutScreen';
import AttendanceSummaryScreen from '../screens/AttendanceSummaryScreen';
import TeacherQRCheckInScreen from '../screens/TeacherQRCheckInScreen';
import TeacherGradebookScreen from '../screens/TeacherGradebookScreen';
import TeacherUploadResultsScreen from '../screens/TeacherUploadResultsScreen';
import TeacherAnnouncementsScreen from '../screens/TeacherAnnouncementsScreen';

// Parent Screens
import ParentLoginScreen from '../screens/ParentLoginScreen';
import ParentDashboardScreen from '../screens/ParentDashboardScreen';
import ParentChildrenScreen from '../screens/ParentChildrenScreen';
import ParentAttendanceScreen from '../screens/ParentAttendanceScreen';
import ParentResultsScreen from '../screens/ParentResultsScreen';
import ParentFeesScreen from '../screens/ParentFeesScreen';
import ParentAnnouncementsScreen from '../screens/ParentAnnouncementsScreen';
import ParentAnnouncementsListScreen from '../screens/ParentAnnouncementsListScreen';
import ParentAnnouncementDetailScreen from '../screens/ParentAnnouncementDetailScreen';
import ParentMessageCenterScreen from '../screens/ParentMessageCenterScreen';
import AdminBulkImportScreen from '../screens/AdminBulkImportScreen';

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

// Common drawer screen options
const createDrawerScreenOptions = (title, icon, theme) => ({
  title,
  drawerIcon: ({ color, size }) => <Icon name={icon} size={size} color={color} />,
});

// Common drawer navigator options
export const drawerNavigatorOptions = (theme) => ({
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
});

// Student/Main App Navigation Configuration
export const mainAppScreens = (theme) => [
  {
    name: 'Home',
    component: HomeScreen,
    options: createDrawerScreenOptions('Dashboard', '🏠', theme),
  },
  {
    name: 'Courses',
    component: SimpleCoursesScreen,
    options: createDrawerScreenOptions('Course Management', '📚', theme),
  },
  {
    name: 'Schedule',
    component: SimpleScheduleScreen,
    options: createDrawerScreenOptions('Class Schedule', '📅', theme),
  },
  {
    name: 'Results Portal',
    component: SimpleResultsPortalScreen,
    options: createDrawerScreenOptions('Academic Results', '📊', theme),
  },
  {
    name: 'My Attendance',
    component: StudentAttendanceScreen,
    options: createDrawerScreenOptions('My Attendance', '🗓️', theme),
  },
  {
    name: 'Job Portal',
    component: SimpleJobPortalScreen,
    options: createDrawerScreenOptions('Career Portal', '💼', theme),
  },
  {
    name: 'Fees & Scholarships',
    component: SimpleFinanceScreen,
    options: createDrawerScreenOptions('Finance Center', '💰', theme),
  },
  {
    name: 'Hostel & Transport',
    component: SimpleCampusServicesScreen,
    options: createDrawerScreenOptions('Campus Services', '🏠', theme),
  },
  {
    name: 'Chatbot',
    component: SimpleAIAssistantScreen,
    options: createDrawerScreenOptions('AI Assistant', '🤖', theme),
  },
  {
    name: 'Announcements',
    component: StudentAnnouncementsListScreen,
    options: createDrawerScreenOptions('Announcements', '📣', theme),
  },
  {
    name: 'HR & Staff',
    component: SimpleStaffDirectoryScreen,
    options: createDrawerScreenOptions('Staff Directory', '👥', theme),
  },
  {
    name: 'Profile',
    component: SimpleProfileScreen,
    options: createDrawerScreenOptions('My Profile', '👤', theme),
  },
];

// Admin Navigation Configuration
export const adminScreens = (theme) => [
  {
    name: 'AdminDashboard',
    component: AdminDashboardScreen,
    options: createDrawerScreenOptions('Dashboard', '📊', theme),
  },
  {
    name: 'AdminUserManagement',
    component: AdminUserManagementScreen,
    options: createDrawerScreenOptions('User Management', '👥', theme),
  },
  {
    name: 'AdminClassManagement',
    component: AdminClassManagementScreen,
    options: createDrawerScreenOptions('Class Management', '🏫', theme),
  },
  {
    name: 'AdminCourseManagement',
    component: AdminCourseManagementScreen,
    options: createDrawerScreenOptions('Course Management', '📚', theme),
  },
  {
    name: 'AdminReports',
    component: AdminReportsScreen,
    options: createDrawerScreenOptions('Reports & Analytics', '📈', theme),
  },
  {
    name: 'AdminAttendanceAudit',
    component: AdminAttendanceAuditScreen,
    options: createDrawerScreenOptions('Attendance Audit', '🧾', theme),
  },
  {
    name: 'AdminSettings',
    component: AdminSettingsScreen,
    options: createDrawerScreenOptions('System Settings', '⚙️', theme),
  },
  {
    name: 'AdminBulkImport',
    component: AdminBulkImportScreen,
    options: createDrawerScreenOptions('Bulk Import', '📥', theme),
  },
  {
    name: 'AdminLogout',
    component: AdminLogoutScreen,
    options: createDrawerScreenOptions('Logout', '🚪', theme),
  },
];

// Teacher Navigation Configuration
export const teacherScreens = (theme) => [
  {
    name: 'TeacherDashboard',
    component: TeacherDashboardScreen,
    options: createDrawerScreenOptions('Dashboard', '📊', theme),
  },
  {
    name: 'TeacherClasses',
    component: TeacherClassesScreen,
    options: createDrawerScreenOptions('My Classes', '🏫', theme),
  },
  {
    name: 'TeacherMarkAttendance',
    component: MarkAttendanceScreen,
    options: createDrawerScreenOptions('Mark Attendance', '✅', theme),
  },
  {
    name: 'TeacherSummary',
    component: AttendanceSummaryScreen,
    options: createDrawerScreenOptions('Summary', '🧾', theme),
  },
  {
    name: 'TeacherUploadResults',
    component: TeacherUploadResultsScreen,
    options: createDrawerScreenOptions('Upload Results', '📊', theme),
  },
  {
    name: 'TeacherAnnouncements',
    component: TeacherAnnouncementsScreen,
    options: createDrawerScreenOptions('Announcements', '📣', theme),
  },
  {
    name: 'TeacherSchedule',
    component: SimpleScheduleScreen,
    options: createDrawerScreenOptions('Schedule', '📅', theme),
  },
  {
    name: 'TeacherProfile',
    component: SimpleProfileScreen,
    options: createDrawerScreenOptions('Profile', '👤', theme),
  },
  {
    name: 'TeacherLogout',
    component: TeacherLogoutScreen,
    options: createDrawerScreenOptions('Logout', '🚪', theme),
  },
];

// Parent Navigation Configuration
export const parentScreens = (theme) => [
  {
    name: 'ParentDashboard',
    component: ParentDashboardScreen,
    options: createDrawerScreenOptions('Dashboard', '📊', theme),
  },
  {
    name: 'ParentChildren',
    component: ParentChildrenScreen,
    options: createDrawerScreenOptions('My Children', '👨‍👩‍👧‍👦', theme),
  },
  {
    name: 'ParentAttendance',
    component: ParentAttendanceScreen,
    options: createDrawerScreenOptions('Attendance', '🗓️', theme),
  },
  {
    name: 'ParentResults',
    component: ParentResultsScreen,
    options: createDrawerScreenOptions('Results', '📈', theme),
  },
  {
    name: 'ParentFees',
    component: ParentFeesScreen,
    options: createDrawerScreenOptions('Fees', '💳', theme),
  },
  {
    name: 'ParentAnnouncements',
    component: ParentAnnouncementsListScreen,
    options: createDrawerScreenOptions('Announcements', '📣', theme),
  },
  {
    name: 'ParentMessages',
    component: ParentMessageCenterScreen,
    options: createDrawerScreenOptions('Messages', '✉️', theme),
  },
  {
    name: 'ParentLogout',
    component: ParentLogoutScreen,
    options: createDrawerScreenOptions('Logout', '🚪', theme),
  },
];

// Authentication Stack Configuration
export const authScreens = [
  {
    name: 'Welcome',
    component: WelcomeScreen,
  },
  {
    name: 'Login',
    component: LoginScreen,
  },
  {
    name: 'Signup',
    component: SignupScreen,
  },
  {
    name: 'ForgotPassword',
    component: ForgotPasswordScreen,
  },
  {
    name: 'AdminLogin',
    component: AdminLoginScreen,
  },
  {
    name: 'TeacherLogin',
    component: TeacherLoginScreen,
  },
  {
    name: 'ParentLogin',
    component: ParentLoginScreen,
  },
];

// Admin Stack Screens (for nested navigation)
export const adminStackScreens = [
  {
    name: 'AdminClassStudents',
    component: AdminClassStudentsScreen,
  },
  {
    name: 'AdminCourseEnrollments',
    component: AdminCourseEnrollmentsScreen,
  },
];

export default {
  drawerNavigatorOptions,
  mainAppScreens,
  adminScreens,
  teacherScreens,
  parentScreens,
  authScreens,
  adminStackScreens,
};
