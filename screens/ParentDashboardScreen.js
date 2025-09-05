import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  Alert, 
  FlatList, 
  ScrollView, 
  RefreshControl, 
  Dimensions,
  StatusBar,
  Image
} from 'react-native';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const isIOS = Platform.OS === 'ios';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const ParentDashboardScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ 
    childrenCount: 0, 
    unreadAnnouncements: 0, 
    unpaidInvoices: 0, 
    upcomingEvents: 0 
  });
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [dash, kids, anns] = await Promise.all([
        apiClient.getParentDashboard(),
        apiClient.getParentChildren(),
        apiClient.getParentAnnouncements({ limit: 5 }),
      ]);
      if (kids?.success) setChildren(kids.data?.children || []);
      if (anns?.success) setAnnouncements(anns.data?.announcements || []);
      // Normalize stats from dashboard response with safe fallbacks
      if (dash?.success) {
        const raw = dash.data?.stats || dash.data || {};
        const pickNum = (k, alt) => Number(raw?.[k] ?? raw?.[alt] ?? 0) || 0;
        setStats({
          childrenCount: pickNum('children', 'childrenCount') || (kids?.data?.children?.length || 0),
          unreadAnnouncements: pickNum('unreadAnnouncements', 'unread_announcements'),
          unpaidInvoices: pickNum('unpaidInvoices', 'unpaid_invoices'),
          upcomingEvents: pickNum('upcomingEvents', 'upcoming_events'),
        });
      } else {
        setStats((prev) => ({ ...prev, childrenCount: kids?.data?.children?.length || 0 }));
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const openChild = (child) => {
    navigation.navigate('ParentChildren', { focusId: child.id });
  };

  const handleLogout = async () => {
    console.log('Parent Dashboard: Logout button pressed!');
    
    // Use browser's native confirm for web compatibility
    const confirmed = window.confirm('Are you sure you want to logout?');
    
    if (confirmed) {
      try {
        console.log('Parent Dashboard: Starting logout process');
        
        // Call logout function
        const logoutResult = await logout();
        console.log('Parent Dashboard: Logout result:', logoutResult);
        
        // Add a small delay to ensure state updates
        setTimeout(() => {
          console.log('Parent Dashboard: Attempting navigation reset after delay');
          
          // Force navigation reset with multiple fallback approaches
          try {
            // Method 1: Try to get root navigator and reset
            const parent = navigation.getParent();
            const root = parent?.getParent();
            
            console.log('Parent Dashboard: Navigation hierarchy - parent:', !!parent, 'root:', !!root);
            
            if (root) {
              console.log('Parent Dashboard: Resetting via root navigator');
              root.reset({ index: 0, routes: [{ name: 'Auth' }] });
            } else if (parent) {
              console.log('Parent Dashboard: Resetting via parent navigator');
              parent.reset({ index: 0, routes: [{ name: 'Auth' }] });
            } else {
              console.log('Parent Dashboard: Resetting via current navigator');
              navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
            }
          } catch (navError) {
            console.log('Parent Dashboard: Navigation reset failed:', navError);
            // Fallback: Navigate to ParentLogout screen
            try {
              navigation.navigate('ParentLogout');
            } catch (navError2) {
              console.log('Parent Dashboard: All navigation methods failed:', navError2);
              window.alert('Navigation failed. Please restart the app.');
            }
          }
        }, 100);
        
      } catch (error) {
        console.error('Parent Dashboard: Logout error:', error);
        window.alert('Logout failed. Please try again.');
      }
    } else {
      console.log('Parent Dashboard: Logout cancelled by user');
    }
  };

  const StatCard = ({ number, label, color, icon, onPress }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Text style={[styles.statIconText, { color }]}>{icon}</Text>
        </View>
        <View style={styles.statTextContainer}>
          <Text style={styles.statNumber}>{number}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ChildCard = ({ child }) => (
    <TouchableOpacity 
      style={styles.childCard}
      onPress={() => openChild(child)}
      activeOpacity={0.9}
    >
      <View style={styles.childHeader}>
        <View style={styles.childAvatar}>
          <Text style={styles.childAvatarText}>
            {child.first_name?.[0]}{child.last_name?.[0]}
          </Text>
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{child.first_name} {child.last_name}</Text>
          <Text style={styles.childGrade}>{child.grade_level || 'Grade N/A'}</Text>
        </View>
      </View>
      
      <View style={styles.childActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionPrimary]}
          onPress={() => navigation.navigate('ParentAttendance', { 
            studentId: child.id, 
            childName: child.first_name 
          })}
        >
          <Text style={styles.actionButtonText}>Attendance</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionSecondary]}
          onPress={() => navigation.navigate('ParentResults', { 
            studentId: child.id, 
            childName: child.first_name 
          })}
        >
          <Text style={styles.actionButtonText}>Results</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionTertiary]}
          onPress={() => navigation.navigate('ParentFees', { 
            studentId: child.id, 
            childName: child.first_name 
          })}
        >
          <Text style={styles.actionButtonText}>Fees</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const AnnouncementCard = ({ announcement }) => (
    <TouchableOpacity 
      style={styles.announcementCard}
      activeOpacity={0.8}
    >
      <View style={styles.announcementHeader}>
        <View style={styles.announcementIcon}>
          <Text style={styles.announcementIconText}>📢</Text>
        </View>
        <View style={styles.announcementMeta}>
          <Text style={styles.announcementTitle} numberOfLines={1}>
            {announcement.title}
          </Text>
          <Text style={styles.announcementDate}>
            {new Date(announcement.created_at || announcement.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={styles.announcementBody} numberOfLines={2}>
        {announcement.body || announcement.message}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Parent Dashboard</Text>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading...' : 'Welcome back!'}
          </Text>
        </View>
        <View style={styles.headerDecoration} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#1a237e"
            colors={["#1a237e"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              number={stats.childrenCount}
              label="Children"
              color="#3f51b5"
              icon="👨‍👩‍👧‍👦"
            />
            <StatCard
              number={stats.unreadAnnouncements}
              label="Unread"
              color="#ff9800"
              icon="📢"
            />
            <StatCard
              number={stats.unpaidInvoices}
              label="Unpaid"
              color="#f44336"
              icon="💰"
            />
            <StatCard
              number={stats.upcomingEvents}
              label="Events"
              color="#4caf50"
              icon="📅"
            />
          </View>
        </View>

        {/* Children Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Children</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ParentChildren')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👶</Text>
              <Text style={styles.emptyTitle}>No Children Linked</Text>
              <Text style={styles.emptySubtitle}>
                Contact the school to link your children to your account
              </Text>
            </View>
          ) : (
            <FlatList
              data={children}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.childrenList}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ChildCard child={item} />}
            />
          )}
        </View>

        {/* Announcements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Announcements</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ParentAnnouncements')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {announcements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📢</Text>
              <Text style={styles.emptyTitle}>No Announcements</Text>
              <Text style={styles.emptySubtitle}>
                Check back later for important updates from the school
              </Text>
            </View>
          ) : (
            <View style={styles.announcementsList}>
              {announcements.map((announcement) => (
                <AnnouncementCard 
                  key={announcement.id} 
                  announcement={announcement} 
                />
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ParentMessages')}
            >
              <Text style={styles.quickActionIcon}>💬</Text>
              <Text style={styles.quickActionText}>Message Center</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ParentFees')}
            >
              <Text style={styles.quickActionIcon}>💳</Text>
              <Text style={styles.quickActionText}>Pay Fees</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ParentChildren')}
            >
              <Text style={styles.quickActionIcon}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.quickActionText}>My Children</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ParentAttendance')}
            >
              <Text style={styles.quickActionIcon}>🗓️</Text>
              <Text style={styles.quickActionText}>Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ParentResults')}
            >
              <Text style={styles.quickActionIcon}>📈</Text>
              <Text style={styles.quickActionText}>Results</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ParentAnnouncements')}
            >
              <Text style={styles.quickActionIcon}>📣</Text>
              <Text style={styles.quickActionText}>Announcements</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 20,
    zIndex: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#e3f2fd',
    fontSize: 16,
    opacity: 0.9,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    transform: [{ translateX: 100 }, { translateY: -100 }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  viewAllLink: {
    color: '#3f51b5',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIconText: {
    fontSize: 18,
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  childrenList: {
    paddingHorizontal: 20,
  },
  childCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 2,
  },
  childGrade: {
    fontSize: 14,
    color: '#6b7280',
  },
  childActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  actionPrimary: {
    backgroundColor: '#e3f2fd',
  },
  actionSecondary: {
    backgroundColor: '#e1f5fe',
  },
  actionTertiary: {
    backgroundColor: '#fff3e0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a237e',
  },
  announcementsList: {
    paddingHorizontal: 20,
  },
  announcementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  announcementIconText: {
    fontSize: 16,
  },
  announcementMeta: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 2,
  },
  announcementDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  announcementBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  quickActionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a237e',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default ParentDashboardScreen;


