import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PokemonCard } from '@/components/PokemonCard';
import pokemonReducer from '@/features/pokedex/pokemonSlice';
import type { Pokemon } from '@/features/pokedex/pokemonSlice';

function makeStore(pokemonDetails: Record<number, Pokemon> = {}) {
  return configureStore({
    reducer: { pokemon: pokemonReducer },
    preloadedState: {
      pokemon: {
        allPokemon: [],
        filteredPokemon: [],
        pokemonDetails,
        evolutionChains: {},
        typeFilter: {},
        abilityCache: {},
        loading: false,
        detailLoading: false,
        evolutionLoading: false,
        abilityLoading: {},
        error: null,
        searchQuery: '',
        selectedType: null,
        favorites: [],
      },
    },
  });
}

function renderCard(
  pokemon = { id: 1, name: 'bulbasaur' },
  details: Record<number, Pokemon> = {},
  onPress = jest.fn(),
) {
  const store = makeStore(details);
  return render(
    <Provider store={store}>
      <PokemonCard pokemon={pokemon} onPress={onPress} />
    </Provider>,
  );
}

const mockDetail: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  base_experience: 64,
  types: [
    { slot: 1, type: { name: 'grass', url: '' } },
    { slot: 2, type: { name: 'poison', url: '' } },
  ],
  stats: [{ base_stat: 45, stat: { name: 'hp', url: '' } }],
  abilities: [{ ability: { name: 'overgrow', url: '' }, is_hidden: false, slot: 1 }],
  sprites: {
    front_default: '',
    other: { 'official-artwork': { front_default: '', front_shiny: '' } },
  },
  species: { name: 'bulbasaur', url: '' },
};

// ─── Name rendering ───────────────────────────────────────────────────────────

describe('PokemonCard — name', () => {
  it('renders the capitalised pokemon name', () => {
    const { getByText } = renderCard();
    expect(getByText('Bulbasaur')).toBeTruthy();
  });

  it('renders hyphenated names with spaces', () => {
    const { getByText } = renderCard({ id: 122, name: 'mr-mime' });
    expect(getByText('Mr Mime')).toBeTruthy();
  });
});

// ─── ID rendering (BUG regression) ───────────────────────────────────────────

describe('PokemonCard — id display', () => {
  /**
   * BUG: PokemonCard.tsx line 61 renders `#{formatPokemonId(pokemon.id)}`.
   * formatPokemonId already returns '#001', so the displayed text was '##001'.
   *
   * After the fix (remove the extra leading '#' from the JSX), this test passes.
   */
  it('displays the id with a single # prefix (e.g. #001, not ##001)', () => {
    const { getByText, queryByText } = renderCard({ id: 1, name: 'bulbasaur' });
    expect(getByText('#001')).toBeTruthy();
    expect(queryByText('##001')).toBeNull();
  });

  it('displays three-digit ids correctly', () => {
    const { getByText } = renderCard({ id: 150, name: 'mewtwo' });
    expect(getByText('#150')).toBeTruthy();
  });

  it('displays a four-digit id without extra padding', () => {
    const { getByText } = renderCard({ id: 1000, name: 'gholdengo' });
    expect(getByText('#1000')).toBeTruthy();
  });
});

// ─── Interaction ──────────────────────────────────────────────────────────────

describe('PokemonCard — interaction', () => {
  it('calls onPress when the card is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderCard({ id: 1, name: 'bulbasaur' }, {}, onPress);
    fireEvent.press(getByText('Bulbasaur'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

// ─── Type badges (conditional rendering) ─────────────────────────────────────

describe('PokemonCard — type badges', () => {
  it('does not render type badges when no detail is cached', () => {
    const { queryByText } = renderCard({ id: 1, name: 'bulbasaur' }, {});
    expect(queryByText('grass')).toBeNull();
    expect(queryByText('poison')).toBeNull();
  });

  it('renders type badges when pokemon detail is in the Redux store', () => {
    const { getByText } = renderCard(
      { id: 1, name: 'bulbasaur' },
      { 1: mockDetail },
    );
    expect(getByText('grass')).toBeTruthy();
    expect(getByText('poison')).toBeTruthy();
  });

  it('renders only one badge for a single-type pokemon', () => {
    const singleType: Pokemon = {
      ...mockDetail,
      types: [{ slot: 1, type: { name: 'normal', url: '' } }],
    };
    const { getByText, queryByText } = renderCard(
      { id: 1, name: 'bulbasaur' },
      { 1: singleType },
    );
    expect(getByText('normal')).toBeTruthy();
    expect(queryByText('grass')).toBeNull();
  });
});
