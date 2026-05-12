import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, FontFamily } from '../constants/theme';

interface Props {
  isListening: boolean;
  onPress:     () => void;
  onCantTalk:  () => void;
}

export function VoiceButton({ isListening, onPress, onCantTalk }: Props) {
  const bars = Array.from({ length: 5 }, (_, i) => useRef(new Animated.Value(0.3)).current);

  useEffect(() => {
    if (isListening) {
      const anims = bars.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 80),
            Animated.timing(bar, { toValue: 1, duration: 300 + i * 40, useNativeDriver: true }),
            Animated.timing(bar, { toValue: 0.2, duration: 300 + i * 40, useNativeDriver: true }),
          ]),
        ),
      );
      Animated.parallel(anims).start();
      return () => anims.forEach((a) => a.stop());
    } else {
      bars.forEach((bar) => {
        Animated.timing(bar, { toValue: 0.3, duration: 200, useNativeDriver: true }).start();
      });
    }
  }, [isListening]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>What do you choose?</Text>

      <Pressable
        style={({ pressed }) => [
          styles.micBtn,
          isListening && styles.micBtnListening,
          pressed && styles.micBtnPressed,
        ]}
        onPress={handlePress}
        accessibilityLabel={isListening ? 'Listening for your choice' : 'Tap to say your choice'}
        accessibilityRole="button"
      >
        <View style={styles.waveRow}>
          {bars.map((bar, i) => (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                { transform: [{ scaleY: bar }] },
                isListening && styles.barListening,
              ]}
            />
          ))}
        </View>
        <Text style={styles.micText}>
          {isListening ? 'Listening… say your choice' : 'Tap to say your choice'}
        </Text>
      </Pressable>

      <Pressable onPress={onCantTalk} style={styles.cantTalk}>
        <Text style={styles.cantTalkText}>can't talk right now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width:       '100%',
    alignItems:  'center',
    gap:         Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  label: {
    fontSize:   12,
    letterSpacing: 1.5,
    color:      Colors.textMuted,
    fontFamily: FontFamily.bodyBold,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  micBtn: {
    width:           '100%',
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius:    Radius.xl,
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  micBtnListening: {
    borderColor:     Colors.accent,
    backgroundColor: '#1a0e38',
  },
  micBtnPressed: {
    opacity: 0.8,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
    height:        24,
  },
  bar: {
    width:        4,
    height:       18,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
  },
  barListening: {
    backgroundColor: Colors.accent,
  },
  micText: {
    flex:       1,
    fontSize:   17,
    fontFamily: FontFamily.bodyBold,
    color:      Colors.text,
  },
  cantTalk: {
    paddingVertical: 8,
  },
  cantTalkText: {
    fontSize:   13,
    color:      Colors.textMuted,
    fontFamily: FontFamily.body,
  },
});
