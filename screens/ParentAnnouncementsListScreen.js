import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { theme } from '../config/theme';
import { Card, SectionHeader, LoadingView, EmptyState, SearchInput, Divider, Button, Badge } from '../components/UIComponents';
import { apiClient } from '../services/api';

const PAGE_SIZE = 20;

const ParentAnnouncementsListScreen = ({ navigation, route }) => {
  const childId = route?.params?.childId;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [search, setSearch] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const load = async (cursor = null, append = false) => {
    try {
      if (!append) setLoading(true);
      const resp = await apiClient.getParentAnnouncements({ limit: PAGE_SIZE, after: cursor || undefined, childId, pinned: pinnedOnly ? true : undefined });
      const list = resp?.data?.announcements || [];
      const next = resp?.data?.paging?.nextCursor || null;
      setAnnouncements(prev => append ? [...prev, ...list] : list);
      setNextCursor(next);
    } catch (e) {
      // handled globally by error handler
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [childId, pinnedOnly]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ParentAnnouncementDetail', { announcement: item })}>
      <Card style={{ marginHorizontal: 16, marginBottom: 12 }}>
        <SectionHeader title={item.title || 'Announcement'} subtitle={new Date(item.created_at).toLocaleString()} />
        {item.pinned ? (
          <View style={{ marginTop: 6 }}>
            <Badge title="Pinned" variant="info" size="small" />
          </View>
        ) : null}
        <Divider style={{ marginVertical: 10 }} />
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing && announcements.length === 0) {
    return <LoadingView message="Loading announcements..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ margin: 16 }}>
        <SectionHeader title="Announcements" subtitle="Updates for your child" />
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
        <EmptyState icon="📣" title="No announcements" message="No announcements for your child yet." actionTitle="Refresh" onAction={onRefresh} />
      ) : (
        <FlatList
          data={announcements.filter(a => !search || (a.title || '').toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => { if (nextCursor) load(nextCursor, true); }}
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      )}
    </View>
  );
};

export default ParentAnnouncementsListScreen;


