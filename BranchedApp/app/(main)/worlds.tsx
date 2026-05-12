import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorldGrid } from '../../src/components/WorldGrid';
import { useStoryStore } from '../../src/store/storyStore';
import { Colors, FontFamily, Spacing } from '../../src/constants/theme';
import type { StoryType } from '../../src/constants/storyTypes';

export default function WorldsScreen() {
  const router = useRouter();
  const { setSelectedType } = useStoryStore();

  const handleSelect = (type: StoryType) => {
    setSelectedType(type);
    router.push('/(main)/story');
  };

  return (
    <SafeAreaView style={styles.bg} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push('/(main)/library')} style={styles.navBtn}>
          <Text style={styles.navBtnText}>📚 Library</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(main)/settings')} style={styles.navBtn}>
          <Text style={styles.navBtnText}>⚙️</Text>
        </Pressable>
      </View>

      <WorldGrid onSelect={handleSelect} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex:            1,
    backgroundColor: Colors.bg,
  },
  topBar: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  navBtn: {
    paddingVertical:   6,
    paddingHorizontal: Spacing.sm,
  },
  navBtnText: {
    fontSize:   15,
    color:      Colors.textSoft,
    fontFamily: FontFamily.body,
  },
});
