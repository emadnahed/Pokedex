import { configureStore } from '@reduxjs/toolkit';
import pokemonReducer, {
  setSearchQuery,
  setTypeFilter,
  fetchPokemonList,
  fetchPokemonDetail,
  fetchPokemonByType,
  toggleFavorite,
  fetchAbilityDetail,
} from '@/features/pokedex/pokemonSlice';
import type { PokemonListItem, Pokemon } from '@/features/pokedex/pokemonSlice';

// pokemonService is used inside thunks — mock the whole module
jest.mock('@/api/pokemonService', () => ({
  pokemonService: {
    getPokemonList: jest.fn(),
    getPokemonDetail: jest.fn(),
    getSpeciesChainId: jest.fn(),
    getEvolutionChain: jest.fn(),
    getPokemonByType: jest.fn(),
    getAbilityDetail: jest.fn(),
  },
}));

const { pokemonService } = jest.requireMock('@/api/pokemonService');

function makeStore(preloaded?: object) {
  return configureStore({
    reducer: { pokemon: pokemonReducer },
    ...(preloaded ? { preloadedState: preloaded } : {}),
  });
}

const mockList: PokemonListItem[] = [
  { id: 1, name: 'bulbasaur' },
  { id: 4, name: 'charmander' },
  { id: 7, name: 'squirtle' },
  { id: 25, name: 'pikachu' },
];

const mockDetail: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  base_experience: 64,
  types: [{ slot: 1, type: { name: 'grass', url: '' } }],
  stats: [{ base_stat: 45, stat: { name: 'hp', url: '' } }],
  abilities: [{ ability: { name: 'overgrow', url: '' }, is_hidden: false, slot: 1 }],
  sprites: { front_default: '', other: { 'official-artwork': { front_default: '', front_shiny: '' } } },
  species: { name: 'bulbasaur', url: '' },
};

// ─── Initial state ────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has correct shape', () => {
    const state = pokemonReducer(undefined, { type: '@@INIT' });
    expect(state.allPokemon).toEqual([]);
    expect(state.filteredPokemon).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.detailLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.searchQuery).toBe('');
    expect(state.selectedType).toBeNull();
    expect(state.favorites).toEqual([]);
  });
});

// ─── setSearchQuery ───────────────────────────────────────────────────────────

describe('setSearchQuery', () => {
  function stateWithList() {
    return pokemonReducer(
      undefined,
      fetchPokemonList.fulfilled(mockList, '', undefined),
    );
  }

  it('filters by pokemon name (case-insensitive)', () => {
    const state = pokemonReducer(stateWithList(), setSearchQuery('char'));
    expect(state.filteredPokemon).toEqual([{ id: 4, name: 'charmander' }]);
  });

  it('filters by exact pokemon id', () => {
    const state = pokemonReducer(stateWithList(), setSearchQuery('7'));
    expect(state.filteredPokemon).toEqual([{ id: 7, name: 'squirtle' }]);
  });

  it('does NOT match id=10 when searching "1" — only exact numeric match', () => {
    const extended: PokemonListItem[] = [...mockList, { id: 10, name: 'caterpie' }];
    let state = pokemonReducer(
      undefined,
      fetchPokemonList.fulfilled(extended, '', undefined),
    );
    state = pokemonReducer(state, setSearchQuery('1'));
    // id=1 matches; "caterpie" does not contain "1"; id=10 !== 1
    expect(state.filteredPokemon.map((p) => p.id)).toContain(1);
    expect(state.filteredPokemon.map((p) => p.id)).not.toContain(10);
  });

  it('returns empty array when no match', () => {
    const state = pokemonReducer(stateWithList(), setSearchQuery('zzz'));
    expect(state.filteredPokemon).toEqual([]);
  });

  it('restores all pokemon when query is cleared', () => {
    let state = pokemonReducer(stateWithList(), setSearchQuery('char'));
    state = pokemonReducer(state, setSearchQuery(''));
    expect(state.filteredPokemon).toEqual(mockList);
  });

  it('stores the search query in state', () => {
    const state = pokemonReducer(stateWithList(), setSearchQuery('pika'));
    expect(state.searchQuery).toBe('pika');
  });
});

// ─── setTypeFilter ────────────────────────────────────────────────────────────

describe('setTypeFilter', () => {
  it('stores the selected type', () => {
    const state = pokemonReducer(undefined, setTypeFilter('fire'));
    expect(state.selectedType).toBe('fire');
  });

  it('clears the filter when null is passed', () => {
    let state = pokemonReducer(undefined, setTypeFilter('fire'));
    state = pokemonReducer(state, setTypeFilter(null));
    expect(state.selectedType).toBeNull();
  });

  it('applies type filter against loaded typeFilter ids', () => {
    // First load the list
    let state = pokemonReducer(
      undefined,
      fetchPokemonList.fulfilled(mockList, '', undefined),
    );
    // Simulate fetchPokemonByType result: only id=4 is "fire"
    state = pokemonReducer(
      state,
      fetchPokemonByType.fulfilled({ type: 'fire', ids: [4] }, '', 'fire'),
    );
    // Now apply the type filter
    state = pokemonReducer(state, setTypeFilter('fire'));
    expect(state.filteredPokemon).toEqual([{ id: 4, name: 'charmander' }]);
  });
});

