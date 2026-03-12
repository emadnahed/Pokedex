import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded } from '../helpers/pokedex';

describe('App Launch', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true, delete: true });
    // Disable sync once — Reanimated's infinite animations prevent Detox from ever
    // seeing the app as "idle". All waiting is done via explicit waitFor timeouts.
    await device.disableSynchronization();
  });

  afterAll(async () => {
    await device.enableSynchronization();
    await device.terminateApp();
  });

  it('launches without crashing', async () => {
    await waitFor(element(by.id('search-input'))).toBeVisible().withTimeout(10000);
  });

  it('shows the Pokémon list after the initial network load', async () => {
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

  it('uses MMKV cache on relaunch — list reappears quickly', async () => {
    await device.launchApp({ newInstance: true });
    // Cached data — spotlight should appear well within 8 s
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
  });
});
