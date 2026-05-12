import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStory, type SavedStory } from '../../src/api/stories';
import { Colors, FontFamily, Radius, Spacing } from '../../src/constants/theme';

export default function ReaderScreen() {
  const router   = useRouter();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();

  const [story,   setStory]   = useState<SavedStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!storyId) { setError('No story ID'); setLoading(false); return; }
    getStory(storyId)
      .then(setStory)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [storyId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (error || !story) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Story not found.'}</Text>
        <Pressable onPress={() => router.back()}><Text style={styles.backLink}>← Back</Text></Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.bg} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.heading} numberOfLines={1}>
          {story.genre_emoji} {story.genre_name}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {story.segments.map((seg, i) => (
          <View key={i} style={styles.segment}>
            {/* Chapter title */}
            {seg.chapter ? (
              <Text style={styles.segChapter}>{seg.chapter}</Text>
            ) : null}

            {/* Branch point connector */}
            {i > 0 && seg.choiceMade ? (
              <View style={styles.branchPill}>
                <Text style={styles.branchText}>You chose: {seg.choiceMade}</Text>
              </View>
            ) : null}

            {/* Narration text */}
            <Text style={styles.narration}>{seg.narration}</Text>

            {/* Choices */}
            {seg.choices.length > 0 && i < story.segments.length - 1 && (
              <View style={styles.choicesRow}>
                {seg.choices.map((c, ci) => (
                  <View
                    key={ci}
                    style={[
                      styles.choiceTag,
                      c === story.segments[i + 1]?.choiceMade && styles.choiceTagChosen,
                    ]}
                  >
                    <Text style={styles.choiceTagText}>{c}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg:     { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg, gap: 12 },
  topBar: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backText:  { fontSize: 16, color: Colors.textSoft, fontFamily: FontFamily.body },
  backLink:  { fontSize: 16, color: Colors.accent, fontFamily: FontFamily.bodyBold },
  errorText: { fontSize: 14, color: '#f87171', fontFamily: FontFamily.body },
  heading:   { flex: 1, fontSize: 18, fontFamily: FontFamily.heading, color: Colors.text, textAlign: 'center' },
  scroll:    { padding: Spacing.md, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  segment: {
    gap:           Spacing.sm,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  segChapter: {
    fontSize:   13,
    fontFamily: FontFamily.bodyBold,
    color:      Colors.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  branchPill: {
    backgroundColor: Colors.accentDim + '33',
    borderRadius:    Radius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    alignSelf:       'flex-start',
    borderWidth:     1,
    borderColor:     Colors.accentDim + '55',
  },
  branchText: {
    fontSize:   12,
    color:      Colors.accent,
    fontFamily: FontFamily.bodyBold,
  },
  narration: {
    fontSize:   16,
    lineHeight: 26,
    color:      Colors.text,
    fontFamily: FontFamily.body,
  },
  choicesRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           Spacing.xs,
  },
  choiceTag: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.md,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  choiceTagChosen: {
    borderColor:     Colors.accent,
    backgroundColor: Colors.accentDim + '33',
  },
  choiceTagText: {
    fontSize:   13,
    color:      Colors.textSoft,
    fontFamily: FontFamily.body,
  },
});
