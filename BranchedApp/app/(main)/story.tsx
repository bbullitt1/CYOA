import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  Modal, Alert,
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

  const [phase,        setPhase]        = useState<StoryPhase>('loading');
  const [narration,    setNarration]    = useState('');
  const [chapter,      setChapter]      = useState('');
  const [choices,      setChoices]      = useState<string[]>([]);
  const [ending,       setEnding]       = useState<{ isFailure: boolean; isMoralLesson: boolean } | null>(null);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [useVoice,     setUseVoice]     = useState(true);
  const [showText,     setShowText]     = useState(false);
  const [pendingChoice, setPendingChoice] = useState<{ idx: number; text: string } | null>(null);

  const [isSpeaking,  setIsSpeaking]   = useState(false);

  const audio = useStoryAudio((speaking) => setIsSpeaking(speaking));

  const onVoiceResult = useCallback((idx: number) => {
    engine.makeChoice(idx);
    setPendingChoice({ idx, text: choices[idx] });
  }, [choices]);

  const voice = useVoiceRecognition(onVoiceResult);

  const engine = useStoryEngine(
    (p) => {
      setPhase(p);
      if (p !== 'narrating' && p !== 'loading') setPendingChoice(null);
    },
    (t) => {
      setNarration(t);
      store.setCurrentNarration(t);
    },
    (t) => {
      setChapter(t);
      store.setCurrentChapter(t);
    },
    (c) => {
      setChoices(c);
      store.setChoices(c);
    },
    (e) => {
      setEnding(e);
    },
    setErrorMsg,
  );

  // Start story on mount
  useEffect(() => {
    engine.startStory();
    return () => {
      audio.stopAll();
    };
  }, []);

  // When narration arrives, speak it then show choices / ending
  useEffect(() => {
    if (phase !== 'narrating' || !narration) return;

    const plainText = stripSSML(narration);
    if (!plainText) return;

    const afterSpeaking = () => {
      if (ending) {
        // Navigate to ending screen
        router.push('/(main)/ending');
      } else if (choices.length >= 2) {
        setPhase('choosing');
      }
    };

    audio.playNarration(narration, afterSpeaking);
  }, [phase, narration]);

  // When ending navigates, stop audio
  const handleMakeChoice = useCallback((idx: number) => {
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

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => { audio.stopAll(); router.back(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.chapterPill}>
          <Text style={styles.chapterEmoji}>{selectedType?.e ?? '🌿'}</Text>
          <Text style={styles.chapterTitle} numberOfLines={1}>{chapter || selectedType?.n}</Text>
        </View>

        <ProgressDots current={store.nodeCount} />
      </View>

      {/* Main content area */}
      <View style={styles.main}>

        {/* Loading / branching state */}
        {phase === 'loading' && (
          <View style={styles.centered}>
            <LoadingOrb
              emoji={selectedType?.e ?? '🌿'}
              choiceIdx={pendingChoice?.idx ?? -1}
              choiceText={pendingChoice?.text}
            />
          </View>
        )}

        {/* Story orb — visible during narrating & choosing */}
        {(phase === 'narrating' || phase === 'choosing') && (
          <View style={styles.orbZone}>
            <StoryOrb isSpeaking={isSpeaking} color={accentColor} size={200} />
          </View>
        )}

        {/* Error */}
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

          {/* Playback controls — always shown when narration available */}
          {narration !== '' && (
            <PlaybackControls
              isSpeaking={isSpeaking}
              isPaused={audio.isPaused}
              onSeekBack={audio.seekBack10s}
              onPause={audio.pauseToggle}
              onReplay={audio.replayLast}
              showReplay={!!narration}
            />
          )}

          {/* Status */}
          <Text style={styles.statusText}>
            {phase === 'narrating' && isSpeaking  ? 'Listening to story…'
           : phase === 'narrating' && !isSpeaking ? 'Getting ready…'
           : phase === 'choosing'  && useVoice    ? 'Tap the mic and choose'
           : phase === 'choosing'                 ? 'Choose your path'
           : ''}
          </Text>

          {/* Voice zone */}
          {phase === 'choosing' && useVoice && (
            <VoiceButton
              isListening={voice.isListening}
              onPress={handleMicPress}
              onCantTalk={() => setUseVoice(false)}
            />
          )}

          {/* Tap zone */}
          {phase === 'choosing' && !useVoice && (
            <View style={styles.tapZone}>
              <ChoiceCards choices={choices} onChoice={handleMakeChoice} />
              <Pressable onPress={() => setUseVoice(true)} style={styles.useVoiceBtn}>
                <Text style={styles.useVoiceText}>🎙️ Use voice instead</Text>
              </Pressable>
            </View>
          )}

          {/* Show text button */}
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
  bg:          { flex: 1, backgroundColor: Colors.bgStory },
  topBar: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap:             Spacing.sm,
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
  chapterPill: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    backgroundColor: Colors.surface,
    borderRadius:   Radius.full,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
  },
  chapterEmoji: { fontSize: 18 },
  chapterTitle: {
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
  statusText: {
    fontSize:      11,
    letterSpacing: 1.5,
    color:         Colors.textMuted,
    fontFamily:    FontFamily.bodyBold,
    textTransform: 'uppercase',
  },
  tapZone: {
    width: '100%',
    gap:   Spacing.sm,
    alignItems: 'center',
  },
  useVoiceBtn: {
    paddingVertical: 8,
  },
  useVoiceText: {
    fontSize:   14,
    color:      Colors.accent,
    fontFamily: FontFamily.body,
  },
  showTextBtn: {
    paddingVertical: 4,
  },
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
    backgroundColor: Colors.accentDim,
    borderRadius:    Radius.md,
    paddingVertical: Spacing.sm,
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  narrationText: {
    fontSize:   18,
    lineHeight: 28,
    color:      Colors.text,
    fontFamily: FontFamily.body,
  },
  closeBtn: {
    marginTop:       Spacing.xl,
    alignItems:      'center',
  },
  closeBtnText: {
    fontSize:   16,
    color:      Colors.accent,
    fontFamily: FontFamily.bodyBold,
  },
});
