import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/authStore';
import { getToken } from '../src/api/client';
import { getProfile } from '../src/api/auth';

export default function RootLayout() {
  const { setLoaded, applyProfile } = useAuthStore();

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  useEffect(() => {
    // Configure iOS audio session once at startup
    Audio.setAudioModeAsync({
      playsInSilentModeIOS:    true,
      staysActiveInBackground: false,
      allowsRecordingIOS:      false,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await getToken();
        if (token) {
          const user = await getProfile();
          applyProfile(user);
        }
      } catch {
        // Token invalid or expired — user will be sent to welcome
      } finally {
        setLoaded(true);
      }
    }
    bootstrap();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </>
  );
}
