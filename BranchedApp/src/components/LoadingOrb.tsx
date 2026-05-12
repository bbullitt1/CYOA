import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontFamily, Spacing } from '../constants/theme';

interface Props {
  emoji:       string;
  choiceIdx?:  number;  // -1 = starting story
  choiceText?: string;
}

const BADGE_LABELS  = ['①', '②', '③'];
const BADGE_COLORS  = [Colors.choice[0], Colors.choice[1], Colors.choice[2]];

export function LoadingOrb({ emoji, choiceIdx = -1, choiceText }: Props) {
  const pulse = useRef(new Animated.Value(0.85)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
    ).start();

    const makeRing = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2600, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      );

    Animated.parallel([
      makeRing(ring1, 0),
      makeRing(ring2, 860),
      makeRing(ring3, 1720),
    ]).start();
  }, []);

  const isChoice = choiceIdx >= 0 && choiceText;
  const badgeColor = isChoice ? BADGE_COLORS[Math.min(choiceIdx, 2)] : Colors.accentDim;

  return (
    <View style={styles.container}>
      {/* Expanding rings */}
      {[ring1, ring2, ring3].map((r, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              opacity: r.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.2, 0] }),
              transform: [{ scale: r.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
            },
          ]}
        />
      ))}

      {/* Emoji */}
      <Animated.Text
        style={[styles.emoji, { transform: [{ scale: pulse.interpolate({ inputRange: [0.85, 1], outputRange: [0.95, 1.05] }) }] }]}
      >
        {emoji}
      </Animated.Text>

      {/* Choice badge (if branching) */}
      {isChoice && (
        <>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeLabel}>{BADGE_LABELS[Math.min(choiceIdx, 2)]}</Text>
          </View>
          <Text style={styles.choiceText} numberOfLines={2}>{choiceText}</Text>
        </>
      )}

      <Text style={styles.statusLabel}>
        {isChoice ? 'Your story is branching…' : 'Starting your adventure…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems:      'center',
    justifyContent:  'center',
    gap:             Spacing.sm,
  },
  ring: {
    position:     'absolute',
    width:        160,
    height:       160,
    borderRadius: 80,
    borderWidth:  1.5,
    borderColor:  Colors.accent,
  },
  emoji: {
    fontSize:    64,
    marginBottom: 4,
  },
  badge: {
    width:           42,
    height:          42,
    borderRadius:    21,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       4,
  },
  badgeLabel: {
    fontSize:   20,
    color:      '#fff',
    fontFamily: FontFamily.bodyBold,
  },
  choiceText: {
    fontSize:   18,
    fontFamily: FontFamily.bodyBold,
    color:      Colors.text,
    textAlign:  'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 26,
  },
  statusLabel: {
    fontSize:      11,
    letterSpacing: 1.8,
    color:         Colors.textMuted,
    fontFamily:    FontFamily.bodyBold,
    textTransform: 'uppercase',
    marginTop:     Spacing.xs,
  },
});
