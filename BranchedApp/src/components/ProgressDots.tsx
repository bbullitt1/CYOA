import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MAX_NODES } from '../constants/api';
import { Colors } from '../constants/theme';

interface Props {
  current: number; // 1-based
}

export function ProgressDots({ current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: MAX_NODES }, (_, i) => {
        const done   = i < current - 1;
        const active = i === current - 1;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              done   && styles.dotDone,
              active && styles.dotActive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap:           6,
    alignItems:    'center',
  },
  dot: {
    width:        7,
    height:       7,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotDone: {
    backgroundColor: Colors.textMuted,
  },
  dotActive: {
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: Colors.accent,
  },
});
