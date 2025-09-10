import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const isIOS = Platform.OS === 'ios';

const StudentAssignmentsScreen = ({ navigation }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useBackButton(navigation);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      console.log('StudentAssignments: Fetching assignments...');
      
      const response = await apiClient.getStudentAssignments();
      console.log('StudentAssignments: Assignments response:', JSON.stringify(response, null, 2));
      
      if (response?.success && response?.data?.assignments) {
        setAssignments(response.data.assignments);
      } else {
        console.log('StudentAssignments: No assignments found or API error');
        setAssignments([]);
      }
    } catch (error) {
      console.log('StudentAssignments: Error fetching assignments:', error.message);
      Alert.alert('Error', 'Failed to load assignments. Please try again.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (dueDate, submission) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (submission) {
      if (submission.grade !== null && submission.grade !== undefined) {
        return '#10b981'; // Green for graded
      } else {
        return '#3b82f6'; // Blue for submitted
      }
    } else if (now > due) {
      return '#ef4444'; // Red for overdue
    } else {
      return '#f59e0b'; // Yellow for pending
    }
  };

  const getStatusText = (dueDate, submission) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (submission) {
      if (submission.grade !== null && submission.grade !== undefined) {
        return `Graded: ${submission.grade}/${submission.assignment?.max_points || 'N/A'}`;
      } else {
        return 'Submitted';
      }
    } else if (now > due) {
      return 'Overdue';
    } else {
      return 'Pending';
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const renderAssignmentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.assignmentCard}
      onPress={() => navigation.navigate('StudentAssignmentDetail', { assignmentId: item.id })}
    >
      <View style={styles.assignmentHeader}>
        <Text style={styles.assignmentTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.due_date, item.submission) }]}>
          <Text style={styles.statusText}>{getStatusText(item.due_date, item.submission)}</Text>
        </View>
      </View>
      
      <Text style={styles.assignmentDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.assignmentMeta}>
        <Text style={styles.metaText}>Due: {formatDate(item.due_date)}</Text>
        <Text style={styles.metaText}>Points: {item.max_points}</Text>
        <Text style={styles.metaText}>Type: {item.assignment_type}</Text>
      </View>
      
      <View style={styles.dueDateInfo}>
        <Text style={[
          styles.dueDateText,
          { color: getStatusColor(item.due_date, item.submission) }
        ]}>
          {getDaysUntilDue(item.due_date)}
        </Text>
      </View>

      {item.submission && (
        <View style={styles.submissionInfo}>
          <Text style={styles.submissionText}>
            Submitted on {formatDate(item.submission.submitted_at)}
          </Text>
          {item.submission.feedback && (
            <Text style={styles.feedbackText} numberOfLines={2}>
              Feedback: {item.submission.feedback}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && assignments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Assignments</Text>
          <Text style={styles.headerSubtitle}>View and submit your assignments</Text>
        </View>
      </View>

      {/* Assignments List */}
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={renderAssignmentItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchAssignments}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No assignments yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your teachers will post assignments here
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    color: '#1a237e',
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: isIOS ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: isIOS ? 28 : 24,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#e3f2fd',
    fontSize: isIOS ? 16 : 14,
  },
  listContainer: {
    padding: 16,
  },
  assignmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  assignmentTitle: {
    color: '#1a237e',
    fontWeight: '700',
    fontSize: 18,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  assignmentDescription: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  assignmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  dueDateInfo: {
    marginBottom: 8,
  },
  dueDateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submissionInfo: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
  },
  submissionText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackText: {
    color: '#6b7280',
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default StudentAssignmentsScreen;
