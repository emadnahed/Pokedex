import { element, by, waitFor } from 'detox';
import { waitForVisible } from '../setup';

export async function searchFor(query: string) {
  await waitForVisible('search-input');
  await element(by.id('search-input')).clearText();
  await element(by.id('search-input')).typeText(query);
  // Dismiss keyboard so subsequent taps on list items are not swallowed
  // by the FlatList's default keyboardShouldPersistTaps="never" behaviour.
  await element(by.id('search-input')).tapReturnKey();
}

export async function clearSearch() {
  await waitForVisible('search-input');
  await element(by.id('search-input')).clearText();
}

export async function selectType(type: string | null) {
  const chipId = `type-chip-${(type ?? 'all').toLowerCase()}`;
  await element(by.id(chipId)).tap();
}

export async function waitForListLoaded(timeout = 20000) {
  await waitFor(element(by.id('spotlight-card'))).toBeVisible().withTimeout(timeout);
}
