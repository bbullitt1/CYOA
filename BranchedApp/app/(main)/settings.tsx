import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, TextInput, Alert,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateProfile, changePassword, signOut } from '../../src/api/auth';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, FontFamily, Radius, Spacing } from '../../src/constants/theme';

export default function SettingsScreen() {
  const router  = useRouter();
  const store   = useAuthStore();
  const { user, ageGroup, storyPurpose, storyPurposeCustom, applyProfile, reset } = store;

  const [selectedAge,    setSelectedAge]    = useState(ageGroup);
  const [selectedPurpose,setSelectedPurpose]= useState(storyPurpose);
  const [customGoal,     setCustomGoal]     = useState(storyPurposeCustom);
  const [currentPw,      setCurrentPw]      = useState('');
  const [newPw,          setNewPw]          = useState('');
  const [saving,         setSaving]         = useState(false);
  const [savingPw,       setSavingPw]       = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        age_group:            selectedAge,
        story_purpose:        selectedPurpose,
        story_purpose_custom: selectedPurpose === 'other' ? customGoal.trim() : '',
      });
      applyProfile(updated);
      Alert.alert('Saved!', 'Your settings have been updated.');
    } catch (err: unknown) {
      Alert.alert('Error', (err as Error)?.message ?? 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) {
      Alert.alert('Missing info', 'Enter both current and new password.');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw(''); setNewPw('');
      Alert.alert('Done!', 'Password changed successfully.');
    } catch (err: unknown) {
      Alert.alert('Error', (err as Error)?.message ?? 'Could not change password.');
    } finally {
      setSavingPw(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign out?', 'You\'ll need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          reset();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.bg} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.heading}>Settings</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <Text style={styles.email}>{user?.email}</Text>

          {/* Age group */}
          <Text style={styles.sectionLabel}>Reader age</Text>
          <View style={styles.row}>
            {([['young', '🌱', 'Ages 6–8'], ['older', '🌿', 'Ages 8–12']] as const).map(([val, emoji, label]) => (
              <Pressable
                key={val}
                onPress={() => setSelectedAge(val)}
                style={[styles.optionCard, selectedAge === val && styles.optionCardActive]}
              >
                <Text style={styles.optionEmoji}>{emoji}</Text>
                <Text style={styles.optionLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Purpose */}
          <Text style={styles.sectionLabel}>Story purpose</Text>
          {([
            ['entertainment', '🎉', 'Pure fun'],
            ['decisions',     '🧭', 'Decision-making'],
            ['other',         '✏️', 'Custom goal'],
          ] as const).map(([val, emoji, label]) => (
            <Pressable
              key={val}
              onPress={() => setSelectedPurpose(val)}
              style={[styles.purposeCard, selectedPurpose === val && styles.optionCardActive]}
            >
              <Text style={styles.optionEmoji}>{emoji}</Text>
              <Text style={styles.optionLabel}>{label}</Text>
            </Pressable>
          ))}

          {selectedPurpose === 'other' && (
            <TextInput
              style={styles.input}
              value={customGoal}
              onChangeText={setCustomGoal}
              placeholder="Custom goal…"
              placeholderTextColor={Colors.textMuted}
              multiline
            />
          )}

          <Pressable
            onPress={handleSaveProfile}
            disabled={saving}
            style={[styles.btn, styles.btnAccent, saving && styles.btnDim]}
          >
            <Text style={styles.btnText}>{saving ? 'Saving…' : 'Save preferences'}</Text>
          </Pressable>

          {/* Change password */}
          <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>Change password</Text>
          <TextInput
            style={styles.input}
            value={currentPw}
            onChangeText={setCurrentPw}
            placeholder="Current password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            value={newPw}
            onChangeText={setNewPw}
            placeholder="New password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />
          <Pressable
            onPress={handleChangePassword}
            disabled={savingPw}
            style={[styles.btn, styles.btnAccent, savingPw && styles.btnDim]}
          >
            <Text style={styles.btnText}>{savingPw ? 'Updating…' : 'Update password'}</Text>
          </Pressable>

          {/* Sign out */}
          <Pressable onPress={handleSignOut} style={[styles.btn, styles.btnDanger, { marginTop: Spacing.xl }]}>
            <Text style={styles.btnText}>Sign out</Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg:    { flex: 1, backgroundColor: Colors.bg },
  flex:  { flex: 1 },
  topBar: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backText: { fontSize: 16, color: Colors.textSoft, fontFamily: FontFamily.body },
  heading:  { fontSize: 20, fontFamily: FontFamily.heading, color: Colors.text },
  scroll:   { padding: Spacing.xl, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  email: {
    fontSize:   14,
    fontFamily: FontFamily.body,
    color:      Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize:   12,
    letterSpacing: 1.2,
    color:      Colors.textMuted,
    fontFamily: FontFamily.bodyBold,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', gap: Spacing.sm },
  optionCard: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing.md,
  },
  optionCardActive: {
    borderColor:     Colors.accent,
    backgroundColor: '#1a0e38',
  },
  purposeCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    padding:         Spacing.md,
  },
  optionEmoji: { fontSize: 20 },
  optionLabel: { fontSize: 15, fontFamily: FontFamily.bodyBold, color: Colors.text },
  input: {
    backgroundColor: Colors.surface,
    borderRadius:    Radius.md,
    borderWidth:     1,
    borderColor:     Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize:        16,
    color:           Colors.text,
    fontFamily:      FontFamily.body,
  },
  btn: {
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    alignItems:      'center',
    marginTop:       4,
  },
  btnAccent:  { backgroundColor: Colors.accentDim },
  btnDanger:  { backgroundColor: '#7f1d1d' },
  btnDim:     { opacity: 0.65 },
  btnText: {
    fontSize:   16,
    fontFamily: FontFamily.bodyBold,
    color:      '#fff',
  },
});
