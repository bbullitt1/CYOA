import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StoryOrb } from '../../src/components/StoryOrb/StoryOrb';
import { LoadingOrb } from '../../src/components/LoadingOrb';
import { ChoiceCards } from '../../src/components/ChoiceCards';
import { VoiceButton } from '../../src/components/VoiceButton';
import { PlaybackControls } from '../../src/components/PlaybackControls';
import { ProgressDots } from '../../src/components/ProgressDots';
import { useStoryAudio } from '../../src/hooks/useStoryAudio';
import { useVoiceRecognition } from '../../src/hooks/useVoiceRecognition';
import { useStoryEngine, type StoryPhase } from '../../src/hooks/useStoryEngine';
import { useStoryStore } from '../../src/store/storyStore';
import { stripSSML } from '../../src/utils/parseStory';
import { Colors, FontFamily, Radius, Spacing } from '../../src/constants/theme';

export default function StoryScreen() {
  const router = useRouter();
  const store  = useStoryStore();

  const [phase,         setPhase]        = useState<StoryPhase>('loading');
  const [narration,     setNarration]    = useState('');
  const [choices,       setChoices]      = useState<string[]>([]);
  const [ending,        setEnding]       = useState<{ isFailure: boolean; isMoralLesson: boolean } | null>(null);
  const [errorMsg,      setErrorMsg]     = useState('');
  const [useVoice,      setUseVoice]     = useState(true);
  const [showText,      setShowText]     = useState(false);
  const [pendingChoice, setPendingChoice]= useState<{ idx: number; text: string } | null>(null);
  const [isSpeaking,    setIsSpeaking]   = useState(false);

  const beatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const audio = useStoryAudio((speaking) => setIsSpeaking(speaking));

  const onVoiceResult = useCallback((idx: number) => {
    engine.makeChoice(idx);
    setPendingChoice({ idx, text: choices[idx] });
  }, [choices]); // eslint-disable-line react-hooks/exhaustive-deps

  const voice = useVoiceRecognition(onVoiceResult);

  const engine = useStoryEngine(
    (p) => {
      setPhase(p);
      if (p !== 'narrating' && p !== 'loading') setPendingChoice(null);
    },
    (t) => { setNarration(t); store.setCurrentNarration(t); },
    (t) => { store.setCurrentChapter(t); },  // track chapter for store only (not displayed)
    (c) => { setChoices(c); store.setChoices(c); },
    (e) => { setEnding(e); },
    setErrorMsg,
  );

  // Start story on mount
  useEffect(() => {
    engine.startStory();
    return () => {
      audio.stopAll();
      if (beatTimerRef.current) clearTimeout(beatTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When narration arrives, speak it — show choices/ending only after audio finishes + beat
  useEffect(() => {
    if (phase !== 'narrating' || !narration) return;
    const plainText = stripSSML(narration);
    if (!plainText) return;

    const afterSpeaking = () => {
      // 1.5-second beat before showing choices / transitioning to ending
      beatTimerRef.current = setTimeout(() => {
        if (ending) {
          router.push('/(main)/ending');
        } else if (choices.length >= 2) {
          setPhase('choosing');
        }
      }, 1500);
    };

    audio.playNarration(narration, afterSpeaking);
  }, [phase, narration]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMakeChoice = useCallback((idx: number) => {
    if (beatTimerRef.current) { clearTimeout(beatTimerRef.current); beatTimerRef.current = null; }
    setPendingChoice({ idx, text: choices[idx] });
    audio.stopAll();
    engine.makeChoice(idx);
  }, [choices, audio, engine]);

  const handleMicPress = useCallback(() => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening(choices);
    }
  }, [voice, choices]);

  const selectedType = store.selectedType;
  const accentColor  = selectedType?.ac ?? Colors.accent;

  return (
    <SafeAreaView style={styles.bg} edges={['top', 'bottom']}>

      {/* Top bar — world title only, no chapter names */}
      <View style={styles.topBar}>
        <Pressable onPress={() => { audio.stopAll(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.titlePill}>
          <Text style={styles.titleEmoji}>{selectedType?.e ?? '🌿'}</Text>
          <Text style={styles.titleText} numberOfLines={1}>{selectedType?.n ?? ''}</Text>
        </View>

        <ProgressDots current={store.nodeCount} />
      </View>

      {/* Main content area */}
      <View style={styles.main}>

        {phase === 'loading' && (
          <View style={styles.centered}>
            <LoadingOrb
              emoji={selectedType?.e ?? '🌿'}
              choiceIdx={pendingChoice?.idx ?? -1}
              choiceText={pendingChoice?.text}
            />
          </View>
        )}

        {(phase === 'narrating' || phase === 'choosing') && (
          <View style={styles.orbZone}>
            <StoryOrb isSpeaking={isSpeaking} color={accentColor} size={200} />
          </View>
        )}

        {phase === 'error' && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{errorMsg || 'Something went wrong.'}</Text>
            <Pressable onPress={() => engine.startStory()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Bottom panel — hidden during loading */}
      {phase !== 'loading' && (
        <View style={styles.bottomPanel}>

          {/* Spotify-style audio scrubber — always shown when narration available */}
          {narration !== '' && (
            <PlaybackControls
              isSpeaking={isSpeaking}
              isPaused={audio.isPaused}
              duration={audio.duration}
              position={audio.position}
              onSeekBack={audio.seekBack10s}
              onPause={audio.pauseToggle}
              onReplay={audio.replayLast}
              onSeekTo={audio.seekTo}
              showReplay={!!narration}
            />
          )}

          {/* Voice zone — only after audio concludes (choosing phase) */}
          {phase === 'choosing' && useVoice && (
            <VoiceButton
              isListening={voice.isListening}
              onPress={handleMicPress}
              onCantTalk={() => setUseVoice(false)}
            />
          )}

          {/* Tap zone — only after audio concludes (choosing phase) */}
          {phase === 'choosing' && !useVoice && (
            <View style={styles.tapZone}>
              <ChoiceCards choices={choices} onChoice={handleMakeChoice} />
              <Pressable onPress={() => setUseVoice(true)} style={styles.useVoiceBtn}>
                <Text style={styles.useVoiceText}>🎙️ Use voice instead</Text>
              </Pressable>
            </View>
          )}

          {/* Show text */}
          {narration !== '' && (
            <Pressable onPress={() => setShowText(true)} style={styles.showTextBtn}>
              <Text style={styles.showTextBtnText}>Show text</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Narration text overlay */}
      <Modal visible={showText} transparent animationType="fade" onRequestClose={() => setShowText(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.overlayContent}>
            <Text style={styles.narrationText}>{stripSSML(narration)}</Text>
          </ScrollView>
          <Pressable onPress={() => setShowText(false)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>← Back to story</Text>
          </Pressable>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg:      { flex: 1, backgroundColor: Colors.bgStory },
  topBar: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
    gap:               Spacing.sm,
  },
  backBtn: {
    paddingVertical:   6,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize:   16,
    color:      Colors.textSoft,
    fontFamily: FontFamily.body,
  },
  titlePill: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    backgroundColor: Colors.surface,
    borderRadius:    Radius.full,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
  },
  titleEmoji: { fontSize: 18 },
  titleText: {
    flex:       1,
    fontSize:   14,
    fontFamily: FontFamily.bodyBold,
    color:      Colors.text,
  },
  main: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  centered: {
    alignItems:     'center',
    justifyContent: 'center',
    padding:        Spacing.xl,
    gap:            Spacing.md,
  },
  orbZone: {
    alignItems:     'center',
    justifyContent: 'center',
    flex:           1,
  },
  bottomPanel: {
    paddingHorizontal: Spacing.md,
    paddingBottom:     Spacing.lg,
    gap:               Spacing.md,
    alignItems:        'center',
  },
  tapZone: {
    width:      '100%',
    gap:        Spacing.sm,
    alignItems: 'center',
  },
  useVoiceBtn: { paddingVertical: 8 },
  useVoiceText: {
    fontSize:   14,
    color:      Colors.accent,
    fontFamily: FontFamily.body,
  },
  showTextBtn:     { paddingVertical: 4 },
  showTextBtnText: {
    fontSize:   13,
    color:      Colors.textMuted,
    fontFamily: FontFamily.body,
  },
  errorText: {
    fontSize:   16,
    color:      Colors.textSoft,
    fontFamily: FontFamily.body,
    textAlign:  'center',
  },
  retryBtn: {
    backgroundColor:   Colors.accentDim,
    borderRadius:      Radius.md,
    paddingVertical:   Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  retryText: {
    color:      '#fff',
    fontFamily: FontFamily.bodyBold,
    fontSize:   15,
  },
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    padding:         Spacing.xl,
    justifyContent:  'center',
  },
  overlayContent: {
    flexGrow:       1,
    justifyContent: 'center',
  },
  narrationText: {
    fontSize:   18,
    lineHeight: 28,
    color:      Colors.text,
    fontFamily: FontFamily.body,
  },
  closeBtn:     { marginTop: Spacing.xl, alignItems: 'center' },
  closeBtnText: {
    fontSize:   16,
    color:      Colors.accent,
    fontFamily: FontFamily.bodyBold,
  },
});
