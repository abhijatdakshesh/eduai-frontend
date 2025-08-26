import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { theme } from '../config/theme';
import { Card, SectionHeader, Divider, Badge } from '../components/UIComponents';
import { apiClient } from '../services/api';

const StudentAnnouncementDetailScreen = ({ route }) => {
  const { announcement } = route.params || {};

  useEffect(() => {
    if (announcement?.id) {
      apiClient.markStudentAnnouncementRead(announcement.id).catch(() => {});
    }
  }, [announcement?.id]);

  if (!announcement) {
    return null;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Card>
        <SectionHeader title={announcement.title || 'Announcement'} subtitle={new Date(announcement.created_at).toLocaleString()} />
        {announcement.pinned ? (
          <View style={{ marginTop: 6 }}>
            <Badge title="Pinned" variant="info" size="small" />
          </View>
        ) : null}
        <Divider style={{ marginVertical: 12 }} />
        <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 22 }}>
          {announcement.body || ''}
        </Text>
      </Card>
    </ScrollView>
  );
};

export default StudentAnnouncementDetailScreen;


