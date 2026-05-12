import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listStories, type SavedStory } from '../../src/api/stories';
import { Colors, FontFamily, Radius, Spacing } from '../../src/constants/theme';

const OUTCOME_ICON: Record<string, string> = {
  victory: '🏆',
  failure: '😬',
  lesson:  '⚖️',
};

export default function LibraryScreen() {
  const router  = useRouter();
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    listStories()
      .then(setStories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: SavedStory }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{item.genre_emoji}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.genre_name}</Text>
          <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.outcomeIcon}>{OUTCOME_ICON[item.outcome] ?? '📖'}</Text>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => router.push({ pathname: '/(main)/reader', params: { storyId: item.id } })}
        >
          <Text style={styles.actionBtnText}>Read</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.bg} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.heading}>Your stories</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading && <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />}

      {!!error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!loading && stories.length === 0 && !error && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No stories yet.</Text>
          <Text style={styles.emptySubText}>Finish an adventure to see it here.</Text>
        </View>
      )}

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg:     { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backText: { fontSize: 16, color: Colors.textSoft, fontFamily: FontFamily.body },
  heading:  { fontSize: 20, fontFamily: FontFamily.heading, color: Colors.text },
  list: {
    padding: Spacing.md,
    gap:     Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing.md,
    gap:             Spacing.sm,
    marginBottom:    Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
  },
  cardEmoji: { fontSize: 30 },
  cardInfo:  { flex: 1 },
  cardName: {
    fontSize:   16,
    fontFamily: FontFamily.bodyBold,
    color:      Colors.text,
  },
  cardDate: {
    fontSize:   12,
    fontFamily: FontFamily.body,
    color:      Colors.textMuted,
  },
  outcomeIcon: { fontSize: 24 },
  cardActions: {
    flexDirection: 'row',
    gap:           Spacing.sm,
  },
  actionBtn: {
    backgroundColor: Colors.accentDim,
    borderRadius:    Radius.md,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
  },
  actionBtnText: {
    fontSize:   14,
    fontFamily: FontFamily.bodyBold,
    color:      '#fff',
  },
  empty: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing.sm,
  },
  emptyText:    { fontSize: 18, fontFamily: FontFamily.bodyBold, color: Colors.textSoft },
  emptySubText: { fontSize: 14, fontFamily: FontFamily.body, color: Colors.textMuted },
  errorText:    { fontSize: 14, color: '#f87171', textAlign: 'center', margin: Spacing.md, fontFamily: FontFamily.body },
});
