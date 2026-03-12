import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded, searchFor, clearSearch } from '../helpers/pokedex';
import { navigateViaSpotlight, goBack, goBackFromEvo, openEvolution } from '../helpers/navigation';
import { waitForAnimations, waitForVisible } from '../setup';

describe('Evolution Chain Screen', () => {
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

  // ── Bulbasaur 3-stage chain ──────────────────────────────────────────────────

  it('renders all three evolution stages for Bulbasaur', async () => {
    // After searching, the match appears as the spotlight — navigate via spotlight
    await searchFor('bulbasaur');
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
    await navigateViaSpotlight();
    await openEvolution();

    // Evolution chain is fetched from PokeAPI — allow extra time for slow connections
    await waitFor(element(by.id('evo-node-1'))).toBeVisible().withTimeout(30000);
    await detoxExpect(element(by.id('evo-node-2'))).toExist();
    await detoxExpect(element(by.id('evo-node-3'))).toExist();
  });

  it('current Pokémon node is disabled — tapping it stays on evolution screen', async () => {
    await element(by.id('evo-node-1')).tap();
    // Still on evolution screen (disabled tap does nothing)
    await detoxExpect(element(by.id('evo-back-button'))).toBeVisible();
  });

  it('back button returns to the detail screen', async () => {
    await goBackFromEvo();
    // Banner is below the fold — toExist() confirms we're on the detail screen
    await waitFor(element(by.id('evolution-banner'))).toExist().withTimeout(5000);
  });

  // ── Tap a different node (replace navigation) ────────────────────────────────

  it('tapping Ivysaur node navigates to Ivysaur detail', async () => {
    await openEvolution();
    await waitFor(element(by.id('evo-node-2'))).toBeVisible().withTimeout(15000);
    // FadeInDown.springify() — wait for spring to settle before tapping
    await waitForAnimations(2000);
    await element(by.id('evo-node-2')).tap();
    // Let the navigation.replace() slide animation complete before checking state.
    await waitForAnimations(1000);
    // navigation.replace() swaps Evolution with PokemonDetail(Ivysaur).
    // Stack: [Pokedex, PokemonDetail(Bulbasaur), PokemonDetail(Ivysaur)]
    // Wait for Ivysaur's detail to load (spinner has no back-button).
    await waitFor(element(by.id('back-button'))).toBeVisible().withTimeout(15000);
    await goBack(); // Ivysaur's detail → Bulbasaur's detail
    // disableSynchronization() means nav animations run uninspected.
    // Without this wait, waitForVisible('back-button') resolves instantly against
    // Ivysaur's back-button still visible mid-animation, and the 2nd goBack() re-taps it.
    await waitForAnimations(700); // let Ivysaur→Bulbasaur transition complete (~300ms)
    await waitForVisible('back-button', 10000); // now Bulbasaur's back-button is the only one
    await goBack(); // Bulbasaur's detail → list
    await waitForAnimations(700); // let Bulbasaur→list transition complete
    await clearSearch();
    await waitForListLoaded(10000);
  });

  // ── Charmander chain ─────────────────────────────────────────────────────────

  it('shows Charmander → Charmeleon → Charizard chain', async () => {
    await searchFor('charmander');
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
    await navigateViaSpotlight(); // Charmander is in spotlight after search
    await openEvolution();

    await waitFor(element(by.id('evo-node-4'))).toBeVisible().withTimeout(30000);
    await detoxExpect(element(by.id('evo-node-5'))).toExist();
    await detoxExpect(element(by.id('evo-node-6'))).toExist();

    await goBackFromEvo(); // evo screen → Charmander's detail
    await waitForAnimations(700);
    await waitForVisible('back-button', 10000);
    await goBack(); // Charmander's detail → list
    await waitForAnimations(700);
    await clearSearch();
    await waitForListLoaded(10000);
  });

  // ── Pokémon with no evolutions (Ditto) ───────────────────────────────────────

  it('shows only one node for Ditto (no evolutions)', async () => {
    await searchFor('ditto');
    await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(8000);
    await navigateViaSpotlight();
    await openEvolution();

    await waitFor(element(by.id('evo-node-132'))).toBeVisible().withTimeout(30000);
    await detoxExpect(element(by.id('evo-node-133'))).not.toBeVisible();

    await goBackFromEvo(); // evo screen → Ditto's detail
    await waitForAnimations(700);
    await waitForVisible('back-button', 10000);
    await goBack(); // Ditto's detail → list
    // Last test — afterAll terminates the app; no state reset needed.
  });
});
