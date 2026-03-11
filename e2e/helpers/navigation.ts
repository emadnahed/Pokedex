import { element, by, waitFor } from 'detox';
import { waitForVisible } from '../setup';

/** Navigate to a Pokemon's detail screen from the grid. */
export async function navigateToDetail(pokemonId: number) {
  await waitForVisible(`pokemon-card-${pokemonId}`);
  await element(by.id(`pokemon-card-${pokemonId}`)).tap();
  await waitForVisible('back-button');
}

/** Navigate to the first Pokemon's detail screen via the spotlight card. */
export async function navigateViaSpotlight() {
  await waitForVisible('spotlight-card', 20000);
  await element(by.id('spotlight-card')).tap();
  await waitForVisible('back-button');
}

/** Go back from any screen that has a back-button. */
export async function goBack() {
  await element(by.id('back-button')).tap();
}

/** Navigate to the evolution screen from the detail screen. */
export async function openEvolution() {
  await waitForVisible('evolution-banner');
  await element(by.id('evolution-banner')).tap();
  await waitForVisible('back-button', 20000);
}
