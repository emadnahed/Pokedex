import { element, by, waitFor } from 'detox';
import { waitForVisible } from '../setup';

/** Toggle the favorites view on the Pokedex list screen. */
export async function toggleFavoritesView() {
  await element(by.id('favorites-toggle')).tap();
}

/** Toggle favorite status for the current Pokemon on the detail screen. */
export async function toggleFavorite() {
  await waitForVisible('favorite-button');
  await element(by.id('favorite-button')).tap();
}

/** Navigate into favorites view and check a card is present. */
export async function expectInFavorites(pokemonId: number) {
  await toggleFavoritesView();
  await waitFor(element(by.id(`pokemon-card-${pokemonId}`)))
    .toBeVisible()
    .withTimeout(5000);
}

/** Navigate into favorites view and check a card is absent. */
export async function expectNotInFavorites(pokemonId: number) {
  await toggleFavoritesView();
  await waitFor(element(by.id(`pokemon-card-${pokemonId}`)))
    .not.toBeVisible()
    .withTimeout(5000);
  // Reset back to full list
  await element(by.id('favorites-toggle')).tap();
}
