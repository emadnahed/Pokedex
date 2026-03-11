import React from 'react';
import { render } from '@testing-library/react-native';
import { TypeBadge } from '@/components/TypeBadge';
import { getTypeColor } from '@/utils/typeColors';

describe('TypeBadge', () => {
  it('renders the type label in uppercase', () => {
    const { getByText } = render(<TypeBadge type="fire" />);
    expect(getByText('FIRE')).toBeTruthy();
  });

  it('renders water type label correctly', () => {
    const { getByText } = render(<TypeBadge type="water" />);
    expect(getByText('WATER')).toBeTruthy();
  });

  it('uses md size styles by default', () => {
    const { getByText } = render(<TypeBadge type="grass" />);
    const label = getByText('GRASS');
    // Default size label has fontSize 12
    expect(label.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontSize: 12 })]),
    );
  });

  it('uses sm size styles when size="sm"', () => {
    const { getByText } = render(<TypeBadge type="grass" size="sm" />);
    const label = getByText('GRASS');
    // Small label has fontSize 10
    expect(label.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontSize: 10 })]),
    );
  });

  it('applies the correct background colour for the type', () => {
    const { toJSON } = render(<TypeBadge type="fire" />);
    const root = toJSON() as any;
    // The root element is the badge View; its style is an array of style objects
    const bg = (root.props.style as any[]).find(
      (s: any) => s && s.backgroundColor,
    )?.backgroundColor;
    expect(bg).toBe(getTypeColor('fire'));
  });

  it('applies the normal-type fallback colour for an unknown type', () => {
    const { toJSON } = render(<TypeBadge type="shadow" />);
    const root = toJSON() as any;
    const bg = (root.props.style as any[]).find(
      (s: any) => s && s.backgroundColor,
    )?.backgroundColor;
    // Unknown type falls back to '#888870' (normal colour)
    expect(bg).toBe('#888870');
  });

  it('renders without crashing for every known type', () => {
    const types = [
      'fire', 'water', 'grass', 'electric', 'psychic', 'ice',
      'dragon', 'dark', 'fairy', 'fighting', 'poison', 'ground',
      'rock', 'ghost', 'bug', 'steel', 'flying', 'normal',
    ];
    types.forEach((type) => {
      expect(() => render(<TypeBadge type={type} />)).not.toThrow();
    });
  });
});
