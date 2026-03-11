import { device, element, by, waitFor } from 'detox';

// Increase default timeout for animations and network calls
jest.setTimeout(120000);

beforeAll(async () => {
  await device.launchApp({ newInstance: true });
});

beforeEach(async () => {
  await device.reloadReactNative();
});

/**
 * Wait for all pending animations to settle.
 * Use after tapping buttons that trigger Reanimated transitions.
 */
export async function waitForAnimations(ms = 600): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for an element identified by testID to be visible.
 * Uses a generous timeout to accommodate network + animation delays.
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
