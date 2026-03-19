import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import {
  BricolageGrotesque_200ExtraLight,
  BricolageGrotesque_300Light,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { store } from '@/store/store';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        BricolageGrotesque_200ExtraLight,
        BricolageGrotesque_300Light,
        BricolageGrotesque_400Regular,
        BricolageGrotesque_500Medium,
        BricolageGrotesque_600SemiBold,
        BricolageGrotesque_700Bold,
        BricolageGrotesque_800ExtraBold,
        Nunito_400Regular,
        Nunito_500Medium,
        Nunito_600SemiBold,
        Nunito_700Bold,
        Nunito_800ExtraBold,
        Nunito_900Black,
        'Bricolage Grotesque': BricolageGrotesque_700Bold, // Default fallback
        Nunito: Nunito_400Regular,
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Or a splash screen
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
