import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

export const selectFilteredPokemon = (state: RootState) => state.pokemon.filteredPokemon;
export const selectLoading = (state: RootState) => state.pokemon.loading;
export const selectError = (state: RootState) => state.pokemon.error;
export const selectSearchQuery = (state: RootState) => state.pokemon.searchQuery;
export const selectSelectedType = (state: RootState) => state.pokemon.selectedType;
export const selectFavorites = (state: RootState) => state.pokemon.favorites;
export const selectDetailLoading = (state: RootState) => state.pokemon.detailLoading;
export const selectEvolutionLoading = (state: RootState) => state.pokemon.evolutionLoading;

export const selectPokemonById = (id: number) =>
  createSelector(
    (state: RootState) => state.pokemon.pokemonDetails,
    (details) => details[id] ?? null,
  );

export const selectEvolutionChainForPokemon = (pokemonId: number) =>
  createSelector(
    (state: RootState) => state.pokemon.evolutionChains,
    (chains) => Object.values(chains).find((c) => {
      // Check if this pokemon is part of this chain
      function includes(link: typeof c.chain): boolean {
        const parts = link.species.url.replace(/\/$/, '').split('/');
        const id = parseInt(parts[parts.length - 1], 10);
        if (id === pokemonId) return true;
        return link.evolves_to.some(includes);
      }
      return includes(c.chain);
    }) ?? null,
  );

export const selectIsFavorite = (id: number) =>
  createSelector(
    selectFavorites,
    (favorites) => favorites.includes(id),
  );
