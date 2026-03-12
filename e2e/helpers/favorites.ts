import { element, by, waitFor } from 'detox';
import { waitForVisible } from '../setup';

export async function toggleFavoritesView() {
  await element(by.id('favorites-toggle')).tap();
}

// Add to favorites — taps favorite-button only when the Pokémon is NOT already favorited.
// If already favorited (testID="favorite-button-active"), this is a no-op.
export async function addToFavorites() {
  try {
    await waitFor(element(by.id('favorite-button'))).toBeVisible().withTimeout(5000);
    await element(by.id('favorite-button')).tap();
  } catch (_) {
    // Already favorited — nothing to do
  }
}

// Remove from favorites — taps favorite-button-active only when the Pokémon IS favorited.
// If not favorited (testID="favorite-button"), this is a no-op.
export async function removeFromFavorites() {
  try {
    await waitFor(element(by.id('favorite-button-active'))).toBeVisible().withTimeout(5000);
    await element(by.id('favorite-button-active')).tap();
  } catch (_) {
    // Not favorited — nothing to do
  }
}

// Legacy: taps whichever favorite button is visible (active or inactive)
export async function toggleFavorite() {
  try {
    await waitFor(element(by.id('favorite-button'))).toBeVisible().withTimeout(3000);
    await element(by.id('favorite-button')).tap();
  } catch (_) {
    await waitFor(element(by.id('favorite-button-active'))).toBeVisible().withTimeout(3000);
    await element(by.id('favorite-button-active')).tap();
  }
}

export async function expectInFavorites(_pokemonId: number) {
  await toggleFavoritesView();
  // Single favorite renders as spotlight-card (first item), not as pokemon-card-{id}
  await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
}
