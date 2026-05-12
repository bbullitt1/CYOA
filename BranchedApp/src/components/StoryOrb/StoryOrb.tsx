import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  RadialGradient,
  vec,
  Blur,
  Paint,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { useOrbAnimation } from './useOrbAnimation';

interface Props {
  isSpeaking: boolean;
  color?:     string; // accent hex
  size?:      number;
}

// Parse hex to rgb components
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function withAlpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function lighten(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.min(255, r + 80)},${Math.min(255, g + 60)},${Math.min(255, b + 40)})`;
}

export function StoryOrb({ isSpeaking, color = '#c084fc', size = 220 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const baseR = size * 0.38;

  const { breathe, amplitude, blobPhase } = useOrbAnimation(isSpeaking);

  // Orb core radius
  const coreR = useDerivedValue(() => {
    const idleScale    = 1 + 0.04 * breathe.value;
    const speakScale   = 1 + 0.18 * amplitude.value;
    return baseR * (isSpeaking ? speakScale : idleScale);
  });

  // Aura (outer glow) radius
  const auraR = useDerivedValue(() => {
    const idleScale  = 1 + 0.06 * breathe.value;
    const speakScale = 1 + 0.28 * amplitude.value;
    return baseR * 1.4 * (isSpeaking ? speakScale : idleScale);
  });

  // Blob 1 offsets (orbiting blob)
  const blob1X = useDerivedValue(() => cx + Math.cos(blobPhase.value) * baseR * 0.4);
  const blob1Y = useDerivedValue(() => cy + Math.sin(blobPhase.value) * baseR * 0.3);
  const blob1R = useDerivedValue(() => baseR * 0.28 * (0.8 + 0.4 * amplitude.value));

  // Blob 2 (counter-orbit)
  const blob2X = useDerivedValue(() => cx + Math.cos(blobPhase.value + Math.PI) * baseR * 0.35);
  const blob2Y = useDerivedValue(() => cy + Math.sin(blobPhase.value + Math.PI) * baseR * 0.25);
  const blob2R = useDerivedValue(() => baseR * 0.22 * (0.7 + 0.5 * amplitude.value));

  const center = vec(cx, cy);
  const highlight = vec(cx - baseR * 0.25, cy - baseR * 0.3);

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Outer glow / aura */}
        <Circle cx={cx} cy={cy} r={auraR}>
          <Paint>
            <RadialGradient
              c={center}
              r={baseR * 1.5}
              colors={[withAlpha(color, 0.25), withAlpha(color, 0.08), 'transparent']}
            />
          </Paint>
          <Blur blur={16} />
        </Circle>

        {/* Lava blob 1 */}
        <Circle cx={blob1X} cy={blob1Y} r={blob1R} color={withAlpha(color, 0.55)}>
          <Blur blur={14} />
        </Circle>

        {/* Lava blob 2 */}
        <Circle cx={blob2X} cy={blob2Y} r={blob2R} color={withAlpha(lighten(color), 0.4)}>
          <Blur blur={12} />
        </Circle>

        {/* Core sphere */}
        <Circle cx={cx} cy={cy} r={coreR}>
          <RadialGradient
            c={highlight}
            r={baseR * 1.2}
            colors={[lighten(color), color, `#1a0440`]}
          />
        </Circle>

        {/* Specular highlight */}
        <Circle
          cx={cx - baseR * 0.22}
          cy={cy - baseR * 0.28}
          r={baseR * 0.18}
          color="rgba(255,255,255,0.18)"
        >
          <Blur blur={6} />
        </Circle>
      </Canvas>
    </View>
  );
}
