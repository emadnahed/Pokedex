import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPokemonList } from '@/features/pokedex/pokemonSlice';

export function usePokemon() {
  const dispatch = useAppDispatch();
  const { allPokemon, filteredPokemon, loading, error, favorites } = useAppSelector(
    (state) => state.pokemon,
  );

  useEffect(() => {
    if (allPokemon.length === 0 && !loading) {
      dispatch(fetchPokemonList());
    }
  }, [allPokemon.length, loading, dispatch]);

  return { allPokemon, filteredPokemon, loading, error, favorites };
}
