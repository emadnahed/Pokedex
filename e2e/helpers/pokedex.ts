import { element, by, waitFor } from 'detox';
import { waitForVisible } from '../setup';

/** Type a query into the search bar. */
export async function searchFor(query: string) {
  await waitForVisible('search-input');
  await element(by.id('search-input')).clearText();
  await element(by.id('search-input')).typeText(query);
}

/** Clear the search input. */
export async function clearSearch() {
  await element(by.id('search-input')).clearText();
}

/** Select a type filter chip. Pass null / 'all' for the "All" chip. */
export async function selectType(type: string | null) {
  const chipId = `type-chip-${(type ?? 'all').toLowerCase()}`;
  await waitForVisible(chipId);
  await element(by.id(chipId)).tap();
}

/** Wait for the list to show at least the spotlight card (i.e. data has loaded). */
export async function waitForListLoaded(timeout = 20000) {
  await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(timeout);
}
