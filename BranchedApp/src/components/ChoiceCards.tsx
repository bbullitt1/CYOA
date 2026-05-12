import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, FontFamily } from '../constants/theme';

interface Props {
  choices:  string[];
  onChoice: (idx: number) => void;
}

const BADGE_LABELS = ['①', '②', '③'];
const BADGE_COLORS = [Colors.choice[0], Colors.choice[1], Colors.choice[2]];

export function ChoiceCards({ choices, onChoice }: Props) {
  const handlePress = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChoice(idx);
  };

  return (
    <View style={styles.grid}>
      {choices.map((text, idx) => (
        <Pressable
          key={idx}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => handlePress(idx)}
          accessibilityLabel={`Choice ${idx + 1}: ${text}`}
          accessibilityRole="button"
        >
          <View style={[styles.badge, { backgroundColor: BADGE_COLORS[idx] }]}>
            <Text style={styles.badgeLabel}>{BADGE_LABELS[idx]}</Text>
          </View>
          <Text style={styles.choiceText}>{text}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width:   '100%',
    gap:     Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  card: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius:   Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  badge: {
    width:        40,
    height:       40,
    borderRadius: Radius.full,
    alignItems:   'center',
    justifyContent: 'center',
    flexShrink:   0,
  },
  badgeLabel: {
    fontSize:   18,
    color:      '#fff',
    fontFamily: FontFamily.bodyBold,
  },
  choiceText: {
    flex:       1,
    fontSize:   17,
    lineHeight: 24,
    color:      Colors.text,
    fontFamily: FontFamily.body,
  },
});