// ─── fetchPokemonList ─────────────────────────────────────────────────────────

describe('fetchPokemonList', () => {
  it('sets loading=true on pending', () => {
    const state = pokemonReducer(undefined, fetchPokemonList.pending('', undefined));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('populates allPokemon and filteredPokemon on fulfilled', () => {
    const state = pokemonReducer(
      undefined,
      fetchPokemonList.fulfilled(mockList, '', undefined),
    );
    expect(state.loading).toBe(false);
    expect(state.allPokemon).toEqual(mockList);
    expect(state.filteredPokemon).toEqual(mockList);
  });

  it('sets error on rejected', () => {
    const state = pokemonReducer(undefined, {
      type: fetchPokemonList.rejected.type,
      payload: 'Network error',
      error: { message: 'Network error' },
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('dispatches and resolves via the real thunk', async () => {
    pokemonService.getPokemonList.mockResolvedValueOnce(mockList);
    const store = makeStore();
    await store.dispatch(fetchPokemonList());
    expect(store.getState().pokemon.allPokemon).toEqual(mockList);
  });

  it('dispatches and rejects via the real thunk', async () => {
    pokemonService.getPokemonList.mockRejectedValueOnce(new Error('API down'));
    const store = makeStore();
    await store.dispatch(fetchPokemonList());
    expect(store.getState().pokemon.error).toBe('API down');
  });
});

// ─── fetchPokemonDetail ───────────────────────────────────────────────────────

describe('fetchPokemonDetail', () => {
  it('sets detailLoading=true on pending', () => {
    const state = pokemonReducer(undefined, fetchPokemonDetail.pending('', 1));
    expect(state.detailLoading).toBe(true);
  });

  it('caches detail keyed by pokemon id on fulfilled', () => {
    const state = pokemonReducer(
      undefined,
      fetchPokemonDetail.fulfilled(mockDetail, '', 1),
    );
    expect(state.detailLoading).toBe(false);
    expect(state.pokemonDetails[1]).toEqual(mockDetail);
  });

  it('clears detailLoading on rejected', () => {
    const state = pokemonReducer(undefined, {
      type: fetchPokemonDetail.rejected.type,
      error: { message: 'not found' },
    });
    expect(state.detailLoading).toBe(false);
  });
});

// ─── fetchAbilityDetail ───────────────────────────────────────────────────────

describe('fetchAbilityDetail', () => {
  it('sets abilityLoading for the ability name on pending', () => {
    const state = pokemonReducer(undefined, fetchAbilityDetail.pending('', 'overgrow'));
    expect(state.abilityLoading['overgrow']).toBe(true);
  });

  it('caches the ability description on fulfilled', () => {
    const state = pokemonReducer(
      undefined,
      fetchAbilityDetail.fulfilled({ name: 'overgrow', desc: 'Powers up Grass moves.' }, '', 'overgrow'),
    );
    expect(state.abilityLoading['overgrow']).toBe(false);
    expect(state.abilityCache['overgrow']).toBe('Powers up Grass moves.');
  });

  it('clears abilityLoading on rejected', () => {
    const pendingState = pokemonReducer(undefined, fetchAbilityDetail.pending('', 'overgrow'));
    const state = pokemonReducer(pendingState, {
      type: fetchAbilityDetail.rejected.type,
      meta: { arg: 'overgrow' },
      error: {},
    });
    expect(state.abilityLoading['overgrow']).toBe(false);
  });
});

// ─── toggleFavorite ───────────────────────────────────────────────────────────

describe('toggleFavorite', () => {
  it('adds a pokemon id to favorites', () => {
    const store = makeStore();
    store.dispatch(toggleFavorite.fulfilled([1], '', 1));
    expect(store.getState().pokemon.favorites).toContain(1);
  });

  it('removes a pokemon id when it is already favorited', () => {
    const store = makeStore();
    store.dispatch(toggleFavorite.fulfilled([1], '', 1));
    store.dispatch(toggleFavorite.fulfilled([], '', 1));
    expect(store.getState().pokemon.favorites).not.toContain(1);
  });

  it('dispatches the real thunk and persists to storage', async () => {
    const store = makeStore();
    // Add to favorites
    await store.dispatch(toggleFavorite(25));
    expect(store.getState().pokemon.favorites).toContain(25);
    // Toggle off
    await store.dispatch(toggleFavorite(25));
    expect(store.getState().pokemon.favorites).not.toContain(25);
  });
});
