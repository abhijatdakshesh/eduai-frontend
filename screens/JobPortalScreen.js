import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  PlatformCard,
  Title,
  Paragraph,
  PlatformButton,
  PlatformSearchbar,
  PlatformChip,
  PlatformModal,
  PlatformIconButton,
  PlatformSnackbar,
  PlatformBadge,
  Text,
} from '../components/PlatformWrapper';

const JobPortalScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const jobTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'full-time', name: 'Full Time' },
    { id: 'part-time', name: 'Part Time' },
    { id: 'internship', name: 'Internship' },
    { id: 'remote', name: 'Remote' },
  ];

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'new-york', name: 'New York' },
    { id: 'san-francisco', name: 'San Francisco' },
    { id: 'seattle', name: 'Seattle' },
    { id: 'austin', name: 'Austin' },
    { id: 'remote', name: 'Remote' },
  ];

  const jobs = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco',
      type: 'full-time',
      salary: '$120,000 - $150,000',
      description: 'We are looking for a talented software engineer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '3+ years of experience in software development',
        'Proficiency in JavaScript, Python, or Java',
        'Experience with cloud platforms (AWS, Azure, or GCP)',
        'Strong problem-solving and communication skills'
      ],
      applications: 45,
      postedDate: '2 days ago',
      logo: '🏢',
    },
    {
      id: 2,
      title: 'Data Analyst Intern',
      company: 'DataFlow Inc',
      location: 'New York',
      type: 'internship',
      salary: '$25/hour',
      description: 'Join our data team as an intern and learn about data analysis, visualization, and business intelligence.',
      requirements: [
        'Currently pursuing a degree in Statistics, Mathematics, or related field',
        'Basic knowledge of SQL and Python',
        'Familiarity with data visualization tools',
        'Strong analytical skills',
        'Available for 3-6 months'
      ],
      applications: 23,
      postedDate: '1 week ago',
      logo: '📊',
    },
    {
      id: 3,
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Remote',
      type: 'remote',
      salary: '$90,000 - $110,000',
      description: 'We are seeking a creative UX designer to help us create amazing user experiences for our products.',
      requirements: [
        'Portfolio demonstrating UX/UI design work',
        'Experience with design tools (Figma, Sketch, Adobe XD)',
        'Understanding of user research and usability principles',
        'Experience with design systems',
        'Strong collaboration skills'
      ],
      applications: 67,
      postedDate: '3 days ago',
      logo: '🎨',
    },
    {
      id: 4,
      title: 'Marketing Coordinator',
      company: 'GrowthMarketing',
      location: 'Austin',
      type: 'full-time',
      salary: '$60,000 - $75,000',
      description: 'Help us grow our brand and reach new customers through innovative marketing strategies.',
      requirements: [
        'Bachelor\'s degree in Marketing or related field',
        '2+ years of marketing experience',
        'Experience with social media marketing',
        'Knowledge of marketing analytics tools',
        'Excellent written and verbal communication skills'
      ],
      applications: 34,
      postedDate: '5 days ago',
      logo: '📈',
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Seattle',
      type: 'full-time',
      salary: '$130,000 - $160,000',
      description: 'Join our infrastructure team and help us build scalable, reliable systems.',
      requirements: [
        'Experience with AWS, Azure, or GCP',
        'Knowledge of Docker and Kubernetes',
        'Experience with CI/CD pipelines',
        'Understanding of infrastructure as code',
        'Strong troubleshooting skills'
      ],
      applications: 28,
      postedDate: '1 day ago',
      logo: '☁️',
    },
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedJobType === 'all' || job.type === selectedJobType;
    const matchesLocation = selectedLocation === 'all' || job.location.toLowerCase() === selectedLocation;
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const handleApplyJob = (jobId) => {
    setSnackbarMessage('Application submitted successfully!');
    setSnackbarVisible(true);
    setModalVisible(false);
  };

  const getJobTypeColor = (type) => {
    switch (type) {
      case 'full-time': return '#4CAF50';
      case 'part-time': return '#FF9800';
      case 'internship': return '#2196F3';
      case 'remote': return '#9C27B0';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Search and Filters */}
        <PlatformCard style={styles.searchCard}>
          <PlatformSearchbar
            placeholder="Search jobs..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
          
          <View style={styles.filterSection}>
            <Paragraph style={styles.filterTitle}>Job Type:</Paragraph>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
              {jobTypes.map(type => (
                <PlatformChip
                  key={type.id}
                  selected={selectedJobType === type.id}
                  onPress={() => setSelectedJobType(type.id)}
                  style={styles.filterChip}
                >
                  {type.name}
                </PlatformChip>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Paragraph style={styles.filterTitle}>Location:</Paragraph>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
              {locations.map(location => (
                <PlatformChip
                  key={location.id}
                  selected={selectedLocation === location.id}
                  onPress={() => setSelectedLocation(location.id)}
                  style={styles.filterChip}
                >
                  {location.name}
                </PlatformChip>
              ))}
            </ScrollView>
          </View>
        </PlatformCard>

        {/* Job Listings */}
        {filteredJobs.map(job => (
          <PlatformCard key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View style={styles.companyInfo}>
                <Text style={styles.companyLogo}>{job.logo}</Text>
                <View style={styles.jobInfo}>
                  <Title style={styles.jobTitle}>{job.title}</Title>
                  <Paragraph style={styles.companyName}>{job.company}</Paragraph>
                  <Paragraph style={styles.jobLocation}>📍 {job.location}</Paragraph>
                </View>
              </View>
              <View style={styles.jobMeta}>
                <PlatformBadge style={[styles.typeBadge, { backgroundColor: getJobTypeColor(job.type) }]}>
                  {job.type.replace('-', ' ').toUpperCase()}
                </PlatformBadge>
                <Paragraph style={styles.salary}>{job.salary}</Paragraph>
              </View>
            </View>

            <Paragraph style={styles.jobDescription} numberOfLines={3}>
              {job.description}
            </Paragraph>

            <View style={styles.jobFooter}>
              <View style={styles.jobStats}>
                <Paragraph style={styles.applications}>{job.applications} applications</Paragraph>
                <Paragraph style={styles.postedDate}>{job.postedDate}</Paragraph>
              </View>
              <View style={styles.jobActions}>
                <PlatformButton
                  mode="outlined"
                  onPress={() => handleViewJob(job)}
                  style={styles.actionButton}
                  compact
                >
                  View Details
                </PlatformButton>
                <PlatformButton
                  mode="contained"
                  onPress={() => handleApplyJob(job.id)}
                  style={styles.actionButton}
                  compact
                >
                  Apply Now
                </PlatformButton>
              </View>
            </View>
          </PlatformCard>
        ))}

        {filteredJobs.length === 0 && (
          <PlatformCard style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Title style={styles.emptyTitle}>No jobs found</Title>
              <Paragraph style={styles.emptyText}>
                Try adjusting your search criteria or filters
              </Paragraph>
            </View>
          </PlatformCard>
        )}
      </ScrollView>

      {/* Job Details Modal */}
      <PlatformModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        {selectedJob && (
          <ScrollView>
            <View style={styles.modalHeader}>
              <Text style={styles.modalLogo}>{selectedJob.logo}</Text>
              <View style={styles.modalJobInfo}>
                <Title style={styles.modalJobTitle}>{selectedJob.title}</Title>
                <Paragraph style={styles.modalCompanyName}>{selectedJob.company}</Paragraph>
                <Paragraph style={styles.modalLocation}>📍 {selectedJob.location}</Paragraph>
              </View>
            </View>

            <View style={styles.modalMeta}>
              <PlatformBadge style={[styles.modalTypeBadge, { backgroundColor: getJobTypeColor(selectedJob.type) }]}>
                {selectedJob.type.replace('-', ' ').toUpperCase()}
              </PlatformBadge>
              <Paragraph style={styles.modalSalary}>{selectedJob.salary}</Paragraph>
            </View>

            <Title style={styles.modalSectionTitle}>Job Description</Title>
            <Paragraph style={styles.modalDescription}>{selectedJob.description}</Paragraph>

            <Title style={styles.modalSectionTitle}>Requirements</Title>
            {selectedJob.requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Paragraph style={styles.requirementText}>{req}</Paragraph>
              </View>
            ))}

            <View style={styles.modalFooter}>
              <Paragraph style={styles.modalStats}>
                {selectedJob.applications} applications • Posted {selectedJob.postedDate}
              </Paragraph>
              <PlatformButton
                mode="contained"
                onPress={() => handleApplyJob(selectedJob.id)}
                style={styles.modalApplyButton}
              >
                Apply for this position
              </PlatformButton>
            </View>
          </ScrollView>
        )}
      </PlatformModal>

      <PlatformSnackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </PlatformSnackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchCard: {
    margin: 16,
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  jobCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  jobLocation: {
    fontSize: 12,
    color: '#666',
  },
  jobMeta: {
    alignItems: 'flex-end',
  },
  typeBadge: {
    marginBottom: 4,
  },
  salary: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  jobDescription: {
    marginBottom: 12,
    color: '#666',
    lineHeight: 20,
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
    fontSize: 12,
    color: '#666',
  },
  postedDate: {
    fontSize: 12,
    color: '#999',
  },
  jobActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 8,
  },
  emptyCard: {
    margin: 16,
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalLogo: {
    fontSize: 40,
    marginRight: 16,
  },
  modalJobInfo: {
    flex: 1,
  },
  modalJobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalCompanyName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  modalLocation: {
    fontSize: 14,
    color: '#666',
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTypeBadge: {
    paddingHorizontal: 12,
  },
  modalSalary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  modalDescription: {
    lineHeight: 22,
    color: '#333',
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    color: '#1976d2',
  },
  requirementText: {
    flex: 1,
    lineHeight: 20,
  },
  modalFooter: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalStats: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  modalApplyButton: {
    paddingVertical: 8,
  },
});

export default JobPortalScreen; 