import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../config/theme';
import { Card, SectionHeader, LoadingView, EmptyState, SearchInput, Divider, Badge, Button } from '../components/UIComponents';
import { apiClient } from '../services/api';

const PAGE_SIZE = 20;

const StudentAnnouncementsListScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [search, setSearch] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const load = async (cursor = null, append = false) => {
    try {
      if (!append) setLoading(true);
      const resp = await apiClient.getStudentAnnouncements({ limit: PAGE_SIZE, after: cursor || undefined, pinned: pinnedOnly ? true : undefined });
      const list = resp?.data?.announcements || [];
      const next = resp?.data?.paging?.nextCursor || null;
      setAnnouncements(prev => append ? [...prev, ...list] : list);
      setNextCursor(next);
    } catch (e) {
      // handled by global handler in UI components usage
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [pinnedOnly]);

  useFocusEffect(
    useCallback(() => {
      // Refresh when returning from detail
      return () => {};
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const renderItem = ({ item }) => {
    const isPinned = !!item.pinned;
    return (
      <TouchableOpacity onPress={() => navigation.navigate('StudentAnnouncementDetail', { announcement: item })}>
        <Card style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <SectionHeader
            title={item.title || 'Untitled'}
            subtitle={new Date(item.created_at).toLocaleString()}
          />
          {isPinned && (
            <View style={{ marginTop: 6 }}>
              <Badge title="Pinned" variant="info" size="small" />
            </View>
          )}
          <Divider style={{ marginVertical: 10 }} />
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && announcements.length === 0) {
    return <LoadingView message="Loading announcements..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ margin: 16 }}>
        <SectionHeader title="Announcements" subtitle="Latest updates from your teachers" />
        <View style={{ marginTop: 12 }}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Search announcements..." />
          <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button
              title={pinnedOnly ? 'Showing Pinned' : 'Show Pinned'}
              variant={pinnedOnly ? 'primary' : 'secondary'}
              size="small"
              onPress={() => setPinnedOnly(v => !v)}
            />
          </View>
        </View>
      </View>

      {announcements.length === 0 ? (
        <EmptyState
          icon="📣"
          title="No announcements"
          message="You have no announcements right now."
          actionTitle="Refresh"
          onAction={onRefresh}
        />
      ) : (
        <FlatList
          data={announcements.filter(a => !search || (a.title || '').toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (nextCursor) load(nextCursor, true);
          }}
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      )}
    </View>
  );
};

export default StudentAnnouncementsListScreen;


