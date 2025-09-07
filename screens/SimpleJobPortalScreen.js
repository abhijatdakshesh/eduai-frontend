import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Dimensions, Alert, Linking } from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';
import { apiClient } from '../services/api';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const SimpleJobPortalScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Back button handler
  useBackButton(navigation);

  // Fetch jobs and filters from API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedJobType !== 'all') filters.job_type = selectedJobType;
      if (selectedLocation !== 'all') filters.location = selectedLocation;
      // Add limit to get all jobs (60 total)
      filters.limit = 100;
      
      const response = await apiClient.getJobs(filters);
      if (response.success) {
        // Transform backend data to frontend format
        const backendJobs = response.data.jobs || [];
        const transformedJobs = backendJobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.job_type,
          salary: `$${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()}`,
          description: job.description,
          applications: parseInt(job.application_count) || 0,
          postedDate: new Date(job.posted_date).toLocaleDateString(),
          logo: '🏢', // Default logo
          requirements: job.requirements,
          deadline: job.deadline,
          application_url: job.application_url // Include application URL
        }));
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback to mock data when API fails
      const mockJobs = [
        {
          id: 1,
          title: 'Software Engineer',
          company: 'TechCorp',
          location: 'San Francisco',
          type: 'full-time',
          salary: '$120,000 - $150,000',
          description: 'We are looking for a talented software engineer to join our team.',
          applications: 45,
          postedDate: '2 days ago',
          logo: '🏢',
          application_url: 'https://techcorp.com/careers/software-engineer',
        },
        {
          id: 2,
          title: 'Data Analyst Intern',
          company: 'DataFlow Inc',
          location: 'New York',
          type: 'internship',
          salary: '$25/hour',
          description: 'Join our data team as an intern and learn about data analysis.',
          applications: 23,
          postedDate: '1 week ago',
          logo: '📊',
          application_url: 'https://dataflow.com/careers/intern',
        },
        {
          id: 3,
          title: 'UX Designer',
          company: 'DesignStudio',
          location: 'Remote',
          type: 'remote',
          salary: '$90,000 - $110,000',
          description: 'We are seeking a creative UX designer to help us create amazing user experiences.',
          applications: 67,
          postedDate: '3 days ago',
          logo: '🎨',
          application_url: 'https://designstudio.com/careers/ux-designer',
        },
      ];
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobTypes = async () => {
    try {
      const response = await apiClient.getJobTypes();
      if (response.success) {
        setJobTypes([
          { id: 'all', name: 'All Types' },
          ...response.data.map(type => ({
            id: type.id,
            name: type.name
          }))
        ]);
      }
    } catch (error) {
      console.error('Error fetching job types:', error);
      // Fallback to default job types
      setJobTypes([
        { id: 'all', name: 'All Types' },
        { id: 'full-time', name: 'Full Time' },
        { id: 'part-time', name: 'Part Time' },
        { id: 'internship', name: 'Internship' },
        { id: 'remote', name: 'Remote' },
      ]);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await apiClient.getJobLocations();
      if (response.success) {
        setLocations([
          { id: 'all', name: 'All Locations' },
          ...response.data.map(location => ({
            id: location,
            name: location
          }))
        ]);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Fallback to default locations
      setLocations([
        { id: 'all', name: 'All Locations' },
        { id: 'new-york', name: 'New York' },
        { id: 'san-francisco', name: 'San Francisco' },
        { id: 'seattle', name: 'Seattle' },
        { id: 'austin', name: 'Austin' },
        { id: 'remote', name: 'Remote' },
      ]);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchJobTypes();
    fetchLocations();
  }, [selectedJobType, selectedLocation]);

  const handleViewJob = (job) => {
    const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline';
    const applicationInfo = job.application_url ? 
      `\n\nApplication URL: ${job.application_url}` : 
      '\n\nApplication: Contact company directly';
    
    Alert.alert(
      'Job Details',
      `${job.title}\n\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nSalary: ${job.salary}\nPosted: ${job.postedDate}\nDeadline: ${deadline}${applicationInfo}\n\nDescription:\n${job.description}\n\nRequirements:\n${job.requirements || 'Not specified'}`,
      [
        { text: 'OK' },
        ...(job.application_url ? [{
          text: 'Apply Now',
          onPress: () => handleApplyJob(job)
        }] : [])
      ]
    );
  };

  const handleApplyJob = async (job) => {
    // Check if job has an application URL
    if (job.application_url) {
      try {
        // Use browser's native confirm for web compatibility
        const confirmed = window.confirm(
          `You will be redirected to ${job.company}'s application page. Continue?`
        );
        
        if (confirmed) {
          // Open external URL
          const supported = await Linking.canOpenURL(job.application_url);
          if (supported) {
            await Linking.openURL(job.application_url);
          } else {
            // Fallback for web - open in new tab
            if (Platform.OS === 'web') {
              window.open(job.application_url, '_blank');
            } else {
              Alert.alert('Error', 'Cannot open application URL');
            }
          }
        }
      } catch (error) {
        console.error('Error opening application URL:', error);
        Alert.alert('Error', 'Failed to open application page');
      }
    } else {
      // Fallback for jobs without application URLs
      Alert.alert(
        'Application Info',
        `To apply for ${job.title} at ${job.company}, please visit their website or contact them directly.`,
        [{ text: 'OK' }]
      );
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedJobType === 'all' || job.type === selectedJobType;
    const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
    return matchesSearch && matchesType && matchesLocation;
  });

  const getJobTypeColor = (type) => {
    switch (type) {
      case 'full-time': return '#4CAF50';
      case 'part-time': return '#FF9800';
      case 'internship': return '#2196F3';
      case 'remote': return '#9C27B0';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Career Portal</Text>
        <Text style={styles.headerSubtitle}>Find your next opportunity</Text>
        <Text style={styles.jobCount}>{filteredJobs.length} jobs available</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search jobs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Job Type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {jobTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.filterChip,
                  selectedJobType === type.id && styles.filterChipSelected
                ]}
                onPress={() => setSelectedJobType(type.id)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedJobType === type.id && styles.filterChipTextSelected
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Location:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {locations.map(location => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.filterChip,
                  selectedLocation === location.id && styles.filterChipSelected
                ]}
                onPress={() => setSelectedLocation(location.id)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedLocation === location.id && styles.filterChipTextSelected
                ]}>
                  {location.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView style={styles.jobsContainer}>
        {filteredJobs.map(job => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View style={styles.companyInfo}>
                <Text style={styles.companyLogo}>{job.logo}</Text>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.companyName}>{job.company}</Text>
                  <Text style={styles.jobLocation}>📍 {job.location}</Text>
                </View>
              </View>
              <View style={styles.jobMeta}>
                <View style={[styles.typeBadge, { backgroundColor: getJobTypeColor(job.type) }]}>
                  <Text style={styles.typeBadgeText}>
                    {job.type.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.salary}>{job.salary}</Text>
              </View>
            </View>

            <Text style={styles.jobDescription} numberOfLines={3}>
              {job.description}
            </Text>

            <View style={styles.jobFooter}>
              <View style={styles.jobStats}>
                <Text style={styles.applications}>{job.applications} applications</Text>
                <Text style={styles.postedDate}>{job.postedDate}</Text>
              </View>
              <View style={styles.jobActions}>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => handleViewJob(job)}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => handleApplyJob(job)}
                >
                  <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {filteredJobs.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search criteria or filters
            </Text>
          </View>
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
    padding: isIOS ? 16 : 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
  },
  headerTitle: {
    fontSize: isIOS ? 20 : 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#546e7a',
    fontSize: isIOS ? 12 : 14,
  },
  searchSection: {
    padding: isIOS ? 16 : 20,
    paddingBottom: isIOS ? 8 : 10,
  },
  searchBar: {
    backgroundColor: '#ffffff',
    borderRadius: isIOS ? 6 : 8,
    padding: isIOS ? 10 : 12,
    marginBottom: isIOS ? 12 : 16,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    fontWeight: 'bold',
    marginBottom: isIOS ? 6 : 8,
    color: '#1a237e',
    fontSize: isIOS ? 12 : 14,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#e8eaf6',
    paddingHorizontal: isIOS ? 12 : 16,
    paddingVertical: isIOS ? 6 : 8,
    borderRadius: isIOS ? 16 : 20,
    marginRight: isIOS ? 6 : 8,
  },
  filterChipSelected: {
    backgroundColor: '#1a237e',
  },
  filterChipText: {
    color: '#1a237e',
    fontSize: isIOS ? 12 : 14,
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  jobsContainer: {
    flex: 1,
    padding: isIOS ? 16 : 20,
    paddingTop: 0,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: isIOS ? 10 : 12,
    padding: isIOS ? 12 : 16,
    marginBottom: isIOS ? 12 : 16,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  companyLogo: {
    fontSize: 32,
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: isIOS ? 16 : 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a237e',
  },
  companyName: {
    fontSize: isIOS ? 12 : 14,
    color: '#666',
    marginBottom: 2,
  },
  jobLocation: {
    fontSize: isIOS ? 10 : 12,
    color: '#666',
  },
  jobMeta: {
    alignItems: 'flex-end',
  },
  typeBadge: {
    paddingHorizontal: isIOS ? 6 : 8,
    paddingVertical: isIOS ? 3 : 4,
    borderRadius: isIOS ? 8 : 12,
    marginBottom: 4,
  },
  typeBadgeText: {
    fontSize: isIOS ? 9 : 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  salary: {
    fontSize: isIOS ? 10 : 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  jobDescription: {
    marginBottom: isIOS ? 10 : 12,
    color: '#666',
    lineHeight: isIOS ? 18 : 20,
    fontSize: isIOS ? 12 : 14,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobStats: {
    flex: 1,
  },
  applications: {
    fontSize: isIOS ? 10 : 12,
    color: '#666',
  },
  postedDate: {
    fontSize: isIOS ? 10 : 12,
    color: '#999',
  },
  jobActions: {
    flexDirection: 'row',
  },
  viewButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: isIOS ? 10 : 12,
    paddingVertical: isIOS ? 6 : 8,
    borderRadius: isIOS ? 6 : 8,
    borderWidth: 1,
    borderColor: '#1a237e',
    marginRight: isIOS ? 6 : 8,
  },
  viewButtonText: {
    color: '#1a237e',
    fontWeight: '600',
    fontSize: isIOS ? 11 : 12,
  },
  applyButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: isIOS ? 10 : 12,
    paddingVertical: isIOS ? 6 : 8,
    borderRadius: isIOS ? 6 : 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: isIOS ? 11 : 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a237e',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
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
  jobCount: {
    fontSize: 14,
    color: '#10b981',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
});

export default SimpleJobPortalScreen;

