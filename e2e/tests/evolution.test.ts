import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded, searchFor, clearSearch } from '../helpers/pokedex';
import { navigateToDetail, goBack, openEvolution } from '../helpers/navigation';
import { waitForAnimations } from '../setup';

describe('Evolution Chain Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitForListLoaded(20000);
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  // ── Basic Chain (Bulbasaur → 3 stages) ───────────────────────────────────────

  it('renders all three evolution stages for Bulbasaur', async () => {
    await searchFor('bulbasaur');
    await waitForAnimations(500);
    await navigateToDetail(1); // Bulbasaur
    await openEvolution();

    // All three nodes must be visible
    await waitFor(element(by.id('evo-node-1'))).toBeVisible().withTimeout(15000); // Bulbasaur
    await detoxExpect(element(by.id('evo-node-2'))).toBeVisible(); // Ivysaur
    await detoxExpect(element(by.id('evo-node-3'))).toBeVisible(); // Venusaur
  });

  it('current Pokémon node (Bulbasaur) is disabled — tapping does not navigate away', async () => {
    await element(by.id('evo-node-1')).tap();
    await waitForAnimations(500);
    // back-button still present means we are still on the evolution screen
    await detoxExpect(element(by.id('back-button'))).toBeVisible();
  });

  it('back button returns to the detail screen', async () => {
    await goBack();
    await waitFor(element(by.id('evolution-banner'))).toBeVisible().withTimeout(5000);
  });

  // ── Tap Different Node (navigate.replace) ────────────────────────────────────

  it('tapping Ivysaur node navigates to Ivysaur detail via replace', async () => {
    await openEvolution();
    await waitFor(element(by.id('evo-node-2'))).toBeVisible().withTimeout(15000);
    await element(by.id('evo-node-2')).tap();
    // After replace() the detail screen for Ivysaur loads
    await waitFor(element(by.id('back-button'))).toBeVisible().withTimeout(10000);
    // evolution-banner must still be visible (we are on a detail screen)
    await detoxExpect(element(by.id('evolution-banner'))).toBeVisible();
    await goBack(); // back to list
    await clearSearch();
  });

  // ── Charmander chain ─────────────────────────────────────────────────────────

  it('shows Charmander → Charmeleon → Charizard chain', async () => {
    await waitForListLoaded(5000);
    await searchFor('charmander');
    await waitForAnimations(500);
    await navigateToDetail(4); // Charmander
    await openEvolution();

    await waitFor(element(by.id('evo-node-4'))).toBeVisible().withTimeout(15000); // Charmander
    await detoxExpect(element(by.id('evo-node-5'))).toBeVisible(); // Charmeleon
    await detoxExpect(element(by.id('evo-node-6'))).toBeVisible(); // Charizard

    await goBack(); // detail
    await goBack(); // list
    await clearSearch();
  });

  // ── Single-stage Pokémon (no evolutions) ────────────────────────────────────

  it('shows only one node for a Pokémon with no evolutions (Ditto #132)', async () => {
    await waitForListLoaded(5000);
    await searchFor('ditto');
    await waitForAnimations(500);
    await navigateToDetail(132);
    await openEvolution();

    await waitFor(element(by.id('evo-node-132'))).toBeVisible().withTimeout(15000);
    // Stage 2 node should not exist
    await detoxExpect(element(by.id('evo-node-133'))).not.toBeVisible();

    await goBack();
    await goBack();
    await clearSearch();
  });
});
