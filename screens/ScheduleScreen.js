import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  PlatformCard,
  Title,
  Paragraph,
  PlatformButton,
  PlatformIconButton,
  PlatformChip,
} from '../components/PlatformWrapper';

const ScheduleScreen = () => {
  const [currentWeek, setCurrentWeek] = useState(0);

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
    1: { // Next week
      Monday: [
        { id: 9, courseCode: 'CS101', courseName: 'Introduction to Programming', instructor: 'Dr. Smith', time: '10:00 AM - 11:30 AM', room: 'Room 201', type: 'Lecture' },
      ],
      Tuesday: [
        { id: 10, courseCode: 'PHY101', courseName: 'Physics I', instructor: 'Dr. Brown', time: '1:00 PM - 2:00 PM', room: 'Lab 301', type: 'Lab' },
      ],
      Wednesday: [
        { id: 11, courseCode: 'CS101', courseName: 'Introduction to Programming', instructor: 'Dr. Smith', time: '10:00 AM - 11:30 AM', room: 'Room 201', type: 'Lecture' },
      ],
      Thursday: [
        { id: 12, courseCode: 'MATH201', courseName: 'Calculus I', instructor: 'Dr. Johnson', time: '2:00 PM - 3:30 PM', room: 'Room 105', type: 'Lecture' },
      ],
      Friday: [
        { id: 13, courseCode: 'PHY101', courseName: 'Physics I', instructor: 'Dr. Brown', time: '1:00 PM - 2:00 PM', room: 'Lab 301', type: 'Lab' },
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
      {/* Week Navigation */}
      <PlatformCard style={styles.navigationCard}>
        <View style={styles.navigationHeader}>
          <PlatformIconButton
            icon="chevron-left"
            onPress={() => navigateWeek(-1)}
            size={24}
          />
          <Title style={styles.weekTitle}>{getWeekLabel(currentWeek)}</Title>
          <PlatformIconButton
            icon="chevron-right"
            onPress={() => navigateWeek(1)}
            size={24}
          />
        </View>
        <PlatformButton
          mode="outlined"
          onPress={() => setCurrentWeek(0)}
          style={styles.todayButton}
          compact
        >
          Today
        </PlatformButton>
      </PlatformCard>

      <ScrollView style={styles.scheduleContainer}>
        {days.map(day => {
          const dayClasses = currentSchedule[day] || [];
          return (
            <PlatformCard key={day} style={styles.dayCard}>
              <Title style={styles.dayTitle}>{day}</Title>
              
              {dayClasses.length > 0 ? (
                dayClasses.map(classItem => (
                  <View key={classItem.id} style={styles.classItem}>
                    <View style={styles.classHeader}>
                      <View style={styles.classInfo}>
                        <Title style={styles.courseCode}>{classItem.courseCode}</Title>
                        <Title style={styles.courseName}>{classItem.courseName}</Title>
                        <Paragraph style={styles.instructor}>Instructor: {classItem.instructor}</Paragraph>
                      </View>
                      <PlatformChip
                        style={[styles.typeChip, { backgroundColor: getClassTypeColor(classItem.type) }]}
                        textStyle={styles.typeChipText}
                      >
                        {classItem.type}
                      </PlatformChip>
                    </View>
                    
                    <View style={styles.classDetails}>
                      <View style={styles.detailRow}>
                        <Paragraph style={styles.detailLabel}>Time:</Paragraph>
                        <Paragraph style={styles.detailValue}>{classItem.time}</Paragraph>
                      </View>
                      <View style={styles.detailRow}>
                        <Paragraph style={styles.detailLabel}>Room:</Paragraph>
                        <Paragraph style={styles.detailValue}>{classItem.room}</Paragraph>
                      </View>
                    </View>

                    <View style={styles.classActions}>
                      <PlatformButton
                        mode="outlined"
                        onPress={() => {}}
                        style={styles.actionButton}
                        compact
                      >
                        View Details
                      </PlatformButton>
                      <PlatformButton
                        mode="contained"
                        onPress={() => {}}
                        style={styles.actionButton}
                        compact
                      >
                        Join Class
                      </PlatformButton>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyDay}>
                  <Paragraph style={styles.emptyText}>No classes scheduled</Paragraph>
                  <Paragraph style={styles.emptySubtext}>Enjoy your free time!</Paragraph>
                </View>
              )}
            </PlatformCard>
          );
        })}
      </ScrollView>

      {/* Quick Stats */}
      <PlatformCard style={styles.statsCard}>
        <Title style={styles.statsTitle}>This Week Summary</Title>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Title style={styles.statNumber}>
              {Object.values(currentSchedule).flat().length}
            </Title>
            <Paragraph style={styles.statLabel}>Total Classes</Paragraph>
          </View>
          <View style={styles.statItem}>
            <Title style={styles.statNumber}>
              {Object.values(currentSchedule).filter(classes => classes.length > 0).length}
            </Title>
            <Paragraph style={styles.statLabel}>Days with Classes</Paragraph>
          </View>
          <View style={styles.statItem}>
            <Title style={styles.statNumber}>
              {Object.values(currentSchedule).flat().filter(c => c.type === 'Lecture').length}
            </Title>
            <Paragraph style={styles.statLabel}>Lectures</Paragraph>
          </View>
        </View>
      </PlatformCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navigationCard: {
    margin: 16,
    padding: 16,
  },
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  todayButton: {
    alignSelf: 'center',
  },
  scheduleContainer: {
    flex: 1,
  },
  dayCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1976d2',
  },
  classItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 2,
  },
  courseName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  instructor: {
    fontSize: 12,
    color: '#666',
  },
  typeChip: {
    height: 24,
  },
  typeChipText: {
    fontSize: 10,
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
    fontSize: 12,
  },
  detailValue: {
    color: '#333',
    fontSize: 12,
  },
  classActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyDay: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
  },
  statsCard: {
    margin: 16,
    padding: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ScheduleScreen; 