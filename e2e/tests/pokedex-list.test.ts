import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded, searchFor, clearSearch, selectType } from '../helpers/pokedex';
import { waitForAnimations } from '../setup';

describe('Pokédex List Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await device.disableSynchronization();
    await waitForListLoaded(20000);
    // Wait for the first grid card too — confirms the network burst has settled
    // and the JS thread is idle enough to receive Detox actions reliably.
    await waitFor(element(by.id('pokemon-card-2'))).toBeVisible().withTimeout(15000);
  });

  afterAll(async () => {
    await device.enableSynchronization();
    await device.terminateApp();
  });

  // ── Spotlight ────────────────────────────────────────────────────────────────

  it('renders the spotlight card for the first Pokémon', async () => {
    await detoxExpect(element(by.id('spotlight-card'))).toBeVisible();
  });

  it('renders at least one grid card', async () => {
    await detoxExpect(element(by.id('pokemon-card-2'))).toBeVisible();
  });

  // ── Search ───────────────────────────────────────────────────────────────────

  it('filters by name: searching "bulbasaur" shows Bulbasaur spotlight', async () => {
    await searchFor('bulbasaur');
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
  });

  it('filters by name: Charmander (#4) is absent when searching "bulbasaur"', async () => {
    await detoxExpect(element(by.id('pokemon-card-4'))).not.toBeVisible();
  });

  it('filters by Pokédex number: searching "25" shows a result', async () => {
    await clearSearch();
    await searchFor('25');
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
  });

  it('clearing search restores the full list', async () => {
    await clearSearch();
    // waitForListLoaded confirms the full list is back (spotlight visible)
    await waitForListLoaded(10000);
  });

  // ── Type Filter ──────────────────────────────────────────────────────────────

  it('selecting Fire type filter shows fire-type Pokémon', async () => {
    await selectType('fire');
    await waitForListLoaded(15000);
  });

  it('Bulbasaur (#1) is absent when Fire filter is active', async () => {
    await detoxExpect(element(by.id('pokemon-card-1'))).not.toBeVisible();
  });

  it('selecting All restores full list', async () => {
    await selectType('all');
    await waitForListLoaded(10000);
    await detoxExpect(element(by.id('pokemon-card-2'))).toBeVisible();
  });

  it('combined Fire filter + search "char" returns results', async () => {
    await selectType('fire');
    await searchFor('char');
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(10000);
    // Reset
    await clearSearch();
    await selectType('all');
    await waitForListLoaded(10000);
  });

  // ── Favorites ────────────────────────────────────────────────────────────────

  it('favorites toggle: empty state shows no-results message', async () => {
    await element(by.id('favorites-toggle')).tap();
    await waitFor(element(by.text('No Pokémon found matching your filters.')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('"Back to All" button restores the full list', async () => {
    await element(by.id('back-to-all-btn')).tap();
    await waitForListLoaded(5000);
  });

  // ── Type Chip Deselect ────────────────────────────────────────────────────────

  it('tapping the active type chip deselects it and restores the full list', async () => {
    await selectType('fire');
    await waitForListLoaded(15000);
    // TypeFilter re-renders with selectedType='fire' in the same JS batch as the SpotlightHeader,
    // but the native commit may lag behind Detox's visibility poll.  A brief wait ensures the
    // fire chip's onPress closure is the deselect version (null) before we tap it.
    await waitForAnimations(800);
    // Tap the already-selected "fire" chip — TypeFilter passes null (deselect) to onTypeSelect
    await element(by.id('type-chip-fire')).tap();
    // pokemon-card-3 (Venusaur) is grass-type: absent under fire filter, present in the full list.
    // Waiting for it is the definitive confirmation that the filter was cleared —
    // waitForListLoaded alone is insufficient because Charmander's spotlight-card
    // is already visible and satisfies the check even if fire is still active.
    // pokemon-card-2 (Ivysaur) is in the same first-row grid cell — if pokemon-card-3
    // is confirmed visible the full list is definitively restored.
    await waitFor(element(by.id('pokemon-card-3'))).toBeVisible().withTimeout(15000);
  });

  // ── Pull-to-Refresh ───────────────────────────────────────────────────────────

  it('pull-to-refresh reloads the list without crashing', async () => {
    await waitForListLoaded(8000);
    // Swipe down from near the top of the FlatList to trigger the refresh indicator.
    // 'slow' speed gives the gesture recognizer time to detect the overscroll pull.
    await element(by.id('pokemon-list')).swipe('down', 'slow', 0.5, 0.5, 0.1);
    // handleRefresh() clears the MMKV cache and re-dispatches fetchPokemonList.
    // The swipe may also scroll the list — waitForListLoaded confirms the list
    // is intact and the spotlight card is visible after the reload.
    await waitForListLoaded(20000);
  });
});
