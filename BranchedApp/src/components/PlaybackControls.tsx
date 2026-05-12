import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, FontFamily } from '../constants/theme';

interface Props {
  isSpeaking:   boolean;
  isPaused:     boolean;
  onSeekBack:   () => void;
  onPause:      () => void;
  onReplay:     () => void;
  showReplay:   boolean;
}

export function PlaybackControls({ isSpeaking, isPaused, onSeekBack, onPause, onReplay, showReplay }: Props) {
  const dim = !isSpeaking && !isPaused;

  return (
    <View style={[styles.container, dim && styles.dim]}>
      <Pressable
        onPress={onSeekBack}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityLabel="Rewind 10 seconds"
      >
        <Text style={styles.btnText}>⏪ 10s</Text>
      </Pressable>

      <Pressable
        onPress={onPause}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
      >
        <Text style={styles.btnText}>{isPaused ? '▶ Resume' : '⏸ Pause'}</Text>
      </Pressable>

      {showReplay && (
        <Pressable
          onPress={onReplay}
          style={({ pressed }) => [styles.replayBtn, pressed && styles.btnPressed]}
          accessibilityLabel="Replay audio"
        >
          <Text style={styles.replayText}>🔊 Replay</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing.sm,
    flexWrap:       'wrap',
  },
  dim: {
    opacity: 0.3,
  },
  btn: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  replayBtn: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth:     1,
    borderColor:     Colors.accentDim,
  },
  btnPressed: {
    opacity: 0.6,
  },
  btnText: {
    fontSize:   14,
    color:      Colors.text,
    fontFamily: FontFamily.body,
  },
  replayText: {
    fontSize:   14,
    color:      Colors.accent,
    fontFamily: FontFamily.bodyBold,
  },
});
