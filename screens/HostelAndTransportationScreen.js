import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  PlatformCard,
  Title,
  Paragraph,
  PlatformButton,
  PlatformSegmentedButtons,
  PlatformBadge,
  PlatformModal,
  PlatformInput,
  PlatformSnackbar,
  PlatformIconButton,
} from '../components/PlatformWrapper';

const HostelAndTransportationScreen = () => {
  const [activeTab, setActiveTab] = useState('hostel');
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const tabs = [
    { value: 'hostel', label: 'Hostel' },
    { value: 'transport', label: 'Transport' },
    { value: 'bookings', label: 'My Bookings' },
  ];

  const hostels = [
    {
      id: 1,
      name: 'University Heights',
      type: 'Shared Room',
      price: 800,
      availability: 'Available',
      amenities: ['WiFi', 'Laundry', 'Kitchen', 'Study Room', 'Gym'],
      description: 'Modern hostel with shared facilities, perfect for students who want to socialize and save money.',
      contact: '+1 (555) 123-4567',
      address: '123 University Ave, Campus District',
      rating: 4.5,
      reviews: 128,
    },
    {
      id: 2,
      name: 'Campus Commons',
      type: 'Private Room',
      price: 1200,
      availability: 'Limited',
      amenities: ['WiFi', 'Private Bathroom', 'Kitchen', 'Study Room', 'Parking'],
      description: 'Premium private rooms with modern amenities and excellent location near campus.',
      contact: '+1 (555) 234-5678',
      address: '456 Campus Blvd, University Area',
      rating: 4.8,
      reviews: 95,
    },
    {
      id: 3,
      name: 'Student Village',
      type: 'Studio Apartment',
      price: 1500,
      availability: 'Available',
      amenities: ['WiFi', 'Private Bathroom', 'Kitchen', 'Balcony', 'Parking', 'Gym'],
      description: 'Fully furnished studio apartments with all modern conveniences for independent students.',
      contact: '+1 (555) 345-6789',
      address: '789 Student St, Academic Quarter',
      rating: 4.6,
      reviews: 156,
    },
  ];

  const transportServices = [
    {
      id: 1,
      name: 'Campus Shuttle',
      type: 'Bus',
      route: 'Campus Loop',
      schedule: 'Every 15 minutes',
      price: 'Free',
      description: 'Free shuttle service connecting all major campus buildings and nearby student housing.',
      stops: ['Main Campus', 'Library', 'Student Center', 'Sports Complex', 'Housing Area'],
      operatingHours: '7:00 AM - 11:00 PM',
      status: 'Operating',
    },
    {
      id: 2,
      name: 'City Transit',
      type: 'Bus',
      route: 'Downtown Express',
      schedule: 'Every 30 minutes',
      price: '$2.50',
      description: 'Express bus service to downtown area with student discounts available.',
      stops: ['Campus', 'Downtown Mall', 'Shopping Center', 'Entertainment District'],
      operatingHours: '6:00 AM - 12:00 AM',
      status: 'Operating',
    },
    {
      id: 3,
      name: 'Bike Share',
      type: 'Bicycle',
      route: 'Campus-wide',
      schedule: '24/7',
      price: '$1/hour',
      description: 'Convenient bike sharing program with stations throughout campus.',
      stops: ['Multiple campus locations'],
      operatingHours: '24/7',
      status: 'Available',
    },
    {
      id: 4,
      name: 'Ride Share',
      type: 'Car',
      route: 'On-demand',
      schedule: '24/7',
      price: 'Variable',
      description: 'Partnership with local ride-sharing services for convenient transportation.',
      stops: ['Anywhere'],
      operatingHours: '24/7',
      status: 'Available',
    },
  ];

  const myBookings = [
    {
      id: 1,
      type: 'hostel',
      name: 'University Heights',
      checkIn: '2024-01-15',
      checkOut: '2024-05-15',
      status: 'Active',
      amount: 3200,
    },
    {
      id: 2,
      type: 'transport',
      name: 'Campus Shuttle',
      date: '2024-03-10',
      time: '9:00 AM',
      status: 'Completed',
      amount: 0,
    },
  ];

  const getAvailabilityColor = (availability) => {
    switch (availability.toLowerCase()) {
      case 'available': return '#4CAF50';
      case 'limited': return '#FF9800';
      case 'full': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'operating':
      case 'available': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const handleBooking = () => {
    setSnackbarMessage('Booking confirmed successfully!');
    setSnackbarVisible(true);
    setBookingModalVisible(false);
  };

  const handleContact = () => {
    setSnackbarMessage('Contact information sent!');
    setSnackbarVisible(true);
    setContactModalVisible(false);
  };

  const renderHostelTab = () => (
    <ScrollView>
      {hostels.map(hostel => (
        <PlatformCard key={hostel.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Title style={styles.itemName}>{hostel.name}</Title>
              <Paragraph style={styles.itemType}>{hostel.type}</Paragraph>
              <Paragraph style={styles.itemPrice}>${hostel.price}/month</Paragraph>
            </View>
            <View style={styles.itemMeta}>
              <PlatformBadge style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor(hostel.availability) }]}>
                {hostel.availability}
              </PlatformBadge>
              <View style={styles.ratingContainer}>
                <Paragraph style={styles.rating}>⭐ {hostel.rating}</Paragraph>
                <Paragraph style={styles.reviews}>({hostel.reviews} reviews)</Paragraph>
              </View>
            </View>
          </View>

          <Paragraph style={styles.itemDescription}>{hostel.description}</Paragraph>

          <View style={styles.amenitiesSection}>
            <Paragraph style={styles.amenitiesTitle}>Amenities:</Paragraph>
            <View style={styles.amenitiesList}>
              {hostel.amenities.map((amenity, index) => (
                <PlatformBadge key={index} style={styles.amenityBadge}>
                  {amenity}
                </PlatformBadge>
              ))}
            </View>
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.itemDetails}>
              <Paragraph style={styles.itemAddress}>📍 {hostel.address}</Paragraph>
              <Paragraph style={styles.itemContact}>📞 {hostel.contact}</Paragraph>
            </View>
            <View style={styles.itemActions}>
              <PlatformButton
                mode="outlined"
                onPress={() => {
                  setSelectedItem(hostel);
                  setContactModalVisible(true);
                }}
                style={styles.actionButton}
                compact
              >
                Contact
              </PlatformButton>
              <PlatformButton
                mode="contained"
                onPress={() => {
                  setSelectedItem(hostel);
                  setBookingModalVisible(true);
                }}
                style={styles.actionButton}
                compact
              >
                Book Now
              </PlatformButton>
            </View>
          </View>
        </PlatformCard>
      ))}
    </ScrollView>
  );

  const renderTransportTab = () => (
    <ScrollView>
      {transportServices.map(service => (
        <PlatformCard key={service.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Title style={styles.itemName}>{service.name}</Title>
              <Paragraph style={styles.itemType}>{service.type} • {service.route}</Paragraph>
              <Paragraph style={styles.itemPrice}>{service.price}</Paragraph>
            </View>
            <View style={styles.itemMeta}>
              <PlatformBadge style={[styles.statusBadge, { backgroundColor: getStatusColor(service.status) }]}>
                {service.status}
              </PlatformBadge>
            </View>
          </View>

          <Paragraph style={styles.itemDescription}>{service.description}</Paragraph>

          <View style={styles.scheduleSection}>
            <Paragraph style={styles.scheduleTitle}>Schedule:</Paragraph>
            <Paragraph style={styles.scheduleText}>{service.schedule}</Paragraph>
            <Paragraph style={styles.operatingHours}>Hours: {service.operatingHours}</Paragraph>
          </View>

          <View style={styles.stopsSection}>
            <Paragraph style={styles.stopsTitle}>Stops:</Paragraph>
            {service.stops.map((stop, index) => (
              <View key={index} style={styles.stopItem}>
                <Paragraph style={styles.bulletPoint}>•</Paragraph>
                <Paragraph style={styles.stopText}>{stop}</Paragraph>
              </View>
            ))}
          </View>

          <View style={styles.itemFooter}>
            <PlatformButton
              mode="contained"
              onPress={() => {
                setSelectedItem(service);
                setBookingModalVisible(true);
              }}
              style={styles.bookButton}
            >
              Book Service
            </PlatformButton>
          </View>
        </PlatformCard>
      ))}
    </ScrollView>
  );

  const renderBookingsTab = () => (
    <ScrollView>
      {myBookings.map(booking => (
        <PlatformCard key={booking.id} style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <View style={styles.bookingInfo}>
              <Title style={styles.bookingName}>{booking.name}</Title>
              <Paragraph style={styles.bookingType}>{booking.type.toUpperCase()}</Paragraph>
              {booking.type === 'hostel' ? (
                <Paragraph style={styles.bookingDates}>
                  {booking.checkIn} to {booking.checkOut}
                </Paragraph>
              ) : (
                <Paragraph style={styles.bookingDates}>
                  {booking.date} at {booking.time}
                </Paragraph>
              )}
            </View>
            <View style={styles.bookingMeta}>
              <PlatformBadge style={[styles.bookingStatus, { backgroundColor: getStatusColor(booking.status) }]}>
                {booking.status.toUpperCase()}
              </PlatformBadge>
              <Paragraph style={styles.bookingAmount}>
                {booking.amount > 0 ? `$${booking.amount}` : 'Free'}
              </Paragraph>
            </View>
          </View>

          <View style={styles.bookingActions}>
            <PlatformButton
              mode="outlined"
              onPress={() => {}}
              style={styles.bookingActionButton}
              compact
            >
              View Details
            </PlatformButton>
            {booking.status === 'Active' && (
              <PlatformButton
                mode="outlined"
                onPress={() => {}}
                style={styles.bookingActionButton}
                compact
              >
                Cancel
              </PlatformButton>
            )}
          </View>
        </PlatformCard>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <PlatformSegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={tabs}
        style={styles.tabs}
      />

      <View style={styles.content}>
        {activeTab === 'hostel' && renderHostelTab()}
        {activeTab === 'transport' && renderTransportTab()}
        {activeTab === 'bookings' && renderBookingsTab()}
      </View>

      {/* Booking Modal */}
      <PlatformModal
        visible={bookingModalVisible}
        onDismiss={() => setBookingModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title style={styles.modalTitle}>
          Book {selectedItem?.type === 'hostel' ? 'Hostel' : 'Transport Service'}
        </Title>
        
        {selectedItem && (
          <>
            <Paragraph style={styles.modalItemName}>{selectedItem.name}</Paragraph>
            <Paragraph style={styles.modalItemPrice}>
              {selectedItem.type === 'hostel' ? `$${selectedItem.price}/month` : selectedItem.price}
            </Paragraph>

            {selectedItem.type === 'hostel' ? (
              <>
                <PlatformInput
                  label="Check-in Date"
                  placeholder="YYYY-MM-DD"
                  style={styles.modalInput}
                />
                <PlatformInput
                  label="Check-out Date"
                  placeholder="YYYY-MM-DD"
                  style={styles.modalInput}
                />
                <PlatformInput
                  label="Number of Occupants"
                  placeholder="1"
                  keyboardType="numeric"
                  style={styles.modalInput}
                />
              </>
            ) : (
              <>
                <PlatformInput
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  style={styles.modalInput}
                />
                <PlatformInput
                  label="Time"
                  placeholder="HH:MM"
                  style={styles.modalInput}
                />
                <PlatformInput
                  label="Pickup Location"
                  placeholder="Enter pickup location"
                  style={styles.modalInput}
                />
              </>
            )}

            <PlatformInput
              label="Special Requirements"
              placeholder="Any special requests..."
              multiline
              numberOfLines={3}
              style={styles.modalInput}
            />

            <View style={styles.modalButtons}>
              <PlatformButton
                mode="outlined"
                onPress={() => setBookingModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </PlatformButton>
              <PlatformButton
                mode="contained"
                onPress={handleBooking}
                style={styles.modalButton}
              >
                Confirm Booking
              </PlatformButton>
            </View>
          </>
        )}
      </PlatformModal>

      {/* Contact Modal */}
      <PlatformModal
        visible={contactModalVisible}
        onDismiss={() => setContactModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title style={styles.modalTitle}>Contact Information</Title>
        
        {selectedItem && (
          <>
            <Paragraph style={styles.modalItemName}>{selectedItem.name}</Paragraph>
            <Paragraph style={styles.contactInfo}>📞 {selectedItem.contact}</Paragraph>
            <Paragraph style={styles.contactInfo}>📍 {selectedItem.address}</Paragraph>

            <PlatformInput
              label="Your Name"
              placeholder="Enter your name"
              style={styles.modalInput}
            />
            <PlatformInput
              label="Your Phone"
              placeholder="Enter your phone number"
              style={styles.modalInput}
            />
            <PlatformInput
              label="Message"
              placeholder="Your message..."
              multiline
              numberOfLines={4}
              style={styles.modalInput}
            />

            <View style={styles.modalButtons}>
              <PlatformButton
                mode="outlined"
                onPress={() => setContactModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </PlatformButton>
              <PlatformButton
                mode="contained"
                onPress={handleContact}
                style={styles.modalButton}
              >
                Send Message
              </PlatformButton>
            </View>
          </>
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
  tabs: {
    margin: 16,
  },
  content: {
    flex: 1,
  },
  itemCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemType: {
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  itemMeta: {
    alignItems: 'flex-end',
  },
  availabilityBadge: {
    marginBottom: 8,
  },
  statusBadge: {
    marginBottom: 8,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviews: {
    fontSize: 10,
    color: '#666',
  },
  itemDescription: {
    marginBottom: 12,
    color: '#666',
    lineHeight: 20,
  },
  amenitiesSection: {
    marginBottom: 12,
  },
  amenitiesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityBadge: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#e3f2fd',
  },
  scheduleSection: {
    marginBottom: 12,
  },
  scheduleTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scheduleText: {
    marginBottom: 4,
  },
  operatingHours: {
    fontSize: 12,
    color: '#666',
  },
  stopsSection: {
    marginBottom: 12,
  },
  stopsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stopItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    marginRight: 8,
    color: '#1976d2',
  },
  stopText: {
    flex: 1,
    fontSize: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemContact: {
    fontSize: 12,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 8,
  },
  bookButton: {
    alignSelf: 'flex-end',
  },
  bookingCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bookingDates: {
    fontSize: 12,
    color: '#666',
  },
  bookingMeta: {
    alignItems: 'flex-end',
  },
  bookingStatus: {
    marginBottom: 4,
  },
  bookingAmount: {
    fontSize: 12,
    color: '#666',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bookingActionButton: {
    marginLeft: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalItemPrice: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactInfo: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default HostelAndTransportationScreen; 