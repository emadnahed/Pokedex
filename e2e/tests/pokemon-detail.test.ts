import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded } from '../helpers/pokedex';
import { navigateViaSpotlight, goBack, goBackFromEvo, openEvolution } from '../helpers/navigation';
import { addToFavorites, removeFromFavorites } from '../helpers/favorites';
import { waitForAnimations, waitForVisible } from '../setup';

// Navigate back to the Pokédex list from wherever we are.
// Handles: glossary overlay, evolution screen, detail screen, favorites mode on list screen.
async function backToList() {
  // Dismiss glossary overlay if open — now an absolute-positioned View in the same UIWindow,
  // so glossary-close is always accessible via testID.
  try {
    await element(by.id('glossary-close')).tap();
    await waitForAnimations(500);
  } catch (_) {}
  // Pop any extra screens (evolution or detail) off the stack
  try {
    await element(by.id('evo-back-button')).tap();
    await waitForAnimations(700);
  } catch (_) {}
  try {
    // back-button is now always rendered (even during loading), so this
    // resolves quickly regardless of data-fetch state.
    await waitFor(element(by.id('back-button'))).toBeVisible().withTimeout(3000);
    await element(by.id('back-button')).tap();
    await waitForAnimations(700);
  } catch (_) {}
  // If still in favorites mode on the list, use the dedicated back arrow
  try {
    await element(by.id('favorites-back')).tap();
  } catch (_) {}
  await waitForListLoaded(10000);
}

describe('Pokémon Detail Screen', () => {
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

  // ── Navigation ───────────────────────────────────────────────────────────────

  it('navigates to detail from spotlight card', async () => {
    await navigateViaSpotlight();
    await detoxExpect(element(by.id('back-button'))).toBeVisible();
    await detoxExpect(element(by.id('glossary-button'))).toBeVisible();
    await goBack();
    await waitForListLoaded(10000);
  });

  it('navigates to detail from a grid card (pokemon-card-3, always in first visible row)', async () => {
    // pokemon-card-3 (Venusaur) is always in row 1 col 2 of the grid — no scroll needed
    await waitFor(element(by.id('pokemon-card-3'))).toBeVisible().withTimeout(8000);
    await element(by.id('pokemon-card-3')).tap();
    // back-button is always rendered (even during the data-fetch loading state),
    // so waitFor resolves as soon as the screen is pushed — potentially before the
    // iOS push animation has settled.  Wait for the animation to complete before tapping.
    await waitFor(element(by.id('back-button'))).toBeVisible().withTimeout(10000);
    await waitForAnimations(800);
    await goBack();
    // Allow navigation transition + any async Redux updates (detail fetch) to settle
    await waitForAnimations(1500);
    await waitForListLoaded(10000);
  });

  // ── Favorites ────────────────────────────────────────────────────────────────

  it('adds a Pokémon to favorites and verifies it appears in favorites view', async () => {
    await backToList();
    await navigateViaSpotlight();
    // addToFavorites() is idempotent — only taps if NOT already favorited.
    // This guards against MMKV having stale state from a previous test run.
    // favorite-button only appears once the data is loaded (isLoaded = true).
    await addToFavorites();
    await goBack();
    await waitForListLoaded(10000);
    // Verify Bulbasaur appears in the favorites view:
    // The favorites-toggle FadeInDown.springify() animation must settle before
    // the tap registers at the correct coordinates.
    await waitForAnimations(2000);
    await element(by.id('favorites-toggle')).tap();
    // Single favorite renders as spotlight-card in the list
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
    // Return to full list
    await waitForAnimations(1500);
    await element(by.id('favorites-toggle')).tap();
    await waitForListLoaded(8000);
  });

  it('removes a Pokémon from favorites', async () => {
    // Clean up any leftover navigation state from the previous test
    await backToList();
    await navigateViaSpotlight();
    // Ensure Bulbasaur IS favorited before we remove it.
    await addToFavorites();
    // Now remove it
    await removeFromFavorites();
    // Verify it's been removed: the button is now "favorite-button" (not -active)
    await waitFor(element(by.id('favorite-button'))).toBeVisible().withTimeout(8000);
    await goBack();
    await waitForListLoaded(10000);
  });

  // ── Glossary ─────────────────────────────────────────────────────────────────

  it('glossary sheet opens and closes', async () => {
    await backToList();
    await navigateViaSpotlight();
    await element(by.id('glossary-button')).tap();
    // Wait for the overlay to render before querying contents.
    // GlossarySheet is now an absolute-positioned View in the same UIWindow
    // (not a Modal), so toBeVisible() works correctly.
    await waitForAnimations(500);
    await waitFor(element(by.id('glossary-close'))).toBeVisible().withTimeout(8000);
    await element(by.id('glossary-close')).tap();
    // When visible=false, GlossarySheet returns null — glossary-close is unmounted
    await waitFor(element(by.id('glossary-close'))).not.toExist().withTimeout(8000);
    await goBack();
    await waitForListLoaded(10000);
  });

  // ── Evolution Banner ─────────────────────────────────────────────────────────

  it('tapping evolution banner navigates to the evolution screen', async () => {
    await backToList();
    await navigateViaSpotlight();
    // Banner is below the fold — openEvolution() scrolls to it before tapping.
    await detoxExpect(element(by.id('evolution-banner'))).toExist();
    await openEvolution();
    // evo-back-button confirms we are on the Evolution screen
    await detoxExpect(element(by.id('evo-back-button'))).toBeVisible();
    await goBackFromEvo(); // Evolution → PokemonDetail
    await waitForAnimations(700);
    await waitFor(element(by.id('back-button'))).toBeVisible().withTimeout(10000);
    await goBack(); // PokemonDetail → list
    await waitForListLoaded(10000);
  });
});
