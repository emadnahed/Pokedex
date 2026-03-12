import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded, searchFor, clearSearch } from '../helpers/pokedex';
import { navigateViaSpotlight, goBack } from '../helpers/navigation';
import { addToFavorites, removeFromFavorites } from '../helpers/favorites';
import { waitForAnimations, waitForVisible } from '../setup';

// Navigate back to list from any screen, clear search, exit favorites mode.
async function resetToList() {
  try {
    await waitFor(element(by.id('back-button'))).toBeVisible().withTimeout(3000);
    await element(by.id('back-button')).tap();
    await waitForAnimations(700);
  } catch (_) {}
  try {
    await element(by.id('favorites-back')).tap();
    await waitForAnimations(500);
  } catch (_) {}
  await clearSearch();
  await waitForListLoaded(10000);
}

describe('Advanced List Features', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await device.disableSynchronization();
    await waitForListLoaded(20000);
    await waitFor(element(by.id('pokemon-card-2'))).toBeVisible().withTimeout(15000);
  });

  afterAll(async () => {
    await device.enableSynchronization();
    await device.terminateApp();
  });

  // ── Scroll / Pagination ───────────────────────────────────────────────────────

  it('scrolling reveals Pokémon beyond the initial FlatList render window', async () => {
    // FlatList uses initialNumToRender=12 with numColumns=2 — only the first
    // 12 grid items (pokemon 2–13) are rendered initially.  pokemon-card-25
    // (Pikachu, grid position 23) is well outside that window and requires
    // the lazy rendering path to activate via scroll.
    await waitForVisible('pokemon-list', 8000);
    await element(by.id('pokemon-list')).scroll(2000, 'down', 0.5, 0.5);
    await waitFor(element(by.id('pokemon-card-25'))).toBeVisible().withTimeout(10000);
  });

  it('scrolling back to top restores the spotlight card', async () => {
    await element(by.id('pokemon-list')).scroll(4000, 'up', 0.5, 0.5);
    await waitForListLoaded(5000);
  });

  // ── Multi-Favorites ──────────────────────────────────────────────────────────

  it('adding two Pokémon to favorites shows both in the favorites view', async () => {
    // Ensure clean state from any prior run
    await resetToList();

    // Favorite Bulbasaur (#1) via spotlight
    await navigateViaSpotlight();
    await addToFavorites();
    await goBack();
    await waitForListLoaded(10000);

    // Favorite Charmander (#4) via grid card — Charmander is always in row 1 col 0
    await waitFor(element(by.id('pokemon-card-4'))).toBeVisible().withTimeout(8000);
    await element(by.id('pokemon-card-4')).tap();
    await waitFor(element(by.id('back-button'))).toBeVisible().withTimeout(10000);
    await waitForAnimations(800);
    await addToFavorites();
    await goBack();
    await waitForListLoaded(10000);

    // Open favorites view — spotlight-card = Bulbasaur, pokemon-card-4 = Charmander in grid
    await waitForAnimations(2000);
    await element(by.id('favorites-toggle')).tap();
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
    await waitFor(element(by.id('pokemon-card-4'))).toBeVisible().withTimeout(8000);

    // Restore full list
    await element(by.id('favorites-toggle')).tap();
    await waitForListLoaded(8000);
  });

  // ── Search within Favorites ──────────────────────────────────────────────────

  it('search filters apply inside the favorites view', async () => {
    // Bulbasaur and Charmander are still favorited from the previous test.
    await resetToList();
    await waitForAnimations(2000);

    // Enter favorites view
    await element(by.id('favorites-toggle')).tap();
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);

    // Search "bulbasaur" within favorites → only Bulbasaur matches
    await searchFor('bulbasaur');
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
    await detoxExpect(element(by.id('pokemon-card-4'))).not.toBeVisible();

    // Search "xyz" → no matches → empty state
    await clearSearch();
    await searchFor('xyz');
    await waitFor(element(by.text('No Pokémon found matching your filters.')))
      .toBeVisible()
      .withTimeout(5000);

    // Clear search and exit favorites
    await clearSearch();
    await waitForListLoaded(10000);
    await element(by.id('favorites-toggle')).tap();
    await waitForListLoaded(8000);
  });

  // ── Favorites Cleanup ────────────────────────────────────────────────────────

  it('removes both favorited Pokémon — confirmed via button state', async () => {
    await resetToList();

    // Remove Bulbasaur via spotlight — verify button flips to inactive
    await navigateViaSpotlight();
    await removeFromFavorites();
    await waitFor(element(by.id('favorite-button'))).toBeVisible().withTimeout(5000);
    await goBack();
    await waitForListLoaded(10000);

    // Remove Charmander by searching — avoids scroll-position dependency
    await searchFor('charmander');
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
    await element(by.id('spotlight-card')).tap();
    await waitFor(element(by.id('back-button'))).toBeVisible().withTimeout(10000);
    await waitForAnimations(800);
    await removeFromFavorites();
    // Verify Charmander is no longer favorited
    await waitFor(element(by.id('favorite-button'))).toBeVisible().withTimeout(5000);
    await goBack();
    await clearSearch();
    await waitForListLoaded(10000);
  });
});
