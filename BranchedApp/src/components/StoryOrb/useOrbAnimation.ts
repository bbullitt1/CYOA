import { useEffect } from 'react';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

export function useOrbAnimation(isSpeaking: boolean) {
  const breathe   = useSharedValue(0);  // 0-1 idle breathing
  const amplitude = useSharedValue(0);  // 0-1 speaking pulse
  const blobPhase = useSharedValue(0);  // 0-2π blob rotation

  useEffect(() => {
    cancelAnimation(blobPhase);
    blobPhase.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: isSpeaking ? 2800 : 5500,
        easing:   Easing.linear,
      }),
      -1, false,
    );

    if (isSpeaking) {
      cancelAnimation(breathe);
      breathe.value = 0.5;

      // Simulate frequency-reactive amplitude with randomized sequences
      const pulse = () => {
        amplitude.value = withSequence(
          withTiming(0.4 + Math.random() * 0.6, { duration: 120 + Math.random() * 180 }),
          withTiming(0.1 + Math.random() * 0.3, { duration: 80 + Math.random() * 120 }),
        );
      };
      // Repeat the pulse via a simple repeating timing
      amplitude.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 140 }),
          withTiming(0.2, { duration: 110 }),
          withTiming(0.9, { duration: 160 }),
          withTiming(0.3, { duration: 90  }),
          withTiming(0.7, { duration: 130 }),
          withTiming(0.15,{ duration: 100 }),
        ),
        -1, false,
      );
    } else {
      cancelAnimation(amplitude);
      amplitude.value = withTiming(0, { duration: 500 });

      cancelAnimation(breathe);
      breathe.value = withRepeat(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        -1, true,
      );
    }
  }, [isSpeaking]);

  return { breathe, amplitude, blobPhase };
}
