import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, FontFamily } from '../constants/theme';

const TRACK_H  = 3;
const DOT_R    = 7;
const DOT_D    = DOT_R * 2;
const OUTER_H  = DOT_D + 6;

interface Props {
  isSpeaking:  boolean;
  isPaused:    boolean;
  duration:    number;   // ms
  position:    number;   // ms
  onSeekBack:  () => void;
  onPause:     () => void;
  onReplay:    () => void;
  onSeekTo:    (fraction: number) => void;
  showReplay:  boolean;
}

export function PlaybackControls({
  isSpeaking, isPaused, duration, position,
  onSeekBack, onPause, onReplay, onSeekTo, showReplay,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(0);

  const progress  = duration > 0 ? Math.min(1, position / duration) : 0;
  const fillWidth = trackWidth * progress;
  const dotLeft   = Math.max(0, fillWidth - DOT_R);

  const dim = !isSpeaking && !isPaused;

  return (
    <View style={[styles.container, dim && styles.dim]}>

      {/* Scrubber */}
      <Pressable
        style={styles.trackOuter}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        onPress={(e) => {
          if (!trackWidth) return;
          const { locationX } = e.nativeEvent;
          onSeekTo(Math.max(0, Math.min(1, locationX / trackWidth)));
        }}
        accessibilityLabel="Audio scrubber"
      >
        <View style={styles.trackBg} />
        <View style={[styles.trackFill, { width: fillWidth, backgroundColor: Colors.accent }]} />
        <View style={[styles.dot, { left: dotLeft }]} />
      </Pressable>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          onPress={onSeekBack}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          accessibilityLabel="Rewind 10 seconds"
        >
          <Text style={styles.iconText}>⏪ 10s</Text>
        </Pressable>

        <Pressable
          onPress={onPause}
          style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}
          accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
        >
          <Text style={styles.playBtnText}>{isPaused ? '▶' : '⏸'}</Text>
        </Pressable>

        {showReplay && (
          <Pressable
            onPress={onReplay}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityLabel="Replay audio"
          >
            <Text style={styles.iconText}>↺ Replay</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width:     '100%',
    gap:       Spacing.sm,
    alignItems:'center',
  },
  dim: { opacity: 0.3 },

  trackOuter: {
    width:          '100%',
    height:         OUTER_H,
    justifyContent: 'center',
  },
  trackBg: {
    position:        'absolute',
    left:            0,
    right:           0,
    height:          TRACK_H,
    borderRadius:    TRACK_H / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  trackFill: {
    position:     'absolute',
    left:         0,
    height:       TRACK_H,
    borderRadius: TRACK_H / 2,
  },
  dot: {
    position:        'absolute',
    width:           DOT_D,
    height:          DOT_D,
    borderRadius:    DOT_R,
    backgroundColor: '#fff',
    top:             (OUTER_H - DOT_D) / 2,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.3,
    shadowRadius:    2,
    elevation:       2,
  },

  controls: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing.lg,
  },
  iconBtn: {
    paddingVertical:   6,
    paddingHorizontal: Spacing.sm,
  },
  iconText: {
    fontSize:   14,
    color:      Colors.textSoft,
    fontFamily: FontFamily.body,
  },
  playBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: Colors.surface,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  playBtnText: {
    fontSize:   20,
    color:      Colors.text,
    lineHeight: 24,
  },
  pressed: { opacity: 0.6 },
});
