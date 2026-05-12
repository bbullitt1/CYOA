import React from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStoryStore } from '../../src/store/storyStore';
import { GENRE_BADGES } from '../../src/constants/storyTypes';
import { Colors, FontFamily, Radius, Spacing } from '../../src/constants/theme';

// Passed as a search param from story screen via navigation state
// We read from the store directly since this is always reached via navigation
export default function EndingScreen() {
  const router = useRouter();
  const { selectedType, choiceLog, nodeCount } = useStoryStore();

  // Determine ending type from the last choiceLog entry context
  // The story.tsx pushes ending info to storyStore before navigating here.
  // We store ending type in the store's currentChapter field as a sentinel:
  // "ENDING:victory" / "ENDING:failure" / "ENDING:lesson"
  const { currentChapter } = useStoryStore();
  const isFailure     = currentChapter.includes('ENDING:failure');
  const isMoralLesson = currentChapter.includes('ENDING:lesson');
  const outcome       = isMoralLesson ? 'lesson' : isFailure ? 'failure' : 'victory';

  const badges = selectedType ? (GENRE_BADGES[selectedType.gn] ?? GENRE_BADGES['Fantasy Quest']) : [];

  const bgColor = isFailure ? '#2a1000' : isMoralLesson ? '#1a0840' : '#051a10';

  const handleRewindTo = (idx: number) => {
    // Navigate back to story and rewind
    router.back();
    // rewindTo is called from story screen via event / param
    // For simplicity, we navigate with a param
    router.push({ pathname: '/(main)/story', params: { rewindTo: String(idx) } });
  };

  const handlePlayAgain = () => {
    router.replace('/(main)/worlds');
  };

  return (
    <SafeAreaView style={[styles.bg, { backgroundColor: bgColor }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Main outcome */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>
            {isFailure ? '😬' : isMoralLesson ? '⚖️' : '🏆'}
          </Text>

          <Text style={styles.heroTitle}>
            {isFailure     ? 'Uh Oh… Not Quite!'
           : isMoralLesson ? 'Every Choice Has a Consequence.'
           :                 'You Did It, Hero!'}
          </Text>

          <Text style={styles.heroSub}>
            {isFailure
              ? 'That path didn\'t work out this time — but the adventure isn\'t over!'
              : isMoralLesson
              ? 'Some choices lead somewhere unexpected. What would you do differently?'
              : 'You made it to the end. That took real courage.'}
          </Text>
        </View>

        {/* Victory badges */}
        {outcome === 'victory' && badges.length > 0 && (
          <View style={styles.badgeRow}>
            {badges.map((b, i) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Rewind history — show for failure & lesson */}
        {(outcome === 'failure' || outcome === 'lesson') && choiceLog.length > 0 && (
          <View style={styles.rewindSection}>
            <Text style={styles.rewindLabel}>Rewind your story</Text>
            {choiceLog.map((entry, i) => (
              <Pressable key={i} onPress={() => handleRewindTo(i)} style={styles.rewindCard}>
                <View style={styles.rewindDot} />
                <Text style={styles.rewindText} numberOfLines={2}>
                  {entry.chapter ? `${entry.chapter}: ` : ''}{entry.choiceText}
                </Text>
                <Text style={styles.rewindArrow}>↩</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable onPress={handlePlayAgain} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>
              {outcome === 'victory' ? '🌟 New adventure' : '🔄 Try a new story'}
            </Text>
          </Pressable>

          {(outcome === 'failure' || outcome === 'lesson') && (
            <Pressable onPress={() => handleRewindTo(choiceLog.length - 1)} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>↩ Go back to last choice</Text>
            </Pressable>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: {
    flexGrow:          1,
    paddingHorizontal: Spacing.xl,
    paddingVertical:   Spacing.xxl,
    alignItems:        'center',
    gap:               Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap:        Spacing.md,
  },
  heroEmoji: {
    fontSize:    80,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize:   28,
    fontFamily: FontFamily.heading,
    color:      Colors.text,
    textAlign:  'center',
  },
  heroSub: {
    fontSize:   16,
    lineHeight: 24,
    fontFamily: FontFamily.body,
    color:      Colors.textSoft,
    textAlign:  'center',
  },
  badgeRow: {
    width:     '100%',
    gap:       Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     Colors.accentDim + '55',
  },
  badgeText: {
    fontSize:   16,
    color:      Colors.text,
    fontFamily: FontFamily.bodyBold,
  },
  rewindSection: {
    width: '100%',
    gap:   Spacing.sm,
  },
  rewindLabel: {
    fontSize:   12,
    letterSpacing: 1.5,
    color:      Colors.textMuted,
    fontFamily: FontFamily.bodyBold,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  rewindCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius:    Radius.md,
    padding:         Spacing.md,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  rewindDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: Colors.textMuted,
    flexShrink:      0,
  },
  rewindText: {
    flex:       1,
    fontSize:   14,
    color:      Colors.textSoft,
    fontFamily: FontFamily.body,
  },
  rewindArrow: {
    fontSize:   18,
    color:      Colors.accent,
  },
  actions: {
    width: '100%',
    gap:   Spacing.sm,
  },
  primaryBtn: {
    backgroundColor: Colors.accentDim,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    alignItems:      'center',
  },
  primaryBtnText: {
    fontSize:   17,
    fontFamily: FontFamily.bodyBold,
    color:      '#fff',
  },
  secondaryBtn: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  secondaryBtnText: {
    fontSize:   16,
    fontFamily: FontFamily.bodyBold,
    color:      Colors.text,
  },
});
