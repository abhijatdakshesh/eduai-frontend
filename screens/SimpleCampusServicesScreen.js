import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const SimpleCampusServicesScreen = () => {
  const services = [
    {
      id: 1,
      title: 'Hostel Accommodation',
      icon: '🏠',
      description: 'On-campus housing options and room booking',
      status: 'Available',
      color: '#4CAF50',
    },
    {
      id: 2,
      title: 'Transportation',
      icon: '🚌',
      description: 'Campus shuttle services and parking permits',
      status: 'Available',
      color: '#2196F3',
    },
    {
      id: 3,
      title: 'Dining Services',
      icon: '🍽️',
      description: 'Campus dining halls and meal plans',
      status: 'Available',
      color: '#FF9800',
    },
    {
      id: 4,
      title: 'Health Services',
      icon: '🏥',
      description: 'Student health center and medical appointments',
      status: 'Available',
      color: '#f44336',
    },
    {
      id: 5,
      title: 'Library Services',
      icon: '📚',
      description: 'Study spaces, book borrowing, and research support',
      status: 'Available',
      color: '#9C27B0',
    },
    {
      id: 6,
      title: 'IT Support',
      icon: '💻',
      description: 'Technical support and computer lab access',
      status: 'Available',
      color: '#607D8B',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Services</Text>
        <Text style={styles.headerSubtitle}>Access all campus facilities and services</Text>
      </View>

      <ScrollView style={styles.servicesContainer}>
        {services.map(service => (
          <TouchableOpacity key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: service.color }]}>
                <Text style={styles.statusText}>{service.status}</Text>
              </View>
            </View>
            
            <View style={styles.serviceActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                <Text style={styles.primaryButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#546e7a',
    fontSize: 14,
  },
  servicesContainer: {
    flex: 1,
    padding: 20,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a237e',
  },
  serviceDescription: {
    color: '#666',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a237e',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#1a237e',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#1a237e',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default SimpleCampusServicesScreen;

