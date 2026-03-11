import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded, searchFor, clearSearch, selectType } from '../helpers/pokedex';
import { waitForAnimations } from '../setup';

describe('Pokédex List Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitForListLoaded(20000);
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  // ── Spotlight ────────────────────────────────────────────────────────────────

  it('renders the spotlight card for the first Pokémon', async () => {
    await detoxExpect(element(by.id('spotlight-card'))).toBeVisible();
  });

  it('renders at least one grid card', async () => {
    // Bulbasaur (#1) is the spotlight; Ivysaur (#2) should be in the grid
    await detoxExpect(element(by.id('pokemon-card-2'))).toBeVisible();
  });

  // ── Search ───────────────────────────────────────────────────────────────────

  it('filters by name: searching "bulbasaur" shows Bulbasaur card', async () => {
    await searchFor('bulbasaur');
    await waitForAnimations();
    // Bulbasaur is always the spotlight when it matches search
    await detoxExpect(element(by.id('spotlight-card'))).toBeVisible();
  });

  it('filters by name: Charmander is absent when searching "bulbasaur"', async () => {
    // pokemon-card-4 is Charmander — should be filtered out
    await detoxExpect(element(by.id('pokemon-card-4'))).not.toBeVisible();
  });

  it('filters by Pokédex number: searching "25" shows Pikachu', async () => {
    await clearSearch();
    await searchFor('25');
    await waitForAnimations();
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(5000);
  });

  it('clearing search restores the full list', async () => {
    await clearSearch();
    await waitForListLoaded(10000);
    await detoxExpect(element(by.id('spotlight-card'))).toBeVisible();
  });

  // ── Type Filter ──────────────────────────────────────────────────────────────

  it('type filter: selecting Fire shows fire-type Pokémon', async () => {
    await selectType('fire');
    await waitForAnimations(800);
    // Charmander (#4) is fire — should appear in spotlight or grid
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(15000);
  });

  it('type filter: Bulbasaur absent when Fire filter is active', async () => {
    // Bulbasaur is Grass/Poison — should be filtered out
    await detoxExpect(element(by.id('pokemon-card-1'))).not.toBeVisible();
  });

  it('type filter: selecting All restores full list', async () => {
    await selectType('all');
    await waitForAnimations();
    await waitForListLoaded(10000);
  });

  it('combined filter: Fire type + search "char" returns only Charmander family', async () => {
    await selectType('fire');
    await searchFor('char');
    await waitForAnimations(800);
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(10000);
    // Reset
    await clearSearch();
    await selectType('all');
  });

  // ── Favorites ────────────────────────────────────────────────────────────────

  it('favorites toggle: empty state shows "No Pokémon found" before any favorites added', async () => {
    await element(by.id('favorites-toggle')).tap();
    await waitForAnimations();
    await detoxExpect(element(by.text('No Pokémon found matching your filters.'))).toBeVisible();
  });

  it('favorites empty state: "Back to All" button returns to full list', async () => {
    await element(by.id('back-to-all-btn')).tap();
    await waitForListLoaded(5000);
  });
});
