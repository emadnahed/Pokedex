import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded } from '../helpers/pokedex';

describe('App Launch', () => {
  beforeAll(async () => {
    // Fresh install to test cold-start behavior
    await device.launchApp({ newInstance: true, delete: true });
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('launches without crashing', async () => {
    // If the app crashed on launch we would never reach this assertion
    await waitFor(element(by.id('search-input'))).toBeVisible().withTimeout(10000);
  });

  it('shows the Pokémon list after the initial network load', async () => {
    // PokeAPI is called on first launch; 20 s is generous but network can be slow on CI
    await waitForListLoaded(20000);
    await detoxExpect(element(by.id('spotlight-card'))).toBeVisible();
  });

  it('shows type filter chips', async () => {
    await detoxExpect(element(by.id('type-chip-all'))).toBeVisible();
    await detoxExpect(element(by.id('type-chip-fire'))).toBeVisible();
  });

  it('shows the search bar', async () => {
    await detoxExpect(element(by.id('search-input'))).toBeVisible();
  });

  it('shows favorites toggle', async () => {
    await detoxExpect(element(by.id('favorites-toggle'))).toBeVisible();
  });

  it('uses MMKV cache on relaunch — list reappears instantly', async () => {
    // Relaunch without deleting — data is now cached in MMKV
    await device.launchApp({ newInstance: true });
    // With cache the spotlight card should appear well within 5 s (no network wait)
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
  });
});
