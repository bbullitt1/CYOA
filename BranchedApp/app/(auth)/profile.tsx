import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { updateProfile } from '../../src/api/auth';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, FontFamily, Radius, Spacing } from '../../src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { applyProfile } = useAuthStore();

  const [ageGroup,    setAgeGroup]    = useState<'young' | 'older' | null>(null);
  const [purpose,     setPurpose]     = useState<'entertainment' | 'decisions' | 'other' | null>(null);
  const [customGoal,  setCustomGoal]  = useState('');
  const [loading,     setLoading]     = useState(false);

  const handleFinish = async () => {
    if (!ageGroup || !purpose) {
      Alert.alert('Almost there!', 'Please select an age group and story purpose.');
      return;
    }
    if (purpose === 'other' && !customGoal.trim()) {
      Alert.alert('One more thing', 'Please describe the custom goal.');
      return;
    }
    setLoading(true);
    try {
      const updated = await updateProfile({
        age_group:            ageGroup,
        story_purpose:        purpose,
        story_purpose_custom: purpose === 'other' ? customGoal.trim() : '',
      });
      applyProfile(updated);
      router.replace('/(main)/worlds');
    } catch (err: unknown) {
      Alert.alert('Error', (err as Error)?.message ?? 'Could not save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Let's set up your adventure</Text>

          <Text style={styles.sectionLabel}>Who's reading?</Text>
          <View style={styles.row}>
            {([['young', '🌱', 'Ages 6–8', 'Short stories, gentle tension'],
               ['older', '🌿', 'Ages 8–12', 'Longer stories, real choices']] as const).map(([val, emoji, label, desc]) => (
              <Pressable
                key={val}
                onPress={() => setAgeGroup(val)}
                style={[styles.ageCard, ageGroup === val && styles.ageCardActive]}
              >
                <Text style={styles.ageEmoji}>{emoji}</Text>
                <Text style={styles.ageLabel}>{label}</Text>
                <Text style={styles.ageDesc}>{desc}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>What are stories for?</Text>
          {([
            ['entertainment', '🎉', 'Pure fun', 'Adventure for the love of it'],
            ['decisions',     '🧭', 'Decision-making', 'Help them think through choices'],
            ['other',         '✏️', 'Custom goal', 'You decide'],
          ] as const).map(([val, emoji, label, desc]) => (
            <Pressable
              key={val}
              onPress={() => setPurpose(val)}
              style={[styles.purposeCard, purpose === val && styles.purposeCardActive]}
            >
              <Text style={styles.purposeEmoji}>{emoji}</Text>
              <View style={styles.purposeText}>
                <Text style={styles.purposeLabel}>{label}</Text>
                <Text style={styles.purposeDesc}>{desc}</Text>
              </View>
            </Pressable>
          ))}

          {purpose === 'other' && (
            <TextInput
              style={styles.customInput}
              value={customGoal}
              onChangeText={setCustomGoal}
              placeholder="Describe the goal…"
              placeholderTextColor={Colors.textMuted}
              multiline
            />
          )}

          <Pressable
            onPress={handleFinish}
            disabled={loading}
            style={({ pressed }) => [styles.btn, (loading || pressed) && styles.btnDim]}
          >
            <Text style={styles.btnText}>{loading ? 'Saving…' : 'Start adventuring →'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg:    { flex: 1, backgroundColor: Colors.bg },
  flex:  { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical:   Spacing.xxl,
    gap: Spacing.md,
  },
  heading: {
    fontSize:   28,
    fontFamily: FontFamily.heading,
    color:      Colors.text,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize:   13,
    fontFamily: FontFamily.bodyBold,
    color:      Colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap:           Spacing.sm,
  },
  ageCard: {
    flex:            1,
    backgroundColor: Colors.surface,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing.md,
    alignItems:      'center',
    gap:             4,
  },
  ageCardActive: {
    borderColor:     Colors.accent,
    backgroundColor: '#1a0e38',
  },
  ageEmoji: { fontSize: 28 },
  ageLabel: { fontSize: 16, fontFamily: FontFamily.bodyBold, color: Colors.text },
  ageDesc:  { fontSize: 12, fontFamily: FontFamily.body, color: Colors.textSoft, textAlign: 'center' },

  purposeCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing.md,
  },
  purposeCardActive: {
    borderColor:     Colors.accent,
    backgroundColor: '#1a0e38',
  },
  purposeEmoji: { fontSize: 24 },
  purposeText:  { flex: 1 },
  purposeLabel: { fontSize: 16, fontFamily: FontFamily.bodyBold, color: Colors.text },
  purposeDesc:  { fontSize: 13, fontFamily: FontFamily.body, color: Colors.textSoft },

  customInput: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.md,
    borderWidth:     1,
    borderColor:     Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize:        16,
    color:           Colors.text,
    fontFamily:      FontFamily.body,
    minHeight:       80,
  },
  btn: {
    backgroundColor: Colors.accentDim,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    alignItems:      'center',
    marginTop:       Spacing.lg,
  },
  btnDim:  { opacity: 0.65 },
  btnText: { fontSize: 17, fontFamily: FontFamily.bodyBold, color: '#fff' },
});
