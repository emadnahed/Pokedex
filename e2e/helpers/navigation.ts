import { element, by, waitFor } from 'detox';
import { waitForVisible, waitForAnimations } from '../setup';

export async function navigateToDetail(pokemonId: number) {
  await waitForVisible(`pokemon-card-${pokemonId}`);
  await element(by.id(`pokemon-card-${pokemonId}`)).tap();
  await waitForVisible('back-button', 15000);
}

export async function navigateViaSpotlight() {
  await waitForVisible('spotlight-card', 20000);
  // FadeInDown.springify() on the spotlight wrapper overshoots after toBeVisible() resolves.
  // Wait for the spring to fully settle before tapping, otherwise the tap misses.
  await waitForAnimations(1500);
  await element(by.id('spotlight-card')).tap();
  await waitForVisible('back-button', 15000);
  // back-button is now always rendered (fix 1), so waitForVisible resolves as soon as the
  // screen is pushed — potentially mid-animation.  Wait for the iOS push animation to
  // fully complete before the caller taps glossary-button, favorite-button, etc.
  // Without this, those taps fire during the native transition and are cancelled.
  await waitForAnimations(800);
}

export async function goBack() {
  await element(by.id('back-button')).tap();
}

export async function goBackFromEvo() {
  // EvolutionScreen uses 'evo-back-button' to avoid ambiguity when both
  // the evo screen and the detail screen below it are mounted simultaneously.
  await element(by.id('evo-back-button')).tap();
}

export async function openEvolution() {
  // The evolution banner is below the fold — scroll down to reveal it.
  // whileElement().scroll() uses y=95% start point which hits the iOS home indicator zone.
  // Instead: explicit scroll(px, dir, 0.5, 0.5) with centre start point is safe.
  // If we're already scrolled to the bottom the scroll throws — catch and proceed,
  // the banner will be visible at the maximum scroll offset anyway.
  await waitFor(element(by.id('detail-scroll'))).toExist().withTimeout(10000);
  try {
    await element(by.id('detail-scroll')).scroll(700, 'down', 0.5, 0.5);
  } catch (_) {
    // Already at maximum scroll offset — banner is in view
  }
  await waitForVisible('evolution-banner', 15000);
  await element(by.id('evolution-banner')).tap();
  await waitForVisible('evo-back-button', 20000);
  // evo-back-button is always rendered (like back-button in PokemonDetailScreen), so
  // waitForVisible resolves as soon as the screen is pushed — potentially mid-animation.
  // Wait for the iOS push animation to fully settle before the caller taps evo-back-button.
  await waitForAnimations(800);
}
