import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PokedexNavigator } from './PokedexNavigator';

export type RootStackParamList = {
  PokedexStack: undefined;
};

const Root = createNativeStackNavigator<RootStackParamList>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const linking: any = {
  prefixes: ['pokedex://'],
  config: {
    screens: {
      PokedexStack: {
        screens: {
          Pokedex: 'pokedex',
          PokemonDetail: 'pokemon/:pokemonId',
          Evolution: 'evolution/:pokemonId',
        },
      },
    },
  },
};

export function RootNavigator() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <NavigationContainer linking={linking} theme={isDark ? DarkTheme : DefaultTheme}>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        <Root.Screen name="PokedexStack" component={PokedexNavigator} />
      </Root.Navigator>
    </NavigationContainer>
  );
}
