import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded } from '../helpers/pokedex';
import { navigateViaSpotlight, navigateToDetail, goBack, openEvolution } from '../helpers/navigation';
import { toggleFavorite, expectInFavorites, expectNotInFavorites } from '../helpers/favorites';
import { waitForAnimations } from '../setup';

describe('Pokémon Detail Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitForListLoaded(20000);
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  // ── Navigation ───────────────────────────────────────────────────────────────

  it('navigates to detail from spotlight card', async () => {
    await navigateViaSpotlight();
    await detoxExpect(element(by.id('back-button'))).toBeVisible();
    await detoxExpect(element(by.id('favorite-button'))).toBeVisible();
    await detoxExpect(element(by.id('glossary-button'))).toBeVisible();
    await goBack();
  });

  it('navigates to detail from a grid card (Charmander #4)', async () => {
    await waitForListLoaded(5000);
    await navigateToDetail(4);
    await detoxExpect(element(by.id('back-button'))).toBeVisible();
    await goBack();
  });

  it('back button returns to the list screen', async () => {
    await waitForListLoaded(5000);
    await navigateViaSpotlight();
    await goBack();
    await detoxExpect(element(by.id('spotlight-card'))).toBeVisible();
  });

  // ── Favorites ────────────────────────────────────────────────────────────────

  it('adds a Pokémon to favorites and verifies persistence', async () => {
    await waitForListLoaded(5000);
    await navigateToDetail(4); // Charmander
    await toggleFavorite();
    await waitForAnimations();
    await goBack();

    // Favorites view should now show Charmander
    await expectInFavorites(4);

    // Toggle favorites view off
    await element(by.id('favorites-toggle')).tap();
  });

  it('favorite state persists after navigating back and returning', async () => {
    await waitForListLoaded(5000);
    await navigateToDetail(4);
    // Heart button should still be active (lit state)
    await detoxExpect(element(by.id('favorite-button'))).toBeVisible();
    await goBack();
  });

  it('removes a Pokémon from favorites', async () => {
    await waitForListLoaded(5000);
    await navigateToDetail(4);
    await toggleFavorite(); // unfavorite
    await waitForAnimations();
    await goBack();

    // Pokémon should be gone from favorites view
    await element(by.id('favorites-toggle')).tap();
    await waitFor(element(by.id('pokemon-card-4')))
      .not.toBeVisible()
      .withTimeout(5000);
    await element(by.id('favorites-toggle')).tap();
  });

  // ── Glossary ─────────────────────────────────────────────────────────────────

  it('glossary sheet opens when tapping the help button', async () => {
    await waitForListLoaded(5000);
    await navigateViaSpotlight();
    await element(by.id('glossary-button')).tap();
    await waitFor(element(by.id('glossary-sheet'))).toBeVisible().withTimeout(5000);
  });

  it('glossary sheet closes when tapping the close button', async () => {
    await element(by.id('glossary-close')).tap();
    await waitFor(element(by.id('glossary-sheet'))).not.toBeVisible().withTimeout(5000);
    await goBack();
  });

  // ── Evolution Banner ─────────────────────────────────────────────────────────

  it('evolution banner is visible on the detail screen', async () => {
    await waitForListLoaded(5000);
    await navigateViaSpotlight();
    await detoxExpect(element(by.id('evolution-banner'))).toBeVisible();
    await goBack();
  });

  it('tapping evolution banner navigates to the evolution screen', async () => {
    await waitForListLoaded(5000);
    await navigateViaSpotlight();
    await openEvolution();
    // EvolutionScreen back button should now be visible
    await detoxExpect(element(by.id('back-button'))).toBeVisible();
    await goBack(); // back to detail
    await goBack(); // back to list
  });
});
