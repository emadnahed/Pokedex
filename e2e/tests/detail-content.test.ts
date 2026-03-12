import { device, element, by, waitFor, expect as detoxExpect } from 'detox';
import { waitForListLoaded } from '../helpers/pokedex';
import { navigateViaSpotlight, goBack } from '../helpers/navigation';
import { waitForAnimations, waitForVisible } from '../setup';

// Bulbasaur (#1) is the spotlight Pokémon — a reliable anchor for content assertions.
// API data:  weight=69 (→ 6.9 kg), height=7 (→ 0.7 m)
//            types: grass, poison
//            stats: hp=45, attack=49, defense=49, special-attack=65, special-defense=65, speed=45

describe('Pokémon Detail Screen — Content', () => {
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

  // ── Type badges ───────────────────────────────────────────────────────────────

  it('displays the correct type badges for Bulbasaur (grass + poison)', async () => {
    await navigateViaSpotlight();
    // Wait for data — type badges only render once pokemonDetail is fetched.
    await waitForVisible('type-badge-grass', 15000);
    await detoxExpect(element(by.id('type-badge-grass'))).toBeVisible();
    await detoxExpect(element(by.id('type-badge-poison'))).toBeVisible();
    await goBack();
    await waitForListLoaded(10000);
  });

  // ── Vitals ────────────────────────────────────────────────────────────────────

  it('displays the correct weight and height for Bulbasaur (6.9 kg / 0.7 m)', async () => {
    await navigateViaSpotlight();
    await waitForVisible('vital-weight', 15000);
    // formatWeight(69) → "6.9 kg (15.2 lbs)" → split(' ')[0] = "6.9"
    await detoxExpect(element(by.id('vital-weight'))).toHaveText('6.9');
    // formatHeight(7) → "0.7 m (2'4")" → split(' ')[0] = "0.7"
    await detoxExpect(element(by.id('vital-height'))).toHaveText('0.7');
    await goBack();
    await waitForListLoaded(10000);
  });

  // ── Base stats ────────────────────────────────────────────────────────────────

  it('displays the correct HP stat value for Bulbasaur (45)', async () => {
    await navigateViaSpotlight();
    await waitForVisible('stat-val-hp', 15000);
    await detoxExpect(element(by.id('stat-val-hp'))).toHaveText('45');
    await goBack();
    await waitForListLoaded(10000);
  });

  it('displays the correct Attack and Defense stat values for Bulbasaur (49 / 49)', async () => {
    await navigateViaSpotlight();
    await waitForVisible('stat-val-attack', 15000);
    await detoxExpect(element(by.id('stat-val-attack'))).toHaveText('49');
    await detoxExpect(element(by.id('stat-val-defense'))).toHaveText('49');
    await goBack();
    await waitForListLoaded(10000);
  });

  it('displays the correct Special Attack and Special Defense values for Bulbasaur (65 / 65)', async () => {
    await navigateViaSpotlight();
    await waitForVisible('stat-val-special-attack', 15000);
    await detoxExpect(element(by.id('stat-val-special-attack'))).toHaveText('65');
    await detoxExpect(element(by.id('stat-val-special-defense'))).toHaveText('65');
    await goBack();
    await waitForListLoaded(10000);
  });

  it('displays the correct Speed stat value for Bulbasaur (45)', async () => {
    await navigateViaSpotlight();
    // Speed is the 6th stat and sits near the bottom of the viewport.
    // Scroll down slightly to ensure it is fully in view before asserting.
    await waitForVisible('stat-val-hp', 15000); // wait for data to load
    try {
      await element(by.id('detail-scroll')).scroll(150, 'down', 0.5, 0.5);
    } catch (_) {}
    await waitForVisible('stat-val-speed', 8000);
    await detoxExpect(element(by.id('stat-val-speed'))).toHaveText('45');
    await goBack();
    await waitForListLoaded(10000);
  });
});
