import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

export const pokeApi = {
  fetchList: (limit: number, offset: number) =>
    apiClient.get(`/pokemon?limit=${limit}&offset=${offset}`),
  fetchPokemon: (idOrName: string | number) =>
    apiClient.get(`/pokemon/${idOrName}`),
  fetchSpecies: (idOrName: string | number) =>
    apiClient.get(`/pokemon-species/${idOrName}`),
  fetchEvolutionChain: (id: number) =>
    apiClient.get(`/evolution-chain/${id}`),
  fetchByType: (type: string) =>
    apiClient.get(`/type/${type}`),
  fetchAbility: (name: string) =>
    apiClient.get(`/ability/${name}`),
};
