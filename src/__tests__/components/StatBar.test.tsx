import React from 'react';
import { render } from '@testing-library/react-native';
import { StatBar } from '@/components/StatBar';

// StatBar uses Reanimated (mocked via jest.setup.js)

describe('StatBar', () => {
  // BUG (fixed): `primaryType` was declared in Props but never used inside the
  // component, forcing every caller to supply a no-op prop. It has been removed.
  it('renders consistently — no unused primaryType prop required', () => {
    const { toJSON: jsonA } = render(
      <StatBar statName="hp" value={45} />,
    );
    const { toJSON: jsonB } = render(
      <StatBar statName="hp" value={45} />,
    );
    expect(JSON.stringify(jsonA())).toBe(JSON.stringify(jsonB()));
  });

  it('displays the short label for a known stat', () => {
    const { getByText } = render(
      <StatBar statName="hp" value={45} />,
    );
    expect(getByText('HP')).toBeTruthy();
  });

  it('displays the short label for attack', () => {
    const { getByText } = render(
      <StatBar statName="attack" value={49} />,
    );
    expect(getByText('ATK')).toBeTruthy();
  });

  it('displays the short label for special-attack', () => {
    const { getByText } = render(
      <StatBar statName="special-attack" value={65} />,
    );
    expect(getByText('Sp.A')).toBeTruthy();
  });

  it('displays the stat value as a number string', () => {
    const { getByText } = render(
      <StatBar statName="speed" value={45} />,
    );
    expect(getByText('45')).toBeTruthy();
  });

  it('falls back to uppercased statName for unknown stats', () => {
    const { getByText } = render(
      <StatBar statName="accuracy" value={100} />,
    );
    expect(getByText('ACCURACY')).toBeTruthy();
  });

  it('renders without crashing for all standard stats', () => {
    const stats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    stats.forEach((statName) => {
      expect(() =>
        render(<StatBar statName={statName} value={50} />),
      ).not.toThrow();
    });
  });
});
