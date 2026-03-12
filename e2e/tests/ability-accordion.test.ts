import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded } from '../helpers/pokedex';
import { navigateViaSpotlight, goBack } from '../helpers/navigation';
import { waitForAnimations, waitForVisible } from '../setup';

// Navigate back to the Pokédex list from wherever we are.
async function backToList() {
  try {
    await element(by.id('glossary-close')).tap();
    await waitForAnimations(500);
  } catch (_) {}
  try {
    await element(by.id('evo-back-button')).tap();
    await waitForAnimations(700);
  } catch (_) {}
  try {
    await waitFor(element(by.id('back-button'))).toBeVisible().withTimeout(3000);
    await element(by.id('back-button')).tap();
    await waitForAnimations(700);
  } catch (_) {}
  try {
    await element(by.id('favorites-back')).tap();
  } catch (_) {}
  await waitForListLoaded(10000);
}

describe('Ability Accordion', () => {
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

  // ── Expand ───────────────────────────────────────────────────────────────────

  it('tapping an ability row expands it and fetches the description', async () => {
    // Bulbasaur (spotlight) has ability "overgrow" as its first non-hidden ability.
    await navigateViaSpotlight();
    // Wait for detail data to load — ability rows appear once pokemon data is fetched.
    await waitForVisible('ability-row-overgrow', 15000);
    await element(by.id('ability-row-overgrow')).tap();
    // Description is fetched from the API on first expand — wait for loading + data.
    await waitFor(element(by.id('ability-desc-overgrow'))).toBeVisible().withTimeout(15000);
    await goBack();
    await waitForListLoaded(10000);
  });

  // ── Collapse ─────────────────────────────────────────────────────────────────

  it('tapping an expanded ability row collapses it — description is hidden', async () => {
    await backToList();
    await navigateViaSpotlight();
    await waitForVisible('ability-row-overgrow', 15000);
    // Expand
    await element(by.id('ability-row-overgrow')).tap();
    await waitFor(element(by.id('ability-desc-overgrow'))).toBeVisible().withTimeout(15000);
    // Collapse — spring animation takes ~600ms to settle
    await element(by.id('ability-row-overgrow')).tap();
    await waitForAnimations(800);
    // contentWrap animates to height=0 with overflow:hidden — description is clipped
    await waitFor(element(by.id('ability-desc-overgrow'))).not.toBeVisible().withTimeout(5000);
    await goBack();
    await waitForListLoaded(10000);
  });

  // ── Hidden Ability ───────────────────────────────────────────────────────────

  it('hidden ability row is visible and labelled correctly', async () => {
    await backToList();
    await navigateViaSpotlight();
    // Bulbasaur's second ability "chlorophyll" is hidden.
    // The HIDDEN badge is rendered inside the same row header.
    await waitForVisible('ability-row-chlorophyll', 15000);
    await detoxExpect(element(by.id('ability-row-chlorophyll'))).toBeVisible();
    await goBack();
    await waitForListLoaded(10000);
  });

  // ── Second Ability Expand ────────────────────────────────────────────────────

  it('hidden ability accordion also expands and shows description', async () => {
    await backToList();
    await navigateViaSpotlight();
    await waitForVisible('ability-row-chlorophyll', 15000);
    await element(by.id('ability-row-chlorophyll')).tap();
    await waitFor(element(by.id('ability-desc-chlorophyll'))).toBeVisible().withTimeout(15000);
    await goBack();
    await waitForListLoaded(10000);
  });
});
