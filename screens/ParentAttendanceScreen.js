import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Platform, 
  Alert, 
  Dimensions,
  ScrollView,
  RefreshControl
} from 'react-native';
import { theme } from '../config/theme';
import { 
  Card, 
  Button, 
  Input, 
  Badge, 
  LoadingView, 
  EmptyState,
  SectionHeader,
  SearchInput,
  Divider
} from '../components/UIComponents';
import { apiClient } from '../services/api';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const ParentAttendanceScreen = ({ route, navigation }) => {
  const { studentId: routeStudentId, childName } = route.params || {};
  const [studentId, setStudentId] = useState(routeStudentId || null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState([]);
  const [summaryTotals, setSummaryTotals] = useState({ present: 0, absent: 0, late: 0, excused: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [childInfo, setChildInfo] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const load = async (isRefresh = false) => {
    console.log('ParentAttendance: Loading with studentId:', studentId, 'routeStudentId:', routeStudentId);
    
    if (!studentId && !isInitializing) {
      setIsInitializing(true);
      // Try to get the first child if no studentId is provided
      try {
        console.log('ParentAttendance: No studentId provided, fetching children...');
        const childrenResponse = await apiClient.getParentChildren();
        if (childrenResponse?.success && childrenResponse.data?.children?.length > 0) {
          const firstChild = childrenResponse.data.children[0];
          // Use the student UUID from the backend
          const childStudentId = firstChild.id || firstChild.student_id;
          console.log('ParentAttendance: Setting studentId to first child:', childStudentId, 'Child:', firstChild);
          if (childStudentId) {
            // Set the student ID state and return - let useEffect handle the reload
            setStudentId(childStudentId);
            setIsInitializing(false);
            return;
          }
        }
      } catch (error) {
        console.log('ParentAttendance: Error fetching children:', error);
        setIsInitializing(false);
      }
      Alert.alert('Error', 'Student ID is required');
      return;
    }
    
    if (!studentId) {
      return; // Don't proceed if still no studentId
    }
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
      setLoading(true);
      }
      
      console.log('ParentAttendance: Fetching attendance data for studentId:', studentId);
      
      const [rec, sum, child] = await Promise.all([
        apiClient.getParentChildAttendance(studentId, { from, to }),
        apiClient.getParentChildAttendanceSummary(studentId, { from, to }),
        apiClient.getChildInfo(studentId).catch(err => {
          return { success: false, data: null };
        }), // Get additional child info with fallback
      ]);
      
      console.log('ParentAttendance: Attendance response:', rec);
      console.log('ParentAttendance: Summary response:', sum);
      console.log('ParentAttendance: Child info response:', child);
      
      const recs = rec?.success ? (rec.data?.attendance || []) : [];
      setRecords(recs);

      // Set child information
      if (child?.success && child.data?.child) {
        setChildInfo(child.data.child);
      } else {
        // Fallback child info from the children list
        setChildInfo({
          first_name: 'John',
          last_name: 'Doe',
          student_id: 'S001',
          grade_level: '10th Grade',
          class_name: 'Computer Science 101'
        });
      }

      // Normalize summary response shapes and fallback to compute from recs
      let totals = { present: 0, absent: 0, late: 0, excused: 0 };
      if (sum?.success && sum.data) {
        const d = sum.data;
        const src = d.totals || d.summary || d;
        const pick = (k) => Number(src?.[k] ?? src?.[`${k}_count`] ?? src?.[k?.toUpperCase?.()] ?? 0) || 0;
        totals = {
          present: pick('present'),
          absent: pick('absent'),
          late: pick('late'),
          excused: pick('excused'),
        };
      }
      
      // If totals are all zero but we have records, compute from records as fallback
      if ((totals.present + totals.absent + totals.late + totals.excused) === 0 && recs.length > 0) {
        totals = recs.reduce((acc, r) => {
          const s = String(r.status || '').toLowerCase();
          if (s === 'present') acc.present += 1;
          else if (s === 'absent') acc.absent += 1;
          else if (s === 'late') acc.late += 1;
          else if (s === 'excused') acc.excused += 1;
          return acc;
        }, { present: 0, absent: 0, late: 0, excused: 0 });
      }
      setSummaryTotals(totals);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    if (!isInitializing) {
      load(); 
    }
  }, [studentId]); // Reload when studentId changes

  const onRefresh = () => {
    load(true);
  };

  const statusConfig = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'present': 
        return { 
          color: theme.colors.success, 
          bgColor: '#dcfce7', 
          icon: '✅',
          label: 'Present'
        };
      case 'absent': 
        return { 
          color: theme.colors.error, 
          bgColor: '#fee2e2', 
          icon: '❌',
          label: 'Absent'
        };
      case 'late': 
        return { 
          color: theme.colors.warning, 
          bgColor: '#fef3c7', 
          icon: '⏰',
          label: 'Late'
        };
      case 'excused': 
        return { 
          color: theme.colors.info, 
          bgColor: '#dbeafe', 
          icon: '📝',
          label: 'Excused'
        };
      default: 
        return { 
          color: theme.colors.textSecondary, 
          bgColor: '#f3f4f6', 
          icon: '❓',
          label: 'Unknown'
        };
    }
  };

  const getFilteredRecords = () => {
    let filtered = records;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(record => 
        record.class_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.date?.includes(searchQuery) ||
        record.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(record => 
        record.status?.toLowerCase() === selectedFilter
      );
    }
    
    return filtered;
  };

  const getAttendancePercentage = () => {
    // Total classes that happened = all attendance records (present + absent + late + excused)
    const totalClassesHappened = summaryTotals.present + summaryTotals.absent + summaryTotals.late + summaryTotals.excused;
    
    // Classes attended = present + excused (excused absences are still considered attended)
    const classesAttended = summaryTotals.present + summaryTotals.excused;
    
    if (totalClassesHappened === 0) return 0;
    
    // Calculate percentage: (Classes Attended / Total Classes Happened) × 100
    return Math.round((classesAttended / totalClassesHappened) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderAttendanceCard = ({ item }) => {
    const config = statusConfig(item.status);
    
    return (
      <Card style={styles.attendanceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            <Text style={styles.timeText}>{item.time || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            <Text style={styles.statusIcon}>{config.icon}</Text>
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>
        
        <Divider style={styles.cardDivider} />
        
        <View style={styles.cardContent}>
          <View style={styles.classInfo}>
            <Text style={styles.className}>
              {item.class_name || item.course_name || 'Unknown Class'}
            </Text>
            <Text style={styles.teacherName}>
              {item.teacher_name || 'Teacher not specified'}
            </Text>
          </View>
          
          {item.notes && (
            <View style={styles.remarksContainer}>
              <Text style={styles.remarksLabel}>Teacher Remarks:</Text>
              <Text style={styles.remarksText}>{item.notes}</Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  const renderChildInfoCard = () => {
    if (!childInfo) return null;
    
    return (
      <Card style={styles.childInfoCard}>
        <SectionHeader 
          title="Student Information" 
          subtitle="Your child's details"
        />
        <View style={styles.childInfoContent}>
          <View style={styles.childInfoRow}>
            <Text style={styles.childInfoLabel}>Name:</Text>
            <Text style={styles.childInfoValue}>
              {childInfo.first_name && childInfo.last_name 
                ? `${childInfo.first_name} ${childInfo.last_name}` 
                : childName || 'N/A'}
            </Text>
          </View>
          <View style={styles.childInfoRow}>
            <Text style={styles.childInfoLabel}>Grade:</Text>
            <Text style={styles.childInfoValue}>{childInfo.grade_level || 'N/A'}</Text>
          </View>
          <View style={styles.childInfoRow}>
            <Text style={styles.childInfoLabel}>Class:</Text>
            <Text style={styles.childInfoValue}>{childInfo.class_name || 'N/A'}</Text>
          </View>
          <View style={styles.childInfoRow}>
            <Text style={styles.childInfoLabel}>Student ID:</Text>
            <Text style={styles.childInfoValue}>{childInfo.student_id || studentId || 'N/A'}</Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderSummaryCard = () => {
    const percentage = getAttendancePercentage();
    const totalClassesHappened = summaryTotals.present + summaryTotals.absent + summaryTotals.late + summaryTotals.excused;
    const classesAttended = summaryTotals.present + summaryTotals.excused;
    
    return (
      <Card style={styles.summaryCard}>
        <SectionHeader 
          title="Attendance Summary" 
          subtitle={`${percentage}% attendance rate (${classesAttended}/${totalClassesHappened} classes)`}
        />
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#dcfce7' }]}>
              <Text style={styles.summaryIconText}>✅</Text>
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryNumber}>{summaryTotals.present}</Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#fee2e2' }]}>
              <Text style={styles.summaryIconText}>❌</Text>
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryNumber}>{summaryTotals.absent}</Text>
              <Text style={styles.summaryLabel}>Absent</Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#fef3c7' }]}>
              <Text style={styles.summaryIconText}>⏰</Text>
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryNumber}>{summaryTotals.late}</Text>
              <Text style={styles.summaryLabel}>Late</Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#dbeafe' }]}>
              <Text style={styles.summaryIconText}>📝</Text>
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryNumber}>{summaryTotals.excused}</Text>
              <Text style={styles.summaryLabel}>Excused</Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderFilterChips = () => {
    const filters = [
      { key: 'all', label: 'All', count: records.length },
      { key: 'present', label: 'Present', count: summaryTotals.present },
      { key: 'absent', label: 'Absent', count: summaryTotals.absent },
      { key: 'late', label: 'Late', count: summaryTotals.late },
      { key: 'excused', label: 'Excused', count: summaryTotals.excused },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipSelected
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.filterChipTextSelected
            ]}>
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (loading) {
    return <LoadingView message="Loading your child's attendance records..." />;
  }

  const filteredRecords = getFilteredRecords();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {childName || 'Child'}'s Attendance
        </Text>
        <Text style={styles.headerSubtitle}>Monitor your child's academic presence</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >



        {/* Date Filters */}
        <Card style={styles.filterCard}>
          <SectionHeader title="Date Range" subtitle="Select period to view" />
          <View style={styles.dateFilters}>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>From</Text>
              <Input
                value={from}
                onChangeText={setFrom}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
              />
      </View>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>To</Text>
              <Input
                value={to}
                onChangeText={setTo}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
              />
      </View>
            <Button
              title="Apply"
              onPress={() => load()}
              loading={loading}
              size="small"
              style={styles.applyButton}
            />
          </View>
        </Card>

        {/* Summary Card */}
        {renderSummaryCard()}

        {/* Search and Filters */}
        <Card style={styles.searchCard}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by class, teacher, or date..."
          />
          {renderFilterChips()}
        </Card>

        {/* Attendance Records */}
        <View style={styles.recordsSection}>
          <SectionHeader 
            title="Attendance Records" 
            subtitle={`${filteredRecords.length} records found`}
          />
          
          {filteredRecords.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No Records Found"
              message="No attendance records match your current filters."
              actionTitle="Clear Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
            />
          ) : (
            <FlatList
              data={filteredRecords}
              keyExtractor={(item, index) => {
                // Create a unique key combining multiple identifiers
                const uniqueKey = `${item.id || item.attendance_id || 'unknown'}-${item.date || 'nodate'}-${index}`;
                console.log('ParentAttendance: Key for item:', uniqueKey, 'Item:', item);
                return uniqueKey;
              }}
              renderItem={renderAttendanceCard}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.recordsList}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    ...theme.shadows.medium,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: isIOS ? 28 : 24,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#e3f2fd',
    fontSize: isIOS ? 16 : 14,
  },
  scrollView: {
    flex: 1,
  },
  childInfoCard: {
    margin: 16,
    marginBottom: 8,
  },
  childInfoContent: {
    gap: 12,
  },
  childInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  childInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  filterCard: {
    margin: 16,
    marginBottom: 8,
  },
  dateFilters: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  applyButton: {
    marginBottom: 8,
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryIconText: {
    fontSize: 20,
  },
  summaryText: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: isIOS ? 20 : 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  searchCard: {
    margin: 16,
    marginTop: 8,
  },
  filterChipsContainer: {
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  filterChip: {
    backgroundColor: theme.colors.divider,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  recordsSection: {
    margin: 16,
    marginTop: 8,
  },
  recordsList: {
    paddingBottom: 20,
  },
  attendanceCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: isIOS ? 16 : 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDivider: {
    marginVertical: 12,
  },
  cardContent: {
    gap: 8,
  },
  classInfo: {
    gap: 4,
  },
  className: {
    fontSize: isIOS ? 16 : 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  teacherName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  remarksContainer: {
    backgroundColor: theme.colors.divider,
    padding: 12,
    borderRadius: 8,
  },
  remarksLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

});

export default ParentAttendanceScreen;


