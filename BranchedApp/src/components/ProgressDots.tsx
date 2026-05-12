import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { MAX_NODES } from '../constants/api';
import { Colors } from '../constants/theme';
import { useStoryStore } from '../store/storyStore';

interface Props {
  current: number; // 1-based
}

function PulsingDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.6, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [scale]);

  return (
    <Animated.View
      style={[
        styles.dotActive,
        { backgroundColor: color, transform: [{ scale }] },
      ]}
    />
  );
}

export function ProgressDots({ current }: Props) {
  const { selectedType } = useStoryStore();
  const accentColor = selectedType?.ac ?? Colors.accent;

  return (
    <View style={styles.row}>
      {Array.from({ length: MAX_NODES }, (_, i) => {
        const done   = i < current - 1;
        const active = i === current - 1;
        if (active) {
          return <PulsingDot key={i} color={accentColor} />;
        }
        return (
          <View
            key={i}
            style={[styles.dot, done && styles.dotDone]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap:           8,
    alignItems:    'center',
  },
  dot: {
    width:           9,
    height:          9,
    borderRadius:    5,
    backgroundColor: Colors.border,
  },
  dotDone: {
    backgroundColor: Colors.textMuted,
  },
  dotActive: {
    width:        13,
    height:       13,
    borderRadius: 7,
  },
});
