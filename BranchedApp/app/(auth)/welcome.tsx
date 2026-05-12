import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { register, login } from '../../src/api/auth';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, FontFamily, Radius, Spacing } from '../../src/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { applyProfile } = useAuthStore();

  const [mode,     setMode]     = useState<'login' | 'register'>('register');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = mode === 'register'
        ? await register(email.trim(), password)
        : await login(email.trim(), password);

      applyProfile(result.user);

      if (!result.user.age_group) {
        router.replace('/(auth)/profile');
      } else {
        router.replace('/(main)/worlds');
      }
    } catch (err: unknown) {
      Alert.alert('Error', (err as Error)?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <Text style={styles.logo}>Branched</Text>
          <Text style={styles.tagline}>Choose your story. Hear it come alive.</Text>

          {/* Tab toggle */}
          <View style={styles.tabs}>
            {(['register', 'login'] as const).map((m) => (
              <Pressable key={m} onPress={() => setMode(m)} style={[styles.tab, mode === m && styles.tabActive]}>
                <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                  {m === 'register' ? 'Create account' : 'Sign in'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [styles.submitBtn, (loading || pressed) && styles.submitBtnDim]}
            >
              <Text style={styles.submitText}>
                {loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg:         { flex: 1, backgroundColor: Colors.bg },
  flex:       { flex: 1 },
  scroll: {
    flexGrow:        1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    gap:             Spacing.lg,
  },
  logo: {
    fontSize:   48,
    fontFamily: FontFamily.heading,
    color:      Colors.text,
    textAlign:  'center',
  },
  tagline: {
    fontSize:   16,
    fontFamily: FontFamily.body,
    color:      Colors.textSoft,
    textAlign:  'center',
    marginBottom: Spacing.lg,
  },
  tabs: {
    flexDirection:   'row',
    backgroundColor: Colors.surface,
    borderRadius:    Radius.full,
    padding:         3,
    width:           '100%',
  },
  tab: {
    flex:            1,
    paddingVertical: 10,
    alignItems:      'center',
    borderRadius:    Radius.full,
  },
  tabActive: {
    backgroundColor: Colors.accentDim,
  },
  tabText: {
    fontSize:   15,
    fontFamily: FontFamily.body,
    color:      Colors.textMuted,
  },
  tabTextActive: {
    color:      '#fff',
    fontFamily: FontFamily.bodyBold,
  },
  form: {
    width: '100%',
    gap:   Spacing.sm,
  },
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
  submitBtn: {
    backgroundColor: Colors.accentDim,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.md,
    alignItems:      'center',
    marginTop:       Spacing.xs,
  },
  submitBtnDim: { opacity: 0.65 },
  submitText: {
    fontSize:   17,
    fontFamily: FontFamily.bodyBold,
    color:      '#fff',
  },
});
