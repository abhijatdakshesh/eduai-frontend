import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Dimensions } from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const SimpleResultsPortalScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [results, setResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gpa, setGpa] = useState('0.00');

  // Back button handler
  useBackButton(navigation);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedSemester !== 'All') filters.semester = selectedSemester;
      if (selectedYear) filters.year = selectedYear;
      
      const response = await apiClient.getResults(filters);
      if (response.success) {
        setResults(response.data.results || []);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      Alert.alert('Error', error.message || 'Failed to fetch results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGPA = async () => {
    try {
      const response = await apiClient.getGPA();
      if (response.success) {
        setGpa(response.data.gpa || '0.00');
      }
    } catch (error) {
      console.error('Error fetching GPA:', error);
      Alert.alert('Error', error.message || 'Failed to fetch GPA');
      setGpa('0.00');
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await apiClient.getAvailableSemesters();
      if (response.success) {
        setSemesters(['All', ...response.data.semesters]);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
      Alert.alert('Error', error.message || 'Failed to fetch semesters');
      setSemesters(['All']);
    }
  };

  const fetchYears = async () => {
    try {
      const response = await apiClient.getAvailableYears();
      if (response.success) {
        setYears(response.data.years);
      }
    } catch (error) {
      console.error('Error fetching years:', error);
      Alert.alert('Error', error.message || 'Failed to fetch years');
      setYears([]);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchGPA();
    fetchSemesters();
    fetchYears();
  }, [selectedSemester, selectedYear]);

  const handleDownloadTranscript = async () => {
    try {
      const response = await apiClient.downloadTranscript();
      if (response.success) {
        Alert.alert(
          'Download Successful',
          'Your transcript has been downloaded successfully.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to download transcript');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', error.message || 'Failed to download transcript');
    }
  };

  const handleRequestGradeReview = async (course) => {
    Alert.prompt(
      'Request Grade Review',
      `Please provide a reason for reviewing your grade in ${course.course_name}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async (reason) => {
            if (reason && reason.trim()) {
              try {
                const response = await apiClient.requestGradeReview(course.id, {
                  reason: reason.trim(),
                  course_code: course.course_code,
                  current_grade: course.grade
                });
                
                if (response.success) {
                  Alert.alert('Success', 'Grade review request submitted successfully!');
                } else {
                  Alert.alert('Error', response.message || 'Failed to submit review request');
                }
              } catch (error) {
                console.error('Grade review error:', error);
                Alert.alert('Error', error.message || 'Failed to submit review request');
              }
            } else {
              Alert.alert('Error', 'Please provide a reason for the grade review.');
            }
          }
        }
      ]
    );
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
      case 'A-':
        return '#4CAF50';
      case 'B+':
      case 'B':
      case 'B-':
        return '#FF9800';
      case 'C+':
      case 'C':
      case 'C-':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.course_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalCredits = results.reduce((sum, course) => sum + course.credits, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Demo notice removed */}
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Academic Results</Text>
        <Text style={styles.headerSubtitle}>View your academic performance</Text>
      </View>

      {/* GPA Summary */}
      <View style={styles.gpaSection}>
        <View style={styles.gpaCard}>
          <Text style={styles.gpaLabel}>Current GPA</Text>
          <Text style={styles.gpaValue}>{gpa}</Text>
          <Text style={styles.gpaSubtext}>Out of 4.0</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{results.length}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCredits}</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.semesterFilter}>
            {semesters.map((semester) => (
              <TouchableOpacity
                key={semester}
                style={[
                  styles.filterChip,
                  selectedSemester === semester && styles.filterChipSelected
                ]}
                onPress={() => setSelectedSemester(semester)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedSemester === semester && styles.filterChipTextSelected
                ]}>
                  {semester}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearFilter}>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.filterChip,
                  selectedYear === year && styles.filterChipSelected
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedYear === year && styles.filterChipTextSelected
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownloadTranscript}>
          <Text style={styles.actionButtonText}>📄 Download Transcript</Text>
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <ScrollView style={styles.resultsContainer}>
        {filteredResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No results found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
          </View>
        ) : (
          filteredResults.map((result) => (
            <View key={result.id} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseCode}>{result.course_code}</Text>
                  <Text style={styles.courseName}>{result.course_name}</Text>
                  <Text style={styles.instructor}>Instructor: {result.instructor}</Text>
                </View>
                <View style={styles.gradeSection}>
                  <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(result.grade) }]}>
                    <Text style={styles.gradeText}>{result.grade}</Text>
                  </View>
                  <Text style={styles.pointsText}>{result.points} points</Text>
                </View>
              </View>

              <View style={styles.resultDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Credits:</Text>
                  <Text style={styles.detailValue}>{result.credits}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Semester:</Text>
                  <Text style={styles.detailValue}>{result.semester} {result.year}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={styles.detailValue}>{result.status}</Text>
                </View>
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => handleRequestGradeReview(result)}
                >
                  <Text style={styles.reviewButtonText}>Request Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#546e7a',
  },
  gpaSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gpaCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  gpaLabel: {
    fontSize: 14,
    color: '#546e7a',
    marginBottom: 4,
  },
  gpaValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  gpaSubtext: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  statLabel: {
    fontSize: 12,
    color: '#546e7a',
  },
  filtersSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  semesterFilter: {
    flex: 1,
  },
  yearFilter: {
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipSelected: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
  },
  filterChipTextSelected: {
    color: 'white',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    backgroundColor: '#1a237e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  courseName: {
    fontSize: 14,
    color: '#424242',
    marginTop: 2,
  },
  instructor: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  gradeSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  gradeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  gradeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a237e',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#424242',
  },
  resultActions: {
    alignItems: 'flex-end',
  },
  reviewButton: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a237e',
  },
  reviewButtonText: {
    fontSize: 12,
    color: '#1a237e',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9e9e9e',
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bdbdbd',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#1a237e',
  },
  demoNotice: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  demoNoticeText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SimpleResultsPortalScreen;
