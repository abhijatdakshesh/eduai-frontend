import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useBackButton } from '../utils/backButtonHandler';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const SimpleScheduleScreen = ({ navigation }) => {
  const [currentWeek, setCurrentWeek] = useState(0);

  // Back button handler
  useBackButton(navigation);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const scheduleData = {
    0: { // Current week
      Monday: [
        { id: 1, courseCode: 'CS101', courseName: 'Introduction to Programming', instructor: 'Dr. Smith', time: '10:00 AM - 11:30 AM', room: 'Room 201', type: 'Lecture' },
        { id: 2, courseCode: 'MATH201', courseName: 'Calculus I', instructor: 'Dr. Johnson', time: '2:00 PM - 3:30 PM', room: 'Room 105', type: 'Lecture' },
      ],
      Tuesday: [
        { id: 3, courseCode: 'PHY101', courseName: 'Physics I', instructor: 'Dr. Brown', time: '1:00 PM - 2:00 PM', room: 'Lab 301', type: 'Lab' },
      ],
      Wednesday: [
        { id: 4, courseCode: 'CS101', courseName: 'Introduction to Programming', instructor: 'Dr. Smith', time: '10:00 AM - 11:30 AM', room: 'Room 201', type: 'Lecture' },
        { id: 5, courseCode: 'ENG101', courseName: 'Composition', instructor: 'Dr. Davis', time: '3:00 PM - 4:30 PM', room: 'Room 150', type: 'Discussion' },
      ],
      Thursday: [
        { id: 6, courseCode: 'MATH201', courseName: 'Calculus I', instructor: 'Dr. Johnson', time: '2:00 PM - 3:30 PM', room: 'Room 105', type: 'Lecture' },
      ],
      Friday: [
        { id: 7, courseCode: 'PHY101', courseName: 'Physics I', instructor: 'Dr. Brown', time: '1:00 PM - 2:00 PM', room: 'Lab 301', type: 'Lab' },
        { id: 8, courseCode: 'BUS101', courseName: 'Introduction to Business', instructor: 'Dr. Wilson', time: '3:00 PM - 4:30 PM', room: 'Room 205', type: 'Lecture' },
      ],
      Saturday: [],
      Sunday: [],
    },
  };

  const getWeekLabel = (weekOffset) => {
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === 1) return 'Next Week';
    if (weekOffset === -1) return 'Last Week';
    return `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`;
  };

  const getClassTypeColor = (type) => {
    switch (type) {
      case 'Lecture': return '#2196F3';
      case 'Lab': return '#4CAF50';
      case 'Discussion': return '#FF9800';
      case 'Exam': return '#f44336';
      default: return '#666';
    }
  };

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => prev + direction);
  };

  const currentSchedule = scheduleData[currentWeek] || {};

  return (
    <View style={styles.container}>
      <View style={styles.navigationCard}>
        <View style={styles.navigationHeader}>
          <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.navButton}>
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.weekTitle}>{getWeekLabel(currentWeek)}</Text>
          <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.navButton}>
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setCurrentWeek(0)} style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scheduleContainer}>
        {days.map(day => {
          const dayClasses = currentSchedule[day] || [];
          return (
            <View key={day} style={styles.dayCard}>
              <Text style={styles.dayTitle}>{day}</Text>
              
              {dayClasses.length > 0 ? (
                dayClasses.map(classItem => (
                  <View key={classItem.id} style={styles.classItem}>
                    <View style={styles.classHeader}>
                      <View style={styles.classInfo}>
                        <Text style={styles.courseCode}>{classItem.courseCode}</Text>
                        <Text style={styles.courseName}>{classItem.courseName}</Text>
                        <Text style={styles.instructor}>Instructor: {classItem.instructor}</Text>
                      </View>
                      <View style={[styles.typeChip, { backgroundColor: getClassTypeColor(classItem.type) }]}>
                        <Text style={styles.typeChipText}>{classItem.type}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.classDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Time:</Text>
                        <Text style={styles.detailValue}>{classItem.time}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Room:</Text>
                        <Text style={styles.detailValue}>{classItem.room}</Text>
                      </View>
                    </View>

                    <View style={styles.classActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>View Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.joinButton]}>
                        <Text style={styles.joinButtonText}>Join Class</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyText}>No classes scheduled</Text>
                  <Text style={styles.emptySubtext}>Enjoy your free time!</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>This Week Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Object.values(currentSchedule).flat().length}
            </Text>
            <Text style={styles.statLabel}>Total Classes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Object.values(currentSchedule).filter(classes => classes.length > 0).length}
            </Text>
            <Text style={styles.statLabel}>Days with Classes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Object.values(currentSchedule).flat().filter(c => c.type === 'Lecture').length}
            </Text>
            <Text style={styles.statLabel}>Lectures</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  navigationCard: {
    margin: isIOS ? 12 : 16,
    padding: isIOS ? 12 : 16,
    backgroundColor: '#ffffff',
    borderRadius: isIOS ? 10 : 12,
  },
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: isIOS ? 16 : 18,
    color: '#1a237e',
  },
  weekTitle: {
    fontSize: isIOS ? 16 : 18,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  todayButton: {
    alignSelf: 'center',
    paddingHorizontal: isIOS ? 12 : 16,
    paddingVertical: isIOS ? 6 : 8,
    backgroundColor: '#1a237e',
    borderRadius: isIOS ? 6 : 8,
  },
  todayButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scheduleContainer: {
    flex: 1,
  },
  dayCard: {
    margin: isIOS ? 12 : 16,
    marginTop: 0,
    padding: isIOS ? 12 : 16,
    backgroundColor: '#ffffff',
    borderRadius: isIOS ? 10 : 12,
  },
  dayTitle: {
    fontSize: isIOS ? 16 : 18,
    fontWeight: 'bold',
    marginBottom: isIOS ? 12 : 16,
    color: '#1a237e',
  },
  classItem: {
    marginBottom: isIOS ? 12 : 16,
    padding: isIOS ? 10 : 12,
    backgroundColor: '#f8f9fa',
    borderRadius: isIOS ? 6 : 8,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  classInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: isIOS ? 14 : 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 2,
  },
  courseName: {
    fontSize: isIOS ? 12 : 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  instructor: {
    fontSize: isIOS ? 10 : 12,
    color: '#666',
  },
  typeChip: {
    paddingHorizontal: isIOS ? 6 : 8,
    paddingVertical: isIOS ? 3 : 4,
    borderRadius: isIOS ? 8 : 12,
  },
  typeChipText: {
    fontSize: isIOS ? 9 : 10,
    color: 'white',
  },
  classDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: isIOS ? 10 : 12,
  },
  detailValue: {
    color: '#333',
    fontSize: isIOS ? 10 : 12,
  },
  classActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: isIOS ? 3 : 4,
    paddingVertical: isIOS ? 6 : 8,
    paddingHorizontal: isIOS ? 10 : 12,
    borderRadius: isIOS ? 6 : 8,
    borderWidth: 1,
    borderColor: '#1a237e',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#1a237e',
    fontWeight: '600',
    fontSize: isIOS ? 11 : 12,
  },
  joinButton: {
    backgroundColor: '#1a237e',
  },
  joinButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: isIOS ? 11 : 12,
  },
  emptyDay: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: isIOS ? 14 : 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: isIOS ? 10 : 12,
    color: '#999',
  },
  statsCard: {
    margin: isIOS ? 12 : 16,
    padding: isIOS ? 12 : 16,
    backgroundColor: '#ffffff',
    borderRadius: isIOS ? 10 : 12,
  },
  statsTitle: {
    fontSize: isIOS ? 14 : 16,
    fontWeight: 'bold',
    marginBottom: isIOS ? 12 : 16,
    textAlign: 'center',
    color: '#1a237e',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: isIOS ? 20 : 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  statLabel: {
    fontSize: isIOS ? 10 : 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default SimpleScheduleScreen;

