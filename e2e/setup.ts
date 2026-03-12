import { device, element, by, waitFor } from 'detox';

jest.setTimeout(120000);

/**
 * Wait for all pending animations to settle.
 */
export async function waitForAnimations(ms = 600): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for an element identified by testID to be visible.
 * Works correctly even when synchronization is disabled.
 */
export async function waitForVisible(testId: string, timeout = 15000) {
  await waitFor(element(by.id(testId))).toBeVisible().withTimeout(timeout);
}

/**
 * Wait for an element to exist in the tree (not necessarily visible).
 */
export async function waitForExists(testId: string, timeout = 10000) {
  await waitFor(element(by.id(testId))).toExist().withTimeout(timeout);
}
