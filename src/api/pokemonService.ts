import { pokeApi } from './pokeApi';
import { storage } from '@/utils/storage';
import type { PokemonListItem, Pokemon, EvolutionChain } from '@/features/pokedex/pokemonSlice';

const LIST_CACHE_KEY = 'pokemon_list_cache';
const LIST_CACHE_TS_KEY = 'pokemon_list_cache_ts';
const DETAIL_CACHE_PREFIX = 'pokemon_detail_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

class PokemonService {
  async getPokemonList(limit = 898): Promise<PokemonListItem[]> {
    const cached = this.readListCache();
    if (cached) return cached;

    const { data } = await pokeApi.fetchList(limit, 0);
    const items: PokemonListItem[] = (data.results as { name: string; url: string }[]).map(
      (item, index) => ({
        id: index + 1,
        name: item.name,
      }),
    );
    this.writeListCache(items);
    return items;
  }

  async getPokemonDetail(id: number): Promise<Pokemon> {
    const cacheKey = `${DETAIL_CACHE_PREFIX}${id}`;
    const cached = storage.getString(cacheKey);
    if (cached) return JSON.parse(cached) as Pokemon;

    const { data } = await pokeApi.fetchPokemon(id);
    storage.set(cacheKey, JSON.stringify(data));
    return data as Pokemon;
  }

  async getEvolutionChain(chainId: number): Promise<EvolutionChain> {
    const cacheKey = `evo_chain_${chainId}`;
    const cached = storage.getString(cacheKey);
    if (cached) return JSON.parse(cached) as EvolutionChain;

    const { data } = await pokeApi.fetchEvolutionChain(chainId);
    storage.set(cacheKey, JSON.stringify(data));
    return data as EvolutionChain;
  }

  async getPokemonByType(type: string): Promise<number[]> {
    const cacheKey = `type_${type}`;
    const cached = storage.getString(cacheKey);
    if (cached) return JSON.parse(cached) as number[];

    const { data } = await pokeApi.fetchByType(type);
    const ids: number[] = (data.pokemon as { pokemon: { name: string; url: string } }[]).map(
      (entry) => {
        const parts = entry.pokemon.url.replace(/\/$/, '').split('/');
        return parseInt(parts[parts.length - 1], 10);
      },
    );
    storage.set(cacheKey, JSON.stringify(ids));
    return ids;
  }

  async getSpeciesChainId(pokemonId: number): Promise<number> {
    const { data } = await pokeApi.fetchSpecies(pokemonId);
    const chainUrl: string = data.evolution_chain.url;
    const parts = chainUrl.replace(/\/$/, '').split('/');
    return parseInt(parts[parts.length - 1], 10);
  }

  clearListCache(): void {
    storage.remove(LIST_CACHE_KEY);
    storage.remove(LIST_CACHE_TS_KEY);
  }

  private readListCache(): PokemonListItem[] | null {
    const ts = storage.getNumber(LIST_CACHE_TS_KEY);
    if (!ts || Date.now() - ts > CACHE_TTL) return null;
    const raw = storage.getString(LIST_CACHE_KEY);
    return raw ? (JSON.parse(raw) as PokemonListItem[]) : null;
  }

  private writeListCache(items: PokemonListItem[]): void {
    storage.set(LIST_CACHE_KEY, JSON.stringify(items));
    storage.set(LIST_CACHE_TS_KEY, Date.now());
  }
}

export const pokemonService = new PokemonService();
