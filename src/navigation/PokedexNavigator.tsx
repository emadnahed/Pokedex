import React from 'react';
import { useColorScheme } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PokedexScreen } from '@/features/pokedex/PokedexScreen';
import { PokemonDetailScreen } from '@/features/pokedex/PokemonDetailScreen';
import { EvolutionScreen } from '@/features/pokedex/EvolutionScreen';
import { Colors } from '@/utils/theme';

export type PokedexStackParamList = {
  Pokedex: undefined;
  PokemonDetail: { pokemonId: number };
  Evolution: { pokemonId: number };
};

const Stack = createNativeStackNavigator<PokedexStackParamList>();

export function PokedexNavigator() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const headerBg = isDark ? Colors.dark.headerBg : Colors.light.headerBg;

  return (
    <Stack.Navigator
      initialRouteName="Pokedex"
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700', fontSize: 20 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Pokedex"
        component={PokedexScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PokemonDetail"
        component={PokemonDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Evolution"
        component={EvolutionScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
