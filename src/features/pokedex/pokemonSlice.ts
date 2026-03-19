import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { pokemonService } from '@/api/pokemonService';
import { storage } from '@/utils/storage';

const FAVORITES_KEY = 'pokemon_favorites';

function loadFavorites(): number[] {
  try {
    const raw = storage.getString(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'number')) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PokemonListItem {
  id: number;
  name: string;
}

export interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

export interface PokemonStat {
  base_stat: number;
  stat: { name: string; url: string };
}

export interface PokemonAbility {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonSprites {
  front_default: string;
  other: {
    'official-artwork': {
      front_default: string;
      front_shiny: string;
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: PokemonSprites;
  species: { name: string; url: string };
}

export interface EvolutionDetail {
  min_level: number | null;
  item: { name: string } | null;
  trigger: { name: string };
}

export interface EvolutionLink {
  species: { name: string; url: string };
  evolves_to: EvolutionLink[];
  evolution_details: EvolutionDetail[];
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionLink;
}

// ─── State ───────────────────────────────────────────────────────────────────

interface PokemonState {
  allPokemon: PokemonListItem[];
  filteredPokemon: PokemonListItem[];
  pokemonDetails: Record<number, Pokemon>;
  evolutionChains: Record<number, EvolutionChain>;
  typeFilter: Record<string, number[]>;
  abilityCache: Record<string, string>;
  loading: boolean;
  detailLoading: boolean;
  evolutionLoading: boolean;
  abilityLoading: Record<string, boolean>;
  error: string | null;
  searchQuery: string;
  selectedType: string | null;
  favorites: number[];
}

const initialState: PokemonState = {
  allPokemon: [],
  filteredPokemon: [],
  pokemonDetails: {},
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
  favorites: loadFavorites(),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function applyFilters(
  all: PokemonListItem[],
  query: string,
  selectedType: string | null,
  typeFilter: Record<string, number[]>,
): PokemonListItem[] {
  let result = all;

  if (selectedType && typeFilter[selectedType]) {
    const typeIds = new Set(typeFilter[selectedType]);
    result = result.filter((p) => typeIds.has(p.id));
  }

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    const asNumber = parseInt(q, 10);
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (!isNaN(asNumber) && p.id === asNumber),
    );
  }

  return result;
}

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchPokemonList = createAsyncThunk(
  'pokemon/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      return await pokemonService.getPokemonList();
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchPokemonDetail = createAsyncThunk(
  'pokemon/fetchDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      return await pokemonService.getPokemonDetail(id);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchPokemonByType = createAsyncThunk(
  'pokemon/fetchByType',
  async (type: string, { rejectWithValue }) => {
    try {
      const ids = await pokemonService.getPokemonByType(type);
      return { type, ids };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchEvolutionForPokemon = createAsyncThunk(
  'pokemon/fetchEvolution',
  async (pokemonId: number, { rejectWithValue }) => {
    try {
      const chainId = await pokemonService.getSpeciesChainId(pokemonId);
      const chain = await pokemonService.getEvolutionChain(chainId);
      return chain;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchAbilityDetail = createAsyncThunk(
  'pokemon/fetchAbility',
  async (name: string, { rejectWithValue }) => {
    try {
      const desc = await pokemonService.getAbilityDetail(name);
      return { name, desc };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  'pokemon/toggleFavorite',
  async (id: number, { getState, rejectWithValue }) => {
    const state = getState() as { pokemon: PokemonState };
    const idx = state.pokemon.favorites.indexOf(id);
    const newFavorites = [...state.pokemon.favorites];
    if (idx >= 0) {
      newFavorites.splice(idx, 1);
    } else {
      newFavorites.push(id);
    }
    try {
      storage.set(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.filteredPokemon = applyFilters(
        state.allPokemon,
        action.payload,
        state.selectedType,
        state.typeFilter,
      );
    },
    setTypeFilter(state, action: PayloadAction<string | null>) {
      state.selectedType = action.payload;
      state.filteredPokemon = applyFilters(
        state.allPokemon,
        state.searchQuery,
        action.payload,
        state.typeFilter,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPokemonList
      .addCase(fetchPokemonList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPokemonList.fulfilled, (state, action) => {
        state.loading = false;
        state.allPokemon = action.payload;
        state.filteredPokemon = applyFilters(
          action.payload,
          state.searchQuery,
          state.selectedType,
          state.typeFilter,
        );
      })
      .addCase(fetchPokemonList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchPokemonDetail
      .addCase(fetchPokemonDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchPokemonDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.pokemonDetails[action.payload.id] = action.payload;
      })
      .addCase(fetchPokemonDetail.rejected, (state) => {
        state.detailLoading = false;
      })
      // fetchPokemonByType
      .addCase(fetchPokemonByType.fulfilled, (state, action) => {
        state.typeFilter[action.payload.type] = action.payload.ids;
        state.filteredPokemon = applyFilters(
          state.allPokemon,
          state.searchQuery,
          state.selectedType,
          { ...state.typeFilter, [action.payload.type]: action.payload.ids },
        );
      })
      // fetchEvolutionForPokemon
      .addCase(fetchEvolutionForPokemon.pending, (state) => {
        state.evolutionLoading = true;
      })
      .addCase(fetchEvolutionForPokemon.fulfilled, (state, action) => {
        state.evolutionLoading = false;
        state.evolutionChains[action.payload.id] = action.payload;
      })
      .addCase(fetchEvolutionForPokemon.rejected, (state) => {
        state.evolutionLoading = false;
      })
      // fetchAbilityDetail
      .addCase(fetchAbilityDetail.pending, (state, action) => {
        state.abilityLoading[action.meta.arg] = true;
      })
      .addCase(fetchAbilityDetail.fulfilled, (state, action) => {
        state.abilityLoading[action.payload.name] = false;
        state.abilityCache[action.payload.name] = action.payload.desc;
      })
      .addCase(fetchAbilityDetail.rejected, (state, action) => {
        state.abilityLoading[action.meta.arg] = false;
      })
      // toggleFavorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.favorites = action.payload;
      });
  },
});

export const { setSearchQuery, setTypeFilter } = pokemonSlice.actions;
export default pokemonSlice.reducer;
