import React, { useState, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORY_TYPES, shuffleArray, type StoryType } from '../constants/storyTypes';
import { Colors, Radius, Spacing, FontFamily } from '../constants/theme';

const PER_VIEW = 6;
const ORDER_KEY = 'b_type_order';
const IDX_KEY   = 'b_type_idx';

interface Props {
  onSelect: (type: StoryType) => void;
}

async function getNextSlice(): Promise<StoryType[]> {
  const total = STORY_TYPES.length;
  let order: number[];
  let idx: number;

  try {
    const rawOrder = await AsyncStorage.getItem(ORDER_KEY);
    const rawIdx   = await AsyncStorage.getItem(IDX_KEY);
    order = rawOrder ? JSON.parse(rawOrder) : null;
    idx   = rawIdx ? parseInt(rawIdx, 10) : 0;
  } catch {
    order = null as unknown as number[];
    idx   = 0;
  }

  if (!order || order.length !== total) {
    order = shuffleArray(Array.from({ length: total }, (_, i) => i));
    idx   = 0;
  }
  if (idx >= total) {
    order = shuffleArray(Array.from({ length: total }, (_, i) => i));
    idx   = 0;
  }

  const slice = order.slice(idx, idx + PER_VIEW);
  if (slice.length < PER_VIEW) {
    const extra = shuffleArray(Array.from({ length: total }, (_, i) => i)).slice(0, PER_VIEW - slice.length);
    slice.push(...extra);
  }

  await AsyncStorage.setItem(ORDER_KEY, JSON.stringify(order));
  await AsyncStorage.setItem(IDX_KEY, String(idx + PER_VIEW));

  return slice.map((i) => STORY_TYPES[i]);
}

export function WorldGrid({ onSelect }: Props) {
  const [worlds, setWorlds] = useState<StoryType[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [customText, setCustomText] = useState('');
  const [loading, setLoading] = useState(true);

  const moreWorlds = useMemo(() => {
    const shown = new Set(worlds.map((w) => w.n));
    return shuffleArray(STORY_TYPES.filter((t) => !shown.has(t.n))).slice(0, 12);
  }, [worlds]);

  React.useEffect(() => {
    getNextSlice().then((s) => { setWorlds(s); setLoading(false); });
  }, []);

  const handleCustom = () => {
    if (!customText.trim()) return;
    const custom: StoryType = {
      e: '✨', n: customText.trim(), sub: 'Custom Adventure',
      ac: '#c084fc', t: customText.trim(), gn: customText.trim(),
      ptcl: '#c084fc', portal: '', glow: 'rgba(150,60,255,.8)',
    };
    onSelect(custom);
  };

  if (loading) return <View style={styles.placeholder} />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Choose your world</Text>

        <View style={styles.grid}>
          {worlds.map((type) => (
            <WorldTile key={type.n} type={type} onPress={() => onSelect(type)} />
          ))}
        </View>

        <Pressable onPress={() => setShowMore((v) => !v)} style={styles.moreBtn}>
          <Text style={styles.moreBtnText}>{showMore ? '▲ Less worlds' : '＋ More worlds'}</Text>
        </Pressable>

        {showMore && (
          <View style={styles.grid}>
            {moreWorlds.map((type) => (
              <WorldTile key={type.n} type={type} onPress={() => onSelect(type)} />
            ))}
          </View>
        )}

        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            value={customText}
            onChangeText={setCustomText}
            placeholder="Or type your own world…"
            placeholderTextColor={Colors.textMuted}
            onSubmitEditing={handleCustom}
            returnKeyType="go"
          />
          <Pressable onPress={handleCustom} style={styles.customBtn}>
            <Text style={styles.customBtnText}>Go</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function WorldTile({ type, onPress }: { type: StoryType; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { borderColor: type.ac + '55' }, pressed && styles.tilePressed]}
      accessibilityLabel={`${type.n}: ${type.sub}`}
    >
      <Text style={styles.tileEmoji}>{type.e}</Text>
      <Text style={[styles.tileName, { color: type.ac }]}>{type.n}</Text>
      <Text style={styles.tileSub}>{type.sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom:     Spacing.xxl,
    alignItems:        'center',
  },
  heading: {
    fontSize:   28,
    fontFamily: FontFamily.heading,
    color:      Colors.text,
    marginBottom: Spacing.lg,
    marginTop:  Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           Spacing.sm,
    justifyContent:'center',
    width:         '100%',
    marginBottom:  Spacing.sm,
  },
  tile: {
    width:           '47%',
    backgroundColor: Colors.surface,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    padding:         Spacing.md,
    alignItems:      'center',
    gap:             4,
  },
  tilePressed: {
    opacity:   0.75,
    transform: [{ scale: 0.97 }],
  },
  tileEmoji: {
    fontSize:    36,
    marginBottom: 4,
  },
  tileName: {
    fontSize:   15,
    fontFamily: FontFamily.bodyBold,
    textAlign:  'center',
  },
  tileSub: {
    fontSize:   12,
    color:      Colors.textSoft,
    fontFamily: FontFamily.body,
    textAlign:  'center',
  },
  moreBtn: {
    paddingVertical:   10,
    paddingHorizontal: Spacing.lg,
    marginVertical:    Spacing.sm,
  },
  moreBtnText: {
    fontSize:   15,
    color:      Colors.accent,
    fontFamily: FontFamily.bodyBold,
  },
  customRow: {
    flexDirection: 'row',
    gap:           Spacing.sm,
    width:         '100%',
    marginTop:     Spacing.sm,
  },
  customInput: {
    flex:            1,
    backgroundColor: Colors.surface,
    borderRadius:    Radius.md,
    borderWidth:     1,
    borderColor:     Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize:        16,
    color:           Colors.text,
    fontFamily:      FontFamily.body,
  },
  customBtn: {
    backgroundColor: Colors.accentDim,
    borderRadius:    Radius.md,
    paddingHorizontal: Spacing.lg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  customBtnText: {
    color:      '#fff',
    fontFamily: FontFamily.bodyBold,
    fontSize:   16,
  },
  placeholder: {
    height: 300,
  },
});
